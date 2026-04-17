export const JOURNAL_TAGS = [
  "win",
  "blocker",
  "skill-gap",
  "interview-prep",
  "learning",
  "motivation",
  "goal",
  "reflection",
] as const;

export type JournalTag = (typeof JOURNAL_TAGS)[number];

export function isValidTag(tag: string): tag is JournalTag {
  return (JOURNAL_TAGS as readonly string[]).includes(tag);
}
