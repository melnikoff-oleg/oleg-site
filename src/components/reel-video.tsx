"use client";

// Play a reel in place, from our own storage, instead of leaving for Instagram.
//
// Three pieces, because the question "do we hold this video" has to be asked
// once per PAGE and answered once per TILE:
//
//   ReelVideoProvider  wraps a grid, asks the server which of its reels can
//                      play, and keeps the answer.
//   ReelPlayButton     sits in a tile. Renders NOTHING unless that reel is
//                      held, so a tile we hold no file for is exactly the tile
//                      it was before this existed: a link to Instagram.
//   the player         one per provider, in a portal, 9:16, native controls.
//
// Nothing about the existing data paths changed to make this work. The rows,
// the types, the three queries that fetch them: all untouched. That is
// deliberate. Whether a file is on storage is a fact about storage, it moves
// on a different schedule from the index, and a tile that finds out late costs
// a play button that appears a moment after the picture, never a broken tile.

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Play, X } from "lucide-react";

type Playing = { shortcode: string; url: string; poster: string | null };

type Ctx = {
  held: ReadonlySet<string>;
  play: (reel: Playing) => void;
};

const ReelVideoContext = createContext<Ctx | null>(null);

export function ReelVideoProvider({
  codes,
  children,
}: {
  codes: string[];
  children: React.ReactNode;
}) {
  const [held, setHeld] = useState<ReadonlySet<string>>(new Set());
  const [playing, setPlaying] = useState<Playing | null>(null);

  // A stable key, so a re-render that hands over an equal list in a new array
  // does not ask the server again.
  const key = useMemo(() => [...codes].sort().join(","), [codes]);

  useEffect(() => {
    if (!key) {
      setHeld(new Set());
      return;
    }
    const ctl = new AbortController();
    fetch("/api/viral-reels/video/held", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The route refuses more than 200, and a wall never shows that many.
      body: JSON.stringify({ codes: key.split(",").slice(0, 200) }),
      signal: ctl.signal,
    })
      .then((r) => (r.ok ? r.json() : { held: [] }))
      .then((d: { held?: string[] }) => setHeld(new Set(d.held ?? [])))
      // Any failure leaves every tile as a link to Instagram, which is what
      // it was anyway.
      .catch(() => {});
    return () => ctl.abort();
  }, [key]);

  const value = useMemo<Ctx>(() => ({ held, play: setPlaying }), [held]);

  return (
    <ReelVideoContext.Provider value={value}>
      {children}
      {playing && <Player reel={playing} onClose={() => setPlaying(null)} />}
    </ReelVideoContext.Provider>
  );
}

/**
 * The play control for one tile. Covers the picture, so it must be rendered
 * AFTER the tile's Instagram link and at the same z-index: later in the DOM
 * wins, and the link underneath is still there for a reel we do not hold.
 */
export function ReelPlayButton({
  shortcode,
  url,
  poster,
  label,
}: {
  shortcode: string;
  url: string;
  poster: string | null;
  label: string;
}) {
  const ctx = useContext(ReelVideoContext);
  if (!ctx || !ctx.held.has(shortcode)) return null;
  return (
    <button
      type="button"
      data-reel-play={shortcode}
      onClick={() => ctx.play({ shortcode, url, poster })}
      className="group/play absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full border border-white/25 bg-navy/55 text-white backdrop-blur-md transition-transform duration-200 group-hover/play:scale-110">
        {/* The glyph is optically left-heavy, so it is nudged to look centred. */}
        <Play className="size-6 translate-x-0.5 fill-current" aria-hidden />
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Player({ reel, onClose }: { reel: Playing; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll under the player.
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = was;
    };
  }, [onClose]);

  // A portal, because a tile is `overflow-hidden` and sits under frosted
  // layers: either can become the containing block of a fixed child and clip
  // the player to the tile it was opened from.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reel player"
      data-reel-player={reel.shortcode}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-full flex-col items-center gap-3"
      >
        {failed ? (
          <p className="max-w-xs rounded-2xl border border-hairline bg-navy-raised px-5 py-4 text-center text-base text-silver">
            This one would not load. It is still on Instagram.
          </p>
        ) : (
          <video
            // The route answers with a redirect to a signed link, so the file
            // streams straight from storage.
            src={`/api/viral-reels/video/${reel.shortcode}`}
            poster={reel.poster ?? undefined}
            controls
            autoPlay
            playsInline
            onError={() => setFailed(true)}
            className="aspect-[9/16] max-h-[calc(100dvh-7rem)] w-auto max-w-full rounded-xl bg-black"
          />
        )}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-4" aria-hidden />
          Open on Instagram
        </a>
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:right-5 sm:top-5"
      >
        <X className="size-5" aria-hidden />
        <span className="sr-only">Close the player</span>
      </button>
    </div>,
    document.body,
  );
}
