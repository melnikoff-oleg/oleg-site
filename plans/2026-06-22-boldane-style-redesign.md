# Plan: Redesign oleg.ae in the Boldane Visual Style

**Created:** 2026-06-22
**Status:** Implemented
**Request:** Fully redesign the personal site (oleeeg-landing) to match the visual style of boldane.com (boldane-site repo): same fonts, colors, surfaces, and motifs across every page. Then add, commit, push, and ship 20 diverse tests verifying the result.

---

## Overview

### What This Plan Accomplishes

This converts the personal landing site (`oleg.ae`) from its current **pure-black + zinc + Unbounded** look to the **Boldane premium dark-navy design system**: navy background (`#020b18`), electric `vivid-blue` (`#2863f0`) accent, silver text, metallic gradient headings, hairline borders, gradient "surface" cards, dot-grid texture, and soft blue glow. Every route (homepage, ~14 `/claude-*` resource pages, `/ads-ai`, `/60k-linkedin-post`, `/marketing-brain`, `/marketing-brain-knowledge`) and every shared component is restyled. We add reusable `Button`/`Card` primitives ported from Boldane, swap the font stack (Inter + DM Sans + Space Grotesk, dropping Unbounded), and back the work with a 20-test verification suite before committing and pushing.

### Why This Matters

`oleg.ae` and `boldane.com` are the two public faces of one person. Right now they read as two unrelated brands (flat black vs premium navy). Unifying them makes Oleg's whole presence feel like one deliberate, high-end brand, which directly reinforces the expertise-first, anti-AI-slop positioning Boldane sells. It also raises the perceived quality of every lead-magnet page that feeds the YouTube → site → offer funnel, supporting the April–September growth sprint.

---

## Current State

### Relevant Existing Structure

**Tech (both repos align well — low-friction port):**
- Both: Next.js (15.3.1 here / 16 on Boldane), React 19, **Tailwind CSS v4** via `@tailwindcss/postcss` (no `tailwind.config`), fonts via `next/font/google`.
- This repo additionally uses **Framer Motion 12** (motion primitives, scroll reveals), `clsx` + `tailwind-merge` (`src/lib/utils.ts` `cn()`), `lucide-react`. Boldane adds `class-variance-authority` (CVA) and `@radix-ui/react-slot` for its `Button`.

**Current design tokens (`src/app/globals.css`):** none beyond base — `body { background:#000; color:#fafafa }`, `color-scheme: dark`. All color is hardcoded per-component (`bg-white/[0.03]`, `text-zinc-400`, `border-white/10`, etc.).

**Current fonts (`src/app/layout.tsx`):** Inter (body) + Unbounded (`--font-unbounded`, headings/wordmark).

**Routes (18 `page.tsx`):** `/` ; `/claude-outreach` `/claude-b2b-outreach` `/claude-cowork-outreach` `/claude-twitter` `/claude-content` `/claude-reels` `/claude-tiktok` `/claude-social-growth` `/claude-trend-scanner` `/claude-marketing` `/claude-seo` `/claude-website` `/claude-interviewer` ; `/ads-ai` ; `/60k-linkedin-post` ; `/marketing-brain` ; `/marketing-brain-knowledge`.

**Shared components (`src/components/`):** `header.tsx`, `hero-section.tsx`, `about-section.tsx`, `results-section.tsx`, `video-section.tsx`, `connect-section.tsx`, `consult-cta.tsx`, `accordion.tsx`, `resource-footer.tsx`, `json-ld.tsx`, `plausible.tsx`, `motion/text-effect.tsx`, `motion/animated-group.tsx`.

**Marketing-brain UI (`src/app/marketing-brain/`):** `page.tsx`, `components/{chat-message,context-drawer,expert-strip,source-card}.tsx`, hooks `use-brain-chat.ts` / `use-memory.ts`.

**Boldane source of truth (read-only reference):**
- `boldane-site/src/app/globals.css` — `@theme inline` tokens + custom classes (`.text-metallic`, `.text-metallic-muted`, `.brand-wordmark`, `.surface-card`, `.surface-raised`, `.bg-dotgrid`, `.glow-blue`, `.eyebrow`).
- `boldane-site/src/app/layout.tsx` — font loading.
- `boldane-site/src/components/ui/{button,card}.tsx` — primitives.

### Boldane Design System (the target — exact values)

**Tokens (`@theme inline`):**
```css
--color-navy: #020b18;          /* page background */
--color-navy-light: #051c3e;
--color-navy-raised: #07142a;   /* raised section bg */
--color-vivid-blue: #2863f0;    /* primary accent / CTA */
--color-silver: #d0d6e0;        /* primary text */
--color-silver-muted: #8a93a3;  /* secondary text */
--color-hairline: rgba(208,214,224,0.1); /* all borders/dividers */
--font-sans: var(--font-inter), system-ui, sans-serif;
--font-display: var(--font-dm-sans), system-ui, sans-serif;
--font-body: var(--font-space), system-ui, sans-serif;
```

**Fonts:** Inter (400/500/700, `--font-inter`, default sans) · DM Sans (400/500/700, `--font-dm-sans`, `font-display` for headings) · Space Grotesk (300/400/500, `--font-space`, `font-body`).

**Signature classes (copy verbatim from Boldane globals.css):** `.text-metallic`, `.text-metallic-muted`, `.brand-wordmark` (metallic gradient text), `.surface-card` (`linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))` + hairline border + `border-radius:1rem`), `.surface-raised`, `.bg-dotgrid` (22px radial dot pattern), `.glow-blue` (`0 0 0 1px rgba(40,99,240,.25), 0 18px 60px -18px rgba(40,99,240,.55)`), `.eyebrow` (uppercase, `letter-spacing:.2em`).

**Buttons:** pill (`rounded-full`), `font-body font-medium`. primary = `bg-vivid-blue text-white shadow-[0_10px_40px_-12px_rgba(40,99,240,.7)]` hover `bg-[#1b50d8]`; outline = `border border-hairline text-silver` hover `border-vivid-blue/50 text-white`; ghost = `text-silver-muted` hover `text-white`. Sizes sm `h-9 px-4 text-sm` / md `h-11 px-6 text-sm` / lg `h-13 px-8 text-base`.

**Header:** `fixed inset-x-0 top-0 z-50`, `bg-navy/70 backdrop-blur-md`, `h-16`; wordmark `brand-wordmark font-display`; links `font-body text-sm text-silver-muted hover:text-white`.

**Eyebrow label pattern:** `font-body text-xs text-vivid-blue/80 uppercase tracking-[0.2em]`.

**Headings:** `font-display`, `leading-[1.05]`, `tracking-tight`, often wrapped in `.text-metallic`. H1 `text-4xl sm:text-5xl lg:text-6xl`.

**Layout:** containers `max-w-6xl` (also `4xl`/`2xl`), `px-6 lg:px-8`, sections `py-24 lg:py-32`. Cards `rounded-2xl`/`surface-card`. Ambient radial-blue glows layered as `pointer-events-none absolute` behind `relative` content.

### Color/Token Migration Map (apply globally)

| Current (oleeeg) | New (Boldane) |
| --- | --- |
| `bg-black`, `#000`, `bg-black/60`, `bg-black/95` | `bg-navy`, `bg-navy/70`, `bg-navy/90` |
| `text-white` (headings) | `.text-metallic` + `font-display` (large) or `text-silver` (UI) |
| `text-white` (body emphasis) | `text-silver` |
| `text-zinc-300` / `text-zinc-400` | `text-silver` / `text-silver-muted` |
| `text-zinc-500` / `600` / `700` | `text-silver-muted` (or `/70`, `/50` opacity) |
| `border-white/5…/20`, `/[0.06]/[0.07]` | `border-hairline` |
| `bg-white/[0.02]…/[0.06]` (cards) | `.surface-card` (or `bg-navy-raised/40`) |
| `bg-white/10` / `/15` / `/20` (chips, hovers) | `bg-vivid-blue/15` (accent) or `bg-white/[0.04]` (neutral hover) |
| white CTA (`bg-white text-black`) | primary `Button` (`bg-vivid-blue text-white`) |
| underline links `decoration-zinc-600` | `text-vivid-blue hover:text-white` (or keep underline w/ `decoration-hairline`) |
| `from-white to-zinc-300 bg-clip-text` | `.text-metallic` |
| `shadow-black/40`, custom black shadows | `.glow-blue` (accent) or keep neutral depth |
| `font-[family-name:var(--font-unbounded)]` | `font-display` (DM Sans) + `.brand-wordmark` for the name |

### Gaps / Problems Being Addressed

- Two public sites with **no shared visual identity**.
- All color/typography is **hardcoded per component** — no tokens, so the brand can't be changed in one place. The redesign introduces tokens, fixing that permanently.
- No automated tests at all; a large cross-cutting restyle has high regression risk (broken routes, leftover black/zinc classes, contrast failures, em-dash violations).

---

## Proposed Changes

### Summary of Changes

- Port Boldane's `@theme inline` tokens + all signature CSS classes into `src/app/globals.css`.
- Swap font stack in `src/app/layout.tsx`: add DM Sans + Space Grotesk, drop Unbounded, wire `font-sans` on body.
- Add `class-variance-authority` + `@radix-ui/react-slot`; create `src/components/ui/button.tsx` and `src/components/ui/card.tsx` ported from Boldane (reuse existing `cn()`).
- Restyle all 13 shared components and all 18 routes via the migration map — keep existing Framer Motion structure, only change visual classes/markup.
- Restyle the marketing-brain chat UI (highest-effort surface) to the navy/silver/vivid-blue system.
- Update `CLAUDE.md` (tech stack + design-system note) and `context/` where it describes the site look.
- Add a **20-test verification suite** (Playwright E2E + visual + static audits) under `tests/`, wired to `npm run test`.
- Run build + tests, then `git add/commit/push` on a feature branch and open/merge per Oleg's preference.

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `src/components/ui/button.tsx` | CVA pill button (primary/outline/ghost; sm/md/lg) ported from Boldane |
| `src/components/ui/card.tsx` | `surface-card` wrapper component |
| `tests/playwright.config.ts` | Playwright config: dev/preview server, desktop + mobile (iPhone) projects |
| `tests/routes.ts` | Single exported list of all 18 routes (shared by tests) |
| `tests/e2e/routes.spec.ts` | Tests 1–6: every route loads 200, has `<h1>`, header/footer render, no console errors |
| `tests/e2e/design-tokens.spec.ts` | Tests 7–11: computed `body` bg = navy, accent present, fonts loaded, no leftover black/zinc, hairline borders |
| `tests/e2e/visual.spec.ts` | Tests 12–15: full-page screenshot snapshots (home, a resource page, marketing-brain, knowledge) desktop + mobile |
| `tests/e2e/interactions.spec.ts` | Tests 16–18: header scroll/blur, accordion open/close, resource-footer links navigate |
| `tests/e2e/a11y-content.spec.ts` | Tests 19–20: contrast/heading-order axe check + no em/en dashes in rendered text |
| `tests/visual.spec.ts-snapshots/` | Committed baseline screenshots (generated on first run) |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `src/app/globals.css` | Replace body block with Boldane `@theme inline` tokens + all signature classes (metallic, surface, dotgrid, glow, eyebrow). Keep `scroll-behavior` + `color-scheme:dark`. |
| `src/app/layout.tsx` | Import `Inter, DM_Sans, Space_Grotesk`; remove `Unbounded`; set CSS-var weights; apply `${...variable} font-sans antialiased` on `<body>`. |
| `package.json` | Add deps `class-variance-authority`, `@radix-ui/react-slot`, devDeps `@playwright/test`, `@axe-core/playwright`; add `"test"` + `"test:update"` scripts. |
| `src/components/header.tsx` | Navy/blur header, `brand-wordmark` name, silver-muted nav links, primary `Button` CTA. |
| `src/components/hero-section.tsx` | Navy bg, blue radial glow + `bg-dotgrid`, `.text-metallic` h1 (`font-display`), eyebrow label, primary/outline `Button`s, `surface-card glow-blue` image frame, metallic quote panel. |
| `src/components/about-section.tsx` | `text-silver`/`text-silver-muted` body, `text-vivid-blue` links. |
| `src/components/results-section.tsx` | `surface-card` stat tiles, metallic numbers, `vivid-blue/15` icon badges, hairline dividers. |
| `src/components/video-section.tsx` | `surface-card glow-blue` frame, hairline borders, navy overlays. |
| `src/components/connect-section.tsx` | Outline `Button`-style social links, hairline borders, vivid-blue hovers. |
| `src/components/consult-cta.tsx` | `surface-card` + primary `Button`. |
| `src/components/accordion.tsx` | Hairline borders, `surface-card` items, `vivid-blue` number badges + chevron. |
| `src/components/resource-footer.tsx` | `surface-card` grid, hairline borders, `vivid-blue` icons, silver text, blue hover. |
| `src/app/page.tsx` | Verify section order/spacing under new system (mostly composition). |
| `src/app/claude-*/page.tsx` (14 files) | Apply migration map: eyebrow "free resource" pill, metallic h1, `surface-card` step blocks, vivid-blue links, primary `Button` CTAs, hairline borders. Shared markup → consistent. |
| `src/app/ads-ai/page.tsx` | Same migration; GitHub CTA → primary `Button`. |
| `src/app/60k-linkedin-post/page.tsx` | Same migration; prompt cards → `surface-card`, copy buttons → outline `Button`, code blocks `bg-navy-raised`. |
| `src/app/marketing-brain/page.tsx` | Navy hero/empty state, metallic title, vivid-blue starter chips + input focus ring, `surface-card` drawer trigger. |
| `src/app/marketing-brain/components/chat-message.tsx` | Silver prose, vivid-blue citation chips, hairline message dividers, navy code blocks. |
| `src/app/marketing-brain/components/context-drawer.tsx` | Navy panel, hairline borders, primary/outline `Button`s. |
| `src/app/marketing-brain/components/expert-strip.tsx` | Hairline ring → `ring-vivid-blue/30` hover, glow-blue lift, navy frame. |
| `src/app/marketing-brain/components/source-card.tsx` | `surface-card`, hairline borders, vivid-blue accents. |
| `src/components/motion/*` | No visual change expected; verify defaults still read well on navy. |
| `CLAUDE.md` | Update Tech Stack (new fonts/deps, `ui/` primitives) + add a "Design System" subsection documenting tokens/classes; note tests under `tests/` + `npm run test`. |
| `context/business-info.md` (and/or `strategy.md`) | One line: personal site now shares Boldane's visual identity. |

### Files to Delete

None. (Unbounded is removed by deleting its import lines, not a file.)

---

## Design Decisions

### Key Decisions Made

1. **Token-first migration, not a rewrite.** Both repos are Tailwind v4 + `next/font` + `cn()`, so we port Boldane's `@theme` + classes and remap utility classes. HTML structure and Framer Motion stay; only visual classes change. Lower risk, faster, preserves SEO markup (h1→h2 hierarchy, JSON-LD).
2. **Keep Framer Motion.** Boldane is mostly CSS-animated, but this site's scroll reveals/`TextEffect` already look premium and on-brand. Removing them would reduce beauty for no benefit. Motion timing stays; only colors change.
3. **Headings use `.text-metallic` + DM Sans; the name/wordmark uses `.brand-wordmark`.** This is Boldane's signature and the single biggest "same brand" signal. Unbounded is dropped entirely.
4. **Introduce shared `Button`/`Card` primitives.** The site currently hand-rolls every button. Porting Boldane's CVA `Button` + `Card` makes the 18 pages consistent and is how Boldane stays uniform — worth the two small deps.
5. **Neutral hovers use `bg-white/[0.04]`, accents use `bg-vivid-blue/*`.** Avoids a sea of blue while keeping the accent meaningful (CTAs, links, active states, icons).
6. **Playwright for the 20 tests.** "Diverse angles" maps to E2E + visual snapshots + computed-style token audits + static-content checks + a11y. Playwright drives a real browser so device emulation is accurate — important given the workspace memory that headless `--screenshot` lies for mobile; Playwright's project viewports avoid that pitfall.
7. **No em/en dashes.** Per standing rule, a dedicated test asserts rendered text contains no `—`/`–`, and all new copy uses commas/colons/periods.
8. **Feature branch + push.** Work on `redesign-boldane-style`; commit only after build + all 20 tests pass; push and open a PR (per repo guidance to branch off `main`).

### Alternatives Considered

- **Full rebuild of each page from scratch in Boldane's idiom** — rejected: huge effort, would churn SEO-critical markup and the working marketing-brain logic for marginal gain over a disciplined restyle.
- **Drop Framer Motion to match Boldane exactly** — rejected: removes polish, adds work.
- **Jest/RTL or Vitest instead of Playwright** — rejected for the *primary* goal: a visual/brand redesign is verified by rendered pixels and computed styles, which need a real browser. Unit tests can't confirm "looks like Boldane."
- **A theming abstraction (next-themes / multi-theme)** — rejected: single dark brand, no toggle needed; tokens in `@theme` are enough.

### Open Questions (resolved with defaults; flag at /implement if you disagree)

1. **Marketing-brain restyle depth** — default: full restyle to match (highest effort). If you'd rather ship the marketing pages first and treat the chat as a fast-follow, say so.
2. **Push target** — default: feature branch `redesign-boldane-style` + push + open PR (not a direct push to `main`). Say "push to main" to override.
3. **Visual baselines** — default: generate snapshot baselines on the first test run and commit them (so future diffs are meaningful). The very first run "passes" by establishing baselines.
4. **Wordmark text** — default: keep "Oleg Melnikov" / "oleg.ae" as today, just restyled with `.brand-wordmark`.

---

## Step-by-Step Tasks

### Step 1: Branch + dependencies

**Actions:**
- `git checkout -b redesign-boldane-style`
- `npm install class-variance-authority @radix-ui/react-slot`
- `npm install -D @playwright/test @axe-core/playwright && npx playwright install chromium`
- Add to `package.json` scripts: `"test": "playwright test"`, `"test:update": "playwright test --update-snapshots"`.

**Files affected:** `package.json`, `package-lock.json`

---

### Step 2: Port design tokens + signature classes

Replace the body-only `globals.css` with Boldane's `@theme inline` block and all signature classes, keeping `scroll-behavior:smooth` and `color-scheme:dark`. Copy `.text-metallic`, `.text-metallic-muted`, `.brand-wordmark`, `.surface-card`, `.surface-raised`, `.bg-dotgrid`, `.glow-blue`, `.eyebrow` verbatim. Set `body { background:var(--color-navy); color:var(--color-silver) }`.

**Files affected:** `src/app/globals.css`

---

### Step 3: Swap font stack

In `layout.tsx`: import `Inter, DM_Sans, Space_Grotesk` from `next/font/google` with the weights/variables Boldane uses; remove `Unbounded`. Put all three `.variable`s + `font-sans antialiased` on `<body>` (keep `<Plausible/>`). Keep all existing metadata.

**Files affected:** `src/app/layout.tsx`

---

### Step 4: Create UI primitives

Port `Button` (CVA: variants primary/outline/ghost, sizes sm/md/lg, `asChild` via Radix Slot) and `Card` (`surface-card`) into `src/components/ui/`, using the existing `cn()` from `src/lib/utils.ts`.

**Files affected:** `src/components/ui/button.tsx`, `src/components/ui/card.tsx`

---

### Step 5: Restyle global chrome (header, footer, motion)

Apply navy/blur header with `brand-wordmark` + silver-muted nav + primary `Button` CTA; restyle `resource-footer.tsx` (surface cards, hairline, vivid-blue icons). Sanity-check `motion/*` defaults on navy.

**Files affected:** `src/components/header.tsx`, `src/components/resource-footer.tsx`, `src/components/motion/text-effect.tsx`, `src/components/motion/animated-group.tsx`

---

### Step 6: Restyle homepage sections

Apply the full system to `hero-section`, `about-section`, `results-section`, `video-section`, `connect-section`, `consult-cta`, then verify `page.tsx` composition (spacing, section order, ambient glow layering).

**Files affected:** `src/components/{hero,about,results,video,connect}-section.tsx`, `src/components/consult-cta.tsx`, `src/app/page.tsx`

---

### Step 7: Restyle the shared resource-page pattern

Restyle `accordion.tsx` first (used by all resource pages), then apply the migration map across the 14 `/claude-*` pages, `/ads-ai`, and `/60k-linkedin-post`: eyebrow pill, metallic h1, `surface-card` step blocks, vivid-blue links, primary `Button` CTAs, hairline borders, navy code blocks. Keep YouTube embed aspect ratio and accordion logic intact.

**Files affected:** `src/components/accordion.tsx`, `src/app/claude-*/page.tsx` (14), `src/app/ads-ai/page.tsx`, `src/app/60k-linkedin-post/page.tsx`

---

### Step 8: Restyle the marketing-brain surfaces

Restyle the chat page + `chat-message`, `context-drawer`, `expert-strip`, `source-card` to navy/silver/vivid-blue. Preserve all streaming/citation/memory logic and the markdown renderer; change only presentation (prose colors, citation chips, focus rings, card surfaces, expert ring/glow).

**Files affected:** `src/app/marketing-brain/page.tsx`, `src/app/marketing-brain/components/*.tsx`

---

### Step 9: Author the 20-test suite

Create `tests/playwright.config.ts` (webServer = `npm run build && npm run start` or dev server; projects: `desktop-chromium` + `mobile-iphone`), `tests/routes.ts` (the 18 routes), and the five spec files implementing the 20 tests below.

**The 20 tests (diverse angles):**

*Route health (routes.spec.ts)*
1. Every route returns HTTP 200.
2. Every route renders exactly one `<h1>`.
3. Header renders on every route (wordmark visible).
4. `ResourceFooter` renders on homepage + every resource/tool/lead-magnet page.
5. No uncaught console errors on any route load.
6. Homepage exposes the 5 main sections (about/results/watch/connect anchors resolve).

*Design tokens / brand fidelity (design-tokens.spec.ts)*
7. Computed `body` `background-color` equals navy `rgb(2,11,24)`.
8. The `vivid-blue` accent (`rgb(40,99,240)`) appears on at least one CTA per page.
9. DM Sans (display) and Space Grotesk/Inter are actually loaded (`document.fonts.check`).
10. No element uses legacy classes/colors: assert no `text-zinc-*`/`bg-white/*`/pure-black `rgb(0,0,0)` backgrounds remain on key pages (computed-style scan).
11. Borders use the hairline color (`rgba(208,214,224,0.1)`) on cards (computed-style spot check).

*Visual regression (visual.spec.ts)*
12. Homepage full-page screenshot matches baseline (desktop).
13. A representative `/claude-*` page matches baseline (desktop).
14. `/marketing-brain` empty state matches baseline (desktop).
15. Homepage matches baseline on mobile (iPhone viewport).

*Interactions (interactions.spec.ts)*
16. Header gains blur/navy background after scroll.
17. Accordion item opens and closes on click (height/aria changes).
18. A `ResourceFooter` card navigates to its route.

*Accessibility + content rules (a11y-content.spec.ts)*
19. axe-core: no critical color-contrast or heading-order violations on homepage + one resource page.
20. No em/en dashes (`—`/`–`) appear in rendered text on homepage, one resource page, and `/marketing-brain`.

**Files affected:** `tests/playwright.config.ts`, `tests/routes.ts`, `tests/e2e/*.spec.ts`

---

### Step 10: Build, run tests, fix, iterate

**Actions:**
- `npm run build` — must succeed (type + lint clean).
- `npm run test` — first run generates visual baselines (tests 12–15) and must pass 1–11, 16–20.
- Fix any leftover legacy classes surfaced by tests 10/11, contrast failures (19), em-dashes (20). Re-run until green.

**Files affected:** any flagged components; `tests/**-snapshots/`

---

### Step 11: Update docs

Update `CLAUDE.md` Tech Stack (fonts, `cva`/`radix-slot`, `ui/` primitives, `tests/` + `npm run test`) and add a short **Design System** subsection (tokens + signature classes). Add one line to `context/business-info.md` noting the shared identity.

**Files affected:** `CLAUDE.md`, `context/business-info.md`

---

### Step 12: Commit + push

**Actions:**
- `git add -A`
- Commit (message ends with the required `Co-Authored-By` trailer).
- `git push -u origin redesign-boldane-style` and open a PR with `gh` (per default in Open Questions #2).

**Files affected:** repo history

---

## Connections & Dependencies

### Files That Reference This Area

- `resource-footer.tsx` is rendered by the homepage and every resource/tool/lead-magnet page + the knowledge gallery — its restyle propagates everywhere (covered by test 4).
- `header.tsx` appears on every route (test 3).
- `accordion.tsx` is used by all `/claude-*` pages (test 17).
- `ui/button.tsx` / `ui/card.tsx` become new shared dependencies once adopted.

### Updates Needed for Consistency

- `CLAUDE.md` Tech Stack + new Design System note + test instructions.
- `context/` site-look references.
- Any future new resource page must use the new tokens/primitives (note this in `resource-footer.tsx`'s existing "when adding a resource" guidance area and in CLAUDE.md).

### Impact on Existing Workflows

- `/scrape-video`, marketing-brain API routes, retrieval logic, and SEO files (`sitemap.ts`, `robots.ts`, JSON-LD) are **design-agnostic and unchanged**.
- New `npm run test` becomes part of the pre-commit/pre-push routine for future UI work.
- Adds Playwright + two runtime deps; build output and Vercel deploy are unaffected (tests are dev-only).

---

## Validation Checklist

- [ ] `npm run build` succeeds with no type/lint errors.
- [ ] `npm run test` passes all 20 tests (visual baselines committed).
- [ ] `body` background is navy and `vivid-blue` accents render (tests 7–8).
- [ ] DM Sans + Space Grotesk load; Unbounded fully removed (test 9, grep).
- [ ] No `text-zinc-*` / `bg-white/*` / pure-black backgrounds remain (test 10 + manual grep).
- [ ] Headings use `.text-metallic` + `font-display`; wordmark uses `.brand-wordmark`.
- [ ] All 18 routes load, single `<h1>`, header + footer present (tests 1–6).
- [ ] Accordion, header-scroll, footer links work (tests 16–18).
- [ ] No critical a11y/contrast issues; no em/en dashes (tests 19–20).
- [ ] `CLAUDE.md` + `context/` updated.
- [ ] Branch pushed; PR opened.

## Success Criteria

1. Side by side, `oleg.ae` and `boldane.com` are visibly the same brand: identical fonts, navy/vivid-blue palette, metallic headings, surface cards, hairline borders, blue glow.
2. Every one of the 18 routes is fully restyled (no leftover black/zinc/white-opacity), with zero regressions in functionality (marketing-brain chat still streams + cites; accordions + embeds work).
3. All 20 tests pass; build is clean; work is committed and pushed.

---

## Notes

- **OG images / JSON-LD** (open SEO items in CLAUDE.md) are out of scope here but a natural follow-up — a Boldane-styled OG template would extend this redesign to social shares.
- **Marketing-brain** is the riskiest surface (most bespoke CSS, streaming state); restyle presentation only and lean on tests 12–14 + manual smoke of a live query.
- Watch Tailwind v4 specifics: tokens live in `@theme inline` (no `tailwind.config`); arbitrary values like `bg-vivid-blue/15` work because the token is registered.
- Keep an eye on contrast: `text-silver-muted` (`#8a93a3`) on navy can fail AA at small sizes — bump to `text-silver` where test 19 flags it.
- First test run establishes screenshot baselines; review them by eye before committing so we're not blessing a bad frame.

---

## Implementation Notes

**Implemented:** 2026-06-22

### Summary

- Ported Boldane's design system into `globals.css`: `@theme inline` tokens (navy / vivid-blue / silver / hairline) plus signature classes (`.text-metallic`, `.brand-wordmark`, `.surface-card`, `.surface-raised`, `.bg-dotgrid`, `.glow-blue`, `.eyebrow`).
- Swapped fonts in `layout.tsx`: Inter (`font-sans`) + DM Sans (`font-display`) + Space Grotesk (`font-body`); removed Unbounded.
- Added `Button` (CVA + Radix Slot) and `Card` primitives under `src/components/ui/`.
- Restyled all 13 shared components + all 18 routes (homepage sections, accordion, resource footer, 14 `claude-*` pages, `ads-ai`, `60k-linkedin-post`, both marketing-brain surfaces) via the color-migration map. Framer Motion, copy, and marketing-brain streaming/citation/memory logic left untouched.
- Authored the 20-test Playwright suite under `tests/` (route health, token fidelity, visual regression desktop + mobile, interactions, a11y + no-em-dash) with committed snapshot baselines. `npm run test` / `npm run test:update` wired up.
- Updated `CLAUDE.md` (Tech Stack, new Design System + Testing sections, `ui/` primitives) and `context/business-info.md`.
- Build clean (24 routes); full suite green (20 tests, all projects).

### Deviations from Plan

- Mobile test project runs on a Chromium iPhone-sized viewport (390x844, isMobile) instead of the WebKit `iPhone 13` device, to avoid a separate WebKit browser download. Same coverage intent, lighter install.
- Shared test constants were inlined into each spec (and `tests/routes.ts` removed) to sidestep a Playwright 1.61 + Node 22 tsconfig-paths resolver bug (`context.conditions?.includes is not a function`) that fired on relative `.ts` imports. Net behavior identical.
- Per-expert monogram accent gradients on the knowledge gallery and the amber/red chat status banners were intentionally kept (semantic color), only retuned to read on navy, rather than forced to blue.

### Issues Encountered

- Playwright could not import a sibling `.ts` module under the repo's `moduleResolution: "bundler"` tsconfig (resolver crash). Resolved by inlining constants and giving tests their own `tests/tsconfig.json` (node resolution), with `tests/` excluded from the app tsconfig.
- First test run reported the visual tests as failed while writing initial baselines (expected); regenerated with `npm run test:update`, then confirmed a fully green run.
