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
