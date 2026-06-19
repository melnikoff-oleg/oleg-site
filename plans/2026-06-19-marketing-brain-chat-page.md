# Plan: Marketing Brain chat page (`/marketing-brain`)

**Created:** 2026-06-19
**Status:** Approved (decisions recorded 2026-06-19)
**Request:** Build a `/marketing-brain` page with a chat window that answers questions like the terminal `query.py` experience — but visual: showing the synthesized answer, the supporting quotes, and a visual preview of the source (book cover + page, or video thumbnail/embed + timecode) each insight came from.

---

## Overview

### What This Plan Accomplishes

Adds a public, beautifully designed chat interface at `/marketing-brain` where a visitor (or Oleg) asks a marketing question and gets back a synthesized answer grounded in the Marketing Brain corpus — every claim backed by a short quote and a **visual source card** (book cover + page number, or video thumbnail/embedded player + clickable timecode). It is the visual, conversational twin of the terminal `query.py` flow, and a companion to the existing `/marketing-brain-knowledge` gallery.

This requires the site to gain its first backend: a Next.js Route Handler that runs BM25 retrieval over the corpus and calls the Claude API to synthesize a cited answer, streamed to the browser.

### Why This Matters

- **Strategic fit.** It's a live, interactive demonstration of "AI systems for marketing" and Claude Code on Oleg's own landing page — exactly the keywords and positioning the site targets. It's a remarkable, shareable artifact (Godin's "Purple Cow") that doubles as proof-of-skill for YouTube/Authority AI.
- **Lead magnet.** A genuinely useful free tool that keeps visitors on-page and showcases the depth behind the content — a natural top-of-funnel asset.
- **Reuse.** The corpus, manifest, citation machinery, and the `/marketing-brain-knowledge` data/design already exist; this builds the conversational layer on top.

---

## Current State

### Relevant Existing Structure

- `marketing-brain/` — self-contained KB: `books/*.md` (page markers `<!-- page N -->`), `videos/<expert>/NN-*.md` (per-paragraph timecodes `` [`16:21`](url&t=981s) ``), `manifest.json`, `scripts/query.py` (BM25 + citations), `scripts/build-kb.py`.
- `src/app/marketing-brain-knowledge/` — existing gallery page + `data.ts` (generated from `manifest.json`) + `layout.tsx`. Establishes the visual language we extend.
- `public/marketing-brain/book-covers/*.jpg` — book cover images already served by the site.
- `src/app/layout.tsx` — Inter + Unbounded fonts, dark theme. `src/app/globals.css` — black bg.
- `src/app/sitemap.ts`, `src/components/json-ld.tsx`, `src/components/plausible.tsx`.
- `next.config.ts` — only `img.youtube.com` is whitelisted for `next/image` (we use plain `<img>` for thumbnails, as the gallery does, so no change needed).
- `.env` — currently holds `APIFY_KEY`. Site is otherwise **fully static** (all routes prerendered).

### Gaps or Problems Being Addressed

- The brain is only queryable from a terminal (`query.py`). There is no visual, conversational way to use it — and no LLM synthesis layer (the terminal returns raw chunks; it does not compose an answer).
- The site has **no backend** — no API routes, no server-side secrets, no Claude integration. This feature introduces all three.
- BM25 + citation logic lives in Python (`query.py`); the web app is TypeScript. The retrieval needs a TS path (or a Python serverless function) plus a build artifact it can read.

---

## Proposed Changes

### Summary of Changes

- Add `@anthropic-ai/sdk` dependency and `ANTHROPIC_API_KEY` (local `.env` + Vercel env var).
- Add a build script that emits a server-side `chunks.json` (text + citation metadata) from the KB markdown — a faithful TS-friendly port of `query.py`'s chunking and citation extraction.
- Add a TypeScript BM25 retriever that loads `chunks.json` and returns top-K chunks (mirrors `query.py` scoring closely enough for good retrieval).
- Add a streaming Route Handler (`/api/marketing-brain/chat`) that retrieves context, calls Claude to synthesize a cited answer, and streams back both the **sources** (for visual cards) and the **answer text** (with `[n]` citation markers).
- Add the `/marketing-brain` chat page + `layout.tsx` (metadata), premium and on-brand, with source cards (book cover + page, video thumbnail/embed + timecode), citation chips, starter prompts, and streaming UI.
- Cross-link `/marketing-brain` ↔ `/marketing-brain-knowledge`; add `/marketing-brain` to the sitemap.
- Update `CLAUDE.md` (and optionally `context/integrations.md`) to document the new page type, the API route, the build script, and the Anthropic integration.
- Add rate-limiting / abuse protection to the API route (approach pending — see Open Questions).

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `marketing-brain/scripts/build-web-index.py` | Generate `chunks.json` from `books/*.md` + `videos/**/*.md` (chunking + citation metadata), faithful to `query.py`. |
| `src/app/marketing-brain/_data/chunks.json` | Server-side retrieval corpus (chunk text + citation metadata). **Not** under `public/`. Gitignore/visibility per Open Questions. |
| `src/lib/marketing-brain/retriever.ts` | BM25 index built once per process from `chunks.json`; `search(query, k)` returns scored chunks with citations. |
| `src/lib/marketing-brain/types.ts` | Shared types: `Chunk`, `Citation` (book/video), `SourceCard`, chat request/response shapes. |
| `src/app/api/marketing-brain/chat/route.ts` | POST handler: retrieve → build prompt → stream Claude answer + sources. Rate-limited. |
| `src/lib/marketing-brain/prompt.ts` | System-prompt builder: formats numbered sources, sets citation/quote/length/copyright rules. |
| `src/app/marketing-brain/page.tsx` | Chat UI (client component): messages, streaming, source cards, citation chips, composer, starter prompts. |
| `src/app/marketing-brain/layout.tsx` | SEO metadata for the chat page. |
| `src/app/marketing-brain/components/source-card.tsx` | Visual source card: book (cover + page + quote) / video (thumbnail or embed + timecode + quote). |
| `src/app/marketing-brain/components/chat-message.tsx` | Renders a message (assistant markdown + inline `[n]` citation chips). |
| `src/app/marketing-brain/use-brain-chat.ts` | Client hook: POSTs to the route, parses the streamed sources + text protocol, exposes messages/state. |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `package.json` | Add `@anthropic-ai/sdk` (and, if chosen, `react-markdown` + `remark-gfm` for answer rendering). |
| `.env` | Add `ANTHROPIC_API_KEY=…` (local only; never committed — `.env` is currently untracked). |
| `.gitignore` | Add `src/app/marketing-brain/_data/chunks.json` if we keep it out of git (see Open Questions). |
| `src/app/sitemap.ts` | Add `/marketing-brain` entry. |
| `src/app/marketing-brain-knowledge/page.tsx` | Add a prominent link/CTA to `/marketing-brain` ("ask the brain"). |
| `CLAUDE.md` | Document the chat page type, the `/api/marketing-brain/chat` route, `build-web-index.py`, and the Anthropic integration + env var. |
| `context/integrations.md` | (Optional) Add an "Anthropic API" entry (model, env var, where used). |
| `next.config.ts` | Only if we decide to render thumbnails via `next/image` (would need `i.ytimg.com`). Default: no change (plain `<img>`). |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **TypeScript BM25 over a prebuilt `chunks.json`, not a Python serverless function.** Keeps one runtime (Next.js on Vercel), avoids a Python lambda + its cold-start/runtime config. The build script (Python, reusing `query.py`'s proven logic) emits a JSON the TS retriever consumes. Retrieval feeds Claude, so exact BM25 parity with `query.py` isn't required — good ranking is.

2. **Two-layer answer: retrieve (deterministic) → synthesize (Claude).** The terminal returns raw chunks; this composes them into a written answer with `[n]` citations. Retrieval stays code-controlled (cheap, fast, auditable); Claude only writes prose from supplied context. This is a single-LLM-call RAG pattern (per the Claude API guidance: "Q&A → Claude API, one request"), not an agent.

3. **Stream sources first, then text.** The route emits the retrieved source list immediately (so cards render while the answer streams), then streams Claude's text deltas. Claude is instructed to cite `[1]`, `[2]`… mapping to those sources. This mirrors the terminal's numbered results and lets the UI wire citation chips → cards.

4. **Short quotes only; full pages never shipped to the client.** Source cards show a cover/thumbnail + a **short** quote (≤ ~25 words) + the citation (page or timecode). The full chunk text stays server-side. This is the copyright guardrail (the corpus is faithful full text of copyrighted books) and matches fair-use norms. `chunks.json` is server-only (never under `public/`).

5. **Visual previews use existing assets.** Books → committed cover image + page number (we have covers, not page scans). Videos → YouTube thumbnail, plus an **embedded player at the timecode** (`youtube.com/embed/{id}?start={sec}`) and a deep link. Reuses the patterns already in `marketing-brain-knowledge` and the resource pages.

6. **Anthropic SDK directly (not the Vercel AI SDK).** Minimizes new deps, stays close to the documented `client.messages.stream()` pattern, and gives full control over the custom sources+text stream protocol. (AI SDK is a reasonable alternative — see Alternatives.)

7. **Model + thinking.** Default per Claude API guidance is `claude-opus-4-8` with adaptive thinking. But this is a **public, potentially-abused endpoint**, and synthesis-from-context is not a hard reasoning task — so cost/latency favor a smaller model. Recommendation: `claude-sonnet-4-6` (or `claude-haiku-4-5` for cheapest), thinking disabled or low effort, `max_tokens` ~1024, streaming. Final choice is an Open Question (it's Oleg's spend).

8. **Reuse the `/marketing-brain-knowledge` design language** (Unbounded headings, dark theme, framer-motion, white/low-opacity borders, ambient glow) so the two pages feel like one product.

### Alternatives Considered

- **Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) with `useChat`.** Faster chat scaffolding and built-in streaming/data-parts for sources. Rejected as the default to avoid extra abstraction/deps and to keep the streaming protocol explicit; easy to switch to if preferred.
- **Python serverless function calling `query.py` directly.** Reuses the exact retriever, but adds a second runtime, complicates deploy, and still needs an LLM-synthesis layer. Rejected for operational simplicity.
- **Embeddings + vector DB (e.g., Upstash Vector / pgvector).** Higher-quality semantic retrieval, but adds infra, an embedding cost, and a build/sync step. BM25 is already validated (18/18 tests) and zero-infra. Rejected for v1; note as a future upgrade.
- **Agentic RAG (give Claude a `search` tool it calls iteratively).** Closer to the "terminal experience" and higher quality on hard questions, but more tokens/cost/latency and more moving parts on a public endpoint. Rejected for v1; note as a future enhancement.
- **Ship the whole corpus to the client and retrieve in-browser.** Eliminates the backend but publicly exposes full copyrighted book text and the API key problem remains. Rejected (copyright + can't hide the key).

### Resolved Decisions (2026-06-19)

1. **Model & budget.** Use **`claude-sonnet-4-6`** for synthesis. Thinking disabled, `max_tokens` ~1024, streaming.
2. **Abuse / rate-limiting & access.** Chat is **public**, protected by a **limited per-IP daily cap of 30 queries/day**. On hitting the cap, return 429 and the UI shows a friendly notice: *"You've hit today's limit. If you want more, just reach out to me — oleg@buildauthority.ai."* Implementation: a simple per-IP+date counter (in-memory module map keyed by `ip:YYYY-MM-DD`, since this is "limited, for now"). **Caveat:** in-memory state is per serverless instance and resets on cold start, so the real-world cap is approximate, not a hard guarantee — documented in code with a clear upgrade path to Vercel KV / Upstash Redis for a durable cap if abuse appears.
3. **Repo visibility / where `chunks.json` lives (copyright).** Repo is **private** → `chunks.json` is **committed** to `src/app/marketing-brain/_data/chunks.json` (still server-only; never under `public/`). No gitignore needed for it.
4. **Quote length.** Cap quotes at **~25 words / 1–2 sentences**, attributed. Full chunk text stays server-side.
5. **Answer rendering.** Use **`react-markdown` + `remark-gfm`**.

---

## Step-by-Step Tasks

### Step 1: Dependencies, env, and config

Wire up the Anthropic integration and (optionally) markdown rendering.

**Actions:**
- `npm install @anthropic-ai/sdk` (and `react-markdown remark-gfm` if Open Question 5 = markdown).
- Add `ANTHROPIC_API_KEY=…` to local `.env`; add the same to Vercel project env (Production + Preview). Document that it must be set.
- If `chunks.json` is gitignored (Open Question 3), add it to `.gitignore`.
- Confirm rate-limit infra choice (Open Question 2); if Upstash, add `@upstash/ratelimit @upstash/redis` and the two `UPSTASH_*` env vars.

**Files affected:**
- `package.json`, `.env`, `.gitignore`

---

### Step 2: Build the web index (`chunks.json`)

Port `query.py`'s indexing to a build script that emits a JSON the TS retriever can read. Mirror the exact chunking + citation extraction so retrieval quality matches the terminal.

**Actions:**
- Create `marketing-brain/scripts/build-web-index.py`:
  - Books: split on `<!-- page N -->`, drop headings, reflow whitespace, chunk by ~200 words; emit `{id, type:"book", text, title, author, page, slug, cover}` where `cover` = `/marketing-brain/book-covers/<slug>.jpg`.
  - Videos: regex each timecoded paragraph (`` [`(\d+:..)`](url)\s*text ``); emit `{id, type:"video", text, title, expert, videoId, seconds, timecode, url, thumb}` (`thumb` from `manifest.json`).
  - Write to `src/app/marketing-brain/_data/chunks.json`. Optionally also precompute per-chunk token lists / document frequencies to cut TS cold-start (decide during impl).
- Run it; sanity-check counts (~10k chunks, matching `query.py`'s `10194`).
- Document the regenerate step (after KB updates: `build-kb.py` → `build-web-index.py`).

**Files affected:**
- `marketing-brain/scripts/build-web-index.py`, `src/app/marketing-brain/_data/chunks.json`

---

### Step 3: TypeScript BM25 retriever

Recreate `query.py`'s search in TS, built once per process and cached in module scope (so warm Vercel invocations skip the rebuild).

**Actions:**
- Create `src/lib/marketing-brain/types.ts` (`Chunk`, `Citation`, `SourceCard`, request/response types).
- Create `src/lib/marketing-brain/retriever.ts`:
  - Load `chunks.json` (import or `fs.readFile` at first call), tokenize (same stopword list + `[a-z0-9]+` regex as `query.py`), build BM25 stats (idf, avgdl, tf, inverted index), memoize in a module singleton.
  - `search(query, k=6)` → top-K chunks with citation metadata.
  - A `snippet(text, query)` helper to extract a short, query-centered quote (≤ ~25 words) for the card — mirrors `query.py`'s `snippet()`.
- Add a tiny self-check (a few known queries return the expected expert/book) runnable locally.

**Files affected:**
- `src/lib/marketing-brain/retriever.ts`, `src/lib/marketing-brain/types.ts`

---

### Step 4: Streaming chat Route Handler

The backend: retrieve, prompt, stream answer + sources. Protect it.

**Actions:**
- Create `src/lib/marketing-brain/prompt.ts`: builds the system prompt — persona ("the Marketing Brain"), the numbered source list (title/author or expert + the chunk text), and rules: answer concisely in Oleg's lowercase voice; cite sources inline as `[n]`; include short quotes (≤ ~25 words) attributed; **never** reproduce long passages; if nothing relevant retrieved, say so. Optionally append Oleg's context (audience, brand) for tailored answers.
- Create `src/app/api/marketing-brain/chat/route.ts` (`runtime = "nodejs"`):
  - Parse `{ messages }` (chat history). Take the latest user message → `search()` top-K.
  - Enforce rate limit (Open Question 2). On limit, return 429 with a friendly message.
  - Return a streamed `Response` (SSE or newline-delimited JSON): first frame = `{ type:"sources", sources:[…] }` (citation cards built from retrieved chunks: cover/thumb, title, author/expert, page or timecode+url, short quote); subsequent frames = `{ type:"delta", text }` from `client.messages.stream(...)`; final `{ type:"done" }`.
  - Model/params per Open Question 1 (default `claude-sonnet-4-6`, thinking disabled or low effort, `max_tokens` ~1024, streaming). Handle `stop_reason: "refusal"` and API errors with typed exceptions; surface a graceful error frame.
- Keep `ANTHROPIC_API_KEY` server-only (never exposed to the client).

**Files affected:**
- `src/app/api/marketing-brain/chat/route.ts`, `src/lib/marketing-brain/prompt.ts`

---

### Step 5: Client chat hook + streaming protocol

A small hook that drives the conversation and parses the stream.

**Actions:**
- Create `src/app/marketing-brain/use-brain-chat.ts`:
  - State: `messages` (each: role, text, `sources[]`, streaming flag), `input`, `isStreaming`, `error`.
  - `send()`: optimistic-append the user message, POST history to `/api/marketing-brain/chat`, read the stream, attach `sources` to the pending assistant message, append `delta` text as it arrives, finalize on `done`.
  - Handle 429 / errors gracefully (inline assistant error bubble).

**Files affected:**
- `src/app/marketing-brain/use-brain-chat.ts`

---

### Step 6: Source card + message components

The visual heart of the feature.

**Actions:**
- `source-card.tsx`:
  - **Book:** cover image (from `/marketing-brain/book-covers/...`), title + author, `p. NN` badge, the short quote, link to the book in `/marketing-brain-knowledge`. Premium card (border, hover lift) matching the gallery.
  - **Video:** thumbnail with play affordance + timecode badge; clicking expands an inline `youtube.com/embed/{id}?start={sec}` player (or opens the deep link in a new tab); channel/expert + the short quote.
- `chat-message.tsx`:
  - Assistant: render markdown (react-markdown or minimal) with inline `[n]` rendered as small citation chips that scroll to / highlight the matching source card. User: simple bubble.
  - A "thinking…/searching the brain…" shimmer while `isStreaming` and before first delta.

**Files affected:**
- `src/app/marketing-brain/components/source-card.tsx`, `src/app/marketing-brain/components/chat-message.tsx`

---

### Step 7: The `/marketing-brain` page + metadata

Assemble the premium chat experience.

**Actions:**
- `page.tsx` (client): header (wordmark → `/`, link to `/marketing-brain-knowledge`), hero (title "the marketing brain", one-line subtitle), starter prompt chips (e.g. "how do I make an irresistible offer?", "outbound or content?", "youtube thumbnail tips"), the message list (assistant answers + source-card grids under each), and a sticky composer (textarea + send, Enter to send). Empty state explains what it is and that every answer is cited. Reuse fonts/colors/motion/ambient glow from the gallery.
- `layout.tsx`: SEO metadata (title/description/keywords around "ask the marketing greats", "AI marketing assistant", "Claude Code"), canonical `https://oleg.ae/marketing-brain`, OG/Twitter. Optionally add `WebApplication`/`FAQPage` JSON-LD.

**Files affected:**
- `src/app/marketing-brain/page.tsx`, `src/app/marketing-brain/layout.tsx`

---

### Step 8: Cross-linking, sitemap, and docs

Integrate the page into the site and keep docs current.

**Actions:**
- Add `/marketing-brain` to `src/app/sitemap.ts`.
- Add an "ask the brain" CTA on `/marketing-brain-knowledge` linking to `/marketing-brain` (and a "browse the sources" link back).
- Update `CLAUDE.md`: document the chat page type, the `/api/marketing-brain/chat` route, `build-web-index.py`, the Anthropic integration + `ANTHROPIC_API_KEY`, and that the site now has serverless functions (no longer fully static).
- (Optional) Add an "Anthropic API" entry to `context/integrations.md`.

**Files affected:**
- `src/app/sitemap.ts`, `src/app/marketing-brain-knowledge/page.tsx`, `CLAUDE.md`, `context/integrations.md`

---

### Step 9: Validation

Verify retrieval quality, streaming, citations, cost controls, and design.

**Actions:**
- `npm run build` passes; the new route builds as a serverless function.
- Local `npm run dev` + a real `ANTHROPIC_API_KEY`: ask 4–5 questions (incl. the two already tested: "irresistible offer", "outbound vs content"); confirm answers are grounded, citations `[n]` map to correct cards, book pages/video timecodes are right, and the embed opens at the cited second.
- Confirm `chunks.json` is **not** reachable under `/` (server-only) and the API key never reaches the client.
- Exercise the rate limit (429 path) and an error path (e.g., bad key) → graceful UI.
- Mobile layout: cards, embeds, composer all usable; matches site polish.
- Lighthouse pass on the page shell.

**Files affected:**
- none (verification)

---

## Connections & Dependencies

### Files That Reference This Area

- `marketing-brain/manifest.json` and the KB markdown drive `build-web-index.py` (and already drive `marketing-brain-knowledge/data.ts`).
- `public/marketing-brain/book-covers/*` are reused by book source cards.
- `src/app/marketing-brain-knowledge/*` shares the design language and links to/from the chat page.

### Updates Needed for Consistency

- `CLAUDE.md` site-structure + commands sections (new page type, route, script, env, "site now has a backend").
- `sitemap.ts` (+ optional JSON-LD).
- `context/integrations.md` (optional Anthropic entry).
- Regenerate flow: after any KB change, run `build-kb.py` then `build-web-index.py` so the chat corpus stays in sync (document alongside the existing regenerate steps).

### Impact on Existing Workflows

- **The site stops being fully static** — Vercel will deploy a serverless function for `/api/marketing-brain/chat`. Requires `ANTHROPIC_API_KEY` (and any rate-limit env vars) in Vercel. Static pages are unaffected.
- New ongoing cost: Claude API usage per answer (mitigated by model choice + rate limiting + short `max_tokens`).
- The `/scrape-video` and existing build commands are unchanged.

---

## Validation Checklist

- [ ] `@anthropic-ai/sdk` installed; `ANTHROPIC_API_KEY` set locally and in Vercel.
- [ ] `build-web-index.py` produces `chunks.json` with ~10k chunks and correct citation metadata (pages, timecodes, covers, thumbs).
- [ ] TS retriever returns sensible top-K for known queries (matches `query.py` intent).
- [ ] `/api/marketing-brain/chat` streams sources first, then answer text; cites `[n]`; handles refusal/errors/429.
- [ ] `chunks.json` is server-only (not fetchable under `/`); API key never reaches the client.
- [ ] Chat page renders answers with citation chips wired to visual source cards (book cover+page, video thumb/embed+timecode).
- [ ] Quotes are short (≤ ~25 words) and attributed; no long verbatim passages.
- [ ] Rate limiting works; cost controls (model, `max_tokens`) in place.
- [ ] `npm run build` passes; route deploys as a function on Vercel.
- [ ] `/marketing-brain` in sitemap; cross-links with `/marketing-brain-knowledge` both ways.
- [ ] `CLAUDE.md` updated (page type, route, script, env, backend note).
- [ ] Mobile + Lighthouse acceptable; design matches the gallery.

---

## Success Criteria

1. A visitor can ask a marketing question at `/marketing-brain` and receive a streamed, synthesized answer in Oleg's voice, grounded in the corpus.
2. Every answer shows visual source cards — book cover + page number (with a short quote), or video thumbnail/embedded player + clickable timecode (with a short quote) — and inline `[n]` citations link to them.
3. The experience is clearly the visual twin of the terminal `query.py` flow, but premium and on-brand, and links cleanly to/from `/marketing-brain-knowledge`.
4. The endpoint is cost-controlled and abuse-protected; secrets and full corpus text stay server-side; the build deploys cleanly on Vercel.

---

## Notes

- **Future enhancements:** agentic RAG (give Claude a `search` tool to iterate like the terminal); embeddings/vector retrieval for semantic recall; conversation memory/sharing; "expert filter" (ask only Hormozi, etc.); per-answer "open in knowledge base" deep links; prompt-cache the system+sources prefix to cut cost on follow-ups.
- **Cost lever:** retrieval is free and deterministic; only the synthesis call costs money. Short `max_tokens`, a smaller model, and rate limiting keep per-answer cost low. Prompt caching can further cut cost if traffic is steady.
- **Copyright is the load-bearing constraint** — keep the full corpus server-side, ship only short attributed quotes + covers/thumbnails, and confirm repo visibility before committing any full-text artifact (Open Question 3).
- Resolve the five Open Questions before `/implement` — model/cost, rate-limiting/access, repo visibility, quote length, and answer rendering all change implementation specifics.
