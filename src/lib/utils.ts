import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the URL only if it uses an http(s) scheme. Use anywhere a
 * `<a href={…}>` value comes from the server, the database, an AI
 * response, or anything else not statically known. Stops `javascript:`
 * and `data:` URLs from running in the user's browser when clicked.
 *
 * Returns `undefined` for any rejected URL so consumers can render
 * the link as plain text or hide it.
 */
export function safeExternalUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // Allow protocol-relative as https; reject everything else that
  // looks like a scheme (javascript:, data:, vbscript:, blob:, file:).
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  // Allow same-origin paths (e.g. /app/whatever) to pass through.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:') {
      return u.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}
