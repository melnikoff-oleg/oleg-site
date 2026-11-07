# Plan: LinkedIn packaging download guide

**Created:** 2026-11-07
**Status:** Implemented and locally verified
**Request:** Publish a simple LinkedIn packaging tool guide with real Kayla and Emily before/after examples and a public project download.

## Overview

### What This Plan Accomplishes

Add `/linkedin-packaging` in the site's established navy/Wix Madefor guide style. Readers see real profile transformations, download the standalone Python project, and follow three copyable setup steps.

### Why This Matters

The page turns a demonstrated marketing workflow into a usable public resource. It must be understandable without a video or an AI coding subscription.

## Current State

### Relevant Existing Structure

- `src/components/resource-page-shell.tsx` owns guide metadata, header, hero, setup, FAQ and footer.
- `src/components/guide.tsx` provides the written guide primitives.
- `src/components/resources-data.ts`, `src/lib/seo/sitemap-routes.ts`, and `src/app/llms.txt/route.ts` are the current discovery registries.
- `/instagram-viral-pages` is the nearest downloadable-tool guide.

### Gaps or Problems Being Addressed

There is no LinkedIn packaging page. The shared shell currently puts accordion setup before visual examples, while this page needs proof first and only three visible steps.

## Proposed Changes

### Summary of Changes

- Add the page, metadata, OG image and two small interactive components for comparison selection and operating-system commands.
- Extend the shell with optional pre-setup content and a custom setup body without changing existing defaults.
- Register the route, resource card, machine-readable summary and tests.
- Document the new page and verify desktop and 390px mobile behavior.

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `src/app/linkedin-packaging/page.tsx` | Short tool guide, examples, setup, deliverables and FAQ |
| `src/app/linkedin-packaging/layout.tsx` | Canonical, description, Open Graph and Twitter metadata |
| `src/app/linkedin-packaging/opengraph-image.tsx` | Site-style share card |
| `src/app/linkedin-packaging/profile-examples.tsx` | Accessible three-style before/after selection for two people |
| `src/app/linkedin-packaging/project.ts` | Shared public repository and ZIP URLs |
| `src/app/linkedin-packaging/setup-steps.tsx` | Three visible steps with Mac/Linux and Windows commands |
| `tests/e2e/linkedin-packaging.spec.ts` | Route, interaction, clipboard, metadata, layout and accessibility coverage |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `src/components/resource-page-shell.tsx` | Optional proof-first and custom-setup slots |
| `src/components/resources-data.ts` | New downloadable tool resource |
| `src/lib/seo/sitemap-routes.ts` | New route and honest modified date |
| `src/app/llms.txt/route.ts` | Tool summary |
| `src/lib/recommendations.json` | Hand-set relevant next steps, matching the existing fallback workflow |
| `tests/e2e/hero-cta.spec.ts` | Correct stale Instagram no-video fixture found by regression testing |
| `tests/e2e/routes.ts` | Add the route to shared route, metadata and mobile checks |
| `AGENTS.md` | Describe the page and current registration locations |

### Files to Delete (if any)

None.

## Design Decisions

### Key Decisions Made

1. **Proof first:** Two real before/after pairs immediately follow the hero; desktop pairs become stacked mobile cards.
2. **Three visible steps:** Download, setup, keys/run. A single operating-system switch prevents duplicated instructions.
3. **Honest time claim:** About three minutes of hands-on setup after Python and provider accounts are ready; signup, downloads and generation vary.
4. **No mandatory agent:** The Python CLI needs no Claude/Codex subscription. API services may charge separately.
5. **One Boldane presence:** Use the footer credit only.
6. **Short-guide tests:** Register general route checks, but keep this deliberately short guide out of the legacy 900-word article contract.

### Alternatives Considered

A duplicate custom page shell would drift from shared styles and SEO. A long accordion tutorial would obscure the simple workflow. A video placeholder would imply a video exists.

### Open Questions (if any)

None requiring user input. The sibling asset task supplies actual before-profile images, proposed after designs and dimensions; exact CLI usage is checked against the project README.

## Step-by-Step Tasks

### Step 1: Confirm content and implementation contracts

Read AGENTS, prime/context, the nearest guide, shell, route registries and current Python README. Save this plan before structural edits.

### Step 2: Build the page and interactions

Add metadata/OG, examples and setup components. Keep all content within 390px, with 44px controls, descriptive alt text, native disclosures and copy feedback. All examples are labeled proposed AI edits; nothing is published to LinkedIn.

### Step 3: Register and document

Update the actual current resource/sitemap/llms registries, shared test routes and AGENTS. Existing guide defaults remain unchanged.

### Step 4: Validate and inspect

Run TypeScript/build, relevant unit checks and Playwright tests against a production server. Inspect a real 390px mobile screenshot and a desktop screenshot. No provider calls or paid generations occur in tests.

## Connections & Dependencies

### Files That Reference This Area

ResourceFooter reads RESOURCES; sitemap and llms use SITEMAP_ROUTES; route checks read tests/e2e/routes.ts. The shell emits Article, Breadcrumb, FAQ and HowTo schema.

### Updates Needed for Consistency

Keep public repository URL and ZIP branch (`main`) aligned with the release task. Keep all command examples aligned with setup scripts and CLI output names.

### Impact on Existing Workflows

Existing pages keep the same render path. The new page is a static guide with only local UI interactions and no credentials or generation backend.

## Validation Checklist

- [x] Production build passes.
- [x] Both subjects have real before images and three working after directions.
- [x] Mac and Windows setup/run commands are correct and copyable.
- [x] Metadata, sitemap, llms and resource registration are complete.
- [x] No horizontal page overflow at 390px; pairs stack and controls remain tappable.
- [x] Accessibility and schema checks pass.
- [x] AGENTS reflects the new page and registration files.

## Success Criteria

1. `/linkedin-packaging` renders a clear download and three-step workflow.
2. Real before/after examples work on desktop and mobile without clipping.
3. The guide accurately describes prerequisites, time, costs, outputs and review responsibility.

## Notes

Parent task owns public release, image files, commits, push and deployment. This worktree contains only the site implementation and verification.

## Verification results

- Production build passed with Next.js 15.5.15; the new page is statically rendered (129 kB first-load JS).
- Ten new Playwright cases passed on desktop and 390px mobile: proof/order, all images, independent style controls, exact OS commands and clipboard behavior, no overflow, 44px controls, canonical/schema and critical accessibility/heading checks.
- Four shared-shell CTA checks passed across the existing Instagram and Opus guides. The Instagram fixture originally expected a nonexistent video; it now accurately checks the setup section.
- Parent independently ran all 110 site unit tests successfully; six sitemap tests also passed in this task; `git diff --check` passed.
- Actual desktop and mobile comparison images were inspected. Setup captures wait for the shared reveal animation to finish.
- Local production server left on port 3017 for the parent task's independent review. Parent owns public release, commit and deployment.

- Final copy-only correction: terminal introduction now says “commands below” because setup, settings and create are three commands. Parent will build this final copy for deployment.

## Cold-visitor review follow-up

Before deployment, clarify what the visitor can reproduce: company-branded examples are curated and advanced, while the quickstart creates a reviewable draft using the selected reference palette/fonts. Add a visible standard-reference worked example after the comparisons, readable selected headlines and full-size links. Default comparison previews to Clare and explicitly label those controls as previews. Add a separate ten-style setup selector defaulting to `clarekitching` that updates the copied command. Add a compact visible Python/provider prerequisite checklist without changing the three-step workflow or time qualifier. Rebuild and verify default states, style selection/copy, mobile layout and all example images.

## Cold-visitor review follow-up

Before deployment, clarify what the visitor can reproduce: company-branded examples are curated and advanced, while the quickstart creates a reviewable draft using the selected reference palette/fonts. Add a visible standard-reference worked example after the comparisons, readable selected headlines and full-size links. Default comparison previews to Clare and explicitly label those controls as previews. Add a separate ten-style setup selector defaulting to `clarekitching` that updates the copied command. Add a compact visible Python/provider prerequisite checklist without changing the three-step workflow or time qualifier. Rebuild and verify default states, style selection/copy, mobile layout and all example images.

## Concise revision requested by Oleg

Oleg requested roughly 70% less text and optional content folded away. The revised page keeps both visual comparisons, short prerequisite/cost/custom-branding notes, and three core steps: download/install, add keys, generate. It removes the repeated written guide and FAQ; native closed disclosures hold onboarding, terminal help, readable example headlines, the reference-color example and advanced options. The preview assets and repository are unchanged.

Independent rendered-page measurement (excluding shared navigation/footer and unselected menu options): 1,143 → 209 visible words, an 81.7% reduction. With every disclosure expanded: 1,195 → 403 words, a 66.3% reduction. Production build and all 10 updated desktop/mobile browser checks passed, including keyboard disclosure behavior and exact command copying. Mobile and desktop screenshots were visually inspected.
