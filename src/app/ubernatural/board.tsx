"use client";

// The feed with a score and a note under every post. Rate any number of posts;
// Submit asks for a full name once, then sends whatever has a score or a note.
// Scores, notes and the name are kept in this browser as you go, so nothing is lost.
import { useEffect, useRef, useState } from "react";
import type { Post } from "./data";
import { PostCard, RefProof } from "./post-card";

const KEY = "ubn-draft-v3";
const WHO = [
  { id: "all", label: "All" },
  { id: "ivan", label: "Ivan" },
  { id: "egor", label: "Egor" },
  { id: "bogdan", label: "Bogdan" },
] as const;

type Draft = { name: string; ratings: Record<string, number>; notes: Record<string, string> };

export function Board({ posts, archive = false }: { posts: Post[]; archive?: boolean }) {
  const [filter, setFilter] = useState<string>("all");
  const [draft, setDraft] = useState<Draft>({ name: "", ratings: {}, notes: {} });
  const [loaded, setLoaded] = useState(false);
  const [askName, setAskName] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDraft({ name: "", ratings: {}, notes: {}, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch {}
  }, [draft, loaded]);

  const touched = posts.filter((p) => draft.ratings[p.id] || draft.notes[p.id]?.trim()).length;
  const rated = posts.filter((p) => draft.ratings[p.id]).length;
  const nameOk = draft.name.trim().replace(/\s+/g, " ").split(" ").length >= 2 && draft.name.trim().length >= 3;
  const shown = posts.filter((p) => filter === "all" || p.who === filter);

  function flash(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function trySubmit() {
    if (touched === 0) { flash("Score or comment on at least one post first."); return; }
    if (!nameOk) { setAskName(true); return; }
    send();
  }

  async function send() {
    setAskName(false);
    setError(null);
    setSending(true);
    try {
      const votes = posts
        .filter((p) => draft.ratings[p.id] || draft.notes[p.id]?.trim())
        .map((p) => ({ post_id: p.id, rating: draft.ratings[p.id] ?? null, note: draft.notes[p.id]?.trim() || null }));
      const res = await fetch("/api/ubernatural-feed/votes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: draft.name, votes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save. Please try again.");
      setDone(data.saved ?? votes.length);
      flash(`Saved ${data.saved ?? votes.length} ${votes.length === 1 ? "post" : "posts"}. Thank you!`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const set = (id: string, v: number) => { setDone(null); setDraft((d) => ({ ...d, ratings: { ...d.ratings, [id]: v } })); };
  const note = (id: string, v: string) => { setDone(null); setDraft((d) => ({ ...d, notes: { ...d.notes, [id]: v } })); };

  return (
    <>
      <header className="ubs-hero">
        <div className="ubs-eyebrow"><span className="ubs-dot" />übernatural · LinkedIn drafts</div>
        <h1>{archive ? <>{posts.length} posts, <em>round two archive.</em></> : <>{posts.length} posts, <em>best first.</em></>}</h1>
        <p>Every draft exactly as it would appear on LinkedIn, with the viral post it borrows its format from underneath. Score any of them from 1 to 10, add a note if you like, and press Submit. You do not have to rate them all.</p>
        <div className="ubs-stats">
          <div><b>{posts.length}</b><span>posts</span></div>
          <div><b>3</b><span>founders</span></div>
          <div><b>{new Set(posts.map((p) => p.format)).size}</b><span>formats</span></div>
        </div>
      </header>

      <nav className="ubs-sticky" aria-label="Founders">
        <div className="ubs-sticky-in">
          <div className="ubs-chips">
            {WHO.map((w) => (
              <button key={w.id} className="ubs-chip" aria-pressed={filter === w.id} onClick={() => { setFilter(w.id); window.scrollTo({ top: 0 }); }}>
                {w.label} <small>{w.id === "all" ? posts.length : posts.filter((p) => p.who === w.id).length}</small>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="ubs-feed">
        {shown.map((p) => (
          <section key={p.id} className="ubs-item" id={`post-${p.id}`}>
            <div className="ubs-tag">
              <span className="ubs-num">{String(p.n).padStart(2, "0")}</span>
              <span className="ubs-fmtpill">{p.format}</span>
              <span className="ubs-ttl">{p.title}</span>
            </div>
            <PostCard post={p} />
            <RefProof post={p} />
            <div className="ubs-rate">
              <div className="ubs-rate-label" id={`lbl-${p.id}`}>Your score for this post</div>
              <div className="ubs-scale" role="group" aria-labelledby={`lbl-${p.id}`}>
                {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
                  <button key={v} aria-pressed={draft.ratings[p.id] === v} onClick={() => set(p.id, v)}>{v}</button>
                ))}
              </div>
              <textarea
                aria-label={`Note on ${p.title} (optional)`}
                placeholder="What works, what would you change? (optional)"
                value={draft.notes[p.id] ?? ""}
                maxLength={2000}
                onChange={(e) => note(p.id, e.target.value)}
              />
            </div>
          </section>
        ))}
      </main>
      <footer className="ubs-foot">Prepared for übernatural by Oleg Melnikov · Boldane</footer>

      <div className="ubs-bar">
        <div className="ubs-bar-in">
          <div>
            <div className="ubs-count">{rated} of {posts.length} scored{touched > rated ? `, ${touched - rated} with a note only` : ""}{done ? " · saved" : ""}</div>
            <div className="ubs-prog" aria-hidden="true"><i style={{ width: `${(touched / Math.max(posts.length, 1)) * 100}%` }} /></div>
            {error && <div className="ubs-error" role="alert">{error}</div>}
          </div>
          <button className="ubs-cta" aria-disabled={touched === 0 || sending} onClick={trySubmit} disabled={sending}>
            {sending ? "Sending…" : done ? "Submit again" : "Submit"}
          </button>
        </div>
      </div>

      {toast && <div className="ubs-toast" role="status">{toast}</div>}

      {askName && (
        <div className="ubs-modal-back" onClick={() => setAskName(false)}>
          <form className="ubs-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (nameOk) send(); }}>
            <h2>What’s your full name?</h2>
            <p>So we know whose scores these are.</p>
            <input id="ubn-name" autoFocus autoComplete="name" placeholder="First and last name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} maxLength={80} />
            <button className="ubs-cta" type="submit" aria-disabled={!nameOk} style={{ width: "100%" }}>Submit {touched} {touched === 1 ? "post" : "posts"}</button>
          </form>
        </div>
      )}
    </>
  );
}
