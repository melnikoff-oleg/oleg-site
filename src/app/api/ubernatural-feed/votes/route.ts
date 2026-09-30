// POST /api/ubernatural-feed/votes -> { name, votes: [{ post_id, rating?, note? }] }
// Any subset of the 30 posts may be rated; a vote needs a rating (1 to 10), a note, or both.

import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/marketing-brain/rate-limit";
import { dbConfigured, recentSubmissions, saveSubmission, type Vote } from "@/lib/ubernatural-feed/db";
import { POST_IDS } from "@/app/ubernatural/data";

export const dynamic = "force-dynamic";

const MAX_PER_DAY = 20;

export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ error: "Voting is not set up yet." }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const b = body as { name?: unknown; votes?: unknown };
  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!Array.isArray(b.votes)) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const byPost = new Map<string, Vote>();
  for (const v of b.votes as { post_id?: unknown; rating?: unknown; note?: unknown }[]) {
    if (typeof v?.post_id !== "string" || !POST_IDS.includes(v.post_id)) continue;
    const r = Number(v.rating);
    const rating = Number.isInteger(r) && r >= 1 && r <= 10 ? r : null;
    const note = typeof v.note === "string" && v.note.trim() ? v.note.trim().slice(0, 2000) : null;
    if (rating === null && note === null) continue;
    byPost.set(v.post_id, { post_id: v.post_id, rating, note });
  }
  if (byPost.size === 0) return NextResponse.json({ error: "Rate or comment on at least one post." }, { status: 400 });

  const ip = getClientIp(req);
  try {
    if ((await recentSubmissions(ip)) >= MAX_PER_DAY) {
      return NextResponse.json({ error: "Thanks, we already have plenty from you today." }, { status: 429 });
    }
    await saveSubmission(name, [...byPost.values()], { ip, userAgent: req.headers.get("user-agent") });
    return NextResponse.json({ ok: true, saved: byPost.size });
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
