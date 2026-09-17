// GET /api/viral-reels/video/<shortcode> -> 302 to a one-hour signed link.
//
// This is what a <video src> points at. The redirect is the point: the browser
// streams the file straight from storage, range requests and all, and not one
// byte of video passes through a Vercel function.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/marketing-brain/rate-limit";
import { isShortcode, reelVideoConfigured, signedVideoUrl } from "@/lib/reels/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

// A visitor watching reels all afternoon, not a script copying the bucket.
const DAILY_LIMIT = 600;

export async function GET(req: Request, { params }: { params: Promise<{ shortcode: string }> }) {
  const { shortcode } = await params;
  if (!isShortcode(shortcode)) {
    return NextResponse.json({ error: "bad_shortcode" }, { status: 400 });
  }
  if (!reelVideoConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const { allowed } = checkRateLimit(getClientIp(req), {
    bucket: "reels-video",
    limit: DAILY_LIMIT,
  });
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const url = await signedVideoUrl(shortcode, req.signal);
    if (!url) return NextResponse.json({ error: "not_held" }, { status: 404 });
    const res = NextResponse.redirect(url, 302);
    // The link inside dies in an hour, so the redirect must not outlive it.
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch {
    return NextResponse.json({ error: "sign_failed" }, { status: 502 });
  }
}
