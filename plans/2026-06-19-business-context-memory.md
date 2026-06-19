# Plan: Business-context memory for the Marketing Brain chat

**Created:** 2026-06-19
**Status:** Approved (decisions recorded 2026-06-19)
**Request:** Let the `/marketing-brain` chat know my business so its advice is personalized — add context via a website link (scraped with Firecrawl) and file/text uploads, stored as a local "memory" that's injected into the chat and can be updated from the conversation. Local-only MVP, no database.

---

## Overview

### What This Plan Accomplishes

Adds a **business-context memory** to the Marketing Brain chat. You provide context once — paste text, upload files (PDF/text/markdown), or drop in your website URL (auto-scraped + distilled with Firecrawl + Claude) — and it's saved to a local file that gets injected into every chat answer. The result: advice tailored to *your* business (Authority AI, YouTube, your offers, your ICP) instead of generic marketing theory. Memory can also grow during conversations.

### Why This Matters

Generic marketing advice is cheap; personalized advice is the value. Today the chat answers from the corpus alone — it has no idea who's asking. Teaching it your situation turns "here's how offers work" into "here's how *your* $900/mo Authority AI offer could be reframed for B2B founders." It's also a sharp demonstration of "AI systems for marketing" — a personalized AI advisor grounded in the greats — strengthening the flagship asset on the site.

---

## Current State

### Relevant Existing Structure

- **Chat route** `src/app/api/marketing-brain/chat/route.ts` (Node runtime): rate-limit → BM25 retrieve → `buildSystemPrompt(chunks)` → stream Claude (`claude-sonnet-4-6`) sources-then-text (NDJSON).
- **Prompt** `src/lib/marketing-brain/prompt.ts`: `buildSystemPrompt(chunks)` — currently "answer ONLY from these sources."
- **Chat UI** `src/app/marketing-brain/page.tsx` + `use-brain-chat.ts` + `components/`.
- **Retriever / types / rate-limit** in `src/lib/marketing-brain/`.
- **Env** (`.env`): `ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY` (already present), `APIFY_KEY`. `@anthropic-ai/sdk` already installed.
- Patterns: API routes are Node-runtime Route Handlers; `.env` holds secrets; the site reads server-only files via `fs` (e.g., `chunks.json`).

### Gaps or Problems Being Addressed

- The chat has **no knowledge of the user's business** — every answer is generic.
- There's **no way to feed it context** (no website scrape, no file upload, no persistent notes).
- There's **no memory** that persists across questions or grows as the user shares more.

---

## Proposed Changes

### Summary of Changes

- Add a **local memory store**: a single gitignored markdown file the server reads/writes via `fs` (single-user, no DB).
- Add **memory API routes**: read/save the memory; scrape a URL via Firecrawl + distill with Claude; upload a file (PDF/text/md) → extract (+distill) → append.
- **Inject the memory** into the chat system prompt so answers are personalized (corpus still cited; business context used for tailoring).
- Add a **"Your business context" drawer** on `/marketing-brain`: edit/paste memory, scrape a website, upload files, with a clear "personalized: on" indicator.
- **Conversational memory growth** (recommended, optional): after each turn, a cheap Claude (Haiku) pass extracts any durable business fact from the user's message and appends it, with an unobtrusive "added to your context" + undo. (See Open Questions.)
- Add `unpdf` dependency for PDF text extraction; Firecrawl via `fetch` (no SDK dep).
- Docs: update `CLAUDE.md` and `context/`.

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `src/lib/marketing-brain/memory.ts` | Read/write the local memory file (`fs`); `getMemory()`, `setMemory()`, `appendMemory(section)`; path + size guard. |
| `src/lib/marketing-brain/firecrawl.ts` | `scrapeUrl(url)` → page markdown via Firecrawl `/v1/scrape` (fetch + `FIRECRAWL_API_KEY`). |
| `src/lib/marketing-brain/distill.ts` | `distillBusinessProfile(rawText, sourceLabel)` → concise profile via Claude (who they are, offers, ICP, proof, voice). Shared by scrape + large files. |
| `src/app/api/marketing-brain/memory/route.ts` | `GET` (read memory), `PUT` (save full memory text). |
| `src/app/api/marketing-brain/memory/scrape/route.ts` | `POST {url}` → Firecrawl scrape → distill → append to memory; returns the added section. |
| `src/app/api/marketing-brain/memory/upload/route.ts` | `POST` file (multipart) → extract text (PDF via `unpdf`; txt/md direct) → distill if large → append; returns the added section. |
| `src/app/api/marketing-brain/memory/extract/route.ts` | (Optional, conversational growth) `POST {message}` → Haiku extracts a durable business fact (or none) → append; returns what was added. |
| `src/app/marketing-brain/components/context-drawer.tsx` | The "Your business context" slide-over: textarea editor + Save, website scrape input, file upload, status. |
| `src/app/marketing-brain/use-memory.ts` | Client hook: load/save memory, scrape, upload, (optional) extract; exposes `hasContext`. |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `src/lib/marketing-brain/prompt.ts` | `buildSystemPrompt(chunks, businessContext?)` — prepend an "ABOUT THE USER'S BUSINESS" block and add personalization rules (use it to tailor; still cite the corpus for marketing claims; business context is the user's own info, not a citable source). |
| `src/app/api/marketing-brain/chat/route.ts` | Read `getMemory()` and pass it to `buildSystemPrompt`. |
| `src/app/marketing-brain/page.tsx` | Add a header "your context" button (with an "on" dot when memory exists) that opens the drawer; gentle nudge in the empty state ("add your business context for personalized answers"). |
| `package.json` | Add `unpdf` (PDF text extraction). |
| `.gitignore` | Ignore the memory store (`marketing-brain-memory/`) — personal business data, local-only. |
| `next.config.ts` | (If needed) raise body size limit for the upload route, or document the limit. |
| `CLAUDE.md` | Document the memory feature, routes, storage, env, and that it's local-only (won't persist on Vercel). |
| `context/business-info.md` | Note the personalized-advisor capability on the Marketing Brain. |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Single local markdown file as the memory.** `marketing-brain-memory/business-context.md`, read/written via `fs` from Node-runtime routes. No DB, single global memory (one user) — exactly the "simple, local, MVP" ask. Freeform markdown the user can fully edit; scrape/upload operations append clearly-delimited `##` sections.
2. **Inject memory via the system prompt.** A stable "ABOUT THE USER'S BUSINESS" block prepended in `buildSystemPrompt`. The corpus is still the citable source of marketing principles; the business context is the lens for personalization. Keeps the existing retrieval/streaming flow intact.
3. **Distill before storing (for scrape + large files).** Raw site dumps/PDFs are noisy and token-heavy. A Claude pass turns them into a tight profile (offers, ICP, positioning, proof, voice). Pasted text and small files are stored as-is (user controls them). Keeps the injected context high-signal and cheap.
4. **Firecrawl via `fetch`, PDF via `unpdf`.** One Firecrawl endpoint (`/v1/scrape`, `formats: ["markdown"]`) doesn't need an SDK. `unpdf` is a dependency-light, serverless-friendly PDF text extractor (no native binaries) — good locally and if this ever moves server-side.
5. **MVP scope = website + files/text only.** Per the request, drop LinkedIn/Instagram/YouTube scraping. A website URL + file/paste uploads cover the need with far less complexity (social scraping needs per-platform auth/actors).
6. **Drawer UI, not a separate page.** A slide-over on `/marketing-brain` keeps setup one click from the chat and signals "this personalizes your answers." An "on" indicator builds trust that context is active.
7. **Local-only, explicitly.** Memory lives on disk and is gitignored; it will not persist on Vercel's ephemeral filesystem. That's acceptable per the request (prototype to feel the value); a durable store (SQLite/Vercel KV/Blob) is the obvious later upgrade.

### Alternatives Considered

- **Memory as a Claude tool (`update_memory`) in an agentic loop.** Most elegant for conversational growth, but turns the single-shot stream into a tool loop — more complexity than an MVP needs. Deferred; the post-turn extractor gets ~80% of the magic with ~20% of the work.
- **Retrieve over memory (embed/BM25 the context too).** Overkill — the memory is small enough to inject wholesale. Revisit only if context grows large.
- **Vector DB / SQLite now.** Contradicts "local, simple, no DB." A flat file is enough to validate the idea.
- **Store raw scrapes/files verbatim.** Cheaper to build but bloats the prompt and dilutes signal; distillation is worth the one extra call.
- **Social scraping (LinkedIn/IG/YT).** The user themselves narrowed scope to website + files. Excluded.

### Resolved Decisions (2026-06-19)

1. **Conversational memory growth = automatic.** A post-turn extractor runs after each user message, appends durable business facts to memory, and shows an unobtrusive "added to your context · undo" note. A toggle (persisted in `localStorage`, default on) lets the user turn it off.
2. **Model = `claude-sonnet-4-6` for everything** — chat answers, scrape/file distillation, and conversational extraction all use Sonnet 4.6 (thinking disabled + small `max_tokens` for the distill/extract helpers to keep them cheap and fast).
3. **Uploads = PDF + txt/md.** PDF text extraction via `unpdf`; txt/md decoded directly.

---

## Step-by-Step Tasks

### Step 1: Dependencies, env, gitignore

**Actions:**
- `npm install unpdf` (PDF text extraction). Firecrawl uses `fetch` (no dep).
- Confirm `FIRECRAWL_API_KEY` and `ANTHROPIC_API_KEY` in `.env` (both present).
- Add `marketing-brain-memory/` to `.gitignore` (personal, local-only).

**Files affected:** `package.json`, `.gitignore`

---

### Step 2: Memory store helper

Create the single source of truth for the local memory file.

**Actions:**
- `src/lib/marketing-brain/memory.ts`:
  - Path: `path.join(process.cwd(), "marketing-brain-memory/business-context.md")`.
  - `getMemory(): string` — read file (empty string if missing).
  - `setMemory(text: string)` — `mkdir -p` + write (full overwrite from the editor).
  - `appendMemory(heading: string, body: string)` — append a `\n\n## {heading} — {date}\n\n{body}` section.
  - A soft size guard/const (`MAX_CONTEXT_CHARS`) used by the chat route to warn/trim if the memory gets very large.

**Files affected:** `src/lib/marketing-brain/memory.ts`

---

### Step 3: Firecrawl + distillation helpers

**Actions:**
- `src/lib/marketing-brain/firecrawl.ts`: `scrapeUrl(url)` → `POST https://api.firecrawl.dev/v1/scrape` with `{ url, formats: ["markdown"], onlyMainContent: true }` and `Authorization: Bearer ${FIRECRAWL_API_KEY}`; return `data.markdown`. Validate the URL; surface a clear error if the key is missing or the scrape fails.
- `src/lib/marketing-brain/distill.ts`: `distillBusinessProfile(raw, sourceLabel)` → Claude (model per Open Q2) with a prompt that extracts a concise profile: what the business does, offers/pricing, ICP/audience, positioning/voice, proof, links. Returns clean markdown. Cap input (truncate very long scrapes before distilling).

**Files affected:** `src/lib/marketing-brain/firecrawl.ts`, `src/lib/marketing-brain/distill.ts`

---

### Step 4: Memory API routes

**Actions:**
- `memory/route.ts`: `GET` → `{ text }`; `PUT {text}` → `setMemory`, return ok. Node runtime.
- `memory/scrape/route.ts`: `POST {url}` → `scrapeUrl` → `distillBusinessProfile` → `appendMemory("From {hostname}", profile)` → return `{ added }`. Guard missing key/invalid URL.
- `memory/upload/route.ts`: `POST` multipart file → by type: PDF → `unpdf` extract; txt/md → decode. If large, distill; else store as-is. `appendMemory("From file: {name}", text)` → return `{ added }`. Enforce a max file size.
- (Optional, Open Q1) `memory/extract/route.ts`: `POST {message}` → Haiku decides if there's a durable business fact → if so `appendMemory("Note", fact)` and return `{ added }`, else `{ added: null }`.

**Files affected:** the four route files above.

---

### Step 5: Inject memory into the chat

**Actions:**
- `prompt.ts`: change signature to `buildSystemPrompt(chunks, businessContext?: string)`. When present, prepend:
  > `ABOUT THE USER'S BUSINESS (use this to personalize every answer — tailor examples, offers, and recommendations to their actual situation; this is the user's own context, not a citable source):\n{businessContext}`
  Add a rule: *prefer specific, tailored advice grounded in this context; still cite the corpus [n] for marketing principles.* Keep the existing source-citation rules.
- `chat/route.ts`: `const businessContext = getMemory();` → pass to `buildSystemPrompt(chunks, businessContext)`.

**Files affected:** `src/lib/marketing-brain/prompt.ts`, `src/app/api/marketing-brain/chat/route.ts`

---

### Step 6: Memory client hook

**Actions:**
- `src/app/marketing-brain/use-memory.ts`: `text`, `setText`, `load()`, `save()`, `scrape(url)`, `upload(file)`, optional `maybeExtract(message)`, `isWorking`, `hasContext` (non-empty). Scrape/upload append server-side and return the added section; the hook refreshes `text`.

**Files affected:** `src/app/marketing-brain/use-memory.ts`

---

### Step 7: Context drawer UI

**Actions:**
- `src/app/marketing-brain/components/context-drawer.tsx`: a right-side slide-over (framer-motion), on-brand (dark, Unbounded heading). Sections:
  - **Website** — URL input + "scrape" button → appends distilled profile (spinner; success appends to the editor).
  - **Files** — file input (PDF/txt/md, multi) → extracts/distills → appends.
  - **Context** — big textarea bound to `text` + **Save**; helper copy: "this is what the brain knows about your business."
  - Close button; subtle "personalized: on" state.
- `page.tsx`: header "your context" button (with an "on" dot when `hasContext`), opens the drawer; empty-state nudge linking to it.

**Files affected:** `src/app/marketing-brain/components/context-drawer.tsx`, `src/app/marketing-brain/page.tsx`

---

### Step 8: Conversational growth (optional — per Open Q1)

**Actions:**
- If auto: in `use-brain-chat.ts`, after an answer completes, call `maybeExtract(lastUserMessage)`; if it returns an added fact, show an unobtrusive "added to your context · undo" toast (undo = remove that line + save). Provide a toggle (persisted in `localStorage`).
- If explicit: add a small "remember this" affordance (e.g., on the user's own messages, or a one-line quick-add in the drawer) that appends to memory.

**Files affected:** `src/app/marketing-brain/use-brain-chat.ts`, drawer/page, (optional) `memory/extract/route.ts`

---

### Step 9: Docs

**Actions:**
- `CLAUDE.md`: under the Marketing Brain backend, document the memory store (path, gitignored, local-only — not persistent on Vercel), the `memory` routes, Firecrawl + `unpdf`, and that the chat injects business context.
- `context/business-info.md`: note the Marketing Brain can now give personalized advice from saved business context.

**Files affected:** `CLAUDE.md`, `context/business-info.md`

---

### Step 10: Validation

**Actions:**
- `npm run build` passes; routes build as functions.
- Local `npm run dev`: scrape `https://buildauthority.ai` → a sensible distilled profile appends; edit + Save persists (file written under `marketing-brain-memory/`).
- Upload a `.txt` and a `.pdf` → text extracted and appended.
- Ask a question that should be personalized (e.g., "how should I price my offer?") → the answer references the actual business (Authority AI, $900/mo, B2B founders) AND still cites the corpus `[n]`.
- (If auto memory) share a fact mid-chat ("we're launching a $99 Skool community") → it's captured to memory; undo works.
- Confirm `marketing-brain-memory/` is gitignored and never committed; memory stays server-side (not exposed to the client beyond the editor).

**Files affected:** none (verification)

---

## Connections & Dependencies

### Files That Reference This Area

- `src/app/api/marketing-brain/chat/route.ts` and `prompt.ts` (memory injection).
- `src/app/marketing-brain/page.tsx` (drawer entry point), `use-brain-chat.ts` (optional auto-extract).

### Updates Needed for Consistency

- `CLAUDE.md` (memory feature + routes + env + local-only caveat).
- `context/business-info.md` (personalized-advisor capability).
- `.gitignore` (memory folder).

### Impact on Existing Workflows

- Chat answers change from generic to personalized once context exists; with no context, behavior is unchanged (block omitted).
- New ongoing cost: one distill call per scrape/upload, plus (if auto) one cheap Haiku call per turn. Chat answer cost unchanged except a slightly larger prompt.
- **Local-only:** memory writes won't persist on Vercel's ephemeral fs — fine for the prototype; flagged for the future durable-store upgrade.

---

## Validation Checklist

- [ ] `unpdf` installed; `FIRECRAWL_API_KEY` + `ANTHROPIC_API_KEY` present; `marketing-brain-memory/` gitignored.
- [ ] Memory read/save works (`GET`/`PUT`), file written under `marketing-brain-memory/`.
- [ ] Website scrape (Firecrawl) → distilled profile appended; clear errors on bad URL / missing key.
- [ ] File upload (PDF via `unpdf`, txt/md direct) → text extracted/distilled/appended.
- [ ] Chat injects business context; personalized answers still cite the corpus `[n]`; no-context behavior unchanged.
- [ ] Context drawer: edit/save, scrape, upload all work; "personalized: on" indicator correct.
- [ ] (If chosen) conversational capture works with undo + toggle.
- [ ] Memory never reaches the client except via the editor; nothing committed to git.
- [ ] `npm run build` passes.
- [ ] `CLAUDE.md` + `context/` updated.

---

## Success Criteria

1. The user can add business context three ways — paste/edit text, upload files (PDF/text/md), and scrape a website URL — saved to a local memory file.
2. Chat answers are visibly personalized to the business while still grounded in and citing the corpus.
3. Context persists across questions locally, and (if enabled) grows from the conversation, with the user able to review/edit/undo everything.
4. The whole thing is simple and local — no database — and clearly documented as a prototype.

---

## Notes

- **Future upgrades:** durable storage (SQLite / Vercel KV / Blob) for multi-device + Vercel persistence; the memory tool (`update_memory`) for true agentic memory; multi-page site crawl (Firecrawl `/crawl`) instead of single-page scrape; social profiles (LinkedIn/IG/YT) via dedicated scrapers; multiple named "profiles" (e.g., Authority AI vs YouTube) selectable per question; embedding/retrieval over memory if it grows large.
- **Privacy:** the memory holds personal business data — keep it gitignored and server-only; never log it.
- **Prompt caching:** business context lives in the system prefix; editing it invalidates the cache (acceptable — it changes rarely).
- Resolve the three Open Questions before `/implement` — the conversational-growth mechanism especially changes Step 8 and whether `memory/extract` is built.
