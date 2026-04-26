/**
 * Log redaction helpers.
 *
 * The Encore dashboard surfaces every `console.warn` / `console.error` line
 * to anyone with viewer access. Raw PII (full email addresses, recipient
 * lists, message_ids) shouldn't be sitting in those logs — use these helpers
 * at every log call that touches user-controlled identifiers.
 */

/**
 * Mask an email address for logging.
 *   "alice@example.com"  → "al***@example.com"
 *   ""                   → "?"
 *   "no-at"              → "?"
 */
export function redactEmail(e: string | null | undefined): string {
  if (!e) return "?";
  const [local, domain] = e.split("@");
  if (!domain) return "?";
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Mask a list of email addresses for logging. Returns the count plus the
 * first redacted entry so log readers can spot anomalies (one giant blast)
 * without seeing the raw recipients.
 */
export function redactEmailList(list: readonly (string | null | undefined)[] | null | undefined): string {
  if (!list || list.length === 0) return "[]";
  const first = redactEmail(list[0]);
  if (list.length === 1) return `[${first}]`;
  return `[${first} +${list.length - 1} more]`;
}

/**
 * Truncate a subject line for logs. Subjects are not PII per se, but they
 * frequently include user names ("Re: invoice for Jane Doe") and unbounded
 * length lets a noisy sender blow up log storage.
 */
export function truncateSubject(s: string | null | undefined, max = 80): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
