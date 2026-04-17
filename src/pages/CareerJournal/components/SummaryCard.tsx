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
