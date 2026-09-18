// POST /api/mcp -> the viral reels database as a remote MCP server.
//
// One URL that ChatGPT, Claude and Claude Code can all be pointed at. Open, no
// login, free: the tools are read-only and one call costs an embedding (usually
// already stored) and one indexed read.
//
// This is MCP's Streamable HTTP transport in its smallest legal form, written
// by hand rather than through the SDK. The server is STATELESS: no session id
// is issued, every POST is answered with one plain JSON body, and no stream is
// ever opened, all of which the spec allows. That matters on Vercel, where a
// session held in memory would belong to whichever instance happened to answer
// the first request. GET answers 405, the spec's way of saying no server-sent
// stream is offered.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/marketing-brain/rate-limit";
import {
  callTool,
  isTool,
  mcpConfigured,
  SERVER_INSTRUCTIONS,
  ToolInputError,
  TOOLS,
} from "@/lib/mcp/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// Newest first. A client names the version it wants; it gets that one back if
// it is here and the newest otherwise, which is the negotiation the spec asks
// for. Nothing this server does differs between them.
const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

// High on purpose. Claude and ChatGPT call from their own servers, so one IP
// here is thousands of people and a per-visitor number would throttle them all.
// It exists to stop a runaway script, like its sibling on the search routes.
const DAILY_LIMIT = 5000;

/** A model never sends a batch this long; a script might. */
const BATCH_MAX = 10;

// Browser-based clients (the MCP inspector, web playgrounds) call cross-origin.
// Nothing here reads a cookie, so any origin is safe to allow.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

type Id = string | number | null;
type RpcMessage = { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: unknown };

function result(id: Id, value: unknown) {
  return { jsonrpc: "2.0", id, result: value };
}

function failure(id: Id, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function toolText(value: unknown, isError = false) {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value) }],
    ...(isError ? { isError: true } : {}),
  };
}

/** One message in, one reply out; null for a notification, which gets none. */
async function handle(msg: RpcMessage, req: Request): Promise<object | null> {
  const isRequest = typeof msg.id === "string" || typeof msg.id === "number";
  const id: Id = isRequest ? (msg.id as string | number) : null;
  if (msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    // A client's reply to a request we never sent also lands here. Say nothing.
    if (!("method" in msg)) return null;
    return failure(id, -32600, "Invalid request");
  }
  if (!isRequest) return null;

  const params = (msg.params ?? {}) as Record<string, unknown>;
  switch (msg.method) {
    case "initialize": {
      const asked = typeof params.protocolVersion === "string" ? params.protocolVersion : "";
      return result(id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: "viral-reels-database",
          title: "Viral Reels Database",
          version: "1.0.0",
        },
        instructions: SERVER_INSTRUCTIONS,
      });
    }
    case "ping":
      return result(id, {});
    case "tools/list":
      return result(id, { tools: TOOLS });
    case "tools/call": {
      const name = typeof params.name === "string" ? params.name : "";
      if (!isTool(name)) return failure(id, -32602, `Unknown tool: ${name}`);
      if (!mcpConfigured) return result(id, toolText("The database is not configured.", true));
      const { allowed } = checkRateLimit(getClientIp(req), { bucket: "mcp", limit: DAILY_LIMIT });
      if (!allowed) return result(id, toolText("Daily limit reached. Try again tomorrow.", true));
      const args =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};
      try {
        return result(id, toolText(await callTool(name, args, req.signal)));
      } catch (err) {
        if (err instanceof ToolInputError) return result(id, toolText(err.message, true));
        if (!req.signal.aborted) console.error(`mcp ${name} failed`, err);
        return result(id, toolText("The database did not answer. Try again in a moment.", true));
      }
    }
    default:
      return failure(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(failure(null, -32700, "Parse error"), { status: 400, headers: CORS });
  }

  if (Array.isArray(body)) {
    if (body.length === 0 || body.length > BATCH_MAX) {
      return NextResponse.json(failure(null, -32600, "Invalid request"), { status: 400, headers: CORS });
    }
    const replies = (
      await Promise.all(body.map((m) => handle((m ?? {}) as RpcMessage, req)))
    ).filter((r): r is object => r !== null);
    if (replies.length === 0) return new NextResponse(null, { status: 202, headers: CORS });
    return NextResponse.json(replies, { headers: CORS });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(failure(null, -32600, "Invalid request"), { status: 400, headers: CORS });
  }
  const reply = await handle(body as RpcMessage, req);
  // Notifications and responses are accepted with no body.
  if (reply === null) return new NextResponse(null, { status: 202, headers: CORS });
  return NextResponse.json(reply, { headers: CORS });
}

// What a PERSON gets. An MCP client opens a GET asking for text/event-stream and
// is told 405, the spec's way of saying no stream is offered. A person who
// pastes the link into a browser asks for text/html, and a bare 405 there reads
// as "the site is broken", which is exactly what Oleg saw the first time he
// opened it. Same URL, so the link that gets shared is the link that explains
// itself.
const URL_SELF = "https://www.oleg.ae/api/mcp";
const HUMAN_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Viral Reels Database for your AI</title>
<style>
  body{margin:0;background:#0b0f1a;color:#e6e9f2;font:17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif}
  main{max-width:640px;margin:0 auto;padding:56px 16px 72px}
  h1{font-size:30px;line-height:1.2;margin:0 0 12px}
  h2{font-size:18px;margin:36px 0 8px}
  p{margin:0 0 12px;color:#aab1c5}
  code{display:block;background:#141a2b;border:1px solid #242c44;border-radius:10px;padding:12px 14px;color:#fff;font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-x:auto;white-space:nowrap}
  a{color:#7aa2ff}
</style></head><body><main>
<h1>Viral Reels Database, inside your AI</h1>
<p>This link is not a web page. It is a connector. Add it to ChatGPT, Claude or Claude Code and your AI can search thousands of viral Instagram reels, each one broken down into idea, hook, retain and reward. Free, no login.</p>
<code>${URL_SELF}</code>
<h2>Claude</h2>
<p>Settings, Connectors, Add custom connector, paste the link.</p>
<h2>ChatGPT</h2>
<p>Settings, Connectors, turn on developer mode, add the link. Needs a paid plan.</p>
<h2>Claude Code</h2>
<code>claude mcp add --transport http viral-reels ${URL_SELF}</code>
<h2>Then just ask</h2>
<p>"Find viral reels about my topic and write me a reel on the best format."</p>
<p>Browse the same database by hand at <a href="https://www.oleg.ae/reels">oleg.ae/reels</a>.</p>
</main></body></html>`;

export function GET(req: Request) {
  if ((req.headers.get("accept") ?? "").includes("text/html")) {
    return new NextResponse(HUMAN_PAGE, {
      // Never cached. This URL answers by Accept header, and a shared cache that
      // kept the page handed it to MCP clients in place of their 405, which is
      // what the first deploy of this did.
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", Vary: "Accept" },
    });
  }
  return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
