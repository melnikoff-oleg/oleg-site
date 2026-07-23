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
// Long, cited answers with adaptive thinking can take a while; give the function
// headroom so it isn't killed mid-stream (which would look like a random cutoff).
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";
const LIMIT_MESSAGE =
  "you've hit today's limit of 30 questions. if you want more, just reach out to me on linkedin (linkedin.com/in/olegane).";
// Bound the client-controlled conversation so a caller can't drive unbounded
// input-token cost or forge non-user/assistant turns.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 8000;

export async function POST(req: Request) {
  let messages: ChatMessage[];
  let clientContext = "";
  try {
    const body = await req.json();
    // Validate element shape at the runtime boundary (the ChatMessage[] type is
    // compile-time only): keep only well-formed user/assistant turns, clamp each
    // message, and keep the most recent MAX_MESSAGES. This also prevents an
    // unhandled TypeError on a malformed { role } with no string content.
    const raw = Array.isArray(body?.messages) ? body.messages : [];
    messages = raw
      .filter(
        (m: unknown): m is ChatMessage =>
          !!m &&
          typeof (m as ChatMessage).content === "string" &&
          ((m as ChatMessage).role === "user" ||
            (m as ChatMessage).role === "assistant"),
      )
      .slice(-MAX_MESSAGES)
      .map((m: ChatMessage) => ({ ...m, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
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
  // Guard every enqueue: once the client disconnects the controller is closed,
  // and enqueue-after-close throws. Swallow that specific case so a normal
  // abort doesn't surface as an error.
  const send = (controller: ReadableStreamDefaultController, frame: StreamFrame) => {
    try {
      controller.enqueue(encoder.encode(JSON.stringify(frame) + "\n"));
    } catch {
      /* controller already closed (client gone) */
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Sources first, so cards render while the answer streams.
        send(controller, { type: "sources", sources });

        // 2. Stream Claude's synthesized, cited answer. Pass the request signal
        // so generation (and Anthropic billing) stops the moment the client
        // aborts, instead of running to max_tokens against a dead connection.
        const llm = client.messages.stream(
          {
            model: MODEL,
            max_tokens: 8000,
            thinking: { type: "adaptive" },
            system,
            messages: apiMessages,
          },
          { signal: req.signal },
        );

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
        }
        // Always signal a clean finish with the reason, so the client can tell
        // "complete" from "hit the length cap" from "connection died" (the last
        // case = no done frame ever arrives). The UI renders the right banner.
        send(controller, {
          type: "done",
          reason: final.stop_reason ?? "end_turn",
        });
      } catch (err) {
        // A client disconnect surfaces here as an AbortError; that's expected
        // teardown, not a failure, so don't log it or try to emit an error frame
        // to a controller that's already gone.
        if (!req.signal.aborted) {
          console.error("[marketing-brain] chat error", err);
          send(controller, {
            type: "error",
            message: "something went wrong reaching the brain. try again in a moment.",
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
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
