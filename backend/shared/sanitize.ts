/**
 * Sanitize user-supplied strings before interpolating them into AI prompts.
 *
 * Defends against prompt-injection attacks by:
 *  1. Replacing newlines / carriage returns with spaces (prevents multi-line injection)
 *  2. Stripping backtick fences that could break out of quoted context
 *  3. Removing common injection phrases ("ignore previous instructions", etc.)
 *  4. Truncating to a safe maximum length
 */
export function sanitizeForPrompt(
  input: string,
  maxLength: number = 500,
): string {
  let s = input;

  // 1. Collapse newlines and carriage returns into single spaces
  s = s.replace(/[\r\n]+/g, " ");

  // 2. Strip backtick sequences (triple and single)
  s = s.replace(/`{1,}/g, "");

  // 3. Remove well-known injection phrases (case-insensitive)
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /ignore\s+(all\s+)?above\s+instructions/gi,
    /disregard\s+(all\s+)?previous\s+instructions/gi,
    /disregard\s+(all\s+)?above\s+instructions/gi,
    /you\s+are\s+now\s+(?:a|an)\s/gi,
    /system\s*:\s*/gi,
    /\buser\s*:\s*/gi,
    /\bassistant\s*:\s*/gi,
    /<\/?system>/gi,
    /<\/?user>/gi,
    /<\/?assistant>/gi,
  ];
  for (const pat of injectionPatterns) {
    s = s.replace(pat, "");
  }

  // 4. Collapse any resulting multiple spaces
  s = s.replace(/\s{2,}/g, " ").trim();

  // 5. Truncate to maxLength
  if (s.length > maxLength) {
    s = s.slice(0, maxLength);
  }

  return s;
}
