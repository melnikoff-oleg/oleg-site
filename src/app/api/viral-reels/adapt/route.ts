// POST /api/viral-reels/adapt -> one reel rewritten for the visitor's brand.
//
// The only route on this page that spends real money per call (one Sonnet
// call, about a cent), so its cap is per IP and much lower than the search.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/marketing-brain/rate-limit";
import {
  adaptReel,
  BRAND_MIN,
  FEEDBACK_MAX,
  normalizeBrand,
  readReel,
  viralAdaptConfigured,
  type Concept,
} from "@/lib/reels/viral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_LIMIT = 40;
const SHORTCODE = /^[A-Za-z0-9_-]{5,20}$/;

function readConcept(raw: unknown): Concept | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const keys = ["name", "idea", "hook", "retain", "reward", "script"] as const;
  if (!keys.every((k) => typeof r[k] === "string")) return null;
  const out = {} as Concept;
  for (const k of keys) out[k] = (r[k] as string).slice(0, 4000);
  return out;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const raw = (body ?? {}) as Record<string, unknown>;
  const shortcode = typeof raw.shortcode === "string" && SHORTCODE.test(raw.shortcode) ? raw.shortcode : "";
  const brand = normalizeBrand(raw.brand);
  if (!shortcode) return NextResponse.json({ error: "missing_shortcode" }, { status: 400 });
  if (brand.length < BRAND_MIN) return NextResponse.json({ error: "brand_too_short" }, { status: 400 });
  const feedback =
    typeof raw.feedback === "string" ? raw.feedback.replace(/\s+/g, " ").trim().slice(0, FEEDBACK_MAX) : "";
  const previous = readConcept(raw.previous);

  if (!viralAdaptConfigured) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { allowed, remaining } = checkRateLimit(getClientIp(req), { bucket: "adapt", limit: DAILY_LIMIT });
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  req.signal.addEventListener("abort", () => controller.abort(), { once: true });
  const started = performance.now();
  try {
    const reel = await readReel(shortcode, controller.signal);
    if (!reel) return NextResponse.json({ error: "reel_not_found" }, { status: 404 });
    const { concept, usage } = await adaptReel(
      { reel, brand, previous: feedback ? previous : null, feedback: feedback || undefined },
      controller.signal,
    );
    return NextResponse.json(
      { shortcode, concept, remaining },
      {
        headers: {
          "Server-Timing": `total;dur=${Math.round(performance.now() - started)}`,
          "X-Usage": `in=${usage.input};out=${usage.output}`,
        },
      },
    );
  } catch (err) {
    if (!req.signal.aborted) console.error("adapt failed", err);
    return NextResponse.json({ error: "adapt_failed" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
