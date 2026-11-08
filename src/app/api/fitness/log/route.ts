// GET  /api/fitness/log?date=2026-11-10&day=tue -> { session, sets, last: { session, sets } | null }
// POST /api/fitness/log                          -> { date, day, session?: {...}, sets?: [...] }, then { ok: true }
//
// Oleg's own gym log, written from the /fitness page. Both calls need the header
// x-fitness-key equal to FITNESS_LOG_KEY (a short PIN he types once per device);
// without it the data stays private even though the page itself is public.

import { NextResponse } from "next/server";
import {
  dbConfigured,
  getLastSession,
  getSession,
  saveSession,
  type SetRow,
} from "@/lib/fitness/db";

export const dynamic = "force-dynamic";

const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function authorized(req: Request): boolean {
  const key = process.env.FITNESS_LOG_KEY;
  return Boolean(key) && req.headers.get("x-fitness-key") === key;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Wrong key." }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Log is not set up yet." }, { status: 503 });
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  const day = url.searchParams.get("day") ?? "";
  if (!DATE_RE.test(date) || !DAY_IDS.includes(day)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const [current, last] = await Promise.all([getSession(date), getLastSession(day, date)]);
    return NextResponse.json({
      session: current?.session ?? null,
      sets: current?.sets ?? [],
      last,
    });
  } catch {
    return NextResponse.json({ error: "Could not load the log." }, { status: 500 });
  }
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function iso(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Wrong key." }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Log is not set up yet." }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const b = body as {
    date?: unknown;
    day?: unknown;
    session?: { startedAt?: unknown; finishedAt?: unknown; note?: unknown };
    sets?: unknown;
  };
  const date = typeof b.date === "string" ? b.date : "";
  const day = typeof b.day === "string" ? b.day : "";
  if (!DATE_RE.test(date) || !DAY_IDS.includes(day)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const patch: { started_at?: string | null; finished_at?: string | null; note?: string | null } = {};
  if (b.session) {
    const s = iso(b.session.startedAt);
    if (s !== undefined) patch.started_at = s;
    const f = iso(b.session.finishedAt);
    if (f !== undefined) patch.finished_at = f;
    if (b.session.note !== undefined) {
      patch.note =
        typeof b.session.note === "string" && b.session.note.trim()
          ? b.session.note.trim().slice(0, 4000)
          : null;
    }
  }

  const sets: Omit<SetRow, "session_date">[] = [];
  if (Array.isArray(b.sets)) {
    for (const raw of b.sets.slice(0, 200) as Record<string, unknown>[]) {
      const exercise_idx = num(raw.exerciseIdx);
      const movement_idx = num(raw.movementIdx) ?? 0;
      const set_idx = num(raw.setIdx);
      if (exercise_idx === null || set_idx === null) continue;
      if (!Number.isInteger(exercise_idx) || !Number.isInteger(set_idx) || !Number.isInteger(movement_idx)) continue;
      const exercise = typeof raw.exercise === "string" ? raw.exercise.slice(0, 200) : "";
      if (!exercise) continue;
      sets.push({
        exercise_idx,
        movement_idx,
        set_idx,
        exercise,
        movement: typeof raw.movement === "string" ? raw.movement.slice(0, 200) : null,
        weight: num(raw.weight),
        reps: num(raw.reps),
        unit: typeof raw.unit === "string" && ["reps", "s", "min"].includes(raw.unit) ? raw.unit : "reps",
      });
    }
  }

  try {
    await saveSession(date, day, patch, sets);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}
