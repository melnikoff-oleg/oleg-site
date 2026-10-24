// GET /api/ideas -> the public board, plus which ideas this browser voted for

import { NextResponse } from "next/server";
import { listIdeas, votedIdeaIds } from "@/lib/ideas/db";
import { cookieFrom, readVoterId, VOTER_COOKIE } from "@/lib/ideas/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The sync the cached /ideas page runs on mount. Per browser (the voter
// cookie), so it must never be stored by a shared cache.
export async function GET(req: Request) {
  const voterId = readVoterId(cookieFrom(req, VOTER_COOKIE));
  const headers = { "Cache-Control": "private, no-store" };
  try {
    // The vote lookup is skipped (and returns []) for a browser that never voted.
    const [ideas, voted] = await Promise.all([listIdeas(), votedIdeaIds(voterId)]);
    return NextResponse.json({ ideas, voted }, { headers });
  } catch (err) {
    // The board keeps the cached copy it rendered with on any non-200.
    console.error(err);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers });
  }
}
