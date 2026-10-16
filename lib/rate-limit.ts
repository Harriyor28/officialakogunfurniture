type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so memory stays bounded.
if (globalThis.__akogunRateLimitSweep === undefined) {
  globalThis.__akogunRateLimitSweep = setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
    },
    60_000,
  );
  // Do not keep the Node.js process alive just for the sweep.
  globalThis.__akogunRateLimitSweep.unref?.();
}

declare global {
  var __akogunRateLimitSweep: NodeJS.Timeout | undefined;
}

/**
 * Fixed-window in-memory rate limiter. Suitable for a single-instance
 * deployment. For multi-instance production, back this with Redis or the
 * database (see README → Scaling notes).
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
