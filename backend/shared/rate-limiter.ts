/**
 * In-memory sliding window rate limiter.
 * Tracks requests per key (usually IP or userID) within a time window.
 * Suitable for single-instance Encore deployments.
 */

import { APIError } from "encore.dev/api";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 600000); // keep last 10 min
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 60000);

/**
 * Check rate limit for a key.
 * @param key - unique identifier (IP, userID, or composite)
 * @param maxRequests - max allowed requests in the window
 * @param windowMs - time window in milliseconds
 * @throws APIError with code "resource_exhausted" if limit exceeded
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): void {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000);
    throw APIError.resourceExhausted(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }

  entry.timestamps.push(now);
}

/**
 * Pre-configured rate limit profiles for common use cases.
 */
export const RateLimits = {
  /** Auth endpoints: 10 requests per minute per key */
  auth: (key: string) => checkRateLimit(key, 10, 60000),

  /** OAuth endpoints: 10 requests per minute per key */
  oauth: (key: string) => checkRateLimit(key, 10, 60000),

  /** Assessment submission: 5 per minute per user */
  assessment: (key: string) => checkRateLimit(key, 5, 60000),

  /** Roadmap generation: 3 per minute per user */
  roadmap: (key: string) => checkRateLimit(key, 3, 60000),

  /** Task operations: 30 per minute per user */
  tasks: (key: string) => checkRateLimit(key, 30, 60000),

  /** AI task generation: 5 per minute per user */
  aiGenerate: (key: string) => checkRateLimit(key, 5, 60000),

  /** Admin endpoints: 20 per minute per admin */
  admin: (key: string) => checkRateLimit(key, 20, 60000),

  /** Public contact form: 3 per 10 minutes per key */
  contact: (key: string) => checkRateLimit(key, 3, 600000),

  /** Profile updates: 10 per minute per user */
  profile: (key: string) => checkRateLimit(key, 10, 60000),
};
