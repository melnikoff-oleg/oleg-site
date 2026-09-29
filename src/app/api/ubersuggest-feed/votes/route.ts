// GET  /api/ubersuggest-feed/votes         -> results for the posts on the rating page
// POST /api/ubersuggest-feed/votes         -> { name, votes: [{ post_id, rating, note }] }, then the results
//
// A submission must rate EVERY post on the rating page (1 to 10); notes are optional.

import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/marketing-brain/rate-limit";
import { dbConfigured, recentSubmissions, results, saveSubmission } from "@/lib/ubersuggest-feed/db";
import { RATE_POST_IDS } from "@/app/ubersuggest-feed/data";

export const dynamic = "force-dynamic";

const MAX_PER_DAY = 5;

export async function GET() {
  try {
    return NextResponse.json({ results: await results(RATE_POST_IDS) });
  } catch {
    return NextResponse.json({ error: "Could not load results." }, { status: 500 });
  }
}

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
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!Array.isArray(b.votes)) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const byPost = new Map<string, { post_id: string; rating: number; note: string | null }>();
  for (const v of b.votes as { post_id?: unknown; rating?: unknown; note?: unknown }[]) {
    if (typeof v?.post_id !== "string" || !RATE_POST_IDS.includes(v.post_id)) continue;
    const rating = Number(v.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) continue;
    const note = typeof v.note === "string" && v.note.trim() ? v.note.trim().slice(0, 2000) : null;
    byPost.set(v.post_id, { post_id: v.post_id, rating, note });
  }
  const missing = RATE_POST_IDS.filter((id) => !byPost.has(id));
  if (missing.length) {
    return NextResponse.json({ error: "Please rate every post.", missing }, { status: 400 });
  }

  const ip = getClientIp(req);
  try {
    if ((await recentSubmissions(ip)) >= MAX_PER_DAY) {
      return NextResponse.json({ error: "Thanks, we already have your votes for today." }, { status: 429 });
    }
    await saveSubmission(name, [...byPost.values()], { ip, userAgent: req.headers.get("user-agent") });
    return NextResponse.json({ ok: true, results: await results(RATE_POST_IDS) });
  } catch {
    return NextResponse.json({ error: "Could not save your votes. Please try again." }, { status: 500 });
  }
}
