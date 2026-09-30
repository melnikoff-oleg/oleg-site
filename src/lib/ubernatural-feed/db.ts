// Supabase data layer for /ubernatural, where the übernatural founders rate their
// LinkedIn drafts. Server-side only, with the SERVICE ROLE key. The two tables
// (ubn_vote_submission, ubn_vote; DDL in scripts/ubernatural-votes-schema.sql) have
// RLS on with no policies, so this module is the only way in.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dbConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let cached: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!cached) {
    cached = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

/** A rating, a note, or both: a person may rate only some posts and comment without rating. */
export type Vote = { post_id: string; rating: number | null; note: string | null };

export async function recentSubmissions(ip: string): Promise<number> {
  if (!dbConfigured) return 0;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await db()
    .from("ubn_vote_submission")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

/** Store one submission. The submission row and its votes land together or not at all. */
export async function saveSubmission(name: string, votes: Vote[], meta: { ip: string; userAgent: string | null }): Promise<string> {
  const { data, error } = await db()
    .from("ubn_vote_submission")
    .insert({ voter_name: name, ip: meta.ip, user_agent: meta.userAgent })
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id as string;
  const { error: vErr } = await db().from("ubn_vote").insert(votes.map((v) => ({ submission_id: id, ...v })));
  if (vErr) {
    await db().from("ubn_vote_submission").delete().eq("id", id);
    throw vErr;
  }
  return id;
}
