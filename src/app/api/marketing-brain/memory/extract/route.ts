import { extractFact } from "@/lib/marketing-brain/distill";
import { mergeSection, MAX_CONTEXT_CHARS } from "@/lib/marketing-brain/memory";
import {
  checkRateLimit,
  getClientIp,
  MEMORY_DAILY_LIMIT,
} from "@/lib/marketing-brain/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auto-capture: after a chat turn, decide if the user's message holds a durable
// business fact and, if so, append it to the CLIENT-SENT context (the source of
// truth) and return the merged text. Appending to the client's context (not a
// shared server file) keeps personalization intact on Vercel's per-instance fs.
export async function POST(req: Request) {
  let message: string;
  let base = "";
  try {
    const body = await req.json();
    message = String(body?.message ?? "").trim();
    if (typeof body?.businessContext === "string") {
      base = body.businessContext.slice(0, MAX_CONTEXT_CHARS);
    }
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!message || !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ added: null });
  }
  if (!checkRateLimit(getClientIp(req), { bucket: "memory", limit: MEMORY_DAILY_LIMIT }).allowed) {
    // Silently no-op on limit: auto-capture is a background nicety, not a
    // user-visible action, so a 429 banner would be noise.
    return Response.json({ added: null });
  }

  try {
    const fact = await extractFact(message, base);
    if (!fact) return Response.json({ added: null });
    const date = new Date().toISOString().slice(0, 10);
    const { previous, text } = mergeSection(base, "Note from chat", fact, date);
    return Response.json({ added: fact, previous, text });
  } catch (err) {
    console.error("[marketing-brain] extract error", err);
    return Response.json({ added: null });
  }
}
