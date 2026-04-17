import { Search } from "lucide-react";
import { useState } from "react";
import { askJournal, type AskAnswer } from "../api";
import { AskJournalModal } from "./AskJournalModal";

export function AskJournalBar({ userId }: { userId: string }) {
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
      const result = await askJournal(userId, q);
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
