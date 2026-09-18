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

export function GET() {
  return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
