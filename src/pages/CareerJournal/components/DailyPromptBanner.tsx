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
    <aside className="relative rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 ring-1 ring-orange-200 p-6 pr-14">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss today's prompt"
        className="absolute right-3 top-3 cursor-pointer rounded p-1 text-orange-700 transition-colors hover:bg-orange-100"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-700">
        Today's prompt
      </p>
      <p className="font-[Caveat] text-3xl leading-snug text-slate-900">{prompt}</p>
      <button
        type="button"
        onClick={() => onAnswer(prompt)}
        className="mt-4 cursor-pointer rounded-lg bg-[#F97316] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Answer this
      </button>
    </aside>
  );
}
