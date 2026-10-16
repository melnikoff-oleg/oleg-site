"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

// Sections below the fold use content-visibility:auto, so until one has been
// drawn the browser only knows a 900px guess for its height. A plain anchor
// jump aims at a spot computed from those guesses and, as the sections in
// between draw on the way down, lands inside the wrong one. So a nav click
// scrolls, waits for the scroll to settle, and re-aims until it is on target.
//
// The re-aim must never fight the reader. Each jump owns an AbortController; a
// new click aborts the previous jump, and so does any reader input (wheel,
// touch, key, or a pointer press, which covers dragging the scrollbar). Aborting
// removes every listener the jump added, so nothing stays armed afterwards.
let current: AbortController | null = null;
const READER_INPUT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
const MAX_TRIES = 4;
const SETTLE_FALLBACK_MS = 1200; // scrollend unsupported, or no scroll happened

const atBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

export function scrollToSection(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  if (location.hash === hash) history.replaceState(null, "", hash);
  else history.pushState(null, "", hash);

  current?.abort();
  const jump = new AbortController();
  current = jump;
  const { signal } = jump;
  for (const ev of READER_INPUT) {
    window.addEventListener(ev, () => jump.abort(), { once: true, passive: true, signal });
  }

  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant" // not "auto": that defers to the CSS, which says smooth
    : "smooth";
  // On target: the section's top at the viewport top, or, for a last section
  // shorter than the screen, the page already scrolled as far as it goes
  // with the section still below the top edge.
  const onTarget = () => {
    const top = target.getBoundingClientRect().top;
    return Math.abs(top) <= 4 || (top > 0 && atBottom());
  };

  let tries = 0;
  const aim = () => {
    if (signal.aborted) return;
    if (onTarget() || tries >= MAX_TRIES) {
      jump.abort();
      return;
    }
    tries += 1;
    target.scrollIntoView({ behavior, block: "start" });
    // Whichever comes first, the end of this scroll or the fallback, checks again.
    let timer = 0;
    const settle = () => {
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", settle);
      aim();
    };
    window.addEventListener("scrollend", settle, { once: true, signal });
    timer = window.setTimeout(settle, SETTLE_FALLBACK_MS);
    signal.addEventListener("abort", () => window.clearTimeout(timer), { once: true });
  };
  aim();
}

/** An in-page "#section" link that lands on target despite lazy sections. */
export function SectionLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: `#${string}` }) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        scrollToSection(href);
      }}
      {...rest}
    />
  );
}
