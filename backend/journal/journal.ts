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

    const row = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM journal_entries WHERE id = ${id}
    `;
    if (!row) throw APIError.notFound("entry not found");
    if (row.user_id !== userID) throw APIError.permissionDenied("not your entry");

    await db.exec`DELETE FROM journal_entries WHERE id = ${id}`;
    return { ok: true as const };
  }
);

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

    const safeExt = /^[a-z0-9]+$/i.test(p.extension) ? p.extension : "webm";
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

    const keywords = q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const likeClauses = keywords.map(k => `%${k}%`);

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
