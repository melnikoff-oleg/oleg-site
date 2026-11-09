// GET  /api/ubs-posts/votes  -> results for the five posts on /ubs-posts-rate
// POST /api/ubs-posts/votes  -> { name, votes: [{ post_id, rating, note }] }, then the results
//
// The November 2026 round of the Ubersuggest poll. Same tables as the September
// round (/ubersuggest-feed/rate): the post ids differ, and each submission is
// stamped with this round.

import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { dbConfigured, recentSubmissions, results, saveSubmission } from "@/lib/ubersuggest-feed/db";
import { parseSubmission } from "@/lib/ubs-posts/validate";
import { RATE_POST_IDS, ROUND } from "@/app/ubs-posts/rate-ids";

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const parsed = parseSubmission(body, RATE_POST_IDS);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, missing: parsed.missing }, { status: parsed.status });
  if (!dbConfigured) return NextResponse.json({ error: "Voting is not set up yet." }, { status: 503 });

  const ip = getClientIp(req);
  try {
    if ((await recentSubmissions(ip)) >= MAX_PER_DAY) {
      return NextResponse.json({ error: "Thanks, we already have your votes for today." }, { status: 429 });
    }
    await saveSubmission(parsed.name, parsed.votes, { ip, userAgent: req.headers.get("user-agent"), round: ROUND });
    return NextResponse.json({ ok: true, results: await results(RATE_POST_IDS) });
  } catch {
    return NextResponse.json({ error: "Could not save your votes. Please try again." }, { status: 500 });
  }
}
