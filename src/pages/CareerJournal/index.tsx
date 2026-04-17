import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../lib/auth-context";
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
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [summaries, setSummaries] = useState<JournalSummary[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefillPrompt, setPrefillPrompt] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [es, ss] = await Promise.all([
        listEntries(user.id),
        listSummaries(user.id),
      ]);
      setEntries(es);
      setSummaries(ss);
    } catch { /* silently ignore reload errors */ }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await reload();
        const p = await getDailyPrompt(user.id);
        if (!cancelled) setPrompt(p);
      } catch {
        /* prompt unavailable; UI hides banner */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, reload]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    try {
      await deleteEntry(id, user.id);
      await reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const feed: FeedItem[] = [
    ...entries.map(e => ({ type: "entry" as const, entry: e })),
    ...summaries.map(s => ({ type: "summary" as const, summary: s })),
  ].sort((a, b) => {
    const aT = a.type === "entry" ? a.entry.createdAt : a.summary.createdAt;
    const bT = b.type === "entry" ? b.entry.createdAt : b.summary.createdAt;
    return bT.localeCompare(aT);
  });

  if (!user?.id) {
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
          <AskJournalBar userId={user.id} />
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
            userId={user.id}
            prefill={prefillPrompt}
            onCreated={() => {
              setPrefillPrompt(undefined);
              reload();
            }}
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
