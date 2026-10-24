// The whole reel library, filtered and paged. The other half of /viral-reels.
//
// Search answers "what is close to this idea"; browse answers "what is in here
// at all". It never embeds anything and never calls OpenAI, so it is a single
// PostgREST read against `reel_search` and costs nothing per visitor.
//
// Kept apart from search.ts so the two cannot share a cache key or a code path
// by accident: one is ranked by distance to a vector, the other by outlier
// score, and a row that is right for one is not necessarily right for the other.

import "server-only";
import { unstable_cache } from "next/cache";
import { binOf, packBins, type BinRow } from "@/lib/filters/range";
import { memoize } from "@/lib/perf/memo";
import {
  ageInDays,
  reelRangeParams,
  REEL_FILTERS,
  REEL_FILTER_KEYS,
  type ReelFilters,
} from "./filters";
import { BROWSE_PAGE_SIZE, type ReelRow } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TABLE = "reel_search";

export const reelBrowseConfigured = Boolean(SUPABASE_URL && SERVICE_KEY);

// Named explicitly rather than `*`, because `*` would also fetch `embedding`
// (3072 floats, ~24 KB of JSON per row) and `doc`, neither of which any browser
// reads. At 20 rows a page that is the difference between a 60 KB response and
// a 550 KB one. Must stay in step with the ReelRow type.
const COLUMNS = [
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
  "thumb_url",
  // The three 1-10 reads of what a reel gives a viewer, one row per reel,
  // written by analysis/axes in the reels-database repo. Null for a reel indexed
  // since the last scoring pass; the filters treat that as unknown, never as a
  // zero. Must stay in step with the ReelRow type.
  "entertaining",
  "educational",
  "inspirational",
].join(",");

/** Ceiling on rows per read. Well above a page, well below a table scan. */
const BROWSE_MAX_LIMIT = 100;

export type BrowseFilters = {
  /** The five ranges. See src/lib/reels/filters.ts. */
  ranges: ReelFilters;
  page: number;
  /** Rows per page. The browse page always uses the default; the ideas chat
   *  asks for fewer, because it pays per token for every row it reads. */
  limit?: number;
  /** Keep only reels carrying at least one of these tags. Exact matches, which
   *  is workable because the only caller picks them out of library_overview's
   *  own tag list rather than inventing them. */
  tags?: string[];
};

export type BrowsePage = {
  rows: ReelRow[];
  /** How many reels match the filters, not how many are on this page. */
  total: number;
};

export async function browseReels(
  filters: BrowseFilters,
  signal?: AbortSignal,
): Promise<BrowsePage> {
  const { ranges, page } = filters;
  // The /reels route never passes a limit, so it always gets the
  // page size. The ideas chat does, because its effort and diversity filters are
  // applied in TypeScript and need more rows than they keep.
  const limit = Math.min(BROWSE_MAX_LIMIT, Math.max(1, filters.limit ?? BROWSE_PAGE_SIZE));
  const params = new URLSearchParams();
  params.set("select", COLUMNS);
  // Highest outlier first, and a reel whose score never got computed sorts to
  // the very end rather than to the top, which is where Postgres puts nulls in
  // a descending sort by default.
  params.set("order", "score.desc.nullslast,posted_on.desc");
  params.set("limit", String(limit));
  params.set("offset", String((page - 1) * limit));

  // Every filter at full extent adds nothing at all. One date for the whole
  // request, so the two posted_on bounds cannot straddle a midnight.
  for (const [key, value] of reelRangeParams(ranges, new Date())) {
    params.append(key, value);
  }

  // `ov` is array overlap: keep a row if any of its tags is any of these. The
  // braces and quoting are PostgREST's array literal syntax, and a tag with a
  // comma or a quote in it would break out of the list, so both are stripped.
  const tags = (filters.tags ?? [])
    .map((t) => t.replace(/["'{},\\]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 12);
  if (tags.length) {
    params.set("tags", `ov.{${tags.map((t) => `"${t}"`).join(",")}}`);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?${params}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      // The total is what turns "page 3" into "page 3 of 35". `estimated` would
      // be cheaper but wrong on a table this small, where the planner's row
      // estimate can be out by a factor of two.
      Prefer: "count=exact",
    },
    signal,
    // Never cached. A 60-second `revalidate` was here first and it was wrong:
    // Vercel's Data Cache kept serving the pre-sync answer long past its TTL,
    // so the day the library went from 694 reels to 1033 the page still said
    // 7 reels under a million followers in the last 60 days when the database
    // said 108. A count that lags the database is worse than a count that
    // costs one indexed query, and this query is one indexed query.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`browse failed: ${res.status}`);

  const rows = (await res.json()) as ReelRow[];
  if (!Array.isArray(rows)) throw new Error("browse returned a non-array");

  // "0-19/696". The count sits after the slash; PostgREST sends "*" for it when
  // no count was asked for, so fall back to what actually arrived.
  const total = Number(res.headers.get("content-range")?.split("/")[1]);
  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

// ------------------------------------------------------------------- the facts
//
// The histograms are drawn in the browser off every reel in the index, which is
// what lets them redraw on every pixel of a drag instead of once a round trip.
// The creator page ships 245 rows of raw numbers for the same job; this index is
// 4,896 rows, so the same shape would be 120 KB of page. A bin index is never
// above 35 on any of these scales, so one reel is five characters and the whole
// library is a 25 KB string.

/**
 * How many rows one facts request asks for.
 *
 * 1,000, because that is PostgREST's own `db-max-rows` on this project and a
 * bigger `limit` does not raise it: it silently returns 1,000 and says nothing.
 * That is exactly how the first version of this shipped, with the filter bar
 * reporting "1,000 reels" under a wall that paged to 4,896. So the read PAGES,
 * and the page size is the server's ceiling rather than a number of our own that
 * could drift above it.
 */
const FACTS_PAGE = 1000;

/** Ceiling on the whole facts read. Well above the index, well below a runaway. */
const FACTS_LIMIT = 40_000;

export type ReelFacts = {
  /** Five characters a reel, in REEL_FILTER_KEYS order. */
  packed: string;
  /** How many reels it describes, so the caller never has to divide. */
  count: number;
};

/**
 * Every reel in the index reduced to one bin per filter.
 *
 * Binned HERE rather than in the browser, so the server and the client cannot
 * disagree about which bar a reel belongs to: there is one binOf call in the
 * codebase and this is where it runs for reels.
 *
 * Cached rather than `no-store`. It is the same answer for every visitor and it
 * only moves when sync.py runs, which is a handful of times a week; the page's
 * own count next to it stays uncached because it is on screen. Cached whole,
 * once binned, rather than page by page: at 9,743 reels the read is ten pages,
 * and ten sequential data-cache lookups were most of the ~300 ms /reels took to
 * send its first byte. Two layers, each about a minute, so a sync shows within
 * two: the running instance (memoize) and Next's data cache across instances
 * (unstable_cache), which refreshes in the background once stale.
 */
type FactRow = {
  followers: number | null;
  posted_on: string | null;
  entertaining: number | null;
  educational: number | null;
  inspirational: number | null;
};

/** One page of facts; the first also asks PostgREST to count the table. */
async function readFactsPage(
  offset: number,
  count: boolean,
): Promise<{ rows: FactRow[]; total: number | null }> {
  const params = new URLSearchParams();
  params.set(
    "select",
    "followers,posted_on,entertaining,educational,inspirational",
  );
  // Without `order` a paged read has no defined order at all, so pages could
  // skip or repeat rows. It also makes the payload byte-identical between two
  // renders, which is what keeps the client's histograms from shifting under a
  // refresh.
  params.set("order", "shortcode.asc");
  params.set("limit", String(FACTS_PAGE));
  params.set("offset", String(offset));

  // no-store: the finished answer is what gets cached (listReelFacts below).
  // Caching each page as well would only stack a second minute of staleness.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?${params}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(count ? { Prefer: "count=exact" } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`reel facts failed: ${res.status}`);
  const rows = (await res.json()) as FactRow[];
  if (!Array.isArray(rows)) throw new Error("reel facts returned a non-array");
  // Content-Range: "0-999/9743". Only present as a number when counted.
  const total = Number(res.headers.get("content-range")?.split("/")[1]);
  return { rows, total: count && Number.isFinite(total) ? total : null };
}

async function readReelFacts(): Promise<ReelFacts> {
  // The first page also counts the table, so every other page can be asked
  // for at once: two round trips on a cache miss rather than one per 1,000
  // reels in a row, which at 9,743 reels was ten.
  const first = await readFactsPage(0, true);
  const rows = [...first.rows];
  if (first.rows.length === FACTS_PAGE) {
    if (first.total === null) throw new Error("reel facts: no row count in the response");
    const offsets: number[] = [];
    for (let at = FACTS_PAGE; at < Math.min(first.total, FACTS_LIMIT); at += FACTS_PAGE) {
      offsets.push(at);
    }
    const pages = await Promise.all(offsets.map((at) => readFactsPage(at, false)));
    for (const page of pages) rows.push(...page.rows);
    // A sync that landed after the count grew the table past it, which shows as
    // a full last page: read on, one page at a time, until a short one.
    let last = pages.at(-1) ?? first;
    while (last.rows.length === FACTS_PAGE && rows.length < FACTS_LIMIT) {
      last = await readFactsPage(rows.length, false);
      rows.push(...last.rows);
    }
  }
  // A silent truncation would not break anything visibly: the charts would
  // describe a prefix of the index while the count under them came from the
  // database. Say so instead.
  if ((first.total ?? rows.length) > FACTS_LIMIT) {
    console.error(
      `reel facts hit the ${FACTS_LIMIT}-row cap; the histograms are now a prefix of the index`,
    );
  }

  // One date for the whole read, so two reels posted the same day cannot land in
  // different age bars because the loop crossed midnight.
  const today = new Date();
  const binned: BinRow[] = rows.map((r) => {
    const value: Record<(typeof REEL_FILTER_KEYS)[number], number | null> = {
      followers: r.followers,
      age: ageInDays(r.posted_on, today),
      entertaining: r.entertaining,
      educational: r.educational,
      inspirational: r.inspirational,
    };
    // Order fixed by REEL_FILTER_KEYS, which is what the client unpacks against.
    return REEL_FILTER_KEYS.map((key) =>
      binOf(REEL_FILTERS.scales[key], value[key]),
    );
  });
  return { packed: packBins(binned), count: binned.length };
}

export const listReelFacts = memoize(
  60_000,
  unstable_cache(readReelFacts, ["reel-facts"], { revalidate: 60 }),
);
