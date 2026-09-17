// POST /api/viral-reels/video/held -> which of these reels can play in place.
//
// One request per page of tiles, not one per tile. POST because the body is a
// list of up to 200 shortcodes, which does not belong in a query string.
//
// Validates before it checks config, the same order as the other routes here,
// so the guard-rail branches are deterministic in an environment with no keys.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/marketing-brain/rate-limit";
import { HELD_LIMIT, heldVideos, isShortcode, reelVideoConfigured } from "@/lib/reels/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const DAILY_LIMIT = 3000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const codes = (body as { codes?: unknown } | null)?.codes;
  if (!Array.isArray(codes) || codes.length > HELD_LIMIT || !codes.every(isShortcode)) {
    return NextResponse.json({ error: "bad_codes" }, { status: 400 });
  }

  if (!reelVideoConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const { allowed } = checkRateLimit(getClientIp(req), {
    bucket: "reels-video-held",
    limit: DAILY_LIMIT,
  });
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    return NextResponse.json({ held: await heldVideos(codes, req.signal) });
  } catch {
    // A tile that cannot find out simply keeps its link to Instagram, so this
    // is never worth an error on the page.
    return NextResponse.json({ held: [] });
  }
}
