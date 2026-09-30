// Supabase data layer for /ubersuggest-feed/rate, where people rate the
// Ubersuggest LinkedIn drafts.
//
// Server-side only, with the SERVICE ROLE key. The two tables (ubs_vote_submission,
// ubs_vote; DDL in scripts/ubersuggest-votes-schema.sql) have RLS on with no
// policies, so this module is the only way in. Like the /ideas board it degrades
// instead of throwing when the env vars are missing: reads return empty and
// writes report that the database is not configured.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dbConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

let cached: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } },
    );
  }
  return cached;
}

export type Vote = { post_id: string; rating: number; note: string | null };

export type PostResult = {
  post_id: string;
  count: number;
  average: number | null;
  /** Latest notes from other people, newest first, with a first name and initial only. */
  notes: { name: string; rating: number; note: string; at: string }[];
};

/** "Jeff Johnson" -> "Jeff J." so a public results screen never shows full names. */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

/** How many submissions this IP made in the last 24 hours. */
export async function recentSubmissions(ip: string): Promise<number> {
  if (!dbConfigured) return 0;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await db()
    .from("ubs_vote_submission")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

/** Store one person's full set of votes. The submission row and its votes land together or not at all. */
export async function saveSubmission(
  name: string,
  votes: Vote[],
  meta: { ip: string; userAgent: string | null },
): Promise<string> {
  const { data, error } = await db()
    .from("ubs_vote_submission")
    .insert({ voter_name: name, ip: meta.ip, user_agent: meta.userAgent })
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id as string;
  const { error: vErr } = await db()
    .from("ubs_vote")
    .insert(votes.map((v) => ({ submission_id: id, ...v })));
  if (vErr) {
    // Never leave a submission with no votes behind: remove it and report the failure.
    await db().from("ubs_vote_submission").delete().eq("id", id);
    throw vErr;
  }
  return id;
}

/** Averages, counts and the latest notes for each post. */
export async function results(postIds: string[]): Promise<PostResult[]> {
  if (!dbConfigured) return postIds.map((post_id) => ({ post_id, count: 0, average: null, notes: [] }));
  const { data, error } = await db()
    .from("ubs_vote")
    .select("post_id, rating, note, created_at, ubs_vote_submission(voter_name)")
    .in("post_id", postIds)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  type Row = { post_id: string; rating: number; note: string | null; created_at: string; ubs_vote_submission: { voter_name: string } | { voter_name: string }[] | null };
  const rows = (data ?? []) as Row[];
  return postIds.map((post_id) => {
    const mine = rows.filter((r) => r.post_id === post_id);
    const sum = mine.reduce((s, r) => s + r.rating, 0);
    const notes = mine
      .filter((r) => r.note && r.note.trim())
      .slice(0, 6)
      .map((r) => {
        const sub = Array.isArray(r.ubs_vote_submission) ? r.ubs_vote_submission[0] : r.ubs_vote_submission;
        return { name: shortName(sub?.voter_name ?? "Someone"), rating: r.rating, note: (r.note as string).trim(), at: r.created_at };
      });
    return { post_id, count: mine.length, average: mine.length ? Math.round((sum / mine.length) * 10) / 10 : null, notes };
  });
}

export type Rating = { name: string; rating: number; note: string | null; at: string };

/** Every rating for each post, newest first, with a first name and initial only. For /ubersuggest-feed/results. */
export async function allRatings(postIds: string[]): Promise<{ people: number; byPost: Record<string, Rating[]> }> {
  const byPost: Record<string, Rating[]> = Object.fromEntries(postIds.map((id) => [id, []]));
  if (!dbConfigured) return { people: 0, byPost };
  const { data, error } = await db()
    .from("ubs_vote")
    .select("submission_id, post_id, rating, note, created_at, ubs_vote_submission(voter_name)")
    .in("post_id", postIds)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  type Row = { submission_id: string; post_id: string; rating: number; note: string | null; created_at: string; ubs_vote_submission: { voter_name: string } | { voter_name: string }[] | null };
  const rows = (data ?? []) as Row[];
  for (const r of rows) {
    const sub = Array.isArray(r.ubs_vote_submission) ? r.ubs_vote_submission[0] : r.ubs_vote_submission;
    byPost[r.post_id]?.push({ name: shortName(sub?.voter_name ?? "Someone"), rating: r.rating, note: r.note?.trim() || null, at: r.created_at });
  }
  return { people: new Set(rows.map((r) => r.submission_id)).size, byPost };
}
