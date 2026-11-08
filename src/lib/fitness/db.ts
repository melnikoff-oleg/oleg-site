// Supabase data layer for /fitness: the sets Oleg logs from the program page in the gym.
//
// Server-side only, with the SERVICE ROLE key. The two tables (fit_session, fit_set;
// DDL in scripts/fitness-log-schema.sql) have RLS on with no policies, so this
// module is the only way in. Same shape as the other data layers here: it degrades
// instead of throwing when the env vars are missing.

import "server-only";
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

export type SessionRow = {
  session_date: string;
  day_id: string;
  started_at: string | null;
  finished_at: string | null;
  note: string | null;
};

export type SetRow = {
  session_date: string;
  exercise_idx: number;
  movement_idx: number;
  set_idx: number;
  exercise: string;
  movement: string | null;
  weight: number | null;
  reps: number | null;
  unit: string;
};

const SET_COLS =
  "session_date, exercise_idx, movement_idx, set_idx, exercise, movement, weight, reps, unit";

/** One day's session and its sets, or null when nothing was logged. */
export async function getSession(
  date: string,
): Promise<{ session: SessionRow; sets: SetRow[] } | null> {
  if (!dbConfigured) return null;
  const { data: session, error } = await db()
    .from("fit_session")
    .select("session_date, day_id, started_at, finished_at, note")
    .eq("session_date", date)
    .maybeSingle();
  if (error) throw error;
  if (!session) return null;
  const { data: sets, error: e2 } = await db()
    .from("fit_set")
    .select(SET_COLS)
    .eq("session_date", date)
    .order("exercise_idx")
    .order("movement_idx")
    .order("set_idx");
  if (e2) throw e2;
  return { session: session as SessionRow, sets: (sets ?? []) as SetRow[] };
}

/** The most recent earlier session of the same weekday that has at least one set: "last time". */
export async function getLastSession(
  dayId: string,
  before: string,
): Promise<{ session: SessionRow; sets: SetRow[] } | null> {
  if (!dbConfigured) return null;
  const { data: sessions, error } = await db()
    .from("fit_session")
    .select("session_date, day_id, started_at, finished_at, note")
    .eq("day_id", dayId)
    .lt("session_date", before)
    .order("session_date", { ascending: false })
    .limit(6);
  if (error) throw error;
  for (const s of (sessions ?? []) as SessionRow[]) {
    const { data: sets, error: e2 } = await db()
      .from("fit_set")
      .select(SET_COLS)
      .eq("session_date", s.session_date)
      .order("exercise_idx")
      .order("movement_idx")
      .order("set_idx");
    if (e2) throw e2;
    if (sets && sets.length) return { session: s, sets: sets as SetRow[] };
  }
  return null;
}

export type SessionPatch = {
  started_at?: string | null;
  finished_at?: string | null;
  note?: string | null;
};

/** Upsert the session row, then upsert the given sets; a set with neither weight nor reps is deleted. */
export async function saveSession(
  date: string,
  dayId: string,
  patch: SessionPatch,
  sets: Omit<SetRow, "session_date">[],
): Promise<void> {
  if (!dbConfigured) throw new Error("Database is not configured");
  const now = new Date().toISOString();
  const { error } = await db()
    .from("fit_session")
    .upsert(
      { session_date: date, day_id: dayId, ...patch, updated_at: now },
      { onConflict: "session_date" },
    );
  if (error) throw error;

  const keep = sets.filter((s) => s.weight != null || s.reps != null);
  const drop = sets.filter((s) => s.weight == null && s.reps == null);
  if (keep.length) {
    const { error: e2 } = await db()
      .from("fit_set")
      .upsert(
        keep.map((s) => ({ ...s, session_date: date, updated_at: now })),
        { onConflict: "session_date,exercise_idx,movement_idx,set_idx" },
      );
    if (e2) throw e2;
  }
  for (const s of drop) {
    const { error: e3 } = await db()
      .from("fit_set")
      .delete()
      .match({
        session_date: date,
        exercise_idx: s.exercise_idx,
        movement_idx: s.movement_idx,
        set_idx: s.set_idx,
      });
    if (e3) throw e3;
  }
}
