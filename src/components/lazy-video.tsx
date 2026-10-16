"use client";

// A muted looping preview that costs nothing until the visitor heads towards it.
// Three stages, the way Telegram loads media:
//   1. first paint: an inline ~1 KB stripped thumbnail as the background,
//      stretched (the browser's smooth upscale softens it), so the box is never
//      empty and nothing is fetched;
//   2. about a screen away (NEAR): the real poster;
//   3. almost on screen (PLAY): the video file itself, then play.
// `<video poster>` and `autoPlay` both fetch on load even far below the fold,
// which is why neither is set until its stage. Aspect ratio is fixed, so no shift.
// With prefers-reduced-motion the video is never fetched: the poster stays.

import { useEffect, useRef, useState } from "react";

type LazyVideoProps = {
  src: string;
  poster?: string;
  /** inline data URL shown blurred before anything loads (scripts/stripped-thumb.py) */
  placeholder?: string;
  className?: string;
  /** intrinsic aspect ratio "W / H" so the box is reserved before load */
  aspectRatio?: string;
};

const NEAR = "100% 0px"; // one viewport ahead: fetch the poster
const PLAY = "200px 0px"; // nearly visible: fetch the video

type Stage = 0 | 1 | 2;

function watch(el: Element, rootMargin: string, onHit: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) {
        onHit();
        io.disconnect();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

export function LazyVideo({
  src,
  poster,
  placeholder,
  className,
  aspectRatio = "16 / 9",
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof IntersectionObserver === "undefined") {
      setStage(still ? 1 : 2);
      return;
    }
    const stopNear = watch(el, NEAR, () => setStage((s) => (s < 1 ? 1 : s)));
    const stopPlay = watch(el, PLAY, () => setStage(still ? 1 : 2));
    return () => {
      stopNear();
      stopPlay();
    };
  }, []);

  useEffect(() => {
    if (stage === 2) ref.current?.play().catch(() => {});
  }, [stage]);

  return (
    <video
      ref={ref}
      className={className}
      poster={stage >= 1 ? poster : undefined}
      loop
      muted
      playsInline
      preload="none"
      src={stage === 2 ? src : undefined}
      style={{
        aspectRatio,
        ...(placeholder && {
          backgroundImage: `url(${placeholder})`,
          backgroundSize: "cover",
        }),
      }}
    />
  );
}
