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
    <article className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-teal-100 p-6 transition-shadow hover:shadow-md">
      <header className="mb-3 flex items-center justify-between">
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
      <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-900">{entry.body}</p>
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
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
