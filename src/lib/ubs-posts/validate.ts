// The rules a rating submission must pass, as a pure function so the API route
// and the unit tests share one copy.

export type Vote = { post_id: string; rating: number; note: string | null };

export type Parsed =
  | { ok: true; name: string; votes: Vote[] }
  | { ok: false; status: number; error: string; missing?: string[] };

/** Name of 2 to 80 characters, and a whole-number rating from 1 to 10 for every post in `ids`. Notes are optional, cut at 2,000 characters. */
export function parseSubmission(body: unknown, ids: readonly string[]): Parsed {
  if (!body || typeof body !== "object") return { ok: false, status: 400, error: "Bad request." };
  const b = body as { name?: unknown; votes?: unknown };
  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 80) return { ok: false, status: 400, error: "Please enter your full name." };
  if (!Array.isArray(b.votes)) return { ok: false, status: 400, error: "Bad request." };

  const byPost = new Map<string, Vote>();
  for (const v of b.votes as { post_id?: unknown; rating?: unknown; note?: unknown }[]) {
    if (typeof v?.post_id !== "string" || !ids.includes(v.post_id)) continue;
    if (typeof v.rating !== "number" || !Number.isInteger(v.rating) || v.rating < 1 || v.rating > 10) continue;
    const note = typeof v.note === "string" && v.note.trim() ? v.note.trim().slice(0, 2000) : null;
    byPost.set(v.post_id, { post_id: v.post_id, rating: v.rating, note });
  }
  const missing = ids.filter((id) => !byPost.has(id));
  if (missing.length) return { ok: false, status: 400, error: "Please rate every post.", missing };
  return { ok: true, name, votes: ids.map((id) => byPost.get(id) as Vote) };
}
