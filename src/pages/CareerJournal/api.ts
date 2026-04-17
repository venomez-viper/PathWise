/**
 * Career Journal API client — uses PathWise's shared tokenStore + base URL pattern.
 */
import { tokenStore } from "../../lib/api";

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

function getBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return "https://staging-pathwise-4mxi.encr.app";
  }
  return "http://localhost:4000";
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? body?.code ?? `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listEntries(userId: string): Promise<JournalEntry[]> {
  const data = await req<{ entries: JournalEntry[] }>(
    `/journal/entries?userId=${encodeURIComponent(userId)}`
  );
  return data.entries;
}

export async function createEntry(
  userId: string, body: string, source: "typed" | "voice"
): Promise<JournalEntry> {
  const data = await req<{ entry: JournalEntry }>(`/journal/entries`, {
    method: "POST",
    body: JSON.stringify({ userId, body, source }),
  });
  return data.entry;
}

export async function deleteEntry(id: string, userId: string): Promise<void> {
  await req<{ ok: true }>(`/journal/entries/${id}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export async function getDailyPrompt(userId: string): Promise<string> {
  const data = await req<{ prompt: string }>(
    `/journal/daily-prompt?userId=${encodeURIComponent(userId)}`
  );
  return data.prompt;
}

export async function listSummaries(userId: string): Promise<JournalSummary[]> {
  const data = await req<{ summaries: JournalSummary[] }>(
    `/journal/summaries?userId=${encodeURIComponent(userId)}`
  );
  return data.summaries;
}

export async function askJournal(userId: string, question: string): Promise<AskAnswer> {
  return req<AskAnswer>(`/journal/ask`, {
    method: "POST",
    body: JSON.stringify({ userId, question }),
  });
}

export async function transcribeAudio(userId: string, audioBlob: Blob): Promise<string> {
  const buf = await audioBlob.arrayBuffer();
  // Chunked base64 encoding to avoid call stack overflow on large buffers
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as unknown as number[]);
  }
  const base64 = btoa(binary);
  const extension = (audioBlob.type.match(/\/([a-z0-9]+)/i)?.[1] || "webm").toLowerCase();
  const data = await req<{ transcript: string }>(`/journal/transcribe`, {
    method: "POST",
    body: JSON.stringify({ userId, audioBase64: base64, extension }),
  });
  return data.transcript;
}
