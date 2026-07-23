"use client";

import { forwardRef, useState } from "react";
import type { GroupedSource } from "@/lib/marketing-brain/types";

export const SourceCard = forwardRef<
  HTMLDivElement,
  { source: GroupedSource; highlight?: boolean }
>(function SourceCard({ source, highlight }, ref) {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const ring = highlight
    ? "border-vivid-blue/50 bg-vivid-blue/10"
    : "border-hairline bg-navy-raised";

  const numBadge = (n: number) => (
    <span className="flex size-[1.05rem] shrink-0 items-center justify-center rounded bg-vivid-blue/15 text-[10px] font-semibold text-silver">
      {n}
    </span>
  );

  if (source.type === "book") {
    return (
      <div ref={ref} className={`flex gap-3 rounded-xl border p-3 transition-colors duration-500 ${ring}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source.cover}
          alt={source.title}
          loading="lazy"
          className="h-36 w-24 shrink-0 rounded-md object-cover shadow-md shadow-navy/40 ring-1 ring-hairline"
        />
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-medium leading-snug text-silver">{source.title}</p>
          <p className="font-body text-xs text-silver-muted">{source.attribution}</p>
          <ul className="mt-2 space-y-2">
            {source.items.map((it) => (
              <li key={it.n} className="flex gap-2">
                {numBadge(it.n)}
                <div className="min-w-0">
                  <span className="font-body text-[11px] font-medium text-silver-muted">p.&nbsp;{it.page}</span>
                  <p className="line-clamp-2 font-body text-xs italic leading-relaxed text-silver-muted">
                    “{it.quote}”
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // video: one full-width player/thumbnail, multiple timecodes as jump chips
  const active = activeItem !== null ? source.items[activeItem] : null;

  return (
    <div ref={ref} className={`overflow-hidden rounded-xl border transition-colors duration-500 ${ring}`}>
      {active ? (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            key={active.seconds}
            src={`https://www.youtube.com/embed/${source.videoId}?start=${active.seconds}&autoplay=1`}
            title={source.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setActiveItem(0)}
          className="group relative block aspect-video w-full overflow-hidden bg-navy-raised"
          aria-label="Play at cited moment"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={source.thumb}
            alt={source.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-navy/55 ring-1 ring-vivid-blue/40 backdrop-blur-sm transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-5 text-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
      <div className="p-3">
        <p className="line-clamp-2 font-body text-sm font-medium leading-snug text-silver">{source.title}</p>
        <p className="font-body text-xs text-silver-muted">{source.attribution}</p>
        <ul className="mt-2 space-y-2">
          {source.items.map((it, i) => (
            <li key={it.n} className="flex gap-2">
              {numBadge(it.n)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveItem(i)}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium tabular-nums transition-colors ${
                      activeItem === i
                        ? "bg-vivid-blue/25 text-white"
                        : "bg-vivid-blue/15 text-silver hover:bg-vivid-blue/25 hover:text-white"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-2.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {it.timecode}
                  </button>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open on YouTube"
                    className="inline-flex size-6 items-center justify-center rounded text-silver-muted transition-colors hover:text-silver"
                  >
                    ↗
                  </a>
                </div>
                <p className="mt-1 line-clamp-2 font-body text-xs italic leading-relaxed text-silver-muted">
                  “{it.quote}”
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
