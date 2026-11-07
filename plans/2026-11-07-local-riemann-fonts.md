# Plan: Bundle the Riemann guide fonts locally

**Created:** 2026-11-07
**Status:** Implemented and verified
**Request:** Unblock the production build without changing the existing Riemann guide's typography or UI.

## Overview

The deployed Next 15 Google font loader assumes font URLs end in a file extension. Its regular expression returns null for a Google response used by the Riemann route, failing deployment before the new LinkedIn guide can publish. Replace only that route's remote font declarations with local, unmodified official Google Fonts TTF files.

## Current State

`src/app/claude-riemann-hypothesis/layout.tsx` requests Nunito 600/800/900 and Comic Neue 700 through `next/font/google`. CSS uses `--font-nunito` and `--font-comic`; `FontKickoff` starts loading each requested weight. Both fonts have `preload: false` and `display: swap`. Root Wix Madefor fonts work and stay untouched.

## Changes

1. Save baseline desktop and 390px screenshots after fonts load.
2. Download Nunito's full variable TTF and Comic Neue Bold TTF from pinned commits in the official `google/fonts` repository. Store the original SIL OFL licenses and a provenance README with source URLs and SHA-256 hashes.
3. Use `next/font/local` with the same three Nunito weight descriptors and one Comic Neue descriptor, preserving variables, preload/display behavior and FontKickoff calls.
4. Document this route-specific exception in AGENTS.
5. Build, inspect screenshots and font-loading/overflow smoke checks on the affected route, and rerun LinkedIn guide tests against the resulting production build.

## Scope and Alternatives

Use original full TTF files rather than unknown build-cache font hashes or a local Next loader patch. The larger full font files avoid conversion/subsetting and preserve glyphs. No route markup, content, page CSS, other fonts or dependency versions change.

## Validation

- [x] Original licenses inspected; source revisions and hashes recorded.
- [x] Production build passes with the local route fonts.
- [x] Requested weights load from same-origin assets; variables, display and preload settings are unchanged.
- [x] Desktop and 390px screenshots inspected; no horizontal overflow.
- [x] Existing LinkedIn guide browser tests pass.

## Deployment

Parent owns commit, push and production deployment. No generated screenshots enter the site repository.

## Results

Production build passed. All 12 focused Playwright cases passed: two font/layout checks across desktop and 390px mobile, plus ten LinkedIn guide cases. The font checks verify the exact requested weights load, all use swap, no font preloads appear, only two same-origin TTF files are fetched, and neither viewport has horizontal overflow. Screenshots were inspected at both sizes; the desktop before/after first-slide comparison had zero pixels differing by more than 8 channel levels. No page CSS, content or FontKickoff code changed.
