import { scrapeUrl } from "@/lib/marketing-brain/firecrawl";
import { distillBusinessProfile } from "@/lib/marketing-brain/distill";
import { appendMemory } from "@/lib/marketing-brain/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let url: string;
  try {
    const body = await req.json();
    url = String(body?.url ?? "").trim();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!url) return Response.json({ error: "missing_url" }, { status: 400 });
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let host: string;
  try {
    host = new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return Response.json({ error: "invalid_url" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  try {
    const markdown = await scrapeUrl(normalized);
    const profile = await distillBusinessProfile(markdown, normalized);
    const { previous, text } = appendMemory(`From ${host}`, profile);
    return Response.json({ added: profile, previous, text });
  } catch (err) {
    console.error("[marketing-brain] scrape error", err);
    const message = err instanceof Error ? err.message : "scrape failed";
    return Response.json({ error: "scrape_failed", message }, { status: 502 });
  }
}
