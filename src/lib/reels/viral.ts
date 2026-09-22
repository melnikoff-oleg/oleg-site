// The /viral page's two server halves: find the reels a beginner should copy,
// and rewrite one of them for their brand.
//
// FIND is the library search with a different ranking on top. The library ranks
// by similarity alone and lets the visitor filter. This page has no filters:
// the visitor is a beginner with 0 to 50 reels and no viral hit, and the one
// decision made for them (2026-09-22, Oleg) is that the reels worth copying
// come from accounts of 10k to 100k followers, posted in the last three
// months. Those are SOFT bounds: a reel from a 2M account still shows, lower,
// because "show me only small accounts" would empty a narrow niche. So the
// match function is asked for a wide shortlist and every reel is re-scored
// here as similarity times a size weight times a recency weight.
//
// ADAPT reads one reel's write-up and asks Claude to rewrite it for the brand
// the visitor described: a name, the four fields, and a script they can film.

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { embedQuery } from "@/lib/search/embed";
import { MIN_SIMILARITY, type ReelRow } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

export const viralSearchConfigured = Boolean(SUPABASE_URL && SERVICE_KEY && OPENAI_KEY);
export const viralAdaptConfigured = Boolean(SUPABASE_URL && SERVICE_KEY && ANTHROPIC_KEY);

/** The brand description: short enough to embed as one query, long enough to mean something. */
export const BRAND_MIN = 10;
export const BRAND_MAX = 600;
/** Free text the visitor types under a concept to steer the next version. */
export const FEEDBACK_MAX = 400;

/** How many reels the page shows. */
export const VIRAL_RESULT_COUNT = 24;
/** How many the match function is asked for before re-ranking. */
const SHORTLIST = 120;

/**
 * One reel as the page draws and adapts it: the tile numbers plus the four
 * write-ups, because a click opens them without a second request.
 */
export const VIRAL_COLUMNS = [
  "shortcode",
  "url",
  "account",
  "creator",
  "posted_on",
  "score",
  "views",
  "likes",
  "comments",
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
  "thumb_url",
] as const satisfies readonly (keyof ReelRow)[];

export type ViralReel = Pick<ReelRow, (typeof VIRAL_COLUMNS)[number]> & {
  similarity: number;
  /** similarity x size weight x recency weight; what the page is ordered by. */
  rank: number;
};

function headers(): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

// ------------------------------------------------------------------- ranking

/**
 * How much a reel's account size counts against it.
 *
 * Under 100k is the pool Oleg named, at full weight. From 100k to 1M the
 * weight falls on a log scale to 0.6, because a reel that did 2M from a 400k
 * account is still evidence, just weaker evidence for someone with 800
 * followers. Past 1M it keeps falling to 0.3 at 10M and stays there: a Cristiano
 * reel tells a beginner nothing about what they can film.
 */
export function sizeWeight(followers: number | null): number {
  if (followers === null || followers <= 100_000) return 1;
  const l = Math.log10(followers);
  if (followers <= 1_000_000) return 1 - 0.4 * (l - 5); // 5..6 -> 1.0..0.6
  if (followers <= 10_000_000) return 0.6 - 0.3 * (l - 6); // 6..7 -> 0.6..0.3
  return 0.3;
}

/**
 * How much a reel's age counts against it.
 *
 * The first 90 days are at full weight: that is the window Oleg set, and inside
 * it newer is not better enough to reorder anything. After that it decays to
 * half at a year and stays there, so an old reel can still show in a niche with
 * nothing recent, well below anything from this quarter.
 */
export function recencyWeight(ageDays: number | null): number {
  if (ageDays === null) return 0.6;
  if (ageDays <= 90) return 1;
  if (ageDays >= 365) return 0.5;
  return 1 - 0.5 * ((ageDays - 90) / 275);
}

export function ageDays(posted: string | null, today: Date): number | null {
  if (!posted) return null;
  const then = Date.parse(`${posted.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((today.getTime() - then) / 86_400_000));
}

export function rankReels<T extends { similarity: number; followers: number | null; posted_on: string | null; account: string }>(
  rows: T[],
  today: Date,
  count: number,
): (T & { rank: number })[] {
  return rows
    .filter((r) => r.similarity >= MIN_SIMILARITY)
    .map((r) => ({
      ...r,
      rank: r.similarity * sizeWeight(r.followers) * recencyWeight(ageDays(r.posted_on, today)),
    }))
    .sort((a, b) => b.rank - a.rank)
    .filter(perAccountCap(PER_ACCOUNT))
    .slice(0, count);
}

/**
 * At most N reels from one account on the page. Measured on the first pass:
 * "handmade ceramic mugs" returned six reels from one metalworking account in
 * its top seven, because that account has 80 reels in the index and they all
 * sit near each other. Six views of one person is one idea, not six.
 */
const PER_ACCOUNT = 3;
function perAccountCap(max: number) {
  const seen = new Map<string, number>();
  return (r: { account: string }) => {
    const n = (seen.get(r.account) ?? 0) + 1;
    seen.set(r.account, n);
    return n <= max;
  };
}

// -------------------------------------------------------------------- search

/** Trim, collapse whitespace, cap. */
export function normalizeBrand(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, BRAND_MAX);
}

const cache = new Map<string, { at: number; hits: ViralReel[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 200;

export async function findViralReels(brand: string, callerSignal?: AbortSignal): Promise<ViralReel[]> {
  const key = brand.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.hits;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  callerSignal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    // The brand description is the query. A description of what someone makes
    // and who for lands next to reels about the same thing, which is the whole
    // reason the corpus was embedded as idea + hook + tags rather than as a
    // transcript.
    const { vector } = await embedQuery(brand, controller.signal);
    const projection = new URLSearchParams({
      select: [...VIRAL_COLUMNS, "similarity"].join(","),
      order: "similarity.desc",
    });
    const send = () =>
      fetch(`${SUPABASE_URL}/rest/v1/rpc/reel_library_match?${projection}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ query_embedding: vector, match_count: SHORTLIST }),
        signal: controller.signal,
      });
    let res = await send();
    if (res.status >= 500) res = await send();
    if (!res.ok) throw new Error(`reel_library_match failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const rows = (await res.json()) as (Omit<ViralReel, "rank">)[];
    if (!Array.isArray(rows)) throw new Error("reel_library_match returned a non-array");
    const hits = rankReels(rows, new Date(), VIRAL_RESULT_COUNT);
    if (cache.size >= CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, { at: Date.now(), hits });
    return hits;
  } finally {
    clearTimeout(timer);
  }
}

// --------------------------------------------------------------------- adapt

export type Concept = {
  name: string;
  idea: string;
  hook: string;
  retain: string;
  reward: string;
  script: string;
};

const CONCEPT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "idea", "hook", "retain", "reward", "script"],
  properties: {
    name: { type: "string", description: "The concept in at most 70 characters." },
    idea: { type: "string", description: "One or two sentences: what the reel is, for this brand." },
    hook: { type: "string", description: "The first 3 seconds: the exact opening line and what is on screen." },
    retain: { type: "string", description: "How the middle keeps people watching, in 2 to 4 sentences." },
    reward: { type: "string", description: "What the viewer walks away with, in 1 or 2 sentences." },
    script: {
      type: "string",
      description:
        "The full script to film, as plain text with line breaks. Every spoken line word for word, with a short bracketed note of what is on screen where it matters. Under 200 words unless the source reel is longer.",
    },
  },
} as const;

// Sonnet 5 rather than Opus, on purpose: this runs for anyone on the open web
// under a per-IP cap, and Oleg's rule is that the cheaper model comes first.
// One line to change if the concepts read thin.
const MODEL = "claude-sonnet-5";

const SYSTEM = `You rewrite one viral Instagram reel for a different brand.

You are given the write-up of a reel that far outran its account's size: the idea, the hook, how it kept people watching, the reward, and the numbers. You are also given a description of the brand that wants to film its own version.

Keep the STRUCTURE exactly. The hook mechanism, the pacing, the shape of the payoff, the length. Those are why it worked. Change only the SUBJECT: fill the same shape with this brand's world, their customers, their expertise, their product. The result must be filmable by one person with a phone unless the source reel obviously needed more.

Write in plain words a third grader could read. Short sentences. No jargon. Never use an em dash.

Return the concept as JSON matching the schema. The script is what they will read off the phone, so every spoken line is word for word.`;

function reelForPrompt(reel: ViralReel | Record<string, unknown>): string {
  const r = reel as Record<string, unknown>;
  const lines = [
    `Account: @${r.account} (${r.followers ?? "?"} followers)`,
    `Views: ${r.views ?? "?"}, likes: ${r.likes ?? "?"}, outlier score: ${r.score ?? "?"}`,
    `Length: ${r.duration_sec ?? "?"} seconds, ${r.shots ?? "?"} shots`,
    r.music ? `Music: ${r.music}` : "",
    `Idea: ${r.idea ?? ""}`,
    `Hook: ${r.hook_summary ?? ""}`,
    ...((r.hook_points as string[] | null) ?? []).map((p) => `  - ${p}`),
    `Retain: ${r.retain_summary ?? ""}`,
    ...((r.retain_points as string[] | null) ?? []).map((p) => `  - ${p}`),
    `Reward: ${r.reward_summary ?? ""}`,
    ...((r.reward_points as string[] | null) ?? []).map((p) => `  - ${p}`),
    r.caption ? `Caption: ${r.caption}` : "",
    Array.isArray(r.tags) && r.tags.length ? `Tags: ${(r.tags as string[]).join(", ")}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function readReel(shortcode: string, signal: AbortSignal): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({
    select: VIRAL_COLUMNS.join(","),
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
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function adaptReel(
  {
    reel,
    brand,
    previous,
    feedback,
  }: {
    reel: Record<string, unknown>;
    brand: string;
    previous?: Concept | null;
    feedback?: string;
  },
  signal: AbortSignal,
): Promise<{ concept: Concept; usage: { input: number; output: number } }> {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  let user = `THE BRAND that wants its own version:\n${brand}\n\nTHE REEL to rewrite:\n${reelForPrompt(reel)}`;
  if (previous && feedback) {
    user += `\n\nYOUR PREVIOUS VERSION:\n${JSON.stringify(previous, null, 2)}\n\nTHE BRAND'S FEEDBACK on it:\n${feedback}\n\nWrite a new version that takes the feedback. Keep what they did not complain about.`;
  }

  const message = await client.messages.create(
    {
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: user }],
      // Low effort: the first version at default effort took 19 seconds, most
      // of it thinking about a rewrite that needs none. Measured again at low.
      output_config: { effort: "low", format: { type: "json_schema", schema: CONCEPT_SCHEMA } },
    },
    { signal },
  );

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed = JSON.parse(text) as Concept;
  for (const k of ["name", "idea", "hook", "retain", "reward", "script"] as const) {
    if (typeof parsed[k] !== "string") throw new Error(`concept missing ${k}`);
  }
  parsed.name = parsed.name.slice(0, 90);
  return {
    concept: parsed,
    usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
  };
}
