# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is the workspace for **Oleg Melnikov's personal landing page** — a one-pager website that quickly communicates who Oleg is to the public world: his story, expertise, what he offers, and how to connect.

**Oleg** is an AI software entrepreneur with 5 years in AI. Former big tech (Yandex, JetBrains) and hedge fund (Amsterdam). Now runs Boldane (boldane.com — premium personal branding that helps founders with real expertise become known and trusted; $2K/mo) and a growing YouTube channel (18K+ subs, AI for marketing tutorials). Core idea: bridging media and software so people with real stories become known. Not positioned as "an AI tool" or "fully automated"; AI is a capability under the hood, not the pitch.

**This file (CLAUDE.md) is the foundation.** It is automatically loaded at the start of every session. Keep it current — it is the single source of truth for how Claude should understand and operate within this workspace.

---

## The Claude-User Relationship

Claude operates as an **agent assistant** with access to the workspace folders, context files, commands, and outputs. The relationship is:

- **User**: Defines goals, provides context about their role/function, and directs work through commands
- **Claude**: Reads context, understands the user's objectives, executes commands, produces outputs, and maintains workspace consistency

Claude should always orient itself through `/prime` at session start, then act with full awareness of who the user is, what they're trying to achieve, and how this workspace supports that.

---

## Workspace Structure

```
.
├── CLAUDE.md              # This file — core context, always loaded
├── .claude/
│   └── commands/          # Slash commands Claude can execute
│       ├── prime.md       # /prime — session initialization
│       ├── create-plan.md  # /create-plan — create implementation plans
│       ├── implement.md   # /implement — execute plans
│       └── scrape-video.md # /scrape-video — YouTube URL → full MD file
├── context/               # Background context about the user and project
│                          # (User should populate with role, goals, strategies)
├── plans/                 # Implementation plans created by /create-plan
├── outputs/               # Work products and deliverables
├── reference/             # Templates, examples, reusable patterns
└── scripts/               # Automation scripts (if applicable)
```

**Key directories:**

| Directory    | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `context/`   | Who the user is, their role, current priorities, strategies. Read by `/prime`.      |
| `plans/`     | Detailed implementation plans. Created by `/create-plan`, executed by `/implement`. |
| `outputs/`   | Deliverables, analyses, reports, and work products.                                 |
| `reference/` | Helpful docs, templates and patterns to assist in various workflows.                |
| `scripts/`   | Any automation or tooling scripts.                                                  |

---

## Commands

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run this at the start of every session. Claude will:

1. Read CLAUDE.md and context files
2. Summarize understanding of the user, workspace, and goals
3. Confirm readiness to assist

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use when adding new functionality, commands, scripts, or making structural changes. Produces a thorough plan document in `plans/` that captures context, rationale, and step-by-step tasks.

Example: `/create-plan add a competitor analysis command`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step in order, validates the work, and updates the plan status.

Example: `/implement plans/2026-01-28-competitor-analysis-command.md`

### /scrape-video [youtube-url]

**Purpose:** Scrape a YouTube video's metadata and transcript, then save as a clean markdown file.

Uses two Apify actors in parallel:
- `pintostudio/youtube-transcript-scraper` — full transcript
- `streamers/youtube-scraper` — title, views, likes, duration, description, etc.

Produces a single MD file in `outputs/video-{slug}.md` with metadata table, description, timestamps, links, and cleaned transcript.

Requires `APIFY_KEY` in `.env`.

Example: `/scrape-video https://youtu.be/JQQhT0edXXw`

---

## Critical Instruction: Maintain This File

**Whenever Claude makes changes to the workspace, Claude MUST consider whether CLAUDE.md needs updating.**

After any change — adding commands, scripts, workflows, or modifying structure — ask:

1. Does this change add new functionality users need to know about?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need new files to capture this?

If yes to any, update the relevant sections. This file must always reflect the current state of the workspace so future sessions have accurate context.

**Examples of changes requiring CLAUDE.md updates:**

- Adding a new slash command → add to Commands section
- Creating a new output type → document in Workspace Structure or create a section
- Adding a script → document its purpose and usage
- Changing workflow patterns → update relevant documentation

---

## Landing Page Goals

This site should convey:

- **Who Oleg is** -- AI software entrepreneur, 5 years in AI, big tech + hedge fund background, math olympiad winner
- **The arc** -- Built AI in big tech and as an entrepreneur; now focused on AI systems for marketing
- **What he offers** -- Boldane (premium personal branding for founders with real expertise), YouTube (AI for marketing tutorials), Skool community
- **Social proof** -- 1M+ client views, Mike Kamo, $6.6K first deal in 14 days, 16.6K YouTube subs, 500K+ YouTube views, math/CS credentials
- **How to connect** -- YouTube (@Oleg-Melnikov), LinkedIn (/olegai), Instagram, boldane.com

Key references in the main repo (`/Users/olegmelnikov/Desktop/Software Projects/oleeeg`) contain deeper context if needed.

---

## SEO

Ongoing goal: optimize the site for search around keywords like **"AI systems for marketing"**, **"Claude Code"**, **"Claude Code for marketing"**.

**Done:**
- Sitemap (`src/app/sitemap.ts`) + robots.txt (`src/app/robots.ts`)
- Keyword-rich meta tags (title, description, keywords, OG, Twitter cards) on all pages
- Proper heading hierarchy (`h1` → `h2`) across all sections
- Plausible analytics (`src/components/plausible.tsx`, domain: oleg.ae)

**Still to do:**
- Open Graph images (branded preview for social shares)
- Structured data / JSON-LD (Person schema)
- Internal linking (homepage → resource pages — resource pages are now interlinked via `ResourceFooter`)
- Performance audit (Lighthouse, image optimization)
- More content pages (each YouTube video = a potential resource page targeting keywords)
- Google Search Console verification (blocked for now, revisit later)

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Work**: Use commands or direct Claude with tasks
3. **Plan changes**: Use `/create-plan` before significant additions
4. **Execute**: Use `/implement` to execute plans
5. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

---

## Tech Stack

- **Framework:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Deployment target:** Vercel

### Dev Commands

```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run start  # Start production server
```

### Site Structure

**Main page** (`/`) — single page with 6 sections:
1. **Hero** — Tagline, photo, CTAs (`src/components/hero-section.tsx`)
2. **About** — What Oleg does now (`src/components/about-section.tsx`)
3. **Results** — Stats, client proof, credentials (`src/components/results-section.tsx`)
4. **Video** — Looping 5s muted preview, blur + "watch on youtube" on hover (`src/components/video-section.tsx`)
5. **Connect** — Social links + footer (`src/components/connect-section.tsx`)
6. **Header** — Floating nav, blurs on scroll (`src/components/header.tsx`)

**Resource pages** — YouTube video companion pages with setup guides:
- `/claude-outreach` — Claude Code for cold outreach
- `/claude-twitter` — X/Twitter content machine
- `/claude-tiktok` — Viral TikTok videos
- `/claude-website` — Build personal website
- `/claude-social-growth` — Viral social media growth
- `/claude-trend-scanner` — Trend scanner for 10x more views
- `/claude-b2b-outreach` — B2B outreach (35% reply rate)
- `/claude-seo` — SEO optimization
- `/claude-cowork-outreach` — Claude Cowork for cold outreach
- `/claude-marketing` — Marketing (SMM, ads, outreach)
- `/claude-reels` — Viral Instagram Reels
- `/claude-content` — Content creation in 10 minutes
- `/claude-interviewer` — AI voice interviewer for content creation

**Tool pages** — free open-source tool lead magnets (GitHub download + setup guide, no YouTube video):
- `/ads-ai` — AI ads creator (study competitors' Meta ads, generate ad concepts)

**Lead magnet pages** — prompt-based giveaways (no code setup, just copy-paste prompts):
- `/60k-linkedin-post` — 3 AI prompts for LinkedIn content that sells ($60K client case study)

**Marketing Brain pages** — the `marketing-brain/` knowledge base, surfaced on the site:
- `/marketing-brain-knowledge` — static gallery of the whole corpus (8 books + 75 talks, grouped by expert). Data is generated from `marketing-brain/manifest.json` into `src/app/marketing-brain-knowledge/data.ts`. Book covers are served from `public/marketing-brain/book-covers/`.
- `/marketing-brain` — **AI chat** (RAG), branded **"$1B Marketing Brain"**: ask a marketing question, get a streamed, cited answer with visual source cards (book cover + page, or video thumbnail/embed + timecode). This is the visual twin of `marketing-brain/scripts/query.py`. The hero/empty state is deliberately minimal (Jobs-style: title, faces, starter prompts, input, personalize link, nothing else). It shows an **expert portrait strip** (`src/app/marketing-brain/components/expert-strip.tsx`) of the four faces behind the corpus (Hormozi, Brunson, Cialdini, Godin) so visitors instantly grasp whose minds power the answers; portraits are bright color (they appear in a YouTube thumbnail), square face-centered webp crops in `public/marketing-brain/experts/`, unified by a rounded frame + ring + soft drop shadow, with color/lift on hover. Keep visible body text lean (target under ~300 chars).

The two pages are cross-linked (chat header → "browse the sources"; knowledge header + footer → "ask the brain"). The chat (`/marketing-brain`) is also listed in `ResourceFooter`, so it appears in the "more free resources" grid on the homepage and every resource/tool/lead-magnet page; the knowledge gallery renders the `ResourceFooter` too, linking it to the rest of the site.

Resource pages follow a shared pattern: minimal header, embedded YouTube video, accordion setup steps, cross-linked resource footer. Tool pages follow the same pattern but replace the video embed with a GitHub download CTA and "how it works" overview. Lead magnet pages have their own structure: prompts with copy buttons, how-it-works overview, and client proof. Each lives in `src/app/{slug}/page.tsx` with its own `layout.tsx` for metadata.

**Backend (the site is no longer fully static).** The `/marketing-brain` chat is powered by a serverless Route Handler at `src/app/api/marketing-brain/chat/route.ts`:
- **Retrieval:** TypeScript BM25 (`src/lib/marketing-brain/retriever.ts`) over `src/app/marketing-brain/_data/chunks.json`. Ranking refinements (keep `query.py` in parity): each chunk's identity (book title+author / video title+expert) is folded into the indexed tokens so a source is matchable by name; results are capped at `PER_SOURCE` (2) chunks per book/video so near-duplicate clips can't crowd out other sources; and book chunks get a modest quality bonus (`BOOK_WEIGHT` 1.25) since a book is far more distilled than a single talk — a server-only corpus generated by `marketing-brain/scripts/build-web-index.py` (faithful port of `query.py`; rerun after any KB change, after `build-kb.py`). `chunks.json` contains full book text, so it is **server-only** (never under `public/`) and the repo is private; `next.config.ts` adds it to `outputFileTracingIncludes` so it ships with the function on Vercel.
- **Synthesis:** Claude (`@anthropic-ai/sdk`, model `claude-sonnet-4-6`) streams a cited answer; the route emits sources first, then text deltas (NDJSON). Requires **`ANTHROPIC_API_KEY`** in `.env` locally and in Vercel env vars.
- **Abuse protection:** in-memory per-IP daily cap of 30 (`src/lib/marketing-brain/rate-limit.ts`); on limit the UI shows a "reach out: oleg@buildauthority.ai" notice. Approximate (per-instance); upgrade to Vercel KV / Upstash for a hard cap if needed.
- **Copyright:** answers quote sources only briefly (~25 words, attributed); full chunk text never reaches the client.
- **Business-context memory (personalization):** the chat can be taught about the user's business so its advice is personalized. A markdown file `business-context.md` holds it. Storage: locally it sits at the repo root (`marketing-brain-memory/`, gitignored); on Vercel `process.cwd()` (`/var/task`) is read-only, so `src/lib/marketing-brain/memory.ts` bases the dir on `os.tmpdir()` (`/tmp`) when `process.env.VERCEL` is set. Vercel `/tmp` is per-instance and ephemeral (intentional for this MVP; a durable store, Vercel KV / Blob, is the later upgrade). **Because of that, the chat does not rely on the server file in production:** the client sends its loaded "your context" text with each `/api/marketing-brain/chat` request (`businessContext` in the body), and the route prefers it (capped at `MAX_CONTEXT_CHARS`), falling back to the server file only for local dev. This makes personalization work regardless of Vercel's ephemeral fs, and is also correct for multiple visitors (each browser uses its own context). Managed via the "your context" drawer on `/marketing-brain`: paste/edit text, upload files (PDF via `unpdf`, txt/md), or scrape a website (Firecrawl `/v1/scrape` → distilled with `claude-sonnet-4-6`). Routes: `src/app/api/marketing-brain/memory/{route,scrape,upload,extract}`. Auto-capture: after each turn, `memory/extract` (Sonnet 4.6) appends durable business facts the user mentions, with an undo toast + a persisted toggle. Requires `FIRECRAWL_API_KEY` (already in `.env`). Helpers: `src/lib/marketing-brain/{memory,firecrawl,distill}.ts`. Integration tests: with the server running, `node scripts/test-marketing-brain-memory.mjs` (snapshots + restores the real memory; exercises scrape/upload/chat/extract; 18 assertions).

**Shared components:**
- Animation primitives in `src/components/motion/` (TextEffect, AnimatedGroup)
- `src/components/accordion.tsx` — Reusable accordion for setup steps (used by resource pages)
- `src/components/resource-footer.tsx` — Cross-linked footer showing all other resource pages with icons (uses `lucide-react`). Rendered on the homepage (`currentSlug=""`), every resource/tool/lead-magnet page, and the Marketing Brain knowledge gallery. The Marketing Brain chat is the first entry. When adding a new resource page, update the `resources` array in this file.

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse
