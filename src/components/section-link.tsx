"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

// Sections below the fold use content-visibility:auto, so until one has been
// drawn the browser only knows a 900px guess for its height. A plain anchor
// jump aims at a spot computed from those guesses and, as the sections in
// between draw on the way down, lands inside the wrong one. So a nav click
// scrolls, waits for the scroll to settle, and re-aims until it is on target.
//
// The re-aim must never fight the reader. Each click bumps `currentJump`, and so
// does any wheel, touch or key press, so a pending re-aim from an older click,
// or one still armed after the reader took over, sees the change and stops.
let currentJump = 0;
const USER_INPUT = ["wheel", "touchstart", "keydown"] as const;

export function scrollToSection(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = still ? "auto" : "smooth";
  history.pushState(null, "", hash);
  const jump = ++currentJump;
  const cancel = () => {
    if (jump === currentJump) currentJump += 1;
  };
  for (const ev of USER_INPUT) window.addEventListener(ev, cancel, { once: true, passive: true });
  let tries = 0;
  const aim = () => {
    target.scrollIntoView({ behavior, block: "start" });
    tries += 1;
    const settle = () => {
      if (jump !== currentJump) return;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (Math.abs(target.getBoundingClientRect().top) > 4 && !atBottom && tries < 4) aim();
    };
    if ("onscrollend" in window) window.addEventListener("scrollend", settle, { once: true });
    else setTimeout(settle, 900);
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
