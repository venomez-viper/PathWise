import { Search, Sparkles } from 'lucide-react';

export default function SearchComponent() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/70 px-3 py-2 shadow-[0_10px_24px_rgba(69,44,20,0.08)] backdrop-blur">
      <Search className="h-4 w-4 text-[color:var(--ink-soft)]" />
      <input
        type="text"
        placeholder="Search roles, skills, or industries"
        className="w-full min-w-0 bg-transparent text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-soft)] md:w-56"
      />
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105"
        aria-label="Search"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}
