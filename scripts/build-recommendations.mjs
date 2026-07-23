#!/usr/bin/env node
/**
 * Build the "up next" recommendation map for the resource pages.
 *
 * WHAT IT DOES
 *   1. Pulls per-page popularity (unique visitors, last 90 days) from Plausible.
 *   2. Reads each resource's topic (title + description) from the shared
 *      resources data used by the site.
 *   3. Asks Claude ONCE to pick, for every resource page, the best 2-3 "next"
 *      pages, ranked (position 0 = the hero "up next"), balancing relevance to
 *      that page's topic + popularity (the Plausible numbers) + content quality.
 *   4. Writes the result to src/lib/recommendations.json.
 *
 * The site does ZERO LLM/analytics calls at runtime: NextUp just reads the JSON.
 *
 * WHEN TO RERUN
 *   After adding/removing a resource page, or to refresh the popularity signal.
 *
 * USAGE
 *   node scripts/build-recommendations.mjs
 *
 * REQUIRES (in .env at the repo root)
 *   ANTHROPIC_API_KEY, PLAUSIBLE_API_KEY, PLAUSIBLE_BASE_URL, PLAUSIBLE_SITE_ID
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

process.loadEnvFile(join(ROOT, ".env"));

const MODEL = "claude-sonnet-4-6";
const PLAUSIBLE_BASE_URL = process.env.PLAUSIBLE_BASE_URL || "https://plausible.io";
const SITE_ID = process.env.PLAUSIBLE_SITE_ID || "oleg.ae";
const OUT_PATH = join(ROOT, "src/lib/recommendations.json");

// Quality signal from the plan: pages that punch above their raw traffic on
// engagement (dwell / bounce) and deserve a boost even when clicks are lower.
const QUALITY_BOOST = {
  "marketing-brain": "rising, stickiest surface (the AI chat); highest quality",
  "high-converting-website": "deepest engagement, lowest bounce; high quality",
  "5-levels-ai": "long-dwell explainer article; high quality",
};

// ── 1. Read the resource pool (topics) straight from the shared data module. ──
// resources-data.ts is TS, so pull the slug/title/description with a light parse
// rather than importing (keeps this script dependency-free of the TS toolchain).
function readResources() {
  const src = readFileSync(join(ROOT, "src/components/resources-data.ts"), "utf8");
  const body = src.slice(src.indexOf("export const RESOURCES"));
  const items = [];
  const re =
    /slug:\s*"([^"]+)",\s*\n\s*title:\s*"((?:[^"\\]|\\.)*)",\s*\n\s*description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(body))) {
    items.push({
      slug: m[1],
      title: m[2].replace(/\\"/g, '"'),
      description: m[3].replace(/\\"/g, '"'),
    });
  }
  // Fail loudly on a partial parse: every RESOURCES entry has exactly one
  // `slug:` line, so a mismatch means the regex missed a reformatted entry and
  // we would otherwise silently drop that page from the recommendation map.
  const expected = (body.match(/^\s*slug:\s*"/gm) || []).length;
  if (items.length !== expected) {
    throw new Error(
      `Parsed ${items.length} resources but resources-data.ts declares ${expected}. ` +
        `A resource entry does not match the expected slug/title/description layout; ` +
        `fix the regex in readResources() or the entry formatting.`,
    );
  }
  return items;
}

// ── 2. Pull per-page visitors (90d) from Plausible. ──────────────────────────
async function fetchPopularity() {
  const key = process.env.PLAUSIBLE_API_KEY;
  if (!key) throw new Error("PLAUSIBLE_API_KEY missing in .env");
  const res = await fetch(`${PLAUSIBLE_BASE_URL}/api/v2/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site_id: SITE_ID,
      metrics: ["visitors"],
      date_range: "90d",
      dimensions: ["event:page"],
    }),
  });
  if (!res.ok) throw new Error(`Plausible ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const byPage = {};
  for (const row of data.results || []) {
    byPage[row.dimensions[0]] = row.metrics[0];
  }
  return byPage;
}

// ── 3. Ask Claude once for the ranked map. ───────────────────────────────────
async function askClaude(resources, popularity) {
  const catalog = resources.map((r) => ({
    slug: r.slug,
    title: r.title,
    topic: r.description,
    visitors_90d: popularity[`/${r.slug}`] ?? 0,
    quality_note: QUALITY_BOOST[r.slug] ?? "",
  }));

  const slugs = resources.map((r) => r.slug);

  const prompt = `You are building an "up next" recommender for a rack of free-resource landing pages on oleg.ae. Each page is fed by one YouTube video and is usually a dead end (visitors view 1.48 pages per visit). We want to hand each visitor 3 genuinely good next steps.

For EACH page below, pick the best 3 OTHER pages to recommend next, RANKED. Position 0 is the hero "up next" (the single most obvious, valuable next step); positions 1 and 2 are strong secondary picks.

Balance three things for every pick:
1. RELEVANCE: the next page should relate to what the visitor just consumed (same topic cluster, natural progression, or a complementary skill). This matters most.
2. POPULARITY: prefer pages more people actually visit (visitors_90d), so good content is not buried, but do not let popularity override relevance.
3. QUALITY: give pages with a quality_note a boost even if their raw traffic is lower.

Guidelines:
- Never recommend a page to itself.
- Spread the wealth a little: it is fine (good, even) if very popular pages appear often, but try to give every recommendation set a coherent theme rather than always listing the same 3 pages everywhere.
- Think in clusters: outreach pages -> other outreach + high-converting-website; short-video pages (reels/tiktok) -> each other + content/social-growth; content/writing pages -> each other + the marketing-brain and 60k-linkedin-post; ads/seo/trend -> marketing + relevant siblings; the-5-levels/marketing-brain are broad and pair well as a "go deeper" pick.

Here is the catalog (JSON):
${JSON.stringify(catalog, null, 2)}

Return ONLY a JSON object (no prose, no markdown fence) mapping every slug to an array of exactly 3 other slugs, ranked best-first. Every value slug MUST be one of: ${slugs.join(", ")}. Example shape:
{"claude-reels":["claude-tiktok","claude-content","marketing-brain"], ...}`;

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  let text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  // Strip an accidental ```json fence if present.
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const raw = JSON.parse(text);

  // ── Validate + sanitize: only known slugs, exactly 3, never self. ──────────
  const known = new Set(slugs);
  const clean = {};
  for (const slug of slugs) {
    const picks = Array.isArray(raw[slug]) ? raw[slug] : [];
    const seen = new Set();
    const out = [];
    for (const p of picks) {
      if (p !== slug && known.has(p) && !seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
    // Backfill from most-popular others if the model returned < 3.
    if (out.length < 3) {
      const byPop = [...slugs]
        .filter((s) => s !== slug && !seen.has(s))
        .sort((a, b) => (popularity[`/${b}`] ?? 0) - (popularity[`/${a}`] ?? 0));
      for (const s of byPop) {
        if (out.length >= 3) break;
        out.push(s);
      }
    }
    clean[slug] = out.slice(0, 3);
  }
  return clean;
}

async function main() {
  console.log("Fetching Plausible popularity (90d)...");
  const popularity = await fetchPopularity();
  const resources = readResources();
  console.log(`Read ${resources.length} resources from resources-data.ts.`);
  if (resources.length < 2) throw new Error("Failed to parse resources-data.ts");

  console.log(`Asking ${MODEL} to rank recommendations...`);
  const map = await askClaude(resources, popularity);

  const payload = {
    _generatedBy: "scripts/build-recommendations.mjs",
    _note:
      "Ranked 'up next' picks per resource page (position 0 = hero). Regenerate with: node scripts/build-recommendations.mjs",
    _model: MODEL,
    recommendations: map,
  };
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Wrote ${OUT_PATH}`);
  for (const [slug, picks] of Object.entries(map)) {
    console.log(`  /${slug} -> ${picks.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
