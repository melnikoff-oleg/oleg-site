"use client";

import { useState } from "react";
import type { Post } from "./data";
import { PostCard } from "./post-card";

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
          <a className="ubs-cta" href="/ubersuggest-feed/rate" style={{ minHeight: 40, padding: "8px 18px", fontSize: 14 }}>Rate the posts</a>
        </div>
      </nav>
      <main className="ubs-feed">
        {shown.map((p) => (
          <section key={p.id} className="ubs-item">
            <div className="ubs-tag"><span>#{p.n} · <b>{p.format}</b></span><span>{p.title}</span></div>
            <PostCard post={p} />
          </section>
        ))}
      </main>
    </>
  );
}
