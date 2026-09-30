"use client";

// One post drawn the way LinkedIn draws it in the feed: the text folds after the
// same lines LinkedIn shows (measured, see fold.ts) with a "…more" that opens it,
// then the image or the autoplaying muted video.
import { useEffect, useMemo, useState } from "react";
import { DESKTOP, FONT_FAMILY, imageBox, makeMeasurer, mobileAt, preview } from "./fold";
import type { Post } from "./data";

type Platform = typeof DESKTOP;

function usePlatform(): Platform {
  const [pl, setPl] = useState<Platform>(DESKTOP);
  useEffect(() => {
    const pick = () => setPl(window.innerWidth >= 620 ? DESKTOP : mobileAt(Math.min(440, window.innerWidth - 32)));
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);
  return pl;
}

let measurer: ((s: string) => number) & { reset: () => void } | null = null;
function useMeasure() {
  const [, bump] = useState(0);
  useEffect(() => {
    if (!measurer) measurer = makeMeasurer();
    document.fonts?.ready.then(() => { measurer?.reset(); bump((x) => x + 1); });
    bump((x) => x + 1);
  }, []);
  return measurer;
}

export function PostCard({ post }: { post: Post }) {
  const pl = usePlatform();
  const measure = useMeasure();
  const [open, setOpen] = useState(false);
  const pad = pl.padding;
  const folded = useMemo(() => (measure ? preview(post.text, pl, measure) : null), [measure, pl, post.text]);
  const box = imageBox(post.w, post.h, pl.cardWidth);

  return (
    <div className="ubs-card" style={{ width: pl.cardWidth }}>
      <div className="ubs-head" style={{ padding: `12px ${pad}px 0` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ubs-av" src="/ubersuggest-feed/avatar.jpg" alt="" />
        <div className="ubs-who">
          <div className="ubs-nm">Ubersuggest</div>
          <div className="ubs-hd">10,388 followers</div>
          <div className="ubs-hd">1h · 🌎</div>
        </div>
        <div className="ubs-follow">+ Follow</div>
      </div>
      <div className="ubs-body" style={{ margin: `10px ${pad}px 8px`, width: pl.textWidth, font: `14px/${pl.lineHeight}px ${FONT_FAMILY}` }}>
        {open || !folded ? (
          <div className="ubs-full">
            {post.text}
            {open && (
              <>
                {"\n"}
                <button className="ubs-more" onClick={() => setOpen(false)}>show less</button>
              </>
            )}
          </div>
        ) : (
          folded.lines.map((line: string, i: number) => {
            const last = folded.truncated && i === folded.lines.length - 1;
            return (
              <div key={i} className={`ubs-ln${last && pl.marker !== "inline" ? " ubs-mline" : ""}`} style={{ minHeight: pl.lineHeight }}>
                {line}
                {last && (pl.marker === "inline" ? pl.ellipsis : null)}
                {last && (
                  <button className="ubs-more" onClick={() => setOpen(true)}>
                    {pl.marker === "inline" ? pl.moreGap + pl.moreLabel : pl.ellipsis + pl.moreLabel}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="ubs-shot" style={{ height: box.height }}>
        {post.kind === "video" ? (
          <video src={post.media} poster={post.poster ?? undefined} muted loop autoPlay playsInline controls preload="metadata" style={{ width: box.width, height: box.height }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.media} alt={post.title} loading="lazy" style={{ width: box.width, height: box.height }} />
        )}
      </div>
      <div className="ubs-acts" style={{ margin: `4px ${pad}px 0` }}>
        <span>👍 Like</span><span>💬 Comment</span><span>🔁 Repost</span><span>➤ Send</span>
      </div>
    </div>
  );
}

/** The small credit under a card: which viral post this format was modelled on. */
export function RefLink({ post }: { post: Post }) {
  return (
    <a className="ubs-ref" href={post.refUrl} target="_blank" rel="noopener noreferrer">
      Format from <b>{post.refAuthor}</b>&rsquo;s viral post <span aria-hidden="true">↗</span>
      <span className="ubs-refstats">
        <span>{post.refLikes.toLocaleString("en-US")} reactions</span>
        <span>{post.refComments.toLocaleString("en-US")} comments</span>
        <span>{post.refFollowers} followers</span>
      </span>
    </a>
  );
}
