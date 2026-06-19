# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is the workspace for **Oleg Melnikov's personal landing page** — a one-pager website that quickly communicates who Oleg is to the public world: his story, expertise, what he offers, and how to connect.

**Oleg** is an AI software entrepreneur with 5 years in AI. Former big tech (Yandex, JetBrains) and hedge fund (Amsterdam). Now runs Authority AI (helps B2B founders build authentic personal brands) and a growing YouTube channel (16.6K subs, AI for marketing tutorials).

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
- **What he offers** -- Authority AI (authentic personal brands for B2B founders), YouTube (AI for marketing tutorials), Skool community
- **Social proof** -- 1M+ client views, Mike Kamo, $6.6K first deal in 14 days, 16.6K YouTube subs, 500K+ YouTube views, math/CS credentials
- **How to connect** -- YouTube (@Oleg-Melnikov), LinkedIn (/olegai), Instagram, buildauthority.ai

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
- `/marketing-brain` — **AI chat** (RAG): ask a marketing question, get a streamed, cited answer with visual source cards (book cover + page, or video thumbnail/embed + timecode). This is the visual twin of `marketing-brain/scripts/query.py`.

Resource pages follow a shared pattern: minimal header, embedded YouTube video, accordion setup steps, cross-linked resource footer. Tool pages follow the same pattern but replace the video embed with a GitHub download CTA and "how it works" overview. Lead magnet pages have their own structure: prompts with copy buttons, how-it-works overview, and client proof. Each lives in `src/app/{slug}/page.tsx` with its own `layout.tsx` for metadata.

**Backend (the site is no longer fully static).** The `/marketing-brain` chat is powered by a serverless Route Handler at `src/app/api/marketing-brain/chat/route.ts`:
- **Retrieval:** TypeScript BM25 (`src/lib/marketing-brain/retriever.ts`) over `src/app/marketing-brain/_data/chunks.json` — a server-only corpus generated by `marketing-brain/scripts/build-web-index.py` (faithful port of `query.py`; rerun after any KB change, after `build-kb.py`). `chunks.json` contains full book text, so it is **server-only** (never under `public/`) and the repo is private; `next.config.ts` adds it to `outputFileTracingIncludes` so it ships with the function on Vercel.
- **Synthesis:** Claude (`@anthropic-ai/sdk`, model `claude-sonnet-4-6`) streams a cited answer; the route emits sources first, then text deltas (NDJSON). Requires **`ANTHROPIC_API_KEY`** in `.env` locally and in Vercel env vars.
- **Abuse protection:** in-memory per-IP daily cap of 30 (`src/lib/marketing-brain/rate-limit.ts`); on limit the UI shows a "reach out: oleg@buildauthority.ai" notice. Approximate (per-instance); upgrade to Vercel KV / Upstash for a hard cap if needed.
- **Copyright:** answers quote sources only briefly (~25 words, attributed); full chunk text never reaches the client.

**Shared components:**
- Animation primitives in `src/components/motion/` (TextEffect, AnimatedGroup)
- `src/components/accordion.tsx` — Reusable accordion for setup steps (used by resource pages)
- `src/components/resource-footer.tsx` — Cross-linked footer showing all other resource pages with icons (uses `lucide-react`). When adding a new resource page, update the `resources` array in this file.

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse
