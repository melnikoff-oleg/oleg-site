// Durable per-IP daily cap on votes for the /ideas board, counted out of the
// audit log.
//
// Deliberately NOT the in-memory limiter in lib/rate-limit.ts: that
// one is per serverless instance and resets on every cold start, which is fine
// for throttling a paid endpoint but would let anyone stuff votes just by
// waiting for a new instance. We reuse its getClientIp() though, since it
// already handles Vercel's non-spoofable x-real-ip and the right-most XFF hop.

import { countTodayByIp, type VoteAction } from "./db";

export const VOTE_DAILY_LIMIT = 60;

// The event kinds the cap counts. These MUST be the exact strings the vote
// route logs, and the first version of this file got that wrong (it counted
// "vote" / "unvote" while the route logged "voted" / "unvoted"), which silently
// disabled the cap entirely. So the list is derived from a Record over the
// action union, which fails to compile if an action is added or renamed and
// not accounted for here.
const VOTE_KIND_MAP: Record<VoteAction, true> = { voted: true, unvoted: true };
export const VOTE_KINDS = Object.keys(VOTE_KIND_MAP) as VoteAction[];

export async function voteAllowed(ip: string): Promise<boolean> {
  return (await countTodayByIp(ip, VOTE_KINDS)) < VOTE_DAILY_LIMIT;
}
