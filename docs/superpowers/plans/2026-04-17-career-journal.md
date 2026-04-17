# Career Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an isolated Career Journal module where users write/dictate daily career reflections, get AI-generated tags, periodic summaries, and a natural-language Q&A over their own entries.

**Architecture:** New Encore service `backend/journal/` with Mistral SDK wrapper (STT via Voxtral, text via `ministral-8b-latest` + `mistral-small-latest`). New React page at `src/pages/CareerJournal/` using existing tailwind tokens (Manrope/Inter/Caveat, purple primary, teal-tinted surfaces). Budget mode: no TTS, no object storage, tight per-day rate limits.

**Tech Stack:** Encore.dev backend (TypeScript), `@mistralai/mistralai` SDK, React + Vite frontend, Tailwind with existing PathWise tokens, browser MediaRecorder API.

**Spec:** `docs/superpowers/specs/2026-04-17-career-journal-design.md`

---

## File Structure

### Backend (new)
- `backend/journal/journal.ts` — all API endpoints (~400 lines)
- `backend/journal/mistral-client.ts` — Mistral SDK wrapper (secret, chat, STT)
- `backend/journal/tagging.ts` — tag generation from entry body
- `backend/journal/prompts.ts` — daily prompt generation + 24h cache
- `backend/journal/summary.ts` — 5-entry summary generation
- `backend/journal/search.ts` — Ask Your Journal retrieval + completion
- `backend/journal/tags-taxonomy.ts` — fixed 8-tag list
- `backend/journal/migrations/1_create_journal_entries.up.sql`
- `backend/journal/migrations/2_create_journal_tags.up.sql`
- `backend/journal/migrations/3_create_journal_summaries.up.sql`
- `backend/journal/migrations/4_create_journal_daily_prompts.up.sql`
- `backend/journal/encore.service.ts` — service declaration
- `backend/journal/__tests__/journal.test.ts` — endpoint tests

### Backend (modify)
- `backend/shared/rate-limiter.ts` — add 4 new rate-limit profiles
- `backend/package.json` — add `@mistralai/mistralai`

### Frontend (new)
- `src/pages/CareerJournal/index.tsx` — page route component
- `src/pages/CareerJournal/api.ts` — typed client for `/journal/*` endpoints
- `src/pages/CareerJournal/components/EntryComposer.tsx`
- `src/pages/CareerJournal/components/EntryCard.tsx`
- `src/pages/CareerJournal/components/SummaryCard.tsx`
- `src/pages/CareerJournal/components/DailyPromptBanner.tsx`
- `src/pages/CareerJournal/components/AskJournalBar.tsx`
- `src/pages/CareerJournal/components/AskJournalModal.tsx`
- `src/pages/CareerJournal/components/RecordButton.tsx`
- `src/pages/CareerJournal/components/Waveform.tsx`
- `src/pages/CareerJournal/components/TagChip.tsx`
- `src/pages/CareerJournal/components/EmptyState.tsx`
- `src/pages/CareerJournal/lib/journalTags.ts` — tag → color map
- `src/pages/CareerJournal/hooks/useAudioRecorder.ts` — MediaRecorder wrapper

### Frontend (modify)
- `src/App.tsx` — add `/journal` lazy route + nav link
- `src/pages/WhatsNew/changelogData.ts` — add v0.20.0 entry

---

## Task 1: Install Mistral SDK

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Add dependency**

```bash
cd /home/admin1/PathWise/backend && npm install @mistralai/mistralai@^1.0.0
```

- [ ] **Step 2: Verify install**

```bash
cd /home/admin1/PathWise/backend && node -e "console.log(require('@mistralai/mistralai').Mistral)"
```

Expected: prints `[class Mistral]` or similar — the `Mistral` constructor is exported.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/package.json backend/package-lock.json && git commit -m "chore(journal): add @mistralai/mistralai SDK"
```

---

## Task 2: Configure Mistral secret

**Files:** No code changes — local dev setup only.

- [ ] **Step 1: Set Encore secret (development)**

```bash
cd /home/admin1/PathWise/backend && encore secret set --type dev,local MistralAPIKey
```

At the prompt, paste a Mistral API key (user must rotate the one that leaked earlier).

- [ ] **Step 2: Verify secret is registered**

```bash
cd /home/admin1/PathWise/backend && encore secret list | grep MistralAPIKey
```

Expected: `MistralAPIKey` appears with `dev,local` scopes.

- [ ] **Step 3: No commit needed** — secret values are never in git.

---

## Task 3: Create journal service declaration

**Files:**
- Create: `backend/journal/encore.service.ts`

- [ ] **Step 1: Create service file**

```typescript
// backend/journal/encore.service.ts
import { Service } from "encore.dev/service";

export default new Service("journal");
```

- [ ] **Step 2: Verify Encore recognizes service**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors. `journal` appears in the service list if you run `encore meta`.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/encore.service.ts && git commit -m "feat(journal): scaffold empty journal service"
```

---

## Task 4: First migration — journal_entries table

**Files:**
- Create: `backend/journal/migrations/1_create_journal_entries.up.sql`

- [ ] **Step 1: Write migration**

```sql
-- backend/journal/migrations/1_create_journal_entries.up.sql
CREATE TABLE journal_entries (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  body        TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'typed',
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id, created_at DESC);
```

- [ ] **Step 2: Verify migration parses**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/migrations/1_create_journal_entries.up.sql && git commit -m "feat(journal): add journal_entries migration"
```

---

## Task 5: Remaining migrations — tags, summaries, daily_prompts

**Files:**
- Create: `backend/journal/migrations/2_create_journal_tags.up.sql`
- Create: `backend/journal/migrations/3_create_journal_summaries.up.sql`
- Create: `backend/journal/migrations/4_create_journal_daily_prompts.up.sql`

- [ ] **Step 1: Write tags migration**

```sql
-- backend/journal/migrations/2_create_journal_tags.up.sql
CREATE TABLE journal_tags (
  id          TEXT PRIMARY KEY,
  entry_id    TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  tag         TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_journal_tags_user_id ON journal_tags(user_id);
CREATE INDEX idx_journal_tags_entry_id ON journal_tags(entry_id);
```

- [ ] **Step 2: Write summaries migration**

```sql
-- backend/journal/migrations/3_create_journal_summaries.up.sql
CREATE TABLE journal_summaries (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  body          TEXT NOT NULL,
  entry_count   INTEGER NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX idx_journal_summaries_user_id ON journal_summaries(user_id, created_at DESC);
```

- [ ] **Step 3: Write daily_prompts migration**

```sql
-- backend/journal/migrations/4_create_journal_daily_prompts.up.sql
CREATE TABLE journal_daily_prompts (
  user_id     TEXT NOT NULL,
  prompt_date TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (user_id, prompt_date)
);
```

- [ ] **Step 4: Verify all migrations parse**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/migrations/ && git commit -m "feat(journal): add tags, summaries, daily_prompts migrations"
```

---

## Task 6: Add journal rate-limit profiles

**Files:**
- Modify: `backend/shared/rate-limiter.ts`

- [ ] **Step 1: Add 4 profiles at the end of the `RateLimits` object**

Open `backend/shared/rate-limiter.ts` and add these entries to the `RateLimits` const, inside the closing brace, after the `profile` entry:

```typescript
  /** Journal entry creation: 10 per day per user */
  journalEntry: (key: string) => checkRateLimit(key, 10, 86_400_000),

  /** Journal voice transcription: 5 per day per user */
  journalVoice: (key: string) => checkRateLimit(key, 5, 86_400_000),

  /** Journal ask queries: 5 per day per user */
  journalAsk: (key: string) => checkRateLimit(key, 5, 86_400_000),

  /** Journal read operations: 30 per minute per user */
  journalRead: (key: string) => checkRateLimit(key, 30, 60_000),
```

Also update the cleanup timer: change line 19 from `600000` (10 min) to `90_000_000` (~25 hours) so daily-window entries aren't pruned mid-day.

```typescript
    entry.timestamps = entry.timestamps.filter(t => now - t < 90_000_000); // keep last ~25 hours
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/shared/rate-limiter.ts && git commit -m "feat(journal): add journal rate-limit profiles"
```

---

## Task 7: Mistral client wrapper — chat completion

**Files:**
- Create: `backend/journal/mistral-client.ts`
- Create: `backend/journal/__tests__/mistral-client.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/journal/__tests__/mistral-client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("encore.dev/config", () => ({
  secret: (name: string) => () => `test-${name}`,
}));

const mockChatComplete = vi.fn();
vi.mock("@mistralai/mistralai", () => ({
  Mistral: vi.fn().mockImplementation(() => ({
    chat: { complete: mockChatComplete },
  })),
}));

describe("mistral-client: chatCompletion", () => {
  beforeEach(() => {
    mockChatComplete.mockReset();
    vi.resetModules();
  });

  it("returns assistant message content", async () => {
    mockChatComplete.mockResolvedValue({
      choices: [{ message: { content: "hello" } }],
    });
    const { chatCompletion } = await import("../mistral-client");
    const result = await chatCompletion({
      model: "ministral-8b-latest",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(result).toBe("hello");
  });

  it("throws a descriptive error on API failure", async () => {
    mockChatComplete.mockRejectedValue(new Error("boom"));
    const { chatCompletion } = await import("../mistral-client");
    await expect(
      chatCompletion({
        model: "ministral-8b-latest",
        messages: [{ role: "user", content: "hi" }],
      })
    ).rejects.toThrow(/mistral chat failed/i);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/mistral-client.test.ts
```

Expected: FAIL — file `../mistral-client` does not exist.

- [ ] **Step 3: Write minimal implementation**

```typescript
// backend/journal/mistral-client.ts
import { secret } from "encore.dev/config";
import { Mistral } from "@mistralai/mistralai";

const mistralKey = secret("MistralAPIKey");

let client: Mistral | null = null;
function getClient(): Mistral {
  if (!client) client = new Mistral({ apiKey: mistralKey() });
  return client;
}

export type TextModel = "ministral-8b-latest" | "mistral-small-latest";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: TextModel;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function chatCompletion(opts: ChatOptions): Promise<string> {
  try {
    const resp = await getClient().chat.complete({
      model: opts.model,
      messages: opts.messages,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature ?? 0.4,
    });
    const content = resp.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("empty completion");
    }
    return content;
  } catch (err) {
    throw new Error(`mistral chat failed: ${(err as Error).message}`);
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/mistral-client.test.ts
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/mistral-client.ts backend/journal/__tests__/mistral-client.test.ts && git commit -m "feat(journal): mistral client wrapper for chat completion"
```

---

## Task 8: Mistral client wrapper — audio transcription

**Files:**
- Modify: `backend/journal/mistral-client.ts`
- Modify: `backend/journal/__tests__/mistral-client.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `backend/journal/__tests__/mistral-client.test.ts` before the final closing brace:

```typescript
describe("mistral-client: transcribeAudio", () => {
  const mockTranscribe = vi.fn();

  beforeEach(() => {
    mockTranscribe.mockReset();
    vi.resetModules();
    vi.doMock("@mistralai/mistralai", () => ({
      Mistral: vi.fn().mockImplementation(() => ({
        chat: { complete: vi.fn() },
        audio: { transcriptions: { create: mockTranscribe } },
      })),
    }));
  });

  it("returns the transcript text", async () => {
    mockTranscribe.mockResolvedValue({ text: "hello world" });
    const { transcribeAudio } = await import("../mistral-client");
    const result = await transcribeAudio({
      audio: Buffer.from("fake"),
      filename: "clip.webm",
      language: "en",
    });
    expect(result).toBe("hello world");
  });

  it("throws a descriptive error when STT fails", async () => {
    mockTranscribe.mockRejectedValue(new Error("stt down"));
    const { transcribeAudio } = await import("../mistral-client");
    await expect(
      transcribeAudio({ audio: Buffer.from("fake"), filename: "a.webm" })
    ).rejects.toThrow(/mistral stt failed/i);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/mistral-client.test.ts -t "transcribeAudio"
```

Expected: FAIL — `transcribeAudio` is not exported.

- [ ] **Step 3: Add `transcribeAudio` to `mistral-client.ts`**

Append to `backend/journal/mistral-client.ts`:

```typescript
export interface TranscribeOptions {
  audio: Buffer;
  filename: string;
  language?: string;
}

export async function transcribeAudio(opts: TranscribeOptions): Promise<string> {
  try {
    const resp = await getClient().audio.transcriptions.create({
      model: "voxtral-mini-2507",
      file: { fileName: opts.filename, content: opts.audio },
      language: opts.language,
    } as any);
    const text = (resp as any)?.text;
    if (typeof text !== "string") throw new Error("no transcript in response");
    return text;
  } catch (err) {
    throw new Error(`mistral stt failed: ${(err as Error).message}`);
  }
}
```

(The `as any` casts are needed because the SDK's audio types may vary by version — keep these narrow to just the API call.)

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/mistral-client.test.ts
```

Expected: 4 passed (2 chat + 2 stt).

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/mistral-client.ts backend/journal/__tests__/mistral-client.test.ts && git commit -m "feat(journal): mistral client wrapper for voxtral STT"
```

---

## Task 9: Tag taxonomy constant

**Files:**
- Create: `backend/journal/tags-taxonomy.ts`

- [ ] **Step 1: Create the file**

```typescript
// backend/journal/tags-taxonomy.ts
export const JOURNAL_TAGS = [
  "win",
  "blocker",
  "skill-gap",
  "interview-prep",
  "learning",
  "motivation",
  "goal",
  "reflection",
] as const;

export type JournalTag = (typeof JOURNAL_TAGS)[number];

export function isValidTag(tag: string): tag is JournalTag {
  return (JOURNAL_TAGS as readonly string[]).includes(tag);
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/tags-taxonomy.ts && git commit -m "feat(journal): fixed tag taxonomy (8 tags)"
```

---

## Task 10: Tagging logic

**Files:**
- Create: `backend/journal/tagging.ts`
- Create: `backend/journal/__tests__/tagging.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/journal/__tests__/tagging.test.ts
import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({
  chatCompletion: mockChat,
}));

describe("generateTags", () => {
  it("returns parsed tags from the model response", async () => {
    mockChat.mockResolvedValue('["win", "learning"]');
    const { generateTags } = await import("../tagging");
    const tags = await generateTags("I finished my first react hook today");
    expect(tags).toEqual(["win", "learning"]);
  });

  it("filters out invalid tags from the model", async () => {
    mockChat.mockResolvedValue('["win", "not-a-real-tag", "motivation"]');
    const { generateTags } = await import("../tagging");
    const tags = await generateTags("body");
    expect(tags).toEqual(["win", "motivation"]);
  });

  it("returns [] when parsing fails", async () => {
    mockChat.mockResolvedValue("not json at all");
    const { generateTags } = await import("../tagging");
    const tags = await generateTags("body");
    expect(tags).toEqual([]);
  });

  it("returns [] when the mistral call throws", async () => {
    mockChat.mockRejectedValue(new Error("down"));
    const { generateTags } = await import("../tagging");
    const tags = await generateTags("body");
    expect(tags).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/tagging.test.ts
```

Expected: FAIL — `../tagging` does not exist.

- [ ] **Step 3: Implement tagging**

```typescript
// backend/journal/tagging.ts
import { chatCompletion } from "./mistral-client";
import { JOURNAL_TAGS, JournalTag, isValidTag } from "./tags-taxonomy";

const SYSTEM_PROMPT = `You categorize short career journal entries.
Pick 1-3 tags from this fixed list that best describe the entry:
${JOURNAL_TAGS.join(", ")}.
Respond ONLY with a JSON array of strings. No prose. Example: ["win","learning"]`;

export async function generateTags(body: string): Promise<JournalTag[]> {
  try {
    const raw = await chatCompletion({
      model: "ministral-8b-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: body.slice(0, 2000) },
      ],
      maxTokens: 50,
      temperature: 0.2,
    });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === "string")
      .filter(isValidTag)
      .slice(0, 3);
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/tagging.test.ts
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/tagging.ts backend/journal/__tests__/tagging.test.ts && git commit -m "feat(journal): AI tag generation with fallback"
```

---

## Task 11: Entry endpoints — create, list, delete

**Files:**
- Create: `backend/journal/journal.ts`

- [ ] **Step 1: Write the file**

```typescript
// backend/journal/journal.ts
import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";
import { generateTags } from "./tagging";
import { JournalTag } from "./tags-taxonomy";
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

export interface EntryResponse {
  entry: JournalEntry;
}

export interface ListEntriesResponse {
  entries: JournalEntry[];
}

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

    // Hydrate tags in one query
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors. The migrations run on first `encore run`.

- [ ] **Step 3: Smoke-test via encore run**

Open a second terminal:
```bash
cd /home/admin1/PathWise/backend && encore run
```

Expected: Encore starts, `journal` service listed, migrations applied. Stop with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/journal.ts && git commit -m "feat(journal): entry CRUD endpoints with auto-tagging"
```

---

## Task 12: Transcription endpoint

**Files:**
- Modify: `backend/journal/journal.ts`

- [ ] **Step 1: Add endpoint + imports**

Add to the top imports of `backend/journal/journal.ts`:

```typescript
import { transcribeAudio } from "./mistral-client";
```

Append at the end of the file:

```typescript
export interface TranscribeParams {
  userId: string;
  /** base64-encoded audio data */
  audioBase64: string;
  /** original file extension, e.g. "webm" */
  extension: string;
}

export interface TranscribeResponse {
  transcript: string;
}

// POST /journal/transcribe
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/journal.ts && git commit -m "feat(journal): voxtral transcription endpoint"
```

---

## Task 13: Daily prompts logic

**Files:**
- Create: `backend/journal/prompts.ts`
- Create: `backend/journal/__tests__/prompts.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/journal/__tests__/prompts.test.ts
import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("generateDailyPrompt", () => {
  it("returns the model's prompt, trimmed", async () => {
    mockChat.mockResolvedValue('  What did you learn today?  ');
    const { generateDailyPrompt } = await import("../prompts");
    const prompt = await generateDailyPrompt();
    expect(prompt).toBe("What did you learn today?");
  });

  it("falls back to a static prompt on failure", async () => {
    mockChat.mockRejectedValue(new Error("down"));
    const { generateDailyPrompt, FALLBACK_PROMPTS } = await import("../prompts");
    const prompt = await generateDailyPrompt();
    expect(FALLBACK_PROMPTS).toContain(prompt);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/prompts.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement prompts**

```typescript
// backend/journal/prompts.ts
import { chatCompletion } from "./mistral-client";

export const FALLBACK_PROMPTS = [
  "What's one small win from your career journey this week?",
  "Name one skill you want to strengthen this month — why that one?",
  "What conversation at work do you keep replaying in your head?",
  "What's been getting in the way of the progress you want to make?",
  "If today were a good day, what would have happened by 5pm?",
];

const SYSTEM_PROMPT = `You write single-sentence career reflection prompts.
Gentle, curious tone. No bullet points. No preamble. Respond with ONLY the prompt sentence.
Vary the angle: wins, blockers, skills, relationships, values.`;

export async function generateDailyPrompt(): Promise<string> {
  try {
    const raw = await chatCompletion({
      model: "ministral-8b-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Give me today's prompt." },
      ],
      maxTokens: 60,
      temperature: 0.8,
    });
    const trimmed = raw.trim().replace(/^["']|["']$/g, "");
    return trimmed || pickFallback();
  } catch {
    return pickFallback();
  }
}

function pickFallback(): string {
  return FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/prompts.test.ts
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/prompts.ts backend/journal/__tests__/prompts.test.ts && git commit -m "feat(journal): daily prompt generation with fallback"
```

---

## Task 14: Daily prompt endpoint

**Files:**
- Modify: `backend/journal/journal.ts`

- [ ] **Step 1: Add import and endpoint**

Add import near top of `backend/journal/journal.ts`:

```typescript
import { generateDailyPrompt } from "./prompts";
```

Append at the end of the file:

```typescript
export interface DailyPromptResponse {
  prompt: string;
  date: string; // YYYY-MM-DD
}

// GET /journal/daily-prompt?userId=
export const dailyPrompt = api(
  { expose: true, method: "GET", path: "/journal/daily-prompt", auth: true },
  async ({ userId }: { userId: string }): Promise<DailyPromptResponse> => {
    const userID = assertOwnUser(userId);
    RateLimits.journalRead("journal-prompt:" + userID);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/journal.ts && git commit -m "feat(journal): daily prompt endpoint with 24h cache"
```

---

## Task 15: Summary logic

**Files:**
- Create: `backend/journal/summary.ts`
- Create: `backend/journal/__tests__/summary.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/journal/__tests__/summary.test.ts
import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("generateSummary", () => {
  it("returns the model summary", async () => {
    mockChat.mockResolvedValue("You seem focused on interview prep.");
    const { generateSummary } = await import("../summary");
    const s = await generateSummary([
      { body: "practiced 10 leetcode", createdAt: "2026-04-10T10:00:00Z" },
      { body: "mock interview went ok", createdAt: "2026-04-11T10:00:00Z" },
    ]);
    expect(s).toBe("You seem focused on interview prep.");
  });

  it("returns null on failure (caller should skip)", async () => {
    mockChat.mockRejectedValue(new Error("x"));
    const { generateSummary } = await import("../summary");
    const s = await generateSummary([{ body: "hi", createdAt: "2026-04-10T10:00:00Z" }]);
    expect(s).toBeNull();
  });

  it("returns null when entries is empty", async () => {
    const { generateSummary } = await import("../summary");
    const s = await generateSummary([]);
    expect(s).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/summary.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement summary**

```typescript
// backend/journal/summary.ts
import { chatCompletion } from "./mistral-client";

export interface SummaryInput {
  body: string;
  createdAt: string;
}

const SYSTEM_PROMPT = `You are a warm career coach.
The user shares recent journal entries. In 2-3 sentences, reflect back patterns you notice:
themes, progress, tension points. No lists. No headers. Speak to them directly ("You...").
Be specific to the entries — avoid generic advice.`;

export async function generateSummary(entries: SummaryInput[]): Promise<string | null> {
  if (entries.length === 0) return null;
  try {
    const corpus = entries
      .map(e => `[${e.createdAt.slice(0, 10)}] ${e.body}`)
      .join("\n\n");
    const raw = await chatCompletion({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: corpus.slice(0, 8000) },
      ],
      maxTokens: 200,
      temperature: 0.5,
    });
    return raw.trim() || null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/summary.test.ts
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/summary.ts backend/journal/__tests__/summary.test.ts && git commit -m "feat(journal): 5-entry summary generation"
```

---

## Task 16: Wire summaries into createEntry + expose list

**Files:**
- Modify: `backend/journal/journal.ts`

- [ ] **Step 1: Import and add trigger logic**

Add import near top of `backend/journal/journal.ts`:

```typescript
import { generateSummary } from "./summary";
```

Inside the `createEntry` function, after the `INSERT INTO journal_entries` exec, add a count + conditional summary. Replace the existing tagging fire-and-forget block with:

```typescript
    // Fire-and-forget tagging
    generateTags(body).then(async (tags) => {
      for (const tag of tags) {
        await db.exec`
          INSERT INTO journal_tags (id, entry_id, user_id, tag, created_at)
          VALUES (${randomUUID()}, ${id}, ${userID}, ${tag}, ${createdAt})
        `;
      }
    }).catch(() => {});

    // Count user's entries; every 5th triggers a summary
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
```

Append at end of file — the list endpoint:

```typescript
export interface JournalSummary {
  id: string;
  body: string;
  entryCount: number;
  createdAt: string;
}

export interface ListSummariesResponse {
  summaries: JournalSummary[];
}

// GET /journal/summaries?userId=
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/journal.ts && git commit -m "feat(journal): trigger summaries every 5 entries + list endpoint"
```

---

## Task 17: Ask Your Journal — retrieval + completion

**Files:**
- Create: `backend/journal/search.ts`
- Create: `backend/journal/__tests__/search.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// backend/journal/__tests__/search.test.ts
import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("answerQuestion", () => {
  it("returns answer and citations when entries are provided", async () => {
    mockChat.mockResolvedValue("You've been focused on networking.");
    const { answerQuestion } = await import("../search");
    const result = await answerQuestion("what about networking?", [
      { id: "e1", body: "coffee chat with alice", createdAt: "2026-04-10T10:00:00Z" },
      { id: "e2", body: "nothing relevant", createdAt: "2026-04-11T10:00:00Z" },
    ]);
    expect(result.answer).toBe("You've been focused on networking.");
    expect(result.citations.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty-state answer when no entries provided", async () => {
    const { answerQuestion } = await import("../search");
    const result = await answerQuestion("hello", []);
    expect(result.answer).toMatch(/couldn't find|not yet|no entries/i);
    expect(result.citations).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/search.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement search**

```typescript
// backend/journal/search.ts
import { chatCompletion } from "./mistral-client";

export interface SearchEntry {
  id: string;
  body: string;
  createdAt: string;
}

export interface AnswerResult {
  answer: string;
  citations: { entryId: string; date: string }[];
}

const SYSTEM_PROMPT = `You answer questions about the user's own career journal entries.
Use only the entries provided — do not invent details.
Speak directly to the user ("You said...", "You've been...").
Keep answers to 2-4 sentences. If the entries don't address the question, say so plainly.`;

export async function answerQuestion(
  question: string,
  entries: SearchEntry[]
): Promise<AnswerResult> {
  if (entries.length === 0) {
    return {
      answer: "I couldn't find anything about that yet — try writing more entries first.",
      citations: [],
    };
  }

  const corpus = entries
    .map(e => `[id=${e.id} date=${e.createdAt.slice(0, 10)}]\n${e.body}`)
    .join("\n\n---\n\n");

  const answer = await chatCompletion({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Entries:\n\n${corpus.slice(0, 10_000)}\n\nQuestion: ${question}` },
    ],
    maxTokens: 250,
    temperature: 0.3,
  });

  return {
    answer: answer.trim(),
    citations: entries.slice(0, 5).map(e => ({ entryId: e.id, date: e.createdAt.slice(0, 10) })),
  };
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/admin1/PathWise/backend && npx vitest run journal/__tests__/search.test.ts
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/search.ts backend/journal/__tests__/search.test.ts && git commit -m "feat(journal): ask-your-journal retrieval + completion"
```

---

## Task 18: Ask Your Journal endpoint

**Files:**
- Modify: `backend/journal/journal.ts`

- [ ] **Step 1: Add import and endpoint**

Add import near the top of `backend/journal/journal.ts`:

```typescript
import { answerQuestion } from "./search";
```

Append at the end of the file:

```typescript
export interface AskParams {
  userId: string;
  question: string;
}

export interface AskResponse {
  answer: string;
  citations: { entryId: string; date: string }[];
}

// POST /journal/ask
export const ask = api(
  { expose: true, method: "POST", path: "/journal/ask", auth: true },
  async (p: AskParams): Promise<AskResponse> => {
    const userID = assertOwnUser(p.userId);
    RateLimits.journalAsk("journal-ask:" + userID);

    const q = p.question.trim();
    if (q.length === 0) throw APIError.invalidArgument("question is empty");
    if (q.length > 500) throw APIError.invalidArgument("question too long");

    // Simple retrieval: keyword match + fallback to most recent
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

    // If no keyword matches, fall back to 10 most recent
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/admin1/PathWise/backend && encore check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add backend/journal/journal.ts && git commit -m "feat(journal): ask-your-journal endpoint"
```

---

## Task 19: Frontend API client

**Files:**
- Create: `src/pages/CareerJournal/api.ts`

- [ ] **Step 1: Inspect existing API client pattern**

```bash
cd /home/admin1/PathWise && grep -l "fetch\|axios" src/pages/Tasks/*.tsx src/pages/Dashboard/*.tsx 2>/dev/null | head -3
```

Read the matched file(s) briefly and use the same pattern (likely `useAuth` hook + `fetch` with bearer token). Use whatever the existing codebase uses for authenticated requests.

- [ ] **Step 2: Create the API client**

```typescript
// src/pages/CareerJournal/api.ts
// Use the same auth/fetch pattern as existing pages (inspect src/pages/Tasks/index.tsx first)

export type JournalTag =
  | "win" | "blocker" | "skill-gap" | "interview-prep"
  | "learning" | "motivation" | "goal" | "reflection";

export interface JournalEntry {
  id: string;
  userId: string;
  body: string;
  source: "typed" | "voice";
  tags: JournalTag[];
  createdAt: string;
}

export interface JournalSummary {
  id: string;
  body: string;
  entryCount: number;
  createdAt: string;
}

export interface AskAnswer {
  answer: string;
  citations: { entryId: string; date: string }[];
}

const API_BASE = import.meta.env.VITE_API_URL || ""; // matches other pages

async function authedFetch(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(API_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

export async function listEntries(userId: string, token: string): Promise<JournalEntry[]> {
  const r = await authedFetch(`/journal/entries?userId=${encodeURIComponent(userId)}`, token);
  if (!r.ok) throw new Error(`listEntries ${r.status}`);
  const data = await r.json();
  return data.entries;
}

export async function createEntry(
  userId: string, body: string, source: "typed" | "voice", token: string
): Promise<JournalEntry> {
  const r = await authedFetch(`/journal/entries`, token, {
    method: "POST",
    body: JSON.stringify({ userId, body, source }),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.entry;
}

export async function deleteEntry(id: string, userId: string, token: string): Promise<void> {
  const r = await authedFetch(`/journal/entries/${id}?userId=${encodeURIComponent(userId)}`, token, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error(`deleteEntry ${r.status}`);
}

export async function getDailyPrompt(userId: string, token: string): Promise<string> {
  const r = await authedFetch(`/journal/daily-prompt?userId=${encodeURIComponent(userId)}`, token);
  if (!r.ok) throw new Error(`dailyPrompt ${r.status}`);
  const data = await r.json();
  return data.prompt;
}

export async function listSummaries(userId: string, token: string): Promise<JournalSummary[]> {
  const r = await authedFetch(`/journal/summaries?userId=${encodeURIComponent(userId)}`, token);
  if (!r.ok) throw new Error(`listSummaries ${r.status}`);
  const data = await r.json();
  return data.summaries;
}

export async function askJournal(userId: string, question: string, token: string): Promise<AskAnswer> {
  const r = await authedFetch(`/journal/ask`, token, {
    method: "POST",
    body: JSON.stringify({ userId, question }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function transcribeAudio(
  userId: string, audioBlob: Blob, token: string
): Promise<string> {
  const buf = await audioBlob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const extension = (audioBlob.type.match(/\/([a-z0-9]+)/i)?.[1] || "webm").toLowerCase();
  const r = await authedFetch(`/journal/transcribe`, token, {
    method: "POST",
    body: JSON.stringify({ userId, audioBase64: base64, extension }),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.transcript;
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/api.ts && git commit -m "feat(journal): frontend API client"
```

---

## Task 20: Tag color map

**Files:**
- Create: `src/pages/CareerJournal/lib/journalTags.ts`

- [ ] **Step 1: Create tag style map**

```typescript
// src/pages/CareerJournal/lib/journalTags.ts
import type { JournalTag } from "../api";

export const TAG_STYLES: Record<JournalTag, { bg: string; text: string; label: string }> = {
  win:              { bg: "bg-orange-100",  text: "text-orange-900",  label: "Win" },
  blocker:          { bg: "bg-rose-100",    text: "text-rose-900",    label: "Blocker" },
  "skill-gap":      { bg: "bg-violet-100",  text: "text-violet-900",  label: "Skill gap" },
  "interview-prep": { bg: "bg-sky-100",     text: "text-sky-900",     label: "Interview prep" },
  learning:         { bg: "bg-emerald-100", text: "text-emerald-900", label: "Learning" },
  motivation:       { bg: "bg-amber-100",   text: "text-amber-900",   label: "Motivation" },
  goal:             { bg: "bg-teal-100",    text: "text-teal-900",    label: "Goal" },
  reflection:       { bg: "bg-slate-100",   text: "text-slate-900",   label: "Reflection" },
};
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/lib/journalTags.ts && git commit -m "feat(journal): tag style map"
```

---

## Task 21: TagChip component

**Files:**
- Create: `src/pages/CareerJournal/components/TagChip.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/TagChip.tsx
import type { JournalTag } from "../api";
import { TAG_STYLES } from "../lib/journalTags";

export function TagChip({ tag }: { tag: JournalTag }) {
  const s = TAG_STYLES[tag];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/5 ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/TagChip.tsx && git commit -m "feat(journal): TagChip component"
```

---

## Task 21.5: Install frontend component dependencies (REVISED)

**Files:**
- Modify: `package.json`

Rationale: rather than hand-rolling a MediaRecorder wrapper and canvas-based waveform (security + maintenance burden), use vetted npm packages. Pin exact versions, audit before commit.

- [ ] **Step 1: Install packages**

```bash
cd /home/admin1/PathWise && npm install react-media-recorder@1.7.1 react-audio-visualize@1.2.0
```

These two packages together replace the hand-rolled `useAudioRecorder` + `Waveform`:
- `react-media-recorder` — wraps MediaRecorder API, returns `startRecording`, `stopRecording`, `mediaBlob`, `status`. ~600k weekly downloads, MIT, maintained.
- `react-audio-visualize` — `<LiveAudioVisualizer />` React component that renders a canvas waveform from a MediaRecorder instance. MIT, maintained.

- [ ] **Step 2: Security audit the additions**

```bash
cd /home/admin1/PathWise && npm audit --production
```

Expected: no high/critical findings introduced by the new packages. If any appear, report and pause before continuing.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add package.json package-lock.json && git commit -m "chore(journal): add react-media-recorder + react-audio-visualize"
```

---

## Task 22: useAudioRecorder hook (REVISED — thin wrapper over react-media-recorder)

**Files:**
- Create: `src/pages/CareerJournal/hooks/useAudioRecorder.ts`

Note: instead of hand-rolling MediaRecorder + AudioContext logic (~80 lines of browser API gotchas), we re-export the vetted package with a minimal PathWise-specific shim.

- [ ] **Step 1: Implement thin wrapper**

```typescript
// src/pages/CareerJournal/hooks/useAudioRecorder.ts
import { useReactMediaRecorder } from "react-media-recorder";

export interface UseRecorderResult {
  status: "idle" | "recording" | "stopped" | "acquiring_media" | "permission_denied" | string;
  startRecording: () => void;
  stopRecording: () => void;
  mediaBlob: Blob | null;
  mediaStream: MediaStream | null;
  error: string;
}

export function useAudioRecorder(): UseRecorderResult {
  const {
    status, startRecording, stopRecording,
    mediaBlobUrl, previewAudioStream, error,
  } = useReactMediaRecorder({ audio: true, blobPropertyBag: { type: "audio/webm" } });

  // The hook exposes mediaBlobUrl; components that need the Blob itself fetch it
  // once stopped. We expose a Blob loader to keep callers simple.
  return {
    status,
    startRecording,
    stopRecording,
    mediaBlob: null, // caller uses mediaBlobUrl via fetchBlob below
    mediaStream: previewAudioStream ?? null,
    error: error ?? "",
  };
}

export async function fetchBlob(blobUrl: string): Promise<Blob> {
  const r = await fetch(blobUrl);
  return r.blob();
}

// Re-export the raw hook for components that want full control (Waveform needs mediaStream)
export { useReactMediaRecorder } from "react-media-recorder";
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/hooks/useAudioRecorder.ts && git commit -m "feat(journal): useAudioRecorder (wraps react-media-recorder)"
```

---

## Task 22-DEPRECATED (original hand-rolled version — DO NOT IMPLEMENT)

The block below is the previous hand-rolled version, kept only for reference in case the npm package becomes unavailable. Skip it.

<details>
<summary>Legacy hand-rolled version (reference only)</summary>

```typescript
// src/pages/CareerJournal/hooks/useAudioRecorder.ts
import { useRef, useState, useCallback } from "react";

export interface RecorderState {
  isRecording: boolean;
  error: string | null;
  level: number; // 0-1 amplitude for waveform
}

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const [state, setState] = useState<RecorderState>({ isRecording: false, error: null, level: 0 });

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setState(s => ({ ...s, level: rms }));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const rec = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start();
      mediaRecorderRef.current = rec;
      setState({ isRecording: true, error: null, level: 0 });
    } catch (err) {
      setState({ isRecording: false, error: (err as Error).message, level: 0 });
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const rec = mediaRecorderRef.current;
      if (!rec) return resolve(new Blob());
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach(t => t.stop());
        audioCtxRef.current?.close().catch(() => {});
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setState({ isRecording: false, error: null, level: 0 });
        resolve(blob);
      };
      rec.stop();
    });
  }, []);

  return { state, start, stop };
}
```

</details>

---

## Task 23: Waveform component (REVISED — wraps react-audio-visualize)

**Files:**
- Create: `src/pages/CareerJournal/components/Waveform.tsx`

Replaces hand-rolled canvas bars with the vetted `LiveAudioVisualizer` from `react-audio-visualize`. Takes a MediaRecorder instance, renders a maintained canvas waveform. Styled in PathWise teal.

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/Waveform.tsx
import { LiveAudioVisualizer } from "react-audio-visualize";

export function Waveform({ mediaRecorder }: { mediaRecorder: MediaRecorder | null }) {
  if (!mediaRecorder) return null;
  return (
    <div aria-hidden className="flex items-center">
      <LiveAudioVisualizer
        mediaRecorder={mediaRecorder}
        width={120}
        height={28}
        barColor="#0D9488"
        barWidth={2}
        gap={1}
        smoothingTimeConstant={0.85}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/Waveform.tsx && git commit -m "feat(journal): Waveform (wraps react-audio-visualize)"
```

---

## Task 24: RecordButton component

**Files:**
- Create: `src/pages/CareerJournal/components/RecordButton.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/RecordButton.tsx
import { Mic, Square } from "lucide-react";

export function RecordButton({
  isRecording, onStart, onStop, disabled,
}: {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      aria-label={isRecording ? "Stop recording" : "Start voice dictation"}
      aria-pressed={isRecording}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full
        cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${isRecording
          ? "bg-teal-600 text-white ring-2 ring-teal-300 ring-offset-2 animate-pulse"
          : "bg-teal-100 text-teal-800 hover:bg-teal-200"}`}
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
```

- [ ] **Step 2: Verify `lucide-react` is installed**

```bash
cd /home/admin1/PathWise && grep '"lucide-react"' package.json
```

Expected: present. If missing, run `npm install lucide-react` and commit the package lock.

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/RecordButton.tsx && git commit -m "feat(journal): RecordButton component"
```

---

## Task 25: EntryComposer component

**Files:**
- Create: `src/pages/CareerJournal/components/EntryComposer.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/EntryComposer.tsx
import { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { RecordButton } from "./RecordButton";
import { Waveform } from "./Waveform";
import { transcribeAudio, createEntry } from "../api";

export function EntryComposer({
  userId, token, onCreated,
}: {
  userId: string;
  token: string;
  onCreated: () => void;
}) {
  const {
    status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, error: recError,
    previewAudioStream,
  } = useReactMediaRecorder({ audio: true, blobPropertyBag: { type: "audio/webm" } });

  const [body, setBody] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"typed" | "voice">("typed");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const isRecording = status === "recording";

  // Construct a MediaRecorder instance from the preview stream for the visualizer
  useEffect(() => {
    if (isRecording && previewAudioStream && !mediaRecorderRef.current) {
      mediaRecorderRef.current = new MediaRecorder(previewAudioStream);
    }
    if (!isRecording) mediaRecorderRef.current = null;
  }, [isRecording, previewAudioStream]);

  // When recording stops and we have a blob URL, transcribe it
  useEffect(() => {
    if (!mediaBlobUrl || transcribing) return;
    (async () => {
      try {
        setTranscribing(true);
        const blob = await (await fetch(mediaBlobUrl)).blob();
        const transcript = await transcribeAudio(userId, blob, token);
        setBody(prev => prev ? `${prev}\n\n${transcript}` : transcript);
        setSource("voice");
      } catch (err) {
        setError((err as Error).message || "Voice unavailable — please type instead");
      } finally {
        setTranscribing(false);
        clearBlobUrl();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaBlobUrl]);

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createEntry(userId, body.trim(), source, token);
      setBody("");
      setSource("typed");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-teal-100 shadow-sm p-4 transition-all duration-300
        ${isRecording ? "ring-2 ring-teal-400 shadow-teal-100" : ""}`}
    >
      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setSource("typed"); }}
        placeholder="What's on your mind about your career today?"
        rows={4}
        className="w-full resize-none bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RecordButton
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
            disabled={transcribing || saving}
          />
          {isRecording && <Waveform mediaRecorder={mediaRecorderRef.current} />}
          {transcribing && <span className="text-sm text-slate-500">Transcribing…</span>}
          {recError && <span className="text-sm text-rose-600">{recError}</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!body.trim() || saving || isRecording}
          className="cursor-pointer rounded-lg bg-[#6245a4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a3280] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/EntryComposer.tsx && git commit -m "feat(journal): EntryComposer with voice input"
```

---

## Task 26: EntryCard component

**Files:**
- Create: `src/pages/CareerJournal/components/EntryCard.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/EntryCard.tsx
import { Trash2, Mic } from "lucide-react";
import { TagChip } from "./TagChip";
import type { JournalEntry } from "../api";

export function EntryCard({
  entry, onDelete,
}: {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}) {
  const date = new Date(entry.createdAt);
  return (
    <article className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-teal-100 p-4 transition-shadow hover:shadow-md">
      <header className="mb-2 flex items-center justify-between">
        <time
          dateTime={entry.createdAt}
          className="text-xs uppercase tracking-wide text-slate-500"
        >
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </time>
        {entry.source === "voice" && (
          <span className="inline-flex items-center gap-1 text-xs text-teal-700">
            <Mic className="h-3 w-3" /> dictated
          </span>
        )}
      </header>
      <p className="whitespace-pre-wrap text-base text-slate-900">{entry.body}</p>
      <footer className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map(t => <TagChip key={t} tag={t} />)}
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete this entry?")) onDelete(entry.id);
          }}
          aria-label="Delete entry"
          className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/EntryCard.tsx && git commit -m "feat(journal): EntryCard component"
```

---

## Task 27: SummaryCard component

**Files:**
- Create: `src/pages/CareerJournal/components/SummaryCard.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/SummaryCard.tsx
import { Sparkles } from "lucide-react";
import type { JournalSummary } from "../api";

export function SummaryCard({ summary }: { summary: JournalSummary }) {
  const date = new Date(summary.createdAt);
  return (
    <article className="rounded-2xl bg-violet-50 ring-1 ring-violet-200 p-4">
      <header className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-violet-700">
          <Sparkles className="h-3 w-3" /> Reflection · entry #{summary.entryCount}
        </span>
        <time
          dateTime={summary.createdAt}
          className="text-xs uppercase tracking-wide text-violet-600"
        >
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </time>
      </header>
      <p className="font-[Caveat] text-xl leading-snug text-violet-900">{summary.body}</p>
    </article>
  );
}
```

Note: `font-[Caveat]` relies on Caveat being configured in `tailwind.config.js` — it already is per codebase audit.

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/SummaryCard.tsx && git commit -m "feat(journal): SummaryCard component"
```

---

## Task 28: DailyPromptBanner component

**Files:**
- Create: `src/pages/CareerJournal/components/DailyPromptBanner.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/DailyPromptBanner.tsx
import { useState } from "react";
import { X } from "lucide-react";

export function DailyPromptBanner({
  prompt, onAnswer,
}: {
  prompt: string;
  onAnswer: (p: string) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside className="relative rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 ring-1 ring-orange-200 p-4 pr-12">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss today's prompt"
        className="absolute right-2 top-2 cursor-pointer rounded p-1 text-orange-700 transition-colors hover:bg-orange-100"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-orange-700">
        Today's prompt
      </p>
      <p className="font-[Caveat] text-2xl leading-snug text-slate-900">{prompt}</p>
      <button
        type="button"
        onClick={() => onAnswer(prompt)}
        className="mt-3 cursor-pointer rounded-lg bg-[#F97316] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
      >
        Answer this
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/DailyPromptBanner.tsx && git commit -m "feat(journal): DailyPromptBanner"
```

---

## Task 29: AskJournalModal + AskJournalBar

**Files:**
- Create: `src/pages/CareerJournal/components/AskJournalModal.tsx`
- Create: `src/pages/CareerJournal/components/AskJournalBar.tsx`

- [ ] **Step 1: Implement AskJournalModal**

```tsx
// src/pages/CareerJournal/components/AskJournalModal.tsx
import { X, Sparkles } from "lucide-react";
import type { AskAnswer } from "../api";

export function AskJournalModal({
  open, question, loading, answer, error, onClose,
}: {
  open: boolean;
  question: string;
  loading: boolean;
  answer: AskAnswer | null;
  error: string | null;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
            <Sparkles className="h-4 w-4" /> Ask your journal
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <p className="mb-2 text-sm text-slate-500">You asked:</p>
        <p className="mb-4 italic text-slate-800">"{question}"</p>
        {loading && <div className="h-16 animate-pulse rounded-lg bg-slate-100" />}
        {error && <p className="text-rose-600">{error}</p>}
        {answer && (
          <>
            <p className="mb-3 whitespace-pre-wrap text-slate-900">{answer.answer}</p>
            {answer.citations.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">From entries</p>
                <div className="flex flex-wrap gap-1.5">
                  {answer.citations.map(c => (
                    <span
                      key={c.entryId}
                      className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-800 ring-1 ring-inset ring-teal-200"
                    >
                      {c.date}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement AskJournalBar**

```tsx
// src/pages/CareerJournal/components/AskJournalBar.tsx
import { Search } from "lucide-react";
import { useState } from "react";
import { askJournal, type AskAnswer } from "../api";
import { AskJournalModal } from "./AskJournalModal";

export function AskJournalBar({ userId, token }: { userId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setOpen(true);
    setSubmitted(q);
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const result = await askJournal(userId, q, token);
      setAnswer(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 ring-1 ring-teal-100 backdrop-blur-md"
      >
        <Search className="h-4 w-4 text-teal-600" aria-hidden />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your journey…"
          className="flex-1 bg-transparent text-sm focus:outline-none"
          aria-label="Ask your journal"
        />
      </form>
      <AskJournalModal
        open={open}
        question={submitted}
        loading={loading}
        answer={answer}
        error={error}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/AskJournal*.tsx && git commit -m "feat(journal): AskJournal bar + modal"
```

---

## Task 30: EmptyState component

**Files:**
- Create: `src/pages/CareerJournal/components/EmptyState.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/CareerJournal/components/EmptyState.tsx
import { BookOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 py-16 text-center ring-1 ring-teal-100">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
        <BookOpen className="h-7 w-7 text-teal-700" aria-hidden />
      </div>
      <h2 className="font-[Manrope] text-xl font-semibold text-slate-900">
        Your career story starts here
      </h2>
      <p className="mt-2 max-w-xs font-[Caveat] text-xl text-slate-600">
        Write a thought. Dictate a win. Revisit it tomorrow.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/components/EmptyState.tsx && git commit -m "feat(journal): EmptyState component"
```

---

## Task 31: Main page (index.tsx)

**Files:**
- Create: `src/pages/CareerJournal/index.tsx`

- [ ] **Step 1: Inspect how existing pages obtain `userId` + `token`**

```bash
cd /home/admin1/PathWise && grep -rn "useAuth\|userId\|token" src/pages/Tasks/index.tsx | head -20
```

Read one existing page (`src/pages/Tasks/index.tsx` or `src/pages/Dashboard/index.tsx`) to see the exact auth hook and adapt the imports below accordingly.

- [ ] **Step 2: Implement the page**

```tsx
// src/pages/CareerJournal/index.tsx
// IMPORTANT: replace `useAuth()` below with whatever existing hook the codebase uses
// (e.g., from `src/contexts/AuthContext.tsx` or similar).
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext"; // adjust import to match codebase
import {
  listEntries,
  listSummaries,
  deleteEntry,
  getDailyPrompt,
  type JournalEntry,
  type JournalSummary,
} from "./api";
import { EntryComposer } from "./components/EntryComposer";
import { EntryCard } from "./components/EntryCard";
import { SummaryCard } from "./components/SummaryCard";
import { DailyPromptBanner } from "./components/DailyPromptBanner";
import { AskJournalBar } from "./components/AskJournalBar";
import { EmptyState } from "./components/EmptyState";

type FeedItem =
  | { type: "entry"; entry: JournalEntry }
  | { type: "summary"; summary: JournalSummary };

export default function CareerJournalPage() {
  const { user, token } = useAuth(); // adjust per codebase
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [summaries, setSummaries] = useState<JournalSummary[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefillPrompt, setPrefillPrompt] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id || !token) return;
    const [es, ss] = await Promise.all([
      listEntries(user.id, token),
      listSummaries(user.id, token),
    ]);
    setEntries(es);
    setSummaries(ss);
  }, [user?.id, token]);

  useEffect(() => {
    if (!user?.id || !token) return;
    (async () => {
      try {
        setLoading(true);
        await reload();
        const p = await getDailyPrompt(user.id, token);
        setPrompt(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, token, reload]);

  const handleDelete = async (id: string) => {
    if (!user?.id || !token) return;
    await deleteEntry(id, user.id, token);
    await reload();
  };

  // Merge entries + summaries, sort by createdAt desc
  const feed: FeedItem[] = [
    ...entries.map(e => ({ type: "entry" as const, entry: e })),
    ...summaries.map(s => ({ type: "summary" as const, summary: s })),
  ].sort((a, b) => {
    const aT = a.type === "entry" ? a.entry.createdAt : a.summary.createdAt;
    const bT = b.type === "entry" ? b.entry.createdAt : b.summary.createdAt;
    return bT.localeCompare(aT);
  });

  if (!user?.id || !token) {
    return <div className="p-8 text-slate-500">Please sign in.</div>;
  }

  return (
    <div className="min-h-screen bg-[#eefcfe]">
      <div className="mx-auto max-w-[680px] px-4 py-8">
        <header className="mb-6">
          <h1 className="font-[Manrope] text-3xl font-bold text-slate-900">Journal</h1>
          <p className="mt-1 text-sm text-slate-600">A quiet place to think about your career.</p>
        </header>

        <div className="mb-4">
          <AskJournalBar userId={user.id} token={token} />
        </div>

        {prompt && (
          <div className="mb-4">
            <DailyPromptBanner
              prompt={prompt}
              onAnswer={(p) => setPrefillPrompt(p)}
            />
          </div>
        )}

        <div className="mb-6">
          <EntryComposer
            key={prefillPrompt || "composer"}
            userId={user.id}
            token={token}
            onCreated={reload}
          />
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white/40" />
        ) : feed.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {feed.map((item) =>
              item.type === "entry" ? (
                <EntryCard key={`e-${item.entry.id}`} entry={item.entry} onDelete={handleDelete} />
              ) : (
                <SummaryCard key={`s-${item.summary.id}`} summary={item.summary} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/CareerJournal/index.tsx && git commit -m "feat(journal): main CareerJournal page"
```

---

## Task 32: Wire route + nav link

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Find the routes block**

```bash
cd /home/admin1/PathWise && grep -n "Route\|lazy" src/App.tsx | head -20
```

- [ ] **Step 2: Add lazy import near other lazy imports**

Add to the top of `src/App.tsx`:

```typescript
const CareerJournalPage = lazy(() => import("./pages/CareerJournal"));
```

- [ ] **Step 3: Add route inside `<Routes>` block**

Add next to the `/tasks` route or another authenticated route:

```tsx
<Route path="/journal" element={<CareerJournalPage />} />
```

Also add `/app/journal` if the app has dual-prefix routing (check what pattern exists for other pages — use whatever is consistent).

- [ ] **Step 4: Add nav link**

Find the sidebar or nav component (search for "Tasks" and add a "Journal" link adjacent with the same styling). Use the `BookOpen` icon from lucide-react.

```bash
cd /home/admin1/PathWise && grep -rn "Tasks" src/components/ | grep -i "nav\|sidebar" | head -5
```

Add a link entry matching the existing pattern exactly.

- [ ] **Step 5: Run dev server and verify**

```bash
cd /home/admin1/PathWise && npm run dev
```

Navigate to `http://localhost:5173/journal` — confirm page loads, composer renders, daily prompt fetches. Hit Ctrl-C to stop.

- [ ] **Step 6: Commit**

```bash
cd /home/admin1/PathWise && git add src/App.tsx src/components/ && git commit -m "feat(journal): add /journal route and nav link"
```

---

## Task 33: Changelog entry

**Files:**
- Modify: `src/pages/WhatsNew/changelogData.ts`

- [ ] **Step 1: Add entry at top of the `CHANGELOG` array**

```typescript
{
  version: "0.20.0",
  date: "April 17, 2026",
  title: "Career Journal — write, dictate, reflect",
  tag: "feature",
  description:
    "A quiet new space to journal your career. Type or dictate entries with voice, get AI-generated tags and periodic reflections, and ask questions across your own journey.",
  highlights: [
    "Voice dictation with Mistral Voxtral",
    "AI-generated tags on every entry (win, skill-gap, interview-prep, …)",
    "Daily reflection prompts, refreshed every 24 hours",
    "Auto-summaries every 5 entries",
    "Ask natural-language questions across your entire journal",
  ],
},
```

- [ ] **Step 2: Commit**

```bash
cd /home/admin1/PathWise && git add src/pages/WhatsNew/changelogData.ts && git commit -m "docs(journal): add v0.20.0 changelog entry"
```

---

## Task 34: Manual verification pass

**Files:** None — behavioral test.

- [ ] **Step 1: Start backend and frontend**

Terminal 1:
```bash
cd /home/admin1/PathWise/backend && encore run
```
Terminal 2:
```bash
cd /home/admin1/PathWise && npm run dev
```

- [ ] **Step 2: Walk through golden path**

- [ ] Log in → navigate to `/journal`
- [ ] See today's AI-generated daily prompt
- [ ] Type an entry, hit Save → appears in feed
- [ ] Wait ~5 seconds, refresh → AI tags appear
- [ ] Dictate an entry using mic button → transcript appears → save
- [ ] Write 5 entries total → confirm a SummaryCard (violet) appears in feed
- [ ] Use AskJournalBar → "what have I learned?" → modal opens, shows answer + citations
- [ ] Delete an entry → confirm removal
- [ ] Hit rate limit: try 11 entries in a day → confirm error toast with reset time
- [ ] Check console/network: no errors from Mistral API are surfaced to user (silent degrade)

- [ ] **Step 3: If any step fails, file a follow-up task, fix, re-test. Do not commit until all golden-path steps pass.**

---

## Task 35: Verify tests pass and push

**Files:** None — CI verification.

- [ ] **Step 1: Run full backend test suite**

```bash
cd /home/admin1/PathWise/backend && npx vitest run
```

Expected: all tests pass, including the new journal tests (mistral-client, tagging, prompts, summary, search).

- [ ] **Step 2: Run lint and typecheck (if project has them)**

```bash
cd /home/admin1/PathWise && npm run lint 2>/dev/null; cd /home/admin1/PathWise && npm run typecheck 2>/dev/null
```

Fix any errors. Commit fixes as `chore(journal): lint/typecheck fixes`.

- [ ] **Step 3: Review commit log**

```bash
cd /home/admin1/PathWise && git log --oneline main..HEAD
```

Expected: ~30 commits matching the tasks above, each small and scoped.

- [ ] **Step 4: Push to origin and open PR**

```bash
cd /home/admin1/PathWise && git push -u origin HEAD
```

Use `gh pr create` with the title `feat: career journal module`. Body should summarize: isolated new module, backend service + frontend page, Mistral integration (STT + text), budget-mode rate limits, no changes to core features.

---

## Self-Review (completed before handoff)

**Spec coverage:**
- Goals: entries/voice/tags/daily prompt/summaries/ask-journal/graceful-degrade/design-tokens/cost-ceiling ✅ all covered by tasks
- Non-goals: TTS, rich editor, nested pages, streaming STT, soft-delete, sharing, core-feature integration, paid gating — none added ✅
- Architecture: service structure ✅, endpoints table ✅, schema ✅, mistral wrapper ✅, rate-limits ✅, secrets ✅, frontend folder ✅, design tokens ✅, voice UX ✅, data flow ✅, error handling ✅
- Rollout: changelog entry added (Task 33). Hidden-route internal dogfood step is noted in spec but not blocking — execute after Task 35.
- Observability: logging/alerting not yet broken into tasks (spec section 6). **Adding as explicit deferred item**: wire Mistral call logging to existing observability later; scope for v1.1.

**Placeholder scan:** Two items pointed at "whatever the existing codebase uses" (API base URL in Task 19, auth hook in Task 31). These are correctly parameterized on existing patterns — the inspector steps (grep before implement) will resolve them. Not placeholders; they're "match existing convention" instructions.

**Type consistency:** `JournalTag`, `JournalEntry`, `JournalSummary`, `AskAnswer` defined once in `api.ts` and referenced consistently. Backend returns mirror the frontend types. Model names pinned: `ministral-8b-latest`, `mistral-small-latest`, `voxtral-mini-2507`.

**Known deferred (not blocking MVP):**
- Observability / cost logging (spec §6)
- Internal-only hidden-route phase (spec §7, step 1)
- Vector search upgrade for Ask Your Journal (spec §8)

No other gaps found.
