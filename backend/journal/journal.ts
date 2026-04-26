import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";
import { generateTags } from "./tagging";
import { JournalTag } from "./tags-taxonomy";
import { transcribeAudio } from "./mistral-client";
import { generateDailyPrompt } from "./prompts";
import { generateSummary } from "./summary";
import { answerQuestion } from "./search";
import { randomUUID } from "crypto";

const db = new SQLDatabase("journal", { migrations: "./migrations" });

export interface JournalEntry {
  id: string;
  userId: string;
  body: string;
  source: "typed" | "voice";
  tags: JournalTag[];
  createdAt: string;
}

export interface CreateEntryParams {
  userId: string;
  body: string;
  source?: "typed" | "voice";
}

export interface EntryResponse { entry: JournalEntry; }
export interface ListEntriesResponse { entries: JournalEntry[]; }

function assertOwnUser(userId: string): string {
  const authData = getAuthData<AuthData>();
  if (!authData) throw APIError.unauthenticated("session invalid");
  if (authData.userID !== userId) {
    throw APIError.permissionDenied("you can only access your own journal");
  }
  return authData.userID;
}

// POST /journal/entries
export const createEntry = api(
  { expose: true, method: "POST", path: "/journal/entries", auth: true },
  async (p: CreateEntryParams): Promise<EntryResponse> => {
    const userID = assertOwnUser(p.userId);
    RateLimits.journalEntry("journal-entry:" + userID);

    const body = p.body.trim();
    if (body.length === 0) throw APIError.invalidArgument("body cannot be empty");
    if (body.length > 10_000) throw APIError.invalidArgument("body too long (max 10,000 chars)");

    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const source = p.source === "voice" ? "voice" : "typed";

    await db.exec`
      INSERT INTO journal_entries (id, user_id, body, source, created_at)
      VALUES (${id}, ${userID}, ${body}, ${source}, ${createdAt})
    `;

    // Fire-and-forget tagging
    generateTags(body).then(async (tags) => {
      for (const tag of tags) {
        await db.exec`
          INSERT INTO journal_tags (id, entry_id, user_id, tag, created_at)
          VALUES (${randomUUID()}, ${id}, ${userID}, ${tag}, ${createdAt})
        `;
      }
    }).catch(() => { /* tagging failure must not break entry creation */ });

    // Count entries; every 5th triggers a summary
    const countRow = await db.queryRow<{ n: number }>`
      SELECT COUNT(*)::int AS n FROM journal_entries WHERE user_id = ${userID}
    `;
    const count = countRow?.n ?? 0;
    if (count > 0 && count % 5 === 0) {
      (async () => {
        const recent: { body: string; createdAt: string }[] = [];
        const rows = db.query<{ body: string; created_at: string }>`
          SELECT body, created_at FROM journal_entries
          WHERE user_id = ${userID}
          ORDER BY created_at DESC
          LIMIT 5
        `;
        for await (const r of rows) recent.push({ body: r.body, createdAt: r.created_at });
        const summary = await generateSummary(recent);
        if (summary) {
          await db.exec`
            INSERT INTO journal_summaries (id, user_id, body, entry_count, created_at)
            VALUES (${randomUUID()}, ${userID}, ${summary}, ${count}, ${new Date().toISOString()})
          `;
        }
      })().catch(() => {});
    }

    return {
      entry: { id, userId: userID, body, source, tags: [], createdAt },
    };
  }
);

// GET /journal/entries?userId=
export const listEntries = api(
  { expose: true, method: "GET", path: "/journal/entries", auth: true },
  async ({ userId }: { userId: string }): Promise<ListEntriesResponse> => {
    const userID = assertOwnUser(userId);
    RateLimits.journalRead("journal-read:" + userID);

    const entries: JournalEntry[] = [];
    const rows = db.query<{
      id: string;
      user_id: string;
      body: string;
      source: string;
      created_at: string;
    }>`
      SELECT id, user_id, body, source, created_at
      FROM journal_entries
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    for await (const row of rows) {
      entries.push({
        id: row.id,
        userId: row.user_id,
        body: row.body,
        source: (row.source === "voice" ? "voice" : "typed") as "typed" | "voice",
        tags: [],
        createdAt: row.created_at,
      });
    }

    if (entries.length > 0) {
      const byId = new Map(entries.map(e => [e.id, e]));
      const tagRows = db.query<{ entry_id: string; tag: string }>`
        SELECT entry_id, tag FROM journal_tags
        WHERE user_id = ${userID}
      `;
      for await (const row of tagRows) {
        const e = byId.get(row.entry_id);
        if (e) e.tags.push(row.tag as JournalTag);
      }
    }

    return { entries };
  }
);

// DELETE /journal/entries/:id
export const deleteEntry = api(
  { expose: true, method: "DELETE", path: "/journal/entries/:id", auth: true },
  async ({ id, userId }: { id: string; userId: string }): Promise<{ ok: true }> => {
    const userID = assertOwnUser(userId);
    RateLimits.journalRead("journal-delete:" + userID);

    // Same response for not-found AND not-owner so the endpoint isn't a
    // UUID-existence oracle for other users' journal entries.
    const row = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM journal_entries WHERE id = ${id}
    `;
    if (!row || row.user_id !== userID) {
      throw APIError.notFound("entry not found");
    }

    await db.exec`DELETE FROM journal_entries WHERE id = ${id}`;
    return { ok: true as const };
  }
);

/**
 * Magic-byte audio sniffer. Returns the format name (matching our
 * allowed-extension set) or null if the buffer doesn't look like any
 * supported audio format. This is the authoritative content-type check —
 * the extension hint from the client is advisory only.
 */
function sniffAudioFormat(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // WebM / Matroska — starts with EBML header 1A 45 DF A3
  if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return "webm";
  // OGG — "OggS"
  if (buf[0] === 0x4F && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return "ogg";
  // MP3 — ID3v2 ("ID3") or sync frame (FF Fx)
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return "mp3";
  if (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) return "mp3";
  // WAV — "RIFF" .... "WAVE"
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x41 && buf[10] === 0x56 && buf[11] === 0x45) return "wav";
  // MP4 / M4A — "ftyp" at byte 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return "m4a";
  return null;
}

// POST /journal/transcribe
export interface TranscribeParams {
  userId: string;
  audioBase64: string;
  extension: string;
}
export interface TranscribeResponse { transcript: string; }

export const transcribe = api(
  { expose: true, method: "POST", path: "/journal/transcribe", auth: true },
  async (p: TranscribeParams): Promise<TranscribeResponse> => {
    const userID = assertOwnUser(p.userId);
    RateLimits.journalVoice("journal-voice:" + userID);

    const buf = Buffer.from(p.audioBase64, "base64");
    if (buf.length === 0) throw APIError.invalidArgument("empty audio");
    if (buf.length > 5 * 1024 * 1024) {
      throw APIError.invalidArgument("audio too large (max 5MB)");
    }

    // Sniff magic bytes so a malicious payload can't be smuggled in via
    // a forged extension. Also enforce an extension allow-list — generic
    // [a-z0-9]+ matched anything (e.g. "exe").
    const sniffed = sniffAudioFormat(buf);
    if (!sniffed) {
      throw APIError.invalidArgument("audio format not recognized (allowed: webm, ogg, mp3, wav, m4a)");
    }
    const allowedExt = new Set(["webm", "ogg", "oga", "opus", "mp3", "wav", "m4a", "mp4"]);
    const requested = (p.extension ?? "").toLowerCase();
    const safeExt = allowedExt.has(requested) ? requested : sniffed;
    const filename = `entry-${randomUUID()}.${safeExt}`;

    try {
      const transcript = await transcribeAudio({
        audio: buf,
        filename,
        language: "en",
      });
      return { transcript };
    } catch (err) {
      throw APIError.unavailable(`transcription failed: ${(err as Error).message}`);
    }
  }
);

// GET /journal/daily-prompt?userId=
export interface DailyPromptResponse {
  prompt: string;
  date: string;
}

export const dailyPrompt = api(
  { expose: true, method: "GET", path: "/journal/daily-prompt", auth: true },
  async ({ userId }: { userId: string }): Promise<DailyPromptResponse> => {
    const userID = assertOwnUser(userId);
    RateLimits.journalRead("journal-prompt:" + userID);

    const today = new Date().toISOString().slice(0, 10);

    const existing = await db.queryRow<{ prompt: string }>`
      SELECT prompt FROM journal_daily_prompts
      WHERE user_id = ${userID} AND prompt_date = ${today}
    `;
    if (existing) return { prompt: existing.prompt, date: today };

    const prompt = await generateDailyPrompt();
    const createdAt = new Date().toISOString();
    await db.exec`
      INSERT INTO journal_daily_prompts (user_id, prompt_date, prompt, created_at)
      VALUES (${userID}, ${today}, ${prompt}, ${createdAt})
      ON CONFLICT (user_id, prompt_date) DO NOTHING
    `;
    return { prompt, date: today };
  }
);

// GET /journal/summaries?userId=
export interface JournalSummary {
  id: string;
  body: string;
  entryCount: number;
  createdAt: string;
}
export interface ListSummariesResponse { summaries: JournalSummary[]; }

export const listSummaries = api(
  { expose: true, method: "GET", path: "/journal/summaries", auth: true },
  async ({ userId }: { userId: string }): Promise<ListSummariesResponse> => {
    const userID = assertOwnUser(userId);
    RateLimits.journalRead("journal-sum:" + userID);

    const summaries: JournalSummary[] = [];
    const rows = db.query<{
      id: string; body: string; entry_count: number; created_at: string;
    }>`
      SELECT id, body, entry_count, created_at
      FROM journal_summaries
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    for await (const r of rows) {
      summaries.push({
        id: r.id, body: r.body,
        entryCount: r.entry_count, createdAt: r.created_at,
      });
    }
    return { summaries };
  }
);

// POST /journal/ask
export interface AskParams {
  userId: string;
  question: string;
}
export interface AskResponse {
  answer: string;
  citations: { entryId: string; date: string }[];
}

export const ask = api(
  { expose: true, method: "POST", path: "/journal/ask", auth: true },
  async (p: AskParams): Promise<AskResponse> => {
    const userID = assertOwnUser(p.userId);
    RateLimits.journalAsk("journal-ask:" + userID);

    const q = p.question.trim();
    if (q.length === 0) throw APIError.invalidArgument("question is empty");
    if (q.length > 500) throw APIError.invalidArgument("question too long");

    // Cap keywords + escape LIKE metacharacters so a question like
    // "%%%%%%%%" can't turn into a wildcard scan that nukes the index.
    const escapeLike = (s: string) => s.replace(/[\\%_]/g, "\\$&");
    const keywords = q.toLowerCase().split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 8);
    const likeClauses = keywords.map(k => `%${escapeLike(k)}%`);

    const matches: { id: string; body: string; created_at: string }[] = [];
    if (likeClauses.length > 0) {
      const rows = db.query<{ id: string; body: string; created_at: string }>`
        SELECT id, body, created_at FROM journal_entries
        WHERE user_id = ${userID}
          AND LOWER(body) LIKE ANY(${likeClauses})
        ORDER BY created_at DESC
        LIMIT 10
      `;
      for await (const r of rows) matches.push(r);
    }

    if (matches.length === 0) {
      const rows = db.query<{ id: string; body: string; created_at: string }>`
        SELECT id, body, created_at FROM journal_entries
        WHERE user_id = ${userID}
        ORDER BY created_at DESC
        LIMIT 10
      `;
      for await (const r of rows) matches.push(r);
    }

    const result = await answerQuestion(
      q,
      matches.map(m => ({ id: m.id, body: m.body, createdAt: m.created_at }))
    );

    return { answer: result.answer, citations: result.citations };
  }
);

// ── Internal: Purge a user's data from the journal DB ────────────────────────

/**
 * Wipe everything in this service that is associated with `userId`. Called
 * by `auth.adminDeleteUser` and `auth.deleteAccount` as part of the
 * cross-service cascade. Best-effort: each delete is wrapped so one failure
 * does not abort the others.
 *
 * Order: journal_tags first (FK dependency on journal_entries cascades, but
 * we delete by user_id explicitly so any rows whose entry was already orphaned
 * are still cleaned up), then journal_entries, journal_summaries,
 * journal_daily_prompts.
 */
export const purgeUser = api(
  { expose: false },
  async ({ userId }: { userId: string }): Promise<{ success: boolean; deleted: Record<string, boolean> }> => {
    const deleted: Record<string, boolean> = {};

    try {
      await db.exec`DELETE FROM journal_tags WHERE user_id = ${userId}`;
      deleted.journal_tags = true;
    } catch (err) {
      console.error("purgeUser(journal): journal_tags delete failed", err instanceof Error ? err.message : err);
      deleted.journal_tags = false;
    }

    try {
      // FK from journal_tags → journal_entries is ON DELETE CASCADE so any
      // surviving tag rows are wiped here too.
      await db.exec`DELETE FROM journal_entries WHERE user_id = ${userId}`;
      deleted.journal_entries = true;
    } catch (err) {
      console.error("purgeUser(journal): journal_entries delete failed", err instanceof Error ? err.message : err);
      deleted.journal_entries = false;
    }

    try {
      await db.exec`DELETE FROM journal_summaries WHERE user_id = ${userId}`;
      deleted.journal_summaries = true;
    } catch (err) {
      console.error("purgeUser(journal): journal_summaries delete failed", err instanceof Error ? err.message : err);
      deleted.journal_summaries = false;
    }

    try {
      await db.exec`DELETE FROM journal_daily_prompts WHERE user_id = ${userId}`;
      deleted.journal_daily_prompts = true;
    } catch (err) {
      console.error("purgeUser(journal): journal_daily_prompts delete failed", err instanceof Error ? err.message : err);
      deleted.journal_daily_prompts = false;
    }

    return { success: true, deleted };
  }
);
