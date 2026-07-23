"use client";

// A muted looping preview that does NOT download until it scrolls near the
// viewport. `autoPlay` would force the browser to fetch the whole file on load
// (even below the fold), competing with the hero LCP image; instead we keep
// `preload="none"` + a lightweight poster and only set the source + play once an
// IntersectionObserver fires. Aspect ratio is fixed so there is no layout shift.

import { useEffect, useRef, useState } from "react";

type LazyVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  /** intrinsic aspect ratio "W / H" so the box is reserved before load */
  aspectRatio?: string;
};

export function LazyVideo({
  src,
  poster,
  className,
  aspectRatio = "16 / 9",
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (active) ref.current?.play().catch(() => {});
  }, [active]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      loop
      muted
      playsInline
      preload="none"
      src={active ? src : undefined}
      style={{ aspectRatio }}
    />
  );
}
