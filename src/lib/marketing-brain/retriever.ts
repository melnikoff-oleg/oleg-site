// BM25 retrieval over the Marketing Brain corpus.
//
// Faithful TypeScript port of marketing-brain/scripts/query.py: same stopword
// list, tokenizer, BM25 params, and snippet extraction. The index is built once
// per process and cached in module scope, so warm serverless invocations are fast.
//
// chunks.json is read from disk (not statically imported) to keep TypeScript from
// inferring a ~9MB literal type. next.config.ts adds it to outputFileTracingIncludes
// so it ships with the /api/marketing-brain/chat function on Vercel.

import fs from "fs";
import path from "path";
import type { Chunk, Source } from "./types";

const STOP = new Set(
  ("a an the of to in is it for and or but on with as at by from this that " +
    "you your i we they he she them his her our my me do does so if then than " +
    "be been being are was were will would can could should how what why when " +
    "who which there here not no yes get got just like very really about into " +
    "out up down over under more most some any all one two")
    .split(" "),
);

function tok(s: string): string[] {
  const out: string[] = [];
  const matches = s.toLowerCase().match(/[a-z0-9]+/g);
  if (!matches) return out;
  for (const w of matches) {
    if (w.length > 1 && !STOP.has(w)) out.push(w);
  }
  return out;
}

// Fold each chunk's identity (book: title + author; video: title + expert) into
// the searchable text so a source is matchable by its name and creator
// (e.g. "Influence" / "Cialdini"), not only by body prose.
function indexText(chunk: Chunk): string {
  if (chunk.type === "book") {
    return `${chunk.title} ${chunk.author} ${chunk.text}`;
  }
  return `${chunk.title} ${chunk.expert} ${chunk.text}`;
}

// Unique source key: collapse near-duplicate chunks from the same book/video.
function sourceKey(chunk: Chunk): string {
  return chunk.type === "book" ? chunk.slug : chunk.videoId;
}

// Quality weight applied to a chunk's BM25 score. A book is years of distilled,
// edited thinking; a video is a single talk. So books get a modest ranking
// bonus, enough to surface a relevant book over a tangential clip, but small
// enough that a clearly on-topic video still wins (and topics with no relevant
// book stay video-led). Structured per type so it's easy to tune per source later.
const BOOK_WEIGHT = 1.25;
function qualityWeight(chunk: Chunk): number {
  return chunk.type === "book" ? BOOK_WEIGHT : 1.0;
}

type Indexed = {
  chunk: Chunk;
  tokens: string[];
  tf: Map<string, number>;
};

type Index = {
  docs: Indexed[];
  idf: Map<string, number>;
  avgdl: number;
  inv: Map<string, number[]>; // term -> doc indices
};

let cached: Index | null = null;

function load(): Index {
  if (cached) return cached;

  const file = path.join(
    process.cwd(),
    "src/app/marketing-brain/_data/chunks.json",
  );
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { chunks: Chunk[] };
  const chunks = raw.chunks;

  const docs: Indexed[] = [];
  const df = new Map<string, number>();
  const inv = new Map<string, number[]>();
  let totalLen = 0;

  chunks.forEach((chunk, i) => {
    const tokens = tok(indexText(chunk));
    const tf = new Map<string, number>();
    for (const w of tokens) tf.set(w, (tf.get(w) ?? 0) + 1);
    docs.push({ chunk, tokens, tf });
    totalLen += tokens.length;
    for (const w of tf.keys()) {
      df.set(w, (df.get(w) ?? 0) + 1);
      const list = inv.get(w);
      if (list) list.push(i);
      else inv.set(w, [i]);
    }
  });

  const N = docs.length;
  const idf = new Map<string, number>();
  for (const [w, d] of df) {
    idf.set(w, Math.log(1 + (N - d + 0.5) / (d + 0.5)));
  }

  cached = { docs, idf, avgdl: totalLen / Math.max(N, 1), inv };
  return cached;
}

const K1 = 1.5;
const B = 0.75;
// Max chunks taken from any single source (book slug / video id) per query, so
// near-duplicate same-source chunks can't crowd out other relevant material.
const PER_SOURCE = 2;

export function search(query: string, k = 6): Chunk[] {
  const idx = load();
  const qt = tok(query);
  if (qt.length === 0) return [];

  const cand = new Set<number>();
  for (const w of qt) {
    const list = idx.inv.get(w);
    if (list) for (const i of list) cand.add(i);
  }

  const scored: Array<{ score: number; i: number }> = [];
  for (const i of cand) {
    const doc = idx.docs[i];
    const dl = doc.tokens.length || 1;
    let s = 0;
    for (const w of qt) {
      const f = doc.tf.get(w);
      if (f) {
        const idfw = idx.idf.get(w) ?? 0;
        s += (idfw * (f * (K1 + 1))) / (f + K1 * (1 - B + (B * dl) / idx.avgdl));
      }
    }
    if (s > 0) scored.push({ score: s * qualityWeight(doc.chunk), i });
  }

  scored.sort((a, b) => b.score - a.score);

  // Take the top `k` by score, but allow at most PER_SOURCE chunks per source so
  // one talk (or videos generally) can't monopolize every slot and the relevant
  // book can surface.
  const out: Chunk[] = [];
  const perKey = new Map<string, number>();
  for (const { i } of scored) {
    const chunk = idx.docs[i].chunk;
    const key = sourceKey(chunk);
    const used = perKey.get(key) ?? 0;
    if (used >= PER_SOURCE) continue;
    perKey.set(key, used + 1);
    out.push(chunk);
    if (out.length >= k) break;
  }
  return out;
}

// Extract a short, query-centered quote (<= `width` words); mirrors query.py snippet().
function snippet(text: string, query: string, width = 24): string {
  const qt = new Set(tok(query));
  const words = text.split(/\s+/);
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  let best = -1;
  let bi = 0;
  for (let i = 0; i < words.length; i++) {
    if (qt.has(norm(words[i]))) {
      let win = 0;
      for (let j = i; j < Math.min(i + width, words.length); j++) {
        if (qt.has(norm(words[j]))) win++;
      }
      if (win > best) {
        best = win;
        bi = i;
      }
    }
  }
  const start = Math.max(0, bi - 6);
  const slice = words.slice(start, start + width).join(" ");
  return (start > 0 ? "…" : "") + slice + (start + width < words.length ? "…" : "");
}

// Turn retrieved chunks into client-facing Source cards (with short quotes).
export function toSources(chunks: Chunk[], query: string): Source[] {
  return chunks.map((c, idx) => {
    const n = idx + 1;
    const quote = snippet(c.text, query);
    if (c.type === "book") {
      return {
        n,
        type: "book",
        title: c.title,
        attribution: c.author,
        quote,
        page: c.page,
        cover: c.cover,
      };
    }
    return {
      n,
      type: "video",
      title: c.title,
      attribution: c.channel ? `${c.expert} · ${c.channel}` : c.expert,
      quote,
      videoId: c.videoId,
      timecode: c.timecode,
      seconds: c.seconds,
      url: c.url,
      thumb: c.thumb,
    };
  });
}
