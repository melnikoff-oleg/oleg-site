# Plan: "Next up" recommendation system (kill the 13-link dead end)

**Status:** not started (prompt for a future Claude Code session)
**Created:** 2026-07-23
**Owner:** Oleg
**Origin:** Action point #4 from the Plausible visitor-intelligence report
(artifact: https://claude.ai/code/artifact/888e272e-d8b2-4b7b-8734-e331bba9333e)

---

## How to use this file

Open a fresh Claude Code session in the `oleg-site` repo and paste the prompt in
the next section (or say: "read and execute `plans/2026-07-23-next-up-recommendations.md`").
Everything the session needs is below.

---

## The prompt

> **Task: replace the "dead end" of 13 identical links (`ResourceFooter`) with a small, smart "watch/read next" recommendation surface.**
>
> ### Read first
> - Read `CLAUDE.md` fully. It documents the whole site, the design system, the mobile-first rule, the no-em-dash rule, and the Boldane presence policy. Follow all of it.
> - Read the memory note `reference_plausible_traffic_profile.md` (via `/memory` or the project memory dir) for the traffic facts behind this task.
>
> ### Why we are doing this
> - `oleg.ae` is a rack of landing pages, each fed by one YouTube video. Plausible showed **1.48 pages per visit**: almost nobody navigates to a second page.
> - `src/components/resource-footer.tsx` currently dumps **all ~19 resources** as a grid on every page. It is a wall of equal-weight links, so visitors ignore it. After someone grabs the tool, the page is a dead end.
> - We want to hand each visitor **2-3 genuinely good next steps** instead: pages that are both **relevant to what they just consumed** and **popular / high quality**, so the choice is easy and the best content is never buried.
>
> ### Study how the best recommenders *present* this (UX, not the math)
> Before designing the component, look at how YouTube and Amazon actually *show* recommendations, and borrow the presentation patterns (not any algorithm):
> - **YouTube:** one prominent **"Up next"** item (autoplay candidate, largest, on top) plus a **ranked sidebar/list** of a handful more. The hierarchy is the message: one obvious best choice, then a short digestible list, then everything else is out of sight.
> - **Amazon:** compact horizontal **"Customers who bought this also bought"** strips with a clear title framing *why* these are shown, small cards, easy to scan.
> - Takeaways to apply here: (1) surface **one hero recommendation** larger/first, then **1-2 smaller secondary** ones; (2) give the block an honest, specific **title** that frames why ("keep going with", "people who grabbed this also built", "watch next"); (3) rank them, do not show a flat equal grid; (4) keep it short and digestible, never a wall.
>
> ### Approach (no heavy algorithm: use an LLM once at build time, never per request)
> 1. Write a build script (e.g. `scripts/build-recommendations.ts` or `.py`) that:
>    - **Pulls per-page popularity from Plausible.** The API key + config live in `/Users/olegmelnikov/Desktop/Software Projects/oleeeg/.env` (`PLAUSIBLE_API_KEY`, `PLAUSIBLE_BASE_URL=https://plausible.io`; `site_id = "oleg.ae"`). A working query example is in that repo's `scripts/fetch-plausible.sh`. Use `POST /api/v2/query` with `dimensions: ["event:page"]`, metric `visitors`, over the last ~90 days.
>    - **Collects each page's topic** (the `h1` + subtitle, or the route's `metadata`, from `src/app/*/page.tsx`).
>    - **Asks Claude once** (model `claude-sonnet-4-6` or newer; `@anthropic-ai/sdk` is already a dependency, `ANTHROPIC_API_KEY` is in `.env`) to choose, **for each page**, the best 2-3 "next" pages, balancing **relevance to that page's topic + popularity (the Plausible numbers) + content quality**. Rank them (position 0 = the hero "up next"). Force a strict JSON shape, e.g. `{ "/claude-reels": ["/claude-tiktok", "/marketing-brain", "/claude-content"], ... }`.
>    - **Writes the result to a static file** (e.g. `src/lib/recommendations.json`) so **runtime does zero LLM calls**. Document how to regenerate it.
> 2. Build a component (e.g. `src/components/next-up.tsx`) that reads the recommendations for the current slug and renders them in the **YouTube-style hierarchy**: one hero "up next" card + 1-2 smaller secondary cards, with a clear framing title. Use the design system strictly (tokens `navy` / `vivid-blue` / `silver` / `silver-muted` / `hairline`, the `Button`/`Card` primitives, the visual language of `RepoCta` / `ResourceFooter`). Mobile-first, tap targets >= 44px, no horizontal scroll at 390px.
> 3. **Decide with Oleg (or propose a sensible default):** fully replace `ResourceFooter` with these 2-3 ranked cards, OR lead with the 2-3 smart picks and keep a collapsed "see all resources" link below. Preserve some cross-linking for SEO (do not delete all internal links), and respect the Boldane presence policy in `CLAUDE.md` (at most one Boldane pitch per page).
>
> ### Hard rules (from CLAUDE.md / memory)
> - Work in a dedicated **git worktree** and branch.
> - **TDD:** write the Playwright test first (in `tests/e2e/`), then implement. Cover desktop + 390px mobile.
> - Kill any stale `next-server` on `:3000` first, then run the **full suite** (`npm run test`) and get it green.
> - **No em/en dashes** anywhere in rendered page copy: use commas / colons / periods.
> - Simple language, no the word "tools" as a label, never imply ghostwriting.
> - Update `CLAUDE.md` (the new component + the build script + how to regenerate `recommendations.json`).
> - Take a real 390px screenshot and confirm zero horizontal overflow.
> - At the end: `git add`, commit, and **show Oleg the diff before pushing.**
>
> ### Success metric
> Lift "pages per visit" above the current 1.48 by giving each visitor one obvious, valuable next step (plus a short ranked list), instead of a wall of equal links.

---

## Reference: current per-page popularity (Plausible, 23 Apr - 23 Jul 2026)

Use these as a starting signal; the build script should pull fresh numbers.

| Page | Visitors (90d) |
|---|---|
| /claude-reels | 2,886 |
| /claude-cowork-outreach | 969 |
| / (home) | 649 |
| /claude-tiktok | 566 |
| /marketing-brain | 496 |
| /claude-content | 460 |
| /claude-twitter | 449 |
| /claude-b2b-outreach | 410 |
| /claude-marketing | 262 |
| /ads-ai | 244 |
| /claude-outreach | 244 |
| /claude-social-growth | 232 |
| /high-converting-website | 129 |
| /60k-linkedin-post | 122 |
| /claude-trend-scanner | 101 |
| /5-levels-ai | 99 |
| /claude-website | 94 |
| /marketing-brain-knowledge | 77 |
| /claude-seo | 53 |
| /claude-interviewer | 49 |

Quality signal to combine with popularity: `/high-converting-website` and
`/marketing-brain-knowledge` show the deepest engagement (highest dwell, lowest
bounce), and `/marketing-brain` (the AI chat) is the rising, stickiest surface,
so they deserve a quality boost even where raw traffic is lower.
