// In-memory rate limiter (per Vercel instance)
// For multi-instance, upgrade to Upstash Redis

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  userId: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterMs?: number } {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(userId) || { timestamps: [] };

  // Prune expired timestamps for this user
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  entry.timestamps.push(now);
  store.set(userId, entry);
  return { allowed: true };
}
