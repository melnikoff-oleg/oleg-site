"use client";

// One draft drawn the way LinkedIn draws it in the feed, under the founder's own name:
// the text folds after the same lines LinkedIn shows (fold.ts), then the image or the
// autoplaying muted video, then the author's first comment with the sources.
import { useEffect, useMemo, useState } from "react";
import { DESKTOP, FONT_FAMILY, imageBox, makeMeasurer, mobileAt, preview } from "../ubersuggest-feed/fold";
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
        <img className="ubs-av" src={post.avatar} alt="" />
        <div className="ubs-who">
          <div className="ubs-nm">{post.author}</div>
          <div className="ubs-hd">{post.headline}</div>
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
      {post.comment && <FirstComment post={post} pad={pad} />}
    </div>
  );
}

function linkify(line: string) {
  return line.split(/(https?:\/\/\S+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a> : part,
  );
}

function FirstComment({ post, pad }: { post: Post; pad: number }) {
  const [open, setOpen] = useState(false);
  const lines = (post.comment ?? "").split("\n");
  const long = lines.length > 3;
  const shown = open || !long ? lines : lines.slice(0, 2);
  return (
    <div className="ubs-cmt" style={{ padding: `8px ${pad}px 12px` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ubs-cmt-av" src={post.avatar} alt="" />
      <div className="ubs-cmt-bubble">
        <div className="ubs-cmt-nm">{post.author} <span>Author</span></div>
        <div className="ubs-cmt-tx">
          {shown.map((l, i) => <div key={i}>{l ? linkify(l) : "​"}</div>)}
          {long && <button className="ubs-more" onClick={() => setOpen((o) => !o)}>{open ? "show less" : "…see more"}</button>}
        </div>
      </div>
    </div>
  );
}

/** Under each card: the viral post this format comes from, with its real numbers as the proof. */
export function RefProof({ post }: { post: Post }) {
  return (
    <a className="ubs-ref ubn-ref" href={post.refUrl} target="_blank" rel="noopener noreferrer">
      <span className="ubn-ref-top">Why it should work: the format of <b>{post.refAuthor}</b>&rsquo;s viral post <span aria-hidden="true">↗</span></span>
      <span className="ubs-refstats">
        <span>{post.refLikes.toLocaleString("en-US")} reactions</span>
        <span>{post.refComments.toLocaleString("en-US")} comments</span>
        <span>{post.refReposts.toLocaleString("en-US")} reposts</span>
        <span>{post.refFollowers} followers</span>
      </span>
      <span className="ubn-why">{post.why}</span>
    </a>
  );
}
