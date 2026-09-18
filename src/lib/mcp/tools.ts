// The viral reels database as MCP tools.
//
// One remote MCP server is what makes the library reachable from ChatGPT,
// Claude and Claude Code alike, and this module is the whole of what it can do:
// four read-only tools over the same Supabase index the /reels and /creators
// pages read. Nothing here is a second copy of the search. The embedding comes
// from src/lib/search/embed.ts, so a query a visitor already typed on the site
// is served from the stored vector and costs nothing, and the creator reads are
// the roster's own.
//
// What differs from the pages is the PROJECTION. A wall tile draws a thumbnail
// and four numbers and never opens a write-up; a model is the opposite reader,
// it cannot see a thumbnail and the idea and the hook are the entire value. So
// the two searches below ask the match functions for their own column lists
// rather than reusing REEL_TILE_SELECT.
//
// The filters are plain numbers here, not slider stops. A page needs a scale
// with edges because somebody drags a thumb along it; a model can say
// "under 100,000 followers" outright. Every value is coerced to a finite number
// or a date this module formats itself before it reaches the RPC body, so a
// hand-made request cannot put a string into a SQL filter.

import "server-only";
import { embedQuery } from "@/lib/search/embed";
import { daysBefore } from "@/lib/reels/filters";
import { MIN_SIMILARITY, normalizeQuery } from "@/lib/reels/types";
import {
  CREATOR_MIN_SIMILARITY,
  normalizeCreatorQuery,
  normalizeCreatorSort,
  normalizeHandle,
} from "@/lib/creators/types";
import { getCreator, getCreatorReels } from "@/lib/creators/roster";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";

export const mcpConfigured = Boolean(SUPABASE_URL && SERVICE_KEY && OPENAI_KEY);

/** Both upstream hops of one tool call share this budget. */
const CALL_BUDGET_MS = 12_000;

const REEL_LIMIT_DEFAULT = 10;
const REEL_LIMIT_MAX = 25;
const CREATOR_LIMIT_DEFAULT = 10;
const CREATOR_LIMIT_MAX = 25;
const SHELF_LIMIT_DEFAULT = 20;
const SHELF_LIMIT_MAX = 60;

// What a model needs to pick a reel worth opening: the numbers, the idea and
// the hook. The retain and reward write-ups, the shot list and the caption are
// three quarters of a row and belong to get_reel, which is asked for one reel.
const REEL_SEARCH_SELECT = [
  "shortcode",
  "url",
  "account",
  "posted_on",
  "score",
  "views",
  "likes",
  "comments",
  "followers",
  "duration_sec",
  "idea",
  "hook_summary",
  "tags",
  "entertaining",
  "educational",
  "inspirational",
  "similarity",
].join(",");

const REEL_FULL_SELECT = [
  "shortcode",
  "url",
  "account",
  "creator",
  "posted_on",
  "score",
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "followers",
  "duration_sec",
  "shots",
  "music",
  "idea",
  "hook_summary",
  "hook_points",
  "retain_summary",
  "retain_points",
  "reward_summary",
  "reward_points",
  "tags",
  "caption",
  "entertaining",
  "educational",
  "inspirational",
].join(",");

const CREATOR_SEARCH_SELECT = [
  "account",
  "name",
  "profile_url",
  "niche",
  "followers",
  "best_views",
  "total_views",
  "reels_indexed",
  "worth_studying",
  "entertaining",
  "educational",
  "inspirational",
  "tags",
  "similarity",
  "rank_score",
].join(",");

// ------------------------------------------------------------------ the tools

const SCORE_NOTE =
  "score is the outlier score, views / followers^0.7 / 7: 10 or more means the reel far outran what an account that size usually gets.";

export const SERVER_INSTRUCTIONS = [
  "This is Oleg Melnikov's viral Instagram reels database (oleg.ae/reels): thousands of reels that outperformed their account's size, each one watched end to end and written up as idea, hook, retain, reward and tags.",
  "",
  "The one rule for using it: ideas come from the user, formats come from the database. The user's idea is what makes their reel theirs, so never hand them somebody else's idea to copy. Borrow the structure: the hook, how attention is held, the payoff.",
  "",
  "A good flow when someone wants to make a reel: ask what they do and what the reel is about if they have not said; search_reels for that topic and for one or two unrelated niches whose formats could transfer; open the strongest few with get_reel; then write their reel on a proven format, naming the reels it borrows from with their links.",
  "",
  "To check whether an idea is fresh, search it and count how many reels already did it. To study one person, use get_creator. Always show the link and the numbers of any reel you cite, so the user can watch it.",
  "",
  SCORE_NOTE,
].join("\n");

export type ToolDef = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: true; openWorldHint: false };
};

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

export const TOOLS: ToolDef[] = [
  {
    name: "search_reels",
    title: "Search viral reels",
    description:
      "Semantic search over viral Instagram reels that were watched and written up. Describe a topic, a format or a hook in plain words ('street interview', 'AI tools for small business', 'before and after transformation'). Returns each reel's link, numbers, idea and hook, closest first. " +
      SCORE_NOTE,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to look for, in plain words." },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: REEL_LIMIT_MAX,
          description: `How many reels to return. Default ${REEL_LIMIT_DEFAULT}.`,
        },
        posted_within_days: {
          type: "integer",
          minimum: 1,
          description: "Only reels posted in the last N days. Use 30 to 90 for what is working now.",
        },
        min_followers: { type: "integer", minimum: 0, description: "Smallest account size." },
        max_followers: {
          type: "integer",
          minimum: 0,
          description: "Largest account size. Use it to find reels a small account could pull off.",
        },
        min_entertaining: { type: "integer", minimum: 1, maximum: 10, description: "1-10, how fun the reel is." },
        min_educational: { type: "integer", minimum: 1, maximum: 10, description: "1-10, how much it teaches." },
        min_inspirational: { type: "integer", minimum: 1, maximum: 10, description: "1-10, how much it moves you." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
  },
  {
    name: "get_reel",
    title: "Get one reel's full write-up",
    description:
      "The full breakdown of one reel: the idea, the hook, how it retains attention, the reward, each as a summary plus points, with the shot list, music, caption, tags and every number. Pass a shortcode from search_reels or an instagram.com reel link.",
    inputSchema: {
      type: "object",
      properties: {
        shortcode: { type: "string", description: "The reel's shortcode, or its Instagram URL." },
      },
      required: ["shortcode"],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
  },
  {
    name: "search_creators",
    title: "Search creators",
    description:
      "Semantic search over the creators in the database by what they make. Returns handle, niche, audience size, views, and worth_studying, a 1-10 hand rating of how much there is to learn from that person. Ordered by relevance weighted by that rating.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What kind of creator to find, in plain words." },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: CREATOR_LIMIT_MAX,
          description: `How many creators to return. Default ${CREATOR_LIMIT_DEFAULT}.`,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
  },
  {
    name: "get_creator",
    title: "Get one creator and their reels",
    description:
      "One creator's profile (niche, audience, what to study them for, their signature moves and top ideas) and their reels with views, likes and score. Use it to find the repeatable format under one person's work. Reels marked analyzed can be opened with get_reel.",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Instagram handle, with or without the @." },
        sort: {
          type: "string",
          enum: ["views", "new"],
          description: "Most viewed first (default) or newest first.",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: SHELF_LIMIT_MAX,
          description: `How many reels to return. Default ${SHELF_LIMIT_DEFAULT}.`,
        },
      },
      required: ["handle"],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
  },
];

// ------------------------------------------------------------------ arguments

/**
 * A model's mistake, as opposed to ours. It goes back inside the tool result
 * with isError set, which is where the MCP spec puts anything the model can
 * read and correct; a protocol error would be hidden from it.
 */
export class ToolInputError extends Error {}

type Args = Record<string, unknown>;

/** A finite number or null. Strings of digits count, because models send them. */
function num(raw: unknown): number | null {
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function clampInt(raw: unknown, fallback: number, min: number, max: number): number {
  const n = num(raw);
  if (n === null) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** A 1-10 floor, or null. 1 is every scored reel and would only drop the unscored. */
function scoreFloor(raw: unknown): number | null {
  const n = num(raw);
  if (n === null) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}

/** A shortcode out of whatever was pasted: the code itself, or a reel link. */
function readShortcode(raw: unknown): string {
  const text = typeof raw === "string" ? raw.trim() : "";
  const fromUrl = text.match(/instagram\.com\/(?:[^/]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/);
  const code = fromUrl ? fromUrl[1] : text;
  return /^[A-Za-z0-9_-]{5,40}$/.test(code) ? code : "";
}

// ------------------------------------------------------------------- upstream

function headers(): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function rpc<T>(
  fn: string,
  select: string,
  order: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<T[]> {
  const projection = new URLSearchParams({ select, order });
  const send = () =>
    fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}?${projection}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      signal,
    });
  let res = await send();
  // Once more on a 5xx, and only once. The creator index is bigger than the
  // database's cache, so the first search after a quiet spell can run into the
  // 8s statement timeout while it pulls the probe table off disk; the attempt
  // that failed is what warmed it, and the second lands in under a second. A
  // person on the site reads that as a slow page and tries again. A model reads
  // it as "the tool is broken" and stops using it.
  if (res.status >= 500) res = await send();
  // The body names the Postgres error (a timeout, a missing column), and the
  // status alone has never once been enough to tell those apart.
  if (!res.ok) throw new Error(`${fn} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`${fn} returned ${typeof rows}`);
  return rows as T[];
}

/** Null and empty fields only cost the model tokens. */
function compact<T extends Record<string, unknown>>(row: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (k === "similarity" || k === "rank_score") {
      out[k] = Math.round((v as number) * 1000) / 1000;
      continue;
    }
    out[k] = v;
  }
  return out as Partial<T>;
}

// ------------------------------------------------------------------- handlers

async function searchReelsTool(args: Args, signal: AbortSignal) {
  const query = normalizeQuery(typeof args.query === "string" ? args.query : "");
  if (!query) throw new ToolInputError("query is required.");
  const limit = clampInt(args.limit, REEL_LIMIT_DEFAULT, 1, REEL_LIMIT_MAX);

  const days = num(args.posted_within_days);
  const minFollowers = num(args.min_followers);
  const maxFollowers = num(args.max_followers);

  const { vector } = await embedQuery(query, signal);
  const rows = await rpc<{ similarity: number }>(
    "reel_library_match",
    REEL_SEARCH_SELECT,
    "similarity.desc",
    {
      query_embedding: vector,
      match_count: limit,
      min_followers: minFollowers !== null && minFollowers > 0 ? Math.round(minFollowers) : null,
      // The function's upper bounds are EXCLUSIVE, and "at most 100,000" means
      // an account with exactly 100,000 is in.
      below_followers: maxFollowers !== null && maxFollowers >= 0 ? Math.round(maxFollowers) + 1 : null,
      min_entertaining: scoreFloor(args.min_entertaining),
      below_entertaining: null,
      min_educational: scoreFloor(args.min_educational),
      below_educational: null,
      min_inspirational: scoreFloor(args.min_inspirational),
      below_inspirational: null,
      posted_from: null,
      posted_after:
        days !== null && days >= 1 ? daysBefore(new Date(), Math.min(Math.round(days), 3650)) : null,
    },
    signal,
  );
  const hits = rows.filter((r) => r.similarity >= MIN_SIMILARITY).map(compact);
  return {
    query,
    count: hits.length,
    reels: hits,
    ...(hits.length === 0
      ? { note: "Nothing in the library is close to that. Try broader words or drop a filter." }
      : {}),
  };
}

async function getReelTool(args: Args, signal: AbortSignal) {
  const shortcode = readShortcode(args.shortcode);
  if (!shortcode) throw new ToolInputError("shortcode must be a reel shortcode or an instagram.com reel link.");

  const params = new URLSearchParams({
    select: REEL_FULL_SELECT,
    shortcode: `eq.${shortcode}`,
    limit: "1",
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reel_search?${params}`, {
    headers: headers(),
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`reel read failed: ${res.status}`);
  const rows = (await res.json()) as Record<string, unknown>[];
  if (Array.isArray(rows) && rows.length) return compact(rows[0]);

  // Four fifths of the scraped reels have numbers and no write-up. Saying which
  // of the two "not found"s this is stops a model from retrying a reel that
  // exists and was simply never watched.
  const bare = new URLSearchParams({
    select: "shortcode,url,account,posted_on,views,likes,comments,score",
    shortcode: `eq.${shortcode}`,
    limit: "1",
  });
  const fallback = await fetch(`${SUPABASE_URL}/rest/v1/creator_reel?${bare}`, {
    headers: headers(),
    signal,
    cache: "no-store",
  });
  if (fallback.ok) {
    const found = (await fallback.json()) as Record<string, unknown>[];
    if (Array.isArray(found) && found.length) {
      return {
        ...compact(found[0]),
        note: "This reel is in the database with its numbers only. It has not been watched and written up.",
      };
    }
  }
  throw new ToolInputError(`No reel with shortcode ${shortcode} in the database.`);
}

async function searchCreatorsTool(args: Args, signal: AbortSignal) {
  const query = normalizeCreatorQuery(typeof args.query === "string" ? args.query : "");
  if (!query) throw new ToolInputError("query is required.");
  const limit = clampInt(args.limit, CREATOR_LIMIT_DEFAULT, 1, CREATOR_LIMIT_MAX);

  const { vector } = await embedQuery(query, signal);
  const bounds: Record<string, null> = {};
  for (const key of ["followers", "worth_studying", "entertaining", "educational", "inspirational"]) {
    bounds[`min_${key}`] = null;
    bounds[`below_${key}`] = null;
  }
  const rows = await rpc<{ similarity: number }>(
    "creator_search_match",
    CREATOR_SEARCH_SELECT,
    "rank_score.desc",
    { query_embedding: vector, match_count: limit, query_text: query, ...bounds },
    signal,
  );
  // On `similarity`, never on `rank_score`: the floor was calibrated on the
  // relevance scale and the product runs up to 40% below it.
  const hits = rows.filter((r) => r.similarity >= CREATOR_MIN_SIMILARITY).map(compact);
  return {
    query,
    count: hits.length,
    creators: hits,
    ...(hits.length === 0 ? { note: "No creator in the database is close to that." } : {}),
  };
}

async function getCreatorTool(args: Args, signal: AbortSignal) {
  const handle = normalizeHandle(typeof args.handle === "string" ? args.handle : "");
  if (!handle) throw new ToolInputError("handle must be an Instagram handle.");
  const sort = normalizeCreatorSort(typeof args.sort === "string" ? args.sort : "views");
  const limit = clampInt(args.limit, SHELF_LIMIT_DEFAULT, 1, SHELF_LIMIT_MAX);

  // Handles are stored lowercase; Instagram's are case-insensitive.
  const account = handle.toLowerCase();
  const [creator, shelf] = await Promise.all([
    getCreator(account, signal),
    getCreatorReels(account, 1, sort, signal),
  ]);
  if (!creator) {
    throw new ToolInputError(`@${handle} is not in the database. Use search_creators to find who is.`);
  }
  const {
    top_codes: _codes,
    top_thumbs: _thumbs,
    avatar_url: _avatar,
    rank_base: _rank,
    deep_scraped: _deep,
    ...profile
  } = creator;
  return {
    creator: compact(profile),
    page: `https://www.oleg.ae/creators/${account}`,
    reels_total: shelf.total,
    reels_sorted_by: sort,
    reels: shelf.rows.slice(0, limit).map(({ thumb_url: _t, account: _a, ...reel }) => compact(reel)),
  };
}

const HANDLERS: Record<string, (args: Args, signal: AbortSignal) => Promise<unknown>> = {
  search_reels: searchReelsTool,
  get_reel: getReelTool,
  search_creators: searchCreatorsTool,
  get_creator: getCreatorTool,
};

export function isTool(name: string): boolean {
  return Object.hasOwn(HANDLERS, name);
}

/**
 * Run one tool. Throws ToolInputError for the model's mistakes and a plain
 * Error for ours; the route turns both into a tool result, with different words.
 */
export async function callTool(name: string, args: Args, callerSignal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_BUDGET_MS);
  callerSignal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    return await HANDLERS[name](args, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
