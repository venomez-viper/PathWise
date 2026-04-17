import type { JournalTag } from "../api";
import { TAG_STYLES } from "../lib/journalTags";

export function TagChip({ tag }: { tag: JournalTag }) {
  const s = TAG_STYLES[tag];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/5 ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
