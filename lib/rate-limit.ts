const WINDOW_MS = 60_000;
const MAX_KEYS = 10_000;

const hits = new Map<string, number[]>();

/**
 * Sliding-window in-memory rate limiter (per server instance).
 * Good enough for a demo API; swap for Redis/Upstash in production.
 */
export function rateLimit(
  key: string,
  limit = 20,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, remaining: 0 };
  }

  recent.push(now);

  // Cap memory: drop the oldest keys if the map grows unbounded.
  if (!hits.has(key) && hits.size >= MAX_KEYS) {
    const first = hits.keys().next().value;
    if (first !== undefined) hits.delete(first);
  }

  hits.set(key, recent);
  return { ok: true, remaining: limit - recent.length };
}

/** Test helper: clear all rate-limit state. */
export function resetRateLimit() {
  hits.clear();
}
