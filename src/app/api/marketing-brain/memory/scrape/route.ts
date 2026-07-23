import { scrapeUrl } from "@/lib/marketing-brain/firecrawl";
import { distillBusinessProfile } from "@/lib/marketing-brain/distill";
import { mergeSection, MAX_CONTEXT_CHARS } from "@/lib/marketing-brain/memory";
import {
  checkRateLimit,
  getClientIp,
  MEMORY_DAILY_LIMIT,
} from "@/lib/marketing-brain/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reject obviously-internal hosts before scraping. Legitimate users only ever
// scrape public marketing sites, so this rejects nothing they'd submit while
// closing the "use our scraper against internal/metadata hosts" abuse angle.
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || !h.includes(".")) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local + cloud metadata
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true; // 172.16/12
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd")) return true;
  return false;
}

export async function POST(req: Request) {
  if (!checkRateLimit(getClientIp(req), { bucket: "memory", limit: MEMORY_DAILY_LIMIT }).allowed) {
    return Response.json({ error: "rate_limit" }, { status: 429 });
  }

  let url: string;
  let base = "";
  try {
    const body = await req.json();
    url = String(body?.url ?? "").trim();
    if (typeof body?.businessContext === "string") {
      base = body.businessContext.slice(0, MAX_CONTEXT_CHARS);
    }
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!url) return Response.json({ error: "missing_url" }, { status: 400 });
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let host: string;
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return Response.json({ error: "invalid_url" }, { status: 400 });
    }
    host = parsed.hostname.replace(/^www\./, "");
    if (isPrivateHost(parsed.hostname)) {
      return Response.json({ error: "invalid_url" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "invalid_url" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  try {
    const markdown = await scrapeUrl(normalized);
    const profile = await distillBusinessProfile(markdown, normalized);
    const date = new Date().toISOString().slice(0, 10);
    const { previous, text } = mergeSection(base, `From ${host}`, profile, date);
    return Response.json({ added: profile, previous, text });
  } catch (err) {
    // Log details server-side; return a generic message so we don't leak the
    // upstream service's status/body to the client.
    console.error("[marketing-brain] scrape error", err);
    return Response.json({ error: "scrape_failed" }, { status: 502 });
  }
}
