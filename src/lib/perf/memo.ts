// Keep a shared read's latest answer inside the running server instance.
//
// The tool pages (/reels, /creators) open on reads that are the same for every
// visitor and only move when the vault's sync scripts run: the hand-picked wall
// and the histogram facts. Next's data cache already stores them for a minute,
// but on Vercel every lookup in it is a network hop, and the reel facts are ten
// of them in a row (9,743 reels at 1,000 a page), which is most of why /reels
// took ~300 ms to send its first byte. A warm instance that already holds the
// answer should not ask anyone.
//
// Concurrent callers share one in-flight read, so a burst on a cold instance
// costs one read, not one per request. A failed read is not kept: the next
// caller tries again rather than inheriting the error for a minute.
//
// The kept value is ONE object shared by every request on the instance, so a
// caller must treat it as read-only: sorting or editing it in place would
// change what every visitor sees for the rest of the minute. Copy first.

export function memoize<T>(ttlMs: number, read: () => Promise<T>): () => Promise<T> {
  let kept: { at: number; value: T } | null = null;
  let inflight: Promise<T> | null = null;
  return () => {
    if (kept && performance.now() - kept.at < ttlMs) return Promise.resolve(kept.value);
    inflight ??= read().then(
      (value) => {
        kept = { at: performance.now(), value };
        inflight = null;
        return value;
      },
      (err: unknown) => {
        inflight = null;
        throw err;
      },
    );
    return inflight;
  };
}
