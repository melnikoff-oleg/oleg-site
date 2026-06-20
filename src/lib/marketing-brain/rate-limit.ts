// Simple per-IP daily rate limit for the Marketing Brain chat.
//
// "Limited, for now" approach: an in-memory counter keyed by `ip:YYYY-MM-DD`.
// NOTE: serverless instances each hold their own memory and recycle on cold
// start, so this is an approximate cap, not a hard guarantee. If abuse appears,
// swap this module for a durable store (Vercel KV / Upstash Redis) keyed the
// same way: the public API (check) stays identical.

export const DAILY_LIMIT = 30;

type Entry = { day: string; count: number };
const counts = new Map<string, Entry>();

function today(): string {
  // UTC day boundary, good enough for a daily cap.
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Records one query and returns whether it is allowed plus the remaining count.
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const day = today();
  const entry = counts.get(ip);
  if (!entry || entry.day !== day) {
    counts.set(ip, { day, count: 1 });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}
