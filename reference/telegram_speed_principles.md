---
type: reference
description: What makes Telegram's clients feel instant, from its own API docs and web-client source, and how each idea was applied to the oleg.ae homepage on 2026-10-16.
created: 2026-10-16
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
- Here: Next's hashed /_next/static files are immutable, the hero is a hashed
  static import, and public media has a week of cache plus stale-while-revalidate.

## Measured result

scripts/perf-home.mjs and scripts/device-sweep.mjs, production build, slow 4G and
4x CPU throttle. Headline readable 2.3 s before, 1.06-1.08 s after on all 15
screens from 320 px to 2560 px; hero photo shown 3.3 s before, 0.77-1.04 s after;
CLS 0; no horizontal overflow on any screen; nothing below the fold fetched before
scroll on any screen.

## Sources

- https://core.telegram.org/type/PhotoSize
- https://github.com/morethanwords/tweb/blob/master/src/components/lazyLoadQueue.ts
- https://github.com/morethanwords/tweb/blob/master/src/components/lazyLoadQueueBase.ts
- https://cdn.jsdelivr.net/gh/morethanwords/tweb@master/README.md
- https://sourceforge.net/mirror/telegram-web-a/
