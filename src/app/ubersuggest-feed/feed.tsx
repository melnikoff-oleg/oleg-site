"use client";

import { useState } from "react";
import type { Post } from "./data";
import { PostCard, RefLink } from "./post-card";

export function Feed({ posts }: { posts: Post[] }) {
  const formats = ["All", ...new Set(posts.map((p) => p.format))];
  const [filter, setFilter] = useState("All");
  const shown = posts.filter((p) => filter === "All" || p.format === filter);
  return (
    <>
      <nav className="ubs-sticky" aria-label="Formats">
        <div className="ubs-sticky-in">
          <div className="ubs-chips">
            {formats.map((f) => (
              <button key={f} className="ubs-chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>
                {f} <small>{f === "All" ? posts.length : posts.filter((p) => p.format === f).length}</small>
              </button>
            ))}
          </div>
          <a className="ubs-cta ubs-cta-sm" href="/ubersuggest-feed/rate">Rate the posts</a>
        </div>
      </nav>
      <main className="ubs-feed">
        {shown.map((p) => (
          <section key={p.id} className="ubs-item">
            <div className="ubs-tag"><span className="ubs-num">{String(p.n).padStart(2, "0")}</span><span className="ubs-fmtpill">{p.format}</span><span className="ubs-ttl">{p.title}</span></div>
            <PostCard post={p} />
            <RefLink post={p} />
          </section>
        ))}
      </main>
      <footer className="ubs-foot">Prepared for Ubersuggest by Oleg Melnikov</footer>
    </>
  );
}
