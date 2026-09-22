// POST /api/viral-reels/viral -> the reels a beginner in this brand's niche
// should copy, re-ranked for small accounts and recent posts.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/marketing-brain/rate-limit";
import {
  BRAND_MIN,
  findViralReels,
  normalizeBrand,
  viralSearchConfigured,
} from "@/lib/reels/viral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const DAILY_LIMIT = 300;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const brand = normalizeBrand((body as Record<string, unknown> | null)?.brand);
  if (brand.length < BRAND_MIN) {
    return NextResponse.json({ error: "brand_too_short" }, { status: 400 });
  }
  if (!viralSearchConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const { allowed } = checkRateLimit(getClientIp(req), { bucket: "viral", limit: DAILY_LIMIT });
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const started = performance.now();
  try {
    const reels = await findViralReels(brand, req.signal);
    return NextResponse.json(
      { brand, reels },
      { headers: { "Server-Timing": `total;dur=${Math.round(performance.now() - started)}` } },
    );
  } catch (err) {
    if (!req.signal.aborted) console.error("viral search failed", err);
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }
}
