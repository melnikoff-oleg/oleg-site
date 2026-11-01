"use client";

// Tap a photo, see it full size. The photos are plain links to the image file,
// so with no JavaScript a tap still opens it; this one listener (event
// delegation, nothing per photo) turns that into an overlay instead. Tap
// anywhere or press Escape to close.

import { useEffect, useState } from "react";

export function PhotoZoom() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[data-zoom]") as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
      setSrc(link.href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSrc(null);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [src]);

  if (!src) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo, full size"
      className="vt-lb"
      onClick={() => setSrc(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
      <button type="button" className="vt-lb-x" aria-label="Close" autoFocus>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
