import { BookOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 py-16 text-center ring-1 ring-teal-100">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
        <BookOpen className="h-7 w-7 text-teal-700" aria-hidden />
      </div>
      <h2 className="font-[Manrope] text-xl font-semibold text-slate-900">
        Your career story starts here
      </h2>
      <p className="mt-2 max-w-xs font-[Caveat] text-xl text-slate-600">
        Write a thought. Dictate a win. Revisit it tomorrow.
      </p>
    </div>
  );
}
