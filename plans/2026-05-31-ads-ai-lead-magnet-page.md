# Plan: Ads AI Lead Magnet Page

**Created:** 2026-05-31
**Status:** Implemented
**Request:** Add a new lead magnet page at `/ads-ai` for the open-source Ads AI tool with setup instructions and GitHub download link

---

## Overview

### What This Plan Accomplishes

Creates a new page at `/ads-ai` on oleg.ae that serves as a lead magnet for the open-source Ads AI tool (github.com/melnikoff-oleg/ads-ai). The page explains what the tool does, links to the GitHub repo for download, and provides a setup guide based on the project's GETTING-STARTED.md — extended with VSCode and Claude Code setup instructions.

### Why This Matters

This is a different type of resource page than the existing YouTube companions. It drives traffic to a free open-source tool, positions Oleg as someone who builds real AI products (not just tutorials), and creates an SEO-rich page targeting "AI ad creator", "AI ad generator", "Meta ads AI" keywords. The GitHub repo link + setup guide format turns visitors into users of the tool — a stronger lead magnet than a video alone.

---

## Current State

### Relevant Existing Structure

- 13 existing resource pages at `src/app/claude-*/` (YouTube video companions)
- Each follows the pattern: `page.tsx` (client component) + `layout.tsx` (metadata)
- All use: `Accordion` for steps, `ResourceFooter` for cross-links, `ArticleJsonLd` for SEO
- `src/components/resource-footer.tsx` — resources array needs new entry
- `src/app/sitemap.ts` — needs new URL entry
- No existing resource page has a GitHub download link or tool-focused layout

### Gaps or Problems Being Addressed

- No lead magnet page exists for the Ads AI tool
- Existing resource pages are all YouTube companions — this introduces a "free tool" format
- The ads-ai project has a solid GETTING-STARTED.md but no public-facing landing page explaining how to get started with VSCode + Claude Code specifically

---

## Proposed Changes

### Summary of Changes

- Create new route at `src/app/ads-ai/` with `page.tsx` and `layout.tsx`
- Page has: hero with "AI Ads Creator" title, GitHub download CTA, "how it works" overview, accordion setup guide
- Setup guide adapts GETTING-STARTED.md content + adds VSCode & Claude Code setup steps
- No YouTube video embed (can be added later)
- Add entry to `resource-footer.tsx` resources array
- Add URL to `sitemap.ts`
- Update CLAUDE.md resource pages list

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/ads-ai/page.tsx` | Main page component — hero, GitHub CTA, how it works, setup accordion |
| `src/app/ads-ai/layout.tsx` | Next.js metadata (title, description, keywords, OG, Twitter, canonical) |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/resource-footer.tsx` | Add ads-ai entry to resources array |
| `src/app/sitemap.ts` | Add `https://oleg.ae/ads-ai` entry |
| `CLAUDE.md` | Add `/ads-ai` to resource pages list |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Slug is `/ads-ai` not `/claude-ads-ai`**: This is a standalone tool, not a Claude Code tutorial. The slug matches the GitHub repo name and is cleaner.

2. **Hero badge says "free open source tool" instead of "free resource"**: Differentiates this from the YouTube companion pages. Signals that this is a downloadable product.

3. **GitHub download CTA as primary button in hero**: The main action is to clone the repo. Uses a prominent button with GitHub icon, linking to `https://github.com/melnikoff-oleg/ads-ai`.

4. **"How it works" section before setup guide**: Brief 4-step overview (brand → competitors → analysis → create) with icons, adapted from GETTING-STARTED.md's "How It Works — 4 Steps" section. Gives visitors context before they commit to the setup.

5. **Setup accordion extends GETTING-STARTED.md**: Steps are: (1) install prerequisites (Node.js, VSCode, Claude Code), (2) clone the repo & set up env vars, (3) install & run, (4) collect brand context, (5) find competitors, (6) analyze & create ads, (7) using Claude Code commands. New additions vs GETTING-STARTED.md: VSCode installation, Claude Code extension setup, how to use the `/collect-brand` slash command from within VSCode.

6. **No video embed section for now**: Will be added later when a YouTube video is published. The page structure works without it.

7. **ArticleJsonLd still used but without video fields**: Need to handle the case where there's no video — either make videoId/videoTitle optional in the component, or create the JSON-LD inline without the video field.

8. **Lucide icon: `Sparkles`**: For the resource footer entry — represents AI-generated/creative content. Distinct from existing icons.

### Alternatives Considered

- **Full-width hero with screenshot**: Would look great but we don't have app screenshots in this repo. Can be added later.
- **Separate "tool" page template**: Over-engineering for one page. Following the existing resource page pattern with minor variations is simpler.

### Open Questions

None — all decisions are resolved.

---

## Step-by-Step Tasks

### Step 1: Create layout.tsx with metadata

Create `src/app/ads-ai/layout.tsx` following the exact pattern of `claude-interviewer/layout.tsx`.

**Metadata values:**
- Title: `"AI Ads Creator — Free Open Source Tool"`
- Description: `"Clone winning Meta ads with AI. Ads AI studies your competitors' proven ads and generates new ad concepts for your brand — copy, visuals, and video scripts. Free and open source."`
- Keywords: `["AI ad creator", "AI ad generator", "Meta ads AI", "AI advertising tool", "Claude Code", "AI marketing tool", "competitor ad analysis", "AI ad copy", "open source AI tool", "Claude Code for marketing"]`
- Canonical: `https://oleg.ae/ads-ai`
- OG type: `article`
- Published/modified: `2026-05-31`

**Files affected:**
- `src/app/ads-ai/layout.tsx` (create)

---

### Step 2: Create page.tsx

Create `src/app/ads-ai/page.tsx` following the resource page pattern but adapted for a tool page.

**Structure:**

```
ArticleJsonLd (inline, no video)
Header (same minimal header as other resource pages)
Hero section:
  - Badge: "free open source tool"
  - H1: "AI ads creator"
  - Subtitle: "study your competitors' proven Meta ads, analyze what's working, and generate new ad concepts for your brand — AI-written copy, AI-generated visuals, and video scripts."
  - Two CTAs:
    1. Primary: "download on github" → https://github.com/melnikoff-oleg/ads-ai (GitHub icon)
    2. Secondary: "setup guide ↓" → scroll to #setup

"How it works" section:
  - H2: "how it works"
  - 4 cards/items in a grid:
    1. "collect brand" — scrape your website & Instagram, build brand profile
    2. "find competitors" — search Meta Ad Library, rank by performance
    3. "analyze patterns" — AI finds winning hooks, copy structures, visual approaches
    4. "create ads" — generate concepts with AI copy + AI visuals

Setup guide section (id="setup"):
  - H2: "setup guide"
  - Accordion with these steps:

  Step 1: "install prerequisites"
    - Node.js 18+ (link to nodejs.org)
    - VSCode (link to code.visualstudio.com) — recommend for the best experience with Claude Code
    - Claude Code — install the VSCode extension from the marketplace, or use the CLI (`npm install -g @anthropic-ai/claude-code`). Needs a $19/mo subscription.

  Step 2: "clone the repo and set up API keys"
    - `git clone https://github.com/melnikoff-oleg/ads-ai.git && cd ads-ai`
    - `cp .env.example .env`
    - Table of API keys (from GETTING-STARTED.md):
      | ANTHROPIC_API_KEY | Claude AI — ad copy, analysis, QC | Required | console.anthropic.com |
      | GEMINI_API_KEY | Gemini — brand image analysis | Required | aistudio.google.com/apikey |
      | FIRECRAWL_API_KEY | FireCrawl — website scraping | If using URL | firecrawl.dev |
      | APIFY_API_TOKEN | Apify — Instagram + Meta Ad Library | Required | console.apify.com |
      | KIE_AI_API_KEY | Kie.ai — AI image generation | Required | kie.ai |

  Step 3: "install and run"
    - `cd app && npm install`
    - `npm run dev`
    - Open http://localhost:3000

  Step 4: "collect your brand context"
    - Option A: Web form at /brand — enter URL + Instagram handle
    - Option B: Open Claude Code in the project folder, run `/collect-brand`
    - Explain what happens: crawls site, scrapes IG, extracts products, AI-analyzes visuals

  Step 5: "find competitors and analyze"
    - Go to /competitors — search Meta Ad Library by keywords
    - Then /analysis — Claude analyzes top 25 ads, extracts hooks and patterns
    - What to look for: days running (longer = profitable), creative diversity

  Step 6: "generate your ads"
    - Go to /create — set count, pick products, generate
    - Parallel batches of 3, ~2 min per batch
    - Each concept: AI copy + AI-generated image, side-by-side with reference
    - QC runs automatically

  Step 7: "using Claude Code in your project"
    - Open the ads-ai folder in VSCode
    - Open Claude Code (Cmd+Shift+P → "Claude Code" or click the sidebar icon)
    - Run `/collect-brand` for guided brand context collection
    - Claude Code can also help you customize the tool, add features, or debug issues

ResourceFooter
```

**Key pattern differences from existing resource pages:**
- Two CTA buttons in hero instead of none
- "How it works" overview section (new, not in other resource pages)
- No YouTube video embed section
- JSON-LD written inline without video object (since ArticleJsonLd component requires videoId)

**For JSON-LD without video:** Write the JSON-LD `<script>` tag inline in the page component, same structure as `ArticleJsonLd` but omitting the `video` field. This avoids modifying the shared component for one page.

**Files affected:**
- `src/app/ads-ai/page.tsx` (create)

---

### Step 3: Add to resource footer

Add a new entry to the `resources` array in `src/components/resource-footer.tsx`.

**New entry:**
```ts
{
  slug: "ads-ai",
  title: "AI Ads Creator",
  description: "Study competitors' Meta ads with AI and generate ad concepts — copy, visuals, and video scripts",
  icon: Sparkles,
}
```

**Actions:**
- Import `Sparkles` from lucide-react (add to the existing import)
- Add the entry at the end of the resources array

**Files affected:**
- `src/components/resource-footer.tsx`

---

### Step 4: Add to sitemap

Add a new entry to `src/app/sitemap.ts`.

**New entry:**
```ts
{
  url: "https://oleg.ae/ads-ai",
  lastModified: new Date(),
  changeFrequency: "monthly",
  priority: 0.8,
},
```

**Files affected:**
- `src/app/sitemap.ts`

---

### Step 5: Update CLAUDE.md

Add `/ads-ai` to the resource pages list in the "Site Structure" section.

**Add to the list:**
```
- `/ads-ai` — AI ads creator (free open source tool)
```

**Also note** in the resource pages description that this page follows a different pattern (tool download + setup guide, no YouTube video).

**Files affected:**
- `CLAUDE.md`

---

### Step 6: Build verification

Run `npm run build` to verify no TypeScript errors or build issues.

**Actions:**
- Run `npm run build` from the project root
- Fix any errors

**Files affected:**
- None (verification only)

---

## Connections & Dependencies

### Files That Reference This Area

- `src/components/resource-footer.tsx` — cross-links all resource pages (must add new entry)
- `src/app/sitemap.ts` — lists all pages for SEO (must add new entry)
- `CLAUDE.md` — documents all resource pages (must update)

### Updates Needed for Consistency

- Resource footer needs the new page so it appears in cross-links on all 13 existing resource pages
- Sitemap must include the new URL for search engine discovery
- CLAUDE.md documentation must list the new route

### Impact on Existing Workflows

- No impact on existing pages — they only gain a new cross-link in the footer
- The new page follows the established pattern so it integrates naturally

---

## Validation Checklist

- [ ] `src/app/ads-ai/page.tsx` created and renders correctly
- [ ] `src/app/ads-ai/layout.tsx` created with proper metadata
- [ ] Page accessible at `localhost:3000/ads-ai`
- [ ] GitHub link points to `https://github.com/melnikoff-oleg/ads-ai`
- [ ] Setup accordion has 7 steps covering prerequisites, clone, env, run, brand, competitors, Claude Code
- [ ] "How it works" section shows 4-step overview
- [ ] Page appears in resource footer on all other resource pages
- [ ] Page appears in sitemap
- [ ] `npm run build` passes
- [ ] CLAUDE.md updated with new route

---

## Success Criteria

The implementation is complete when:

1. Visiting `localhost:3000/ads-ai` shows a polished lead magnet page with GitHub download CTA, 4-step overview, and 7-step setup accordion
2. The page appears in the resource footer cross-links on all existing resource pages
3. `npm run build` passes with no errors
4. CLAUDE.md and sitemap are updated

---

## Notes

- When a YouTube video is published for ads-ai, add the video embed section between the setup guide and footer (same pattern as other resource pages), and update the JSON-LD to include the video object
- The page could later include screenshots of the tool's UI (dark glass-morphism design) — would make the "how it works" section much stronger
- Consider adding a "see it in action" section with GIFs/screenshots once the tool is more polished
- This is the first non-`claude-*` prefixed resource page — it sets a precedent for tool-specific lead magnets

---

## Implementation Notes

**Implemented:** 2026-05-31

### Summary

Created the `/ads-ai` lead magnet page with hero (GitHub CTA + setup guide scroll link), 4-step "how it works" overview, 7-step setup accordion, and cross-linked resource footer. Updated sitemap, resource footer, and CLAUDE.md. Build passes cleanly.

### Deviations from Plan

None.

### Issues Encountered

None.
