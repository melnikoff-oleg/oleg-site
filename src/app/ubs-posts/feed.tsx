"use client";

import { useState } from "react";
import type { Post } from "./data";
import { PostCard, RefLink } from "./post-card";

/** All the drafts, filtered by whose page they are for. */
export function Feed({ posts }: { posts: Post[] }) {
  const authors = ["All", ...new Set(posts.map((p) => p.author.name))];
  const [filter, setFilter] = useState("All");
  const shown = posts.filter((p) => filter === "All" || p.author.name === filter);
  return (
    <>
      <nav className="ubs-sticky" aria-label="Authors">
        <div className="ubs-sticky-in">
          <div className="ubs-chips">
            {authors.map((a) => (
              <button key={a} className="ubs-chip" aria-pressed={a === filter} onClick={() => setFilter(a)}>
                {a} <small>{a === "All" ? posts.length : posts.filter((p) => p.author.name === a).length}</small>
              </button>
            ))}
          </div>
          <a className="ubs-cta ubs-cta-sm" href="/ubs-posts-rate">Rate five posts</a>
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
