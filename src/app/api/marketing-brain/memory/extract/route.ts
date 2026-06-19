import { extractFact } from "@/lib/marketing-brain/distill";
import { appendMemory, getMemory } from "@/lib/marketing-brain/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auto-capture: after a chat turn, decide if the user's message holds a durable
// business fact and, if so, append it. Returns the added fact + previous text (undo).
export async function POST(req: Request) {
  let message: string;
  try {
    const body = await req.json();
    message = String(body?.message ?? "").trim();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!message || !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ added: null });
  }

  try {
    const fact = await extractFact(message, getMemory());
    if (!fact) return Response.json({ added: null });
    const { previous, text } = appendMemory("Note from chat", fact);
    return Response.json({ added: fact, previous, text });
  } catch (err) {
    console.error("[marketing-brain] extract error", err);
    return Response.json({ added: null });
  }
}
