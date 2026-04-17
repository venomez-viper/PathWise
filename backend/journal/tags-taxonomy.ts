export type JournalTag =
  | "win"
  | "blocker"
  | "skill-gap"
  | "interview-prep"
  | "learning"
  | "motivation"
  | "goal"
  | "reflection";

export const JOURNAL_TAGS: JournalTag[] = [
  "win",
  "blocker",
  "skill-gap",
  "interview-prep",
  "learning",
  "motivation",
  "goal",
  "reflection",
];

export function isValidTag(tag: string): tag is JournalTag {
  return (JOURNAL_TAGS as readonly string[]).includes(tag);
}
