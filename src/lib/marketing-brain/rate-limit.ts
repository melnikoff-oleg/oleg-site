// Simple per-IP daily rate limit for the Marketing Brain endpoints.
//
// "Limited, for now" approach: an in-memory counter keyed by `bucket:ip:YYYY-MM-DD`.
// NOTE: serverless instances each hold their own memory and recycle on cold
// start, so this is an approximate cap, not a hard guarantee. If abuse appears,
// swap this module for a durable store (Vercel KV / Upstash Redis) keyed the
// same way: the public API (checkRateLimit) stays identical.

export const DAILY_LIMIT = 30;
// The paid write endpoints (scrape / upload / extract) each spend Firecrawl or
// Anthropic credits per call, so they get their own, tighter bucket.
export const MEMORY_DAILY_LIMIT = 20;

type Entry = { day: string; count: number };
const counts = new Map<string, Entry>();
// Prune stale-day entries once the map crosses this size, so a long-lived warm
// instance seeing many unique IPs can't grow the map without bound.
const PRUNE_THRESHOLD = 10_000;

function today(): string {
  // UTC day boundary, good enough for a daily cap.
  return new Date().toISOString().slice(0, 10);
}

// The trustworthy client IP. On Vercel `x-real-ip` is set by the platform to the
// true connecting IP and is NOT client-forgeable; `x-forwarded-for` is a
// client-controlled list (the platform APPENDS the real hop on the right), so we
// must never trust its left-most entry. Prefer x-real-ip, then the right-most
// XFF hop, then a stable fallback.
export function getClientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "unknown";
}

function prune(day: string) {
  if (counts.size <= PRUNE_THRESHOLD) return;
  for (const [k, entry] of counts) {
    if (entry.day !== day) counts.delete(k);
  }
}

// Records one hit and returns whether it is allowed plus the remaining count.
// `bucket` namespaces independent limits (e.g. "chat" vs "memory") so one
// feature's usage never drains another's cap.
export function checkRateLimit(
  ip: string,
  { bucket = "chat", limit = DAILY_LIMIT }: { bucket?: string; limit?: number } = {},
): { allowed: boolean; remaining: number } {
  const day = today();
  const key = `${bucket}:${ip}`;
  const entry = counts.get(key);
  if (!entry || entry.day !== day) {
    prune(day);
    counts.set(key, { day, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}
