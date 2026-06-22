import Anthropic from "@anthropic-ai/sdk";
import { search, toSources } from "@/lib/marketing-brain/retriever";
import { buildSystemPrompt } from "@/lib/marketing-brain/prompt";
import { getMemory, MAX_CONTEXT_CHARS } from "@/lib/marketing-brain/memory";
import {
  checkRateLimit,
  getClientIp,
  DAILY_LIMIT,
} from "@/lib/marketing-brain/rate-limit";
import type { ChatMessage, StreamFrame } from "@/lib/marketing-brain/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";
const LIMIT_MESSAGE =
  "you've hit today's limit of 30 questions. if you want more, just reach out to me on linkedin (linkedin.com/in/olegai).";

export async function POST(req: Request) {
  let messages: ChatMessage[];
  let clientContext = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    // The client sends its loaded "your context" so personalization works even
    // on Vercel, where the server-side memory file (in /tmp) is ephemeral and
    // not shared across function instances. Server memory is the local fallback.
    clientContext =
      typeof body?.businessContext === "string" ? body.businessContext : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const userTurns = messages.filter((m) => m.role === "user" && m.content.trim());
  const lastUser = userTurns[userTurns.length - 1];
  if (!lastUser) {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  // Retrieval query = the last user turn, plus the previous one for context
  // (so terse follow-ups like "tell me more" still retrieve the right material).
  const retrievalQuery = userTurns.slice(-2).map((m) => m.content).join(" ");

  // Rate limit (records one query per allowed request).
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: "rate_limit", message: LIMIT_MESSAGE, limit: DAILY_LIMIT },
      { status: 429 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }
  const client = new Anthropic();

  // Retrieve grounding chunks (context-aware query, snippets keyed to the latest turn).
  const chunks = search(retrievalQuery, 8);
  const sources = toSources(chunks, lastUser.content);
  // Prefer the context the client sent; fall back to the server file (local dev).
  const businessContext = (clientContext.trim() || getMemory()).slice(
    0,
    MAX_CONTEXT_CHARS,
  );
  const system = buildSystemPrompt(chunks, businessContext);

  const apiMessages = messages
    .filter((m) => m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, frame: StreamFrame) =>
    controller.enqueue(encoder.encode(JSON.stringify(frame) + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Sources first, so cards render while the answer streams.
        send(controller, { type: "sources", sources });

        // 2. Stream Claude's synthesized, cited answer.
        const llm = client.messages.stream({
          model: MODEL,
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          system,
          messages: apiMessages,
        });

        for await (const event of llm) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send(controller, { type: "delta", text: event.delta.text });
          }
        }

        const final = await llm.finalMessage();
        if (final.stop_reason === "refusal") {
          send(controller, {
            type: "error",
            message: "i can't answer that one. try rephrasing.",
          });
        } else if (final.stop_reason === "max_tokens") {
          // Safety net: the answer ran past the budget. Don't leave it on a
          // broken word. Append a short, honest note (the higher max_tokens
          // makes this rare).
          send(controller, {
            type: "delta",
            text: "\n\n(that answer ran long, ask me to continue and i'll pick up where i left off.)",
          });
        }
      } catch (err) {
        console.error("[marketing-brain] chat error", err);
        send(controller, {
          type: "error",
          message: "something went wrong reaching the brain. try again in a moment.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
