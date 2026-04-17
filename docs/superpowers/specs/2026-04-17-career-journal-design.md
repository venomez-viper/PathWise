# Career Journal — Design Spec

**Date:** 2026-04-17
**Status:** Draft — pending review
**Author:** Claude (brainstormed with user)
**Target path:** `backend/journal/` + `src/pages/CareerJournal/`

---

## 1. Summary

A new standalone Career Journal module inside PathWise. Users write daily career reflections, dictate entries by voice (Mistral Voxtral STT), get AI-generated tags and periodic summaries, and can ask natural-language questions over their own entries. Isolated from all existing features — no changes to Solution page, assessment, tasks, streaks, or roadmap.

**Why isolated:** ship voice + AI safely in a self-contained surface before expanding into core features. First LLM integration in the PathWise codebase.

**Free tier.** Budget-mode: cheapest viable Mistral models, tight rate limits, no TTS, no object storage.

---

## 2. Goals & non-goals

### Goals
- Users can write journal entries by typing or dictating
- AI auto-tags entries on save (e.g., "win", "skill gap", "interview prep")
- AI suggests a daily reflection prompt
- AI generates a "patterns I'm noticing" summary every 5 entries
- Users can ask natural-language questions over their own entries
- All voice + AI features fail gracefully — journal writing always works
- Matches PathWise's existing design system (Manrope / Inter / Caveat, purple primary, teal-tinted surfaces)
- Monthly per-active-user cost stays under ~$0.30

### Non-goals (v1)
- TTS read-back of entries (cost + no object storage)
- Rich block editor, nested pages, templates, backlinks (Notion-style — explicitly deferred)
- Streaming / live transcription (chunked post-recording STT only)
- Soft-delete / trash (hard delete only)
- Sharing entries with others
- Integration with tasks, assessment, roadmap, streaks
- Paid tier gating (everything free)

---

## 3. User flows

### 3.1 First visit (empty state)
1. User navigates to `/journal`
2. Sees empty state: friendly illustration, "Your career story starts here" heading, CTA "Write your first entry"
3. Composer is focused and ready

### 3.2 Write entry (typing)
1. User types into composer textarea
2. User taps "Save"
3. Entry saved, AI tagging fires async, tag chips fade in 60ms-staggered once returned

### 3.3 Write entry (voice)
1. User taps mic button
2. Composer card gains teal glowing border (Border Beam)
3. Waveform visualizer appears inline
4. User taps mic again to stop
5. Audio blob uploaded to backend, Voxtral STT transcribes
6. Transcript inserted into composer textarea, user edits if needed
7. User taps Save → same as 3.2

### 3.4 Daily prompt
1. On `/journal` load, daily prompt banner appears at top if user hasn't dismissed/answered today's
2. Prompt is AI-generated once per user per day, cached 24h
3. Tapping "Answer this" pre-fills composer with prompt in a blockquote

### 3.5 Auto-summary
1. When user saves entry #5, #10, #15 etc., backend generates a summary asynchronously
2. Summary appears as a distinct "Reflection" card in the feed, dated, with a soft lavender tint to distinguish from entries
3. User can delete summaries like entries

### 3.6 Ask your journal
1. Sticky pill search bar at top (desktop) or bottom (mobile)
2. User types "what did I say about networking?"
3. Backend retrieves relevant entries (simple keyword + recent-first; no vector DB for v1), sends as context to `mistral-small-latest`
4. AI answer appears in a modal with citations (dates of entries referenced)
5. Rate-limited: 5 queries/day per user

---

## 4. Architecture

### 4.1 Backend — new Encore service `backend/journal/`

```
backend/journal/
├── journal.ts                  # API endpoints
├── mistral-client.ts           # Shared Mistral client wrapper
├── tagging.ts                  # Tag generation logic
├── summary.ts                  # 5-entry summary logic
├── prompts.ts                  # Daily prompt generation + cache
├── search.ts                   # Ask-your-journal retrieval + completion
└── migrations/
    ├── 1_create_journal_entries.up.sql
    ├── 2_create_journal_tags.up.sql
    ├── 3_create_journal_summaries.up.sql
    └── 4_create_journal_daily_prompts.up.sql
```

### 4.2 API endpoints

All authenticated. All enforce `authData.userID === params.userId` (copy pattern from `backend/tasks/tasks.ts`).

| Method | Path | Purpose | Rate limit |
|---|---|---|---|
| POST | `/journal/entries` | Create entry (text) | 10/day/user |
| GET | `/journal/entries` | List user's entries (paginated, newest first) | 30/min |
| DELETE | `/journal/entries/:id` | Hard delete entry | 30/min |
| POST | `/journal/transcribe` | Upload audio blob, return transcript | 5/day/user |
| GET | `/journal/daily-prompt` | Fetch (or generate if missing) today's prompt | 30/min |
| POST | `/journal/ask` | Natural-language search over own entries | 5/day/user |
| GET | `/journal/summaries` | List user's auto-summaries | 30/min |

### 4.3 Database schema

**`journal_entries`**
```sql
CREATE TABLE journal_entries (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  body        TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'typed',  -- 'typed' | 'voice'
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id, created_at DESC);
```

**`journal_tags`** (many-to-one with entries)
```sql
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

Tag taxonomy (v1 — fixed list, AI picks from these): `win`, `blocker`, `skill-gap`, `interview-prep`, `learning`, `motivation`, `goal`, `reflection`.

**`journal_summaries`**
```sql
CREATE TABLE journal_summaries (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  body          TEXT NOT NULL,
  entry_count   INTEGER NOT NULL,   -- e.g., 5, 10, 15
  created_at    TEXT NOT NULL
);
CREATE INDEX idx_journal_summaries_user_id ON journal_summaries(user_id, created_at DESC);
```

**`journal_daily_prompts`**
```sql
CREATE TABLE journal_daily_prompts (
  user_id     TEXT NOT NULL,
  prompt_date TEXT NOT NULL,  -- YYYY-MM-DD in user's locale
  prompt      TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (user_id, prompt_date)
);
```

### 4.4 Mistral client wrapper

`backend/journal/mistral-client.ts` — single file wrapping `@mistralai/mistralai` SDK.

```typescript
import { secret } from "encore.dev/config";
import { Mistral } from "@mistralai/mistralai";

const mistralKey = secret("MistralAPIKey");
let client: Mistral | null = null;

function getClient() {
  if (!client) client = new Mistral({ apiKey: mistralKey() });
  return client;
}

export async function chatCompletion(opts: {
  model: "ministral-8b-latest" | "mistral-small-latest";
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
}): Promise<string> { /* ... */ }

export async function transcribeAudio(opts: {
  audio: Buffer;
  filename: string;
  language?: string;
}): Promise<string> { /* ... */ }
```

**Model selection policy (cost-optimized):**
- Tagging: `ministral-8b-latest` (~$0.10/1M tokens)
- Daily prompts: `ministral-8b-latest` (one call/user/day)
- Summaries: `mistral-small-latest` (~$0.20/$0.60 per 1M tokens)
- Ask Your Journal: `mistral-small-latest`

### 4.5 Rate limiting

Extend `backend/shared/rate-limiter.ts`:
```typescript
export const RateLimits = {
  // ...existing...
  journalEntry: (key: string) => checkRateLimit(key, 10, 86_400_000),      // 10/day
  journalVoice: (key: string) => checkRateLimit(key, 5, 86_400_000),       // 5/day
  journalAsk: (key: string) => checkRateLimit(key, 5, 86_400_000),         // 5/day
  journalRead: (key: string) => checkRateLimit(key, 30, 60_000),           // 30/min
};
```

Keys scoped `"journal-entry:" + userID`, etc.

### 4.6 Secrets

New Encore secret: `MistralAPIKey`. Stored via `encore secret set` — never committed.

### 4.7 Frontend — new page `src/pages/CareerJournal/`

```
src/pages/CareerJournal/
├── index.tsx                    # JournalPage route component
├── CareerJournal.css            # Any page-specific overrides
└── components/
    ├── EntryComposer.tsx        # Text + mic button
    ├── EntryCard.tsx            # One past entry, tags, delete
    ├── SummaryCard.tsx          # Distinct summary style
    ├── DailyPromptBanner.tsx    # Today's AI prompt
    ├── AskJournalBar.tsx        # Sticky search pill
    ├── AskJournalModal.tsx      # Answer + citations
    ├── RecordButton.tsx         # Mic with pulsing ring
    ├── Waveform.tsx             # Inline audio visualizer
    ├── TagChip.tsx              # One AI-generated tag pill
    └── EmptyState.tsx           # First-visit illustration
```

**Route:** add `/journal` lazy-loaded in `src/App.tsx`.

### 4.8 Design tokens

Use existing PathWise tokens from `tailwind.config.js`:
- Surfaces: `#eefcfe` (Zen Stone teal) — page background and card surfaces
- Primary: `#6245a4` (purple) — Save button, primary CTAs
- Secondary: `#006a62` (teal) — mic button, voice-active states, AI affordances
- CTA accent: `#F97316` (orange) — daily prompt "Answer this" button only
- Text: existing dark text token
- Tag chip palette: soft pastels per tag (win=peach, skill-gap=lavender, reflection=mint, etc.) — define in `src/lib/journalTags.ts`

**Typography:**
- Headings: Manrope
- Body: Inter
- Journal accent (daily prompt text, empty state tagline): Caveat

### 4.9 Component library integration

Inspired by 21st.dev patterns (verify exact URLs when implementing):
- Composer: AI Chat Input pattern (trailing icon slot for mic)
- Recording glow: Border Beam / Shine Border (Magic UI)
- Mic pulse: Ripple / Pulsating Button (Magic UI)
- Entry cards: Glass Card (`bg-white/70 backdrop-blur-md ring-1 ring-teal-100`)
- Tag chips: shadcn Badge base + per-tag color classes
- Ask bar: AI Search Input / Command Menu pattern

No new npm dependencies beyond `@mistralai/mistralai` and potentially `react-voice-visualizer` for the waveform (evaluate vs. hand-rolled canvas).

### 4.10 Voice UX details

- Recording uses browser `MediaRecorder` API, default `audio/webm;codecs=opus`
- Audio blob POSTed as multipart to `/journal/transcribe`
- Backend forwards to Voxtral `/v1/audio/transcriptions` with `model=voxtral-mini-2507`, `language=en`
- File size cap enforced backend-side: 5MB (≈3-4 min audio at opus bitrate) to keep STT cost bounded
- No streaming — single request/response, spinner shown during transcription
- Failed transcription → toast "Voice unavailable, please type" — composer still works

### 4.11 Data flow diagram (voice entry)

```
[RecordButton] → MediaRecorder → Blob
     → POST /journal/transcribe (multipart)
         → backend rate-limit check (journalVoice)
         → Voxtral STT call
         → return { transcript } to composer
     → User reviews & edits → taps Save
     → POST /journal/entries { body }
         → rate-limit check (journalEntry)
         → INSERT journal_entries
         → async fire-and-forget: ministral-8b tagging
             → INSERT journal_tags
         → if entry_count % 5 === 0:
             → async mistral-small summarization
             → INSERT journal_summaries
         → return { entry, pendingTags: true }
     → Frontend polls or refetches for tags (optimistic)
```

### 4.12 Error handling

| Failure | Behavior |
|---|---|
| Mistral API down / 5xx | Entry still saves; tags skipped; toast "AI tagging unavailable, entry saved" |
| STT timeout | Error toast; composer stays editable; user types instead |
| Rate limit hit | Toast with reset time; write UI disabled until reset |
| Network offline | Composer queues entry in localStorage; retries on reconnect (v1.5 — defer) |
| Audio > 5MB | Client-side warning before upload; offer re-record |
| Ask query returns no relevant entries | "I couldn't find anything about that yet — try writing more entries first" |

---

## 5. Testing strategy

- **Backend**: Encore test runner. Unit test each endpoint for happy path, auth (wrong user), rate limit (over-limit), invalid input. Mock Mistral client.
- **Frontend**: Component tests for composer (record/stop toggle, save disabled until text present), entry card (tag rendering, delete confirmation), daily prompt banner (dismiss state), ask modal (loading/success/error).
- **Integration**: One end-to-end test that writes an entry, verifies it appears in list, and verifies tags arrive within N seconds.
- **Manual verification before PR**: write 6 entries (to trigger first summary), dictate one, delete one, ask one question, hit a rate limit intentionally.

---

## 6. Observability

- Log all Mistral API calls with: model used, latency, token counts, cost estimate (per call)
- Daily aggregate: total Mistral spend per day, per user (top 10 users by spend)
- Alert if a single user exceeds $1/day (caps abuse before it gets expensive)
- Error tracking: route Mistral 5xx / rate-limit errors to existing error logger

---

## 7. Rollout plan

1. Ship behind hidden route (`/journal` works, but no nav link) — internal dogfood for 3-5 days
2. Add nav link + "New!" pill in sidebar
3. Add changelog entry to `src/pages/WhatsNew/changelogData.ts`
4. Monitor cost metrics daily for first 2 weeks
5. If cost per user exceeds projection, tighten rate limits before raising models

---

## 8. Open questions / deferred

- **Vector search for Ask Your Journal**: v1 uses simple recency + keyword retrieval. If answer quality is poor with >50 entries, add `pgvector` embeddings later.
- **Tag taxonomy evolution**: v1 uses fixed 8 tags. Allow user-defined tags in v2.
- **Summary cadence**: every 5 entries may be too frequent for heavy writers, too rare for light ones. Revisit after 2 weeks of usage data.
- **Export**: no export to PDF/markdown in v1. Add when requested.
- **Mobile-native voice UX**: web-only v1. iOS app gets parallel implementation separately.

---

## 9. Effort estimate

| Work | Estimate |
|---|---|
| Backend service scaffold + migrations | 1 day |
| Mistral client wrapper + 4 capability modules (tagging/summary/prompt/ask) | 1.5 days |
| Voxtral STT endpoint + rate limiting | 0.5 day |
| Frontend page + composer + entry feed | 1.5 days |
| Daily prompt banner + ask modal + empty state | 1 day |
| Voice recording UI + waveform + error states | 1 day |
| Tests (backend + frontend) | 1 day |
| Design polish + accessibility pass + manual QA | 1 day |
| Changelog + rollout | 0.5 day |
| **Total** | **~9 days** |

Parallelizable across backend + frontend agents, realistic elapsed time ~5-6 days with concurrent work.

---

## 10. Checklist before implementation

- [ ] User reviews this spec
- [ ] `MistralAPIKey` secret obtained (user must rotate the one leaked earlier)
- [ ] Confirm Voxtral model ID `voxtral-mini-2507` is current (docs.mistral.ai check)
- [ ] Confirm no TTS required for v1 ✅
- [ ] Add `@mistralai/mistralai` to `backend/package.json`
- [ ] Writing-plans skill invoked to produce implementation plan with concrete tasks
