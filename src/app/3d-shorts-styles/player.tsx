"use client";

// The original video of one style, playing in place. Oleg's brief (2026-11-17): people watch the video here,
// it starts by itself with sound, a small logo shows where it was posted, and a link opens the original.
//
// Browsers do not let a page start sound before the visitor has touched it. So: the video that is most in view
// plays; we try with sound first; if the browser refuses, it plays silent with a "Tap for sound" button.
// After the first tap anywhere on the page, every next video starts with sound. Only one video plays at a time.

import { useEffect, useRef, useState } from "react";

let touched = false;
const players = new Set<HTMLVideoElement>();

export function PlatformLogo({ platform, className }: { platform: string; className?: string }) {
  // One-colour marks drawn in the site's own line style, not the networks' brand colours.
  if (platform === "YouTube")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function Player({ slug, title, platform, eager }: { slug: string; title: string; platform: string; eager: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [silent, setSilent] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    players.add(v);
    const start = () => {
      players.forEach((o) => o !== v && o.pause());
      v.muted = false;
      v.play().then(
        () => setSilent(false),
        () => {
          v.muted = true;
          setSilent(true);
          v.play().catch(() => {});
        },
      );
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : v.pause()), { threshold: 0.6 });
    io.observe(v);
    const onTouch = () => {
      touched = true;
      if (!v.paused && v.muted) {
        v.muted = false;
        setSilent(false);
      }
    };
    const onVolume = () => setSilent(v.muted);
    document.addEventListener("pointerdown", onTouch);
    v.addEventListener("volumechange", onVolume);
    return () => {
      io.disconnect();
      players.delete(v);
      document.removeEventListener("pointerdown", onTouch);
      v.removeEventListener("volumechange", onVolume);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-raised">
      <video
        ref={ref}
        src={`/3d-shorts-styles/${slug}.mp4`}
        poster={`/3d-shorts-styles/${slug}-cover.webp`}
        preload={eager ? "metadata" : "none"}
        playsInline
        loop
        controls
        aria-label={`Video: ${title}`}
        className="block aspect-[9/16] w-full object-cover"
      />
      <span
        title={`Posted on ${platform}`}
        className="pointer-events-none absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-navy/70 text-white backdrop-blur-sm"
      >
        <PlatformLogo platform={platform} className="h-4 w-4" />
      </span>
      {silent && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (v) {
              v.muted = false;
              v.play().catch(() => {});
            }
            setSilent(false);
          }}
          className="absolute right-2.5 top-2.5 rounded-full bg-vivid-blue px-3 py-1.5 font-body text-sm font-semibold text-white"
        >
          Tap for sound
        </button>
      )}
    </div>
  );
}
