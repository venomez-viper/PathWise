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

const API_BASE = import.meta.env.VITE_API_URL || "";

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
