# Plan: Add /claude-outreach Resource Page

**Created:** 2026-05-12
**Status:** Implemented
**Request:** Create a new page at /claude-outreach — a companion resource page for a YouTube video about using Claude Code for cold outreach and closing deals on LinkedIn/Instagram/Facebook. Modeled after buildauthority.ai/claude-marketing schema (accordion steps, embedded video, resource grid) but without the CTA section.

---

## Overview

### What This Plan Accomplishes

Adds a new route `/claude-outreach` to the landing site — a step-by-step setup guide page that accompanies Oleg's YouTube video on using Claude Code for cold outreach to close sales. The page follows the same schema as buildauthority.ai/claude-marketing: accordion-based steps and an embedded YouTube video. No CTA, no resource grid footer (for now).

### Why This Matters

Each YouTube video needs a companion page where viewers can follow along with setup instructions and find related resources. This page turns a video view into a deeper engagement — visitors bookmark it, return to it, and follow the steps at their own pace. It's the same pattern proven on buildauthority.ai.

---

## Current State

### Relevant Existing Structure

- `src/app/page.tsx` — main landing page (single-page, no sub-routes exist yet)
- `src/app/layout.tsx` — root layout with Inter + Unbounded fonts, dark theme
- `src/app/globals.css` — dark theme globals, Tailwind imports
- `src/components/` — existing components for the main landing page
- `src/lib/utils.ts` — `cn()` utility
- No existing sub-pages or route directories

### Gaps or Problems Being Addressed

- The site currently has no sub-pages — it's a single-page site. This is the first companion/resource page.
- There's no accordion component yet — needs to be built.
- YouTube video viewers have no place to find setup instructions and resources for this video.

---

## Proposed Changes

### Summary of Changes

- Create a new Next.js route at `src/app/claude-outreach/page.tsx`
- Build a reusable accordion component for the step-by-step guide
- Add the page with: hero/title, embedded YouTube video, and accordion setup steps
- No CTA/upsell section, no resource grid footer (for now)
- Include a simple back-link to the main page in the header area

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `src/app/claude-outreach/page.tsx` | The /claude-outreach route — full page component |
| `src/components/accordion.tsx` | Reusable accordion component (click-to-expand steps) |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `CLAUDE.md` | Add /claude-outreach to the site structure docs, note the new resource page pattern |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Keep it in the same site, not a separate repo**: This is the same personal brand site — resource pages live here alongside the main landing page. Consistent styling, shared layout.

2. **Build a reusable Accordion component**: The buildauthority.ai/claude-marketing pattern uses expandable steps. Instead of inlining the accordion logic, create `src/components/accordion.tsx` so future video companion pages can reuse it.

3. **No header nav on resource pages**: The main landing page has a floating header with section anchors (about, results, watch, connect). Resource pages don't have those sections — instead, show a minimal top bar with "oleg melnikov" linking back to `/` and a YouTube link. Reuse the existing `Header` component but on resource pages we'll use a simpler inline header since the nav items don't apply.

4. **Dark theme, same design language**: Match the main site's aesthetic — dark backgrounds, zinc color palette, Inter font, rounded-2xl borders, white/10 border accents, subtle animations.

5. **YouTube embed via iframe (not thumbnail-click)**: Since this is a companion page for a specific video, embed it directly as an iframe. The video IS the content — visitors came here from it. Use `lite-youtube-embed` pattern (lazy iframe) or a simple responsive iframe wrapper.

6. **Placeholder video ID**: Use `JQQhT0edXXw` for now. Easy to swap later — it's a single constant at the top of the file.

7. **Outreach-specific steps**: Three steps: install VS Code, install Claude Code, get API keys (Apify + Kie.ai). Then a sample prompt showing how to kick off the outreach app with Claude Code. No project files to download — Claude Code generates everything from the prompt.

8. **No CTA section, no resource grid**: Per request, skip both the upsell block and the footer resource grid. Keep it clean — just the video, the steps, and the footer.

### Alternatives Considered

- **Build on buildauthority.ai instead**: Rejected — Oleg wants this on his personal landing site, building out the content hub here.
- **Static HTML page**: Rejected — inconsistent with the Next.js app, loses shared layout/fonts/styling.
- **Tabs instead of accordions**: Rejected — accordions are the proven pattern from the reference page, and they work better for sequential steps.

### Open Questions

None — all resolved. Steps, APIs, and page structure are confirmed.

---

## Step-by-Step Tasks

### Step 1: Create the Accordion Component

Build a reusable, animated accordion component that matches the dark theme.

**Actions:**

- Create `src/components/accordion.tsx`
- Client component ("use client") using React state for open/close
- Props: `items: Array<{ title: string; content: React.ReactNode }>`, optionally `defaultOpen?: number`
- Each item: clickable header with step number + title, expandable content area
- Styling: `border border-white/10 bg-white/[0.03] rounded-2xl` (matches results-section cards)
- Smooth height animation using Framer Motion's `AnimatePresence` + `motion.div` with `layout`
- Chevron icon rotates on open/close
- Only one item open at a time (close others when one opens)

**Files affected:**

- `src/components/accordion.tsx`

---

### Step 2: Create the /claude-outreach Page

Build the full page component with all sections.

**Actions:**

- Create `src/app/claude-outreach/page.tsx`
- Export metadata for SEO: title "Claude Code for Outreach — Oleg Melnikov", description about using Claude Code for cold outreach
- Page structure (top to bottom):

**A. Minimal header bar:**
- "oleg melnikov" linking to `/` (left side, Unbounded font)
- YouTube icon+link (right side)
- Styled consistently with main header but static (no scroll behavior needed)

**B. Hero / title area:**
- Small label: "free resource"
- H1: "claude code for outreach" (lowercase, consistent with site style)
- Subtitle: "follow these steps to set up your ai outreach system. click each step for full instructions."
- Centered, max-w-3xl

**C. Embedded YouTube video:**
- Responsive 16:9 iframe wrapper
- Video ID: `JQQhT0edXXw` (placeholder, defined as a constant at the top)
- `rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden` (matches existing card styling)
- Allow: accelerometer, autoplay, clipboard-write, encrypted-media, gyroscope, picture-in-picture
- Max-w-3xl, centered

**D. Setup steps (Accordion):**
- Section heading: "setup guide"
- Use the Accordion component from Step 1
- 4 steps:

  1. **install visual studio code**
     - Download and install VS Code from code.visualstudio.com
     - "this is where you'll run claude code and build your outreach app."

  2. **install claude code**
     - Open terminal in VS Code (Terminal → New Terminal)
     - Run: `npm install -g @anthropic-ai/claude-code`
     - Requires Node.js 18+ — link to nodejs.org if they need it
     - "once installed, type `claude` in the terminal to start."

  3. **get your api keys**
     - Two services needed:
     - **Apify** (apify.com) — for scraping social media platforms. Scrapes leads and information about them from LinkedIn, Instagram, or Facebook. Sign up → Settings → Personal API Token.
     - **Kie.ai** (kie.ai) — for generating visuals with value to send to prospects. Sign up → generate API key.
     - "you'll paste these keys when claude code asks for them, or put them in a .env file."
     - Show code block with .env format:
       ```
       APIFY_API_KEY=your_apify_key_here
       KIE_API_KEY=your_kie_ai_key_here
       ```

  4. **start building with claude code**
     - This is the key step — no project files to download. Claude Code builds the app from a prompt.
     - Open terminal, type `claude`, then give it a prompt like:
     - Show a sample prompt in a styled blockquote/code block:
       > "Create a web application where I can plug in a URL of a person — it can be LinkedIn, Instagram, or Facebook. On the backend, scrape information about this person using Apify, then generate a personalized outreach message with a visual using Kie.ai. The message should provide value based on what I'm selling. I'm selling [your service] through [LinkedIn/Instagram/Facebook]."
     - "adapt the prompt to your use case. in oleg's case, he sells content creation services to founders and generates example content as the value piece."
     - "claude code will build the full web app for you — frontend, backend, API integrations, everything."

- Each step's content: numbered sub-instructions, code blocks where relevant (styled with `bg-white/[0.03] rounded-lg p-4 font-mono text-sm`)
- External links open in new tabs

**E. Footer:**
- "© 2026 oleg melnikov" (matching main page footer)

**Files affected:**

- `src/app/claude-outreach/page.tsx`

---

### Step 3: Add Framer Motion Animations

Add subtle entrance animations consistent with the main site.

**Actions:**

- Use the same `fadeUp` variant pattern used across all existing sections
- Animate: hero text, video embed, accordion section
- Use `whileInView` with `viewport={{ once: true, margin: "-100px" }}` (same as existing sections)

**Files affected:**

- `src/app/claude-outreach/page.tsx` (inline animations, same pattern as existing components)

---

### Step 4: Test and Verify

Run the dev server and verify the page works correctly.

**Actions:**

- Run `npm run dev`
- Navigate to `localhost:3000/claude-outreach`
- Verify:
  - Page loads with dark theme, correct fonts
  - YouTube video embeds and plays
  - Accordions open/close smoothly, only one at a time
  - Code blocks and sample prompt render correctly inside accordions
  - "oleg melnikov" link navigates back to `/`
  - Mobile responsive: stacked layout, readable at 375px width
  - No console errors
- Run `npm run build` to verify production build succeeds

**Files affected:**

- None (testing only)

---

### Step 5: Update CLAUDE.md

Document the new page and the resource page pattern.

**Actions:**

- Add `/claude-outreach` to the Site Structure section in CLAUDE.md
- Note the new pattern: resource/companion pages for YouTube videos
- Mention the reusable Accordion component

**Files affected:**

- `CLAUDE.md`

---

## Connections & Dependencies

### Files That Reference This Area

- `src/app/layout.tsx` — shared layout wraps this new route automatically (no changes needed)
- `src/app/globals.css` — global styles apply to the new page (no changes needed)
- `CLAUDE.md` — needs updating to document new page

### Updates Needed for Consistency

- CLAUDE.md updated with new route and component (Step 5)
- The main page's header doesn't need changes — resource pages use their own minimal header

### Impact on Existing Workflows

- No impact on the existing landing page — this is a new route
- Establishes a pattern for future video companion pages (can create `/claude-seo`, `/claude-content`, etc. following the same template)

---

## Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] `/claude-outreach` loads with correct dark theme and fonts
- [ ] YouTube video embeds correctly in a responsive container
- [ ] All 4 accordion steps expand/collapse with smooth animation
- [ ] Only one accordion is open at a time
- [ ] Code blocks inside accordions are styled correctly (monospace, dark bg)
- [ ] Sample prompt in step 4 is readable and well-styled
- [ ] All external links (VS Code, Node.js, Apify, Kie.ai) open in new tabs
- [ ] "oleg melnikov" header link navigates back to `/`
- [ ] Page is mobile responsive (375px+)
- [ ] `npm run build` succeeds without errors
- [ ] CLAUDE.md updated to reflect new page

---

## Success Criteria

The implementation is complete when:

1. A visitor can navigate to `/claude-outreach` and see a polished resource page matching the site's dark aesthetic
2. The YouTube video is embedded and playable directly on the page
3. 4 setup steps are presented in expandable accordions with formatted content, code blocks, and a sample Claude Code prompt
4. The page is mobile responsive and production-build clean

---

## Notes

- The video ID `JQQhT0edXXw` is a placeholder — swap it for the real one when the video drops. It's a single constant at the top of the page file.
- This establishes a reusable pattern: for each new YouTube video, create a new route under `src/app/{slug}/page.tsx` reusing the Accordion component and the same page structure.
- The Accordion component is intentionally built as a standalone reusable component — future pages like `/claude-seo`, `/claude-content` etc. can import it directly.
- Resource grid footer can be added later when there are more companion pages to cross-link.

---

## Implementation Notes

**Implemented:** 2026-05-12

### Summary

Built the `/claude-outreach` resource page with all 4 setup steps (install VS Code, install Claude Code, get API keys for Apify + Kie.ai, start building with Claude Code prompt). Page includes embedded YouTube video, animated accordion steps, minimal header, and footer. Added a separate `layout.tsx` for SEO metadata since the page component is a client component. Updated CLAUDE.md with the new resource page pattern.

### Deviations from Plan

- Added `src/app/claude-outreach/layout.tsx` for metadata — client components can't export `metadata` in Next.js, so a server layout handles it.

### Issues Encountered

- Port 3000 was occupied by another project (Authority AI Admin). Used port 3001 for testing.
- Browser automation extension unavailable — verified page content via curl and production build instead of visual browser testing.
