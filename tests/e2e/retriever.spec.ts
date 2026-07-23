import { test, expect } from "@playwright/test";
import { search, toSources } from "../../src/lib/marketing-brain/retriever";
import type { Chunk } from "../../src/lib/marketing-brain/types";

// Pure unit test of the BM25 + quality-prior retriever. No page/server needed;
// runs in-process against the committed chunks.json. Reads chunks.json via
// process.cwd(), so it must run from the repo root (Playwright's default).
// Guards the ranking invariants documented in CLAUDE.md that no visual/e2e test
// would catch if BETA / PER_SOURCE / RESERVE_VIDEOS were changed.

const PER_SOURCE = 2;
const RESERVE_VIDEOS = 2;

function sourceKey(c: Chunk): string {
  return c.type === "book" ? c.slug : c.videoId;
}

test.describe("marketing-brain retriever invariants", () => {

  const QUERIES = [
    "how do i write a compelling offer",
    "cold email outreach that gets replies",
    "build a personal brand on youtube",
    "pricing strategy for a service business",
  ];

  test("no single source contributes more than PER_SOURCE chunks", () => {
    for (const q of QUERIES) {
      const chunks = search(q, 8);
      const counts = new Map<string, number>();
      for (const c of chunks) {
        const k = sourceKey(c);
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      for (const [k, n] of counts) {
        expect(n, `query "${q}" took ${n} chunks from ${k}`).toBeLessThanOrEqual(PER_SOURCE);
      }
    }
  });

  test("results always include at least RESERVE_VIDEOS videos", () => {
    for (const q of QUERIES) {
      const chunks = search(q, 8);
      const videos = chunks.filter((c) => c.type === "video").length;
      expect(videos, `query "${q}" surfaced only ${videos} videos`).toBeGreaterThanOrEqual(
        RESERVE_VIDEOS,
      );
    }
  });

  test("a source is retrievable by name/author (identity folding)", () => {
    // Cialdini's Influence is in the corpus; searching the author name must
    // surface that book, proving identity is folded into the searchable text.
    const chunks = search("Cialdini influence persuasion", 8);
    const hasCialdini = chunks.some(
      (c) => c.type === "book" && /cialdini/i.test(c.author),
    );
    expect(hasCialdini, "expected a Cialdini book in results").toBe(true);
  });

  test("toSources returns short attributed quotes, never full chunk text", () => {
    const chunks = search(QUERIES[0], 6);
    const sources = toSources(chunks, QUERIES[0]);
    expect(sources.length).toBe(chunks.length);
    for (const s of sources) {
      expect(s.quote.split(/\s+/).length).toBeLessThanOrEqual(30);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.attribution.length).toBeGreaterThan(0);
    }
  });

  test("empty / stopword-only query returns nothing", () => {
    expect(search("", 6)).toEqual([]);
    expect(search("the a of to", 6)).toEqual([]);
  });
});
