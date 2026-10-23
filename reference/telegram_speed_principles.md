---
type: reference
description: What makes Telegram's clients feel instant, from its own API docs and web-client source, and how each idea was applied to the oleg.ae homepage on 2026-10-16 and to every page on 2026-10-23.
created: 2026-10-16
updated: 2026-10-23
---

# Telegram's speed principles, applied to the homepage

Telegram has published no engineering post on why it feels fast, so this is read
from what it does publish: the MTProto API schema, and the source of its two web
clients (Web K, morethanwords/tweb, and Web A, Ajaxy/telegram-tt, the client at
web.telegram.org/a that won Telegram's Lightweight Client Contest).

## 1. Something real on screen before any file arrives

- Telegram: every photo carries an inline "stripped" size, a tiny compressed JPEG
  shipped inside the message itself, and animated stickers carry a compressed SVG
  outline under 300 bytes, so the client paints a shape before it fetches
  anything (PhotoSize in the API schema).
- Here: the hero photo is a static import with placeholder="blur", so Next
  inlines a blurred preview in the HTML; the preview video gets a ~1 KB inline
  thumbnail made by scripts/stripped-thumb.py. Neither box is ever empty.

## 2. Several sizes of every image, and the client asks for the one it needs

- Telegram: PhotoSize lists a ladder of sizes (stripped, small thumb, larger
  variants, progressive JPEG) and the full file is fetched only on demand.
- Here: next/image serves AVIF/WebP at the width each screen needs, and
  deviceSizes stops at 1920, because nothing on the site is drawn wider than
  ~960 CSS px. Before the cap, a 3x tablet pulled the 3840 hero.

## 3. Load what is visible first, and only when it is about to be seen

- Telegram (tweb src/components/lazyLoadQueue.ts and lazyLoadQueueBase.ts): media
  goes into a queue watched by an IntersectionObserver; an item that becomes
  visible is moved ahead of the rest; at most PARALLEL_LIMIT = 8 load at once;
  queue processing is throttled to 8 ms.
- Here: the video poster loads one viewport ahead and the mp4 200 px ahead
  (LazyVideo); icons use native lazy loading; Story, Results, Watch and Connect are
  content-visibility:auto, so their images are not even considered until the
  section nears the screen. Before scrolling the page fetches the hero and the
  icons just below it, nothing else. The page has a dozen media items, so a
  custom parallel cap would add code for no measured gain; the browser's own
  per-host limit does that job.

## 4. Never let loading fight an animation

- Telegram: one shared subscription locks every live load queue while a "heavy
  animation" runs and unlocks it after (lazyLoadQueue.ts).
- Here: the only animation at load is the hero copy fade, which is CSS on the
  compositor, and no media download is triggered during it. The hero photo has
  no entrance animation at all: it shows the frame it arrives.

## 5. A tiny core instead of a heavy framework

- Telegram: Web A runs on Teact, its own small reimplementation of React's
  component model, with nearly zero dependencies.
- Here: Next and React are fixed, so the lever is how much runs in the browser.
  The hero, text effects and grouped entrances are now server components that
  ship no JavaScript of their own and are visible from the HTML; framer-motion is
  not on the homepage; client code is the header, the scroll reveals, the section
  links and the video loader. Homepage JS is 126 KB transferred, almost all of it
  the shared Next/React runtime.

## 6. Cache everything that does not change

- Telegram: a file is addressed by an id and never changes, so the client caches
  it forever.
- Here: Next's hashed /_next/static files are immutable and the hero is one of
  them (a static import); the preview video and its poster in public/ get a week
  of cache plus stale-while-revalidate.

## Measured result

scripts/perf-home.mjs and scripts/device-sweep.mjs, production build, slow 4G and
4x CPU throttle. Headline readable 2.3 s before, 1.06-1.08 s after on all 15
screens from 320 px to 2560 px; hero photo shown 3.3 s before, 0.77-1.04 s after;
CLS 0; no horizontal overflow on any screen; nothing below the fold fetched before
scroll on any screen.

## Lighthouse

Lighthouse 12.6.1, mobile, real (devtools) throttling: score 100, FCP 0.8 s,
LCP 0.9 s, TBT 0-10 ms, CLS 0 (three runs, production build). Two changes came
out of reading its trace: the hero words no longer animate filter: blur (up to
1.1 s of LCP render delay on a phone CPU), and the CSS is inlined into the HTML
(FCP 1.6 s to 0.8 s under the same throttle). Lighthouse's default simulated mode
reports LCP 2.7 s for the same build because it replays every script that
finished before the observed paint onto its model network; the applied-throttle
run and scripts/perf-home.mjs both measure the paint itself.

## 2026-10-23: every page, under 200 ms

The homepage pass left the rest of the site behind it. Measured cold with
`scripts/perf-pages.mjs` (production build, every public route, three
connections), the resource pages painted in ~76 ms on broadband but their
headline was not readable for 270-425 ms, /5-levels-ai took 711 ms, /ideas
sent its first byte after a second, and the Riemann page pulled 3.7 MB of
screenshots before anyone scrolled. Time to a readable headline (ms), before
and after:

| Page | Broadband desktop | 4G phone | Slow 4G phone |
|---|---|---|---|
| `/` | 102 → 36 | 208 → 125 | 369 → 276 |
| `/claude-code-tutorial` | 423 → 45 | 565 → 132 | 741 → 291 |
| `/claude-code-pricing` | 425 → 44 | 566 → 132 | 736 → 270 |
| `/claude-code-vs-cursor` | 419 → 47 | 561 → 128 | 739 → 279 |
| `/claude-cowork` | 423 → 46 | 564 → 135 | 748 → 276 |
| `/claude-cowork-pricing` | 418 → 44 | 557 → 131 | 741 → 268 |
| `/claude-b2b-outreach` | 273 → 49 | 430 → 127 | 598 → 291 |
| `/claude-cowork-outreach` | 275 → 48 | 423 → 135 | 599 → 274 |
| `/claude-twitter` | 268 → 44 | 421 → 125 | 606 → 291 |
| `/claude-content` | 273 → 49 | 416 → 125 | 595 → 269 |
| `/claude-reels` | 268 → 55 | 418 → 131 | 602 → 287 |
| `/claude-tiktok` | 268 → 49 | 416 → 132 | 595 → 289 |
| `/claude-social-growth` | 274 → 48 | 411 → 144 | 590 → 272 |
| `/claude-marketing` | 271 → 50 | 422 → 125 | 596 → 276 |
| `/5-levels-ai` | 711 → 44 | 970 → 158 | 2527 → 292 |
| `/claude-code-instagram` | 268 → 52 | 414 → 135 | 595 → 268 |
| `/claude-riemann-hypothesis` | 96 → 44 | 219 → 120 | 407 → 291 |
| `/reels` | 164 → 36 | 208 → 144 | 369 → 280 |
| `/viral` | 62 → 44 | 202 → 120 | 355 → 272 |
| `/creators` | 68 → 36 | 207 → 136 | 372 → 292 |
| `/ideas` | 1078 → 40 | 551 → 120 | 606 → 275 |

Broadband is 20 ms RTT and 50 Mbps; the 4G phone is 70 ms and 9 Mbps at 2x
CPU; slow 4G is Lighthouse's 150 ms and 1.6 Mbps at 4x CPU, where the round
trip alone puts 200 ms out of reach. Against a local server, so add the real
network's connection setup (one to three round trips) on top of every number.

What did it, in the order it mattered:

1. **The hero has no entrance animation (principle 1, taken literally).** A
   0.6 s staggered fade was the whole gap between "painted" and "readable" on
   every resource page. The first painted frame is now the finished hero, on
   every page. Scroll reveals stay, but `Reveal` renders nothing hidden from the
   server: after hydration it arms only content still entirely off screen, so
   nothing a visitor can see ever waits on JavaScript or a fade.
2. **Fonts never hold the first paint (principle 4).** The surprise of the pass:
   Chrome treats a `<link rel=preload as=font>` in `<head>` as render-blocking,
   `font-display: swap` or not, for up to ~100 ms. Same page, 4G phone: first
   paint 152-196 ms with next/font's head preloads, 64-72 ms with the same
   preloads issued from `<body>`, the fonts landing at the same moment either
   way. So every next/font call sets `preload: false` and `FontKickoff`, the
   first thing in `<body>`, starts the downloads with `document.fonts.load()`.
   The cost is a swap from the fallback once the file lands, which turned up two
   reflows: titles (semibold, while next/font's fallback is faux-bolded regular
   Arial, 2.7% narrower) and the caps eyebrow labels (4% wider, which wrapped
   the homepage pill at 390 px and dropped the hero 18 px, CLS 0.07). Both now
   have fallbacks of their own in globals.css (homepage CLS 0.07 → 0.005).
   Three titles still sit within 4 px of a wrap boundary and flip a line when
   the font lands (pricing on desktop, tutorial at 375, ideas at 390): about
   0.02-0.03 CLS, first visit only.
3. **Cached first, then synced (principle 6).** /ideas was rendered per request
   to read a cookie; it is now static, refreshed every minute and purged by
   every write, and the per-browser vote state arrives from one fetch on mount,
   the way Telegram opens a chat on the cached history and then syncs. /viral
   was force-dynamic for no reason and is static. /reels and /creators keep
   their shared reads (the picked wall, the histogram facts) in the running
   instance for a minute, and the reel facts, ten sequential page reads at 9,743
   reels, are cached whole in the data cache instead of page by page.
4. **A tiny core (principle 5).** /5-levels-ai was one client component on
   framer-motion: now a server component whose only client code is the copy
   chips (156 → 108 kB first-load JS). framer-motion is gone from the site.
5. **Load what is visible, at the size it is drawn (principles 2 and 3).** The
   Riemann receipts, 2.4 MB and 1.3 MB PNGs, go through the image optimizer at
   the width the screen needs (127 KB on a desktop), the first eagerly and the
   second lazily. The guide figures, lazy already, paint a ~200-byte stripped
   thumbnail (`scripts/stripped-thumb.py --module`) so a fast scroll never shows
   an empty frame.
6. **Instant navigation (principle 3, applied to pages).** 54 internal links in
   the written guides were plain `<a>` and reloaded the whole document. They are
   `next/link` now: prefetched when they scroll into view, opened without a
   round trip.

Tried and dropped, because measuring said so: a `preconnect` to the reel
thumbnail host. The preload scanner already finds those `<img>` tags early in
the same document, so the hint changed nothing measurable.

Left alone on purpose: the YouTube player stays a real iframe in the fold
(Google will not index a click-to-load facade), and its long tasks land 5-7 s
after load on a slow phone, after the page is interactive.

## Sources

- https://core.telegram.org/type/PhotoSize
- https://github.com/morethanwords/tweb/blob/master/src/components/lazyLoadQueue.ts
- https://github.com/morethanwords/tweb/blob/master/src/components/lazyLoadQueueBase.ts
- https://cdn.jsdelivr.net/gh/morethanwords/tweb@master/README.md
- https://sourceforge.net/mirror/telegram-web-a/
