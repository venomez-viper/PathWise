import type { JournalTag } from "../api";

export const TAG_STYLES: Record<JournalTag, { bg: string; text: string; label: string }> = {
  win:              { bg: "bg-orange-100",  text: "text-orange-900",  label: "Win" },
  blocker:          { bg: "bg-rose-100",    text: "text-rose-900",    label: "Blocker" },
  "skill-gap":      { bg: "bg-violet-100",  text: "text-violet-900",  label: "Skill gap" },
  "interview-prep": { bg: "bg-sky-100",     text: "text-sky-900",     label: "Interview prep" },
  learning:         { bg: "bg-emerald-100", text: "text-emerald-900", label: "Learning" },
  motivation:       { bg: "bg-amber-100",   text: "text-amber-900",   label: "Motivation" },
  goal:             { bg: "bg-teal-100",    text: "text-teal-900",    label: "Goal" },
  reflection:       { bg: "bg-slate-100",   text: "text-slate-900",   label: "Reflection" },
};
