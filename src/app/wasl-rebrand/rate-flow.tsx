"use client";

// Intro -> name -> rate every candidate (1 to 10, note optional) -> results.
// Same flow as /ubersuggest-feed/rate. Submit stays on screen but disabled until every
// name has a rating; pressing it early scrolls to the first unrated one and says so.
import { useEffect, useRef, useState } from "react";
import type { NameIdea } from "./data";
import { NameCard } from "./name-card";

type Result = { name_id: string; count: number; average: number | null; notes: { name: string; rating: number; note: string; at: string }[] };
type Stage = "intro" | "rating" | "sending" | "done";

export function RateFlow({ names }: { names: NameIdea[] }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [askName, setAskName] = useState(false);
  const [name, setName] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rated = names.filter((p) => ratings[p.id]).length;
  const complete = rated === names.length;
  const nameOk = name.trim().replace(/\s+/g, " ").length >= 2;

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  function start() {
    setAskName(false);
    setStage("rating");
    window.scrollTo({ top: 0 });
  }

  function flash(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  async function submit() {
    if (!complete) {
      const first = names.find((p) => !ratings[p.id]);
      if (first) {
        setMissing(first.id);
        document.getElementById(`panel-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        flash(`Please rate this name too (${names.length - rated} left).`);
      }
      return;
    }
    setError(null);
    setStage("sending");
    try {
      const res = await fetch("/api/wasl-rebrand/votes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, votes: names.map((p) => ({ name_id: p.id, rating: ratings[p.id], note: notes[p.id] || null })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save your votes. Please try again.");
      setResults(data.results);
      setStage("done");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your votes. Please try again.");
      setStage("rating");
    }
  }

  if (stage === "done" && results) {
    const first = name.trim().split(/\s+/)[0];
    const ranked = [...names].sort((a, b) => (results.find((x) => x.name_id === b.id)?.average ?? 0) - (results.find((x) => x.name_id === a.id)?.average ?? 0));
    return (
      <>
        <header className="ubs-hero">
          <div className="ubs-eyebrow"><span className="ubs-dot" />Ratings saved</div>
          <h1>Thanks, {first}. <em>Here is what everyone thinks.</em></h1>
          <p>The average score for each name, highest first, and what other people wrote about it.</p>
          <div className="ubs-cta-row"><a className="ubs-cta" href="/wasl-rebrand/results">See every vote <span aria-hidden="true">→</span></a></div>
        </header>
        <div className="ubs-results">
          {ranked.map((p) => {
            const r = results.find((x) => x.name_id === p.id);
            return (
              <article key={p.id} className="ubs-res wsl-res">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" />
                <div>
                  <div className="ubs-fmt">{p.domain}</div>
                  <h3>{p.name}</h3>
                  <div className="ubs-score">
                    <b>{r?.average ?? "–"}</b>
                    <span>average from {r?.count ?? 0} {r?.count === 1 ? "person" : "people"}</span>
                  </div>
                  <div className="ubs-yours">You gave it {ratings[p.id]}</div>
                </div>
                {r && r.notes.length > 0 && (
                  <div className="ubs-notes">
                    {r.notes.map((n, i) => (
                      <div key={i} className="ubs-note"><small>{n.name} · {n.rating}/10</small>{n.note}</div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="ubs-hero">
        <div className="ubs-eyebrow"><span className="ubs-dot" />Wasl Apps · the new name</div>
        <h1>Ten names. <em>Each with a story.</em></h1>
        <p>Picked from 100 candidates, strongest first. Every .com is free to register today. Score each from 1 to 10 and add a comment if you like. At the end you see how everyone else voted.</p>
        <div className="ubs-stats">
          <div><b>100</b><span>names screened</span></div>
          <div><b>{names.length}</b><span>finalists</span></div>
          <div><b>.com</b><span>all available</span></div>
        </div>
        {stage === "intro" && (
          <div className="ubs-cta-row">
            <button className="ubs-cta" onClick={() => setAskName(true)}>Rate the names</button>
            <a className="ubs-hint" href="/wasl-rebrand/results" style={{ color: "inherit" }}>See the votes so far</a>
          </div>
        )}
      </header>

      <main className="ubs-feed wsl-feed">
        {names.map((p) => (
          <section key={p.id} className="ubs-item wsl-item" id={`rate-${p.id}`}>
            <NameCard idea={p} />
            {stage !== "intro" && (
              <div id={`panel-${p.id}`} className={`ubs-rate${missing === p.id && !ratings[p.id] ? " ubs-missing" : ""}`}>
                <div className="ubs-rate-label" id={`lbl-${p.id}`}>Your score for {p.name}</div>
                <div className="ubs-scale" role="group" aria-labelledby={`lbl-${p.id}`}>
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
                    <button key={v} aria-pressed={ratings[p.id] === v} onClick={() => { setRatings((r) => ({ ...r, [p.id]: v })); if (missing === p.id) setMissing(null); }}>
                      {v}
                    </button>
                  ))}
                </div>
                <textarea
                  aria-label={`Comment on ${p.name} (optional)`}
                  placeholder="What do you like, what bothers you? (optional)"
                  value={notes[p.id] ?? ""}
                  maxLength={2000}
                  onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                />
              </div>
            )}
          </section>
        ))}
      </main>
      <footer className="ubs-foot">Prepared for Gleb and the team by Oleg Melnikov</footer>

      {stage !== "intro" && (
        <div className="ubs-bar">
          <div className="ubs-bar-in">
            <div>
              <div className="ubs-count">{rated} of {names.length} rated</div>
              <div className="ubs-prog" aria-hidden="true"><i style={{ width: `${(rated / names.length) * 100}%` }} /></div>
              {error && <div className="ubs-error" role="alert">{error}</div>}
            </div>
            <button className="ubs-cta" aria-disabled={!complete || stage === "sending"} onClick={submit} disabled={stage === "sending"}>
              {stage === "sending" ? "Sending…" : "Submit ratings"}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="ubs-toast" role="status">{toast}</div>}

      {askName && (
        <div className="ubs-modal-back" onClick={() => setAskName(false)}>
          <form className="ubs-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (nameOk) start(); }}>
            <h2>What’s your name?</h2>
            <p>So we know whose ratings these are.</p>
            <input id="wsl-name" autoFocus autoComplete="name" placeholder="Your name, e.g. Gleb Fedorenko" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            <button className="ubs-cta" type="submit" aria-disabled={!nameOk} style={{ width: "100%" }}>Start rating</button>
          </form>
        </div>
      )}
    </>
  );
}
