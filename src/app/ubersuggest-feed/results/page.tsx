// Every rating people gave on /ubersuggest-feed/rate, live from Supabase on each visit.
import { allRatings } from "@/lib/ubersuggest-feed/db";
import { RATE_POSTS } from "../data";
import { RefLink } from "../post-card";

export const dynamic = "force-dynamic";

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function ResultsPage() {
  const { people, byPost } = await allRatings(RATE_POSTS.map((p) => p.id));
  const every = Object.values(byPost).flat().map((r) => r.rating);
  return (
    <>
      <header className="ubs-hero">
        <div className="ubs-eyebrow"><span className="ubs-dot" />Ubersuggest · LinkedIn drafts</div>
        <h1>What people <em>think so far.</em></h1>
        <p>Every score and every comment from the rating page, one post from each format. Updated live.</p>
        <div className="ubs-stats">
          <div><b>{people}</b><span>{people === 1 ? "person" : "people"}</span></div>
          <div><b>{every.length}</b><span>ratings</span></div>
          <div><b>{avg(every) ?? "–"}</b><span>average</span></div>
        </div>
        <div className="ubs-cta-row">
          <a className="ubs-cta" href="/ubersuggest-feed/rate">Add your ratings <span aria-hidden="true">→</span></a>
          <a className="ubs-hint" href="/ubersuggest-feed" style={{ color: "inherit" }}>See all 30 posts</a>
        </div>
      </header>
      <div className="ubs-results">
        {RATE_POSTS.map((p) => {
          const rs = byPost[p.id] ?? [];
          const a = avg(rs.map((r) => r.rating));
          return (
            <article key={p.id} className="ubs-res">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.poster ?? p.media} alt="" />
              <div>
                <div className="ubs-fmt">{p.format}</div>
                <h3>{p.title}</h3>
                <div className="ubs-score">
                  <b>{a ?? "–"}</b>
                  <span>average from {rs.length} {rs.length === 1 ? "person" : "people"}</span>
                </div>
                <div className="ubs-dist" aria-label="How many people gave each score">
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => {
                    const n = rs.filter((r) => r.rating === v).length;
                    return <i key={v} title={`${v}: ${n}`} style={{ height: `${n ? 8 + (n / Math.max(1, rs.length)) * 32 : 3}px` }} data-on={n > 0} />;
                  })}
                </div>
                <RefLink post={p} />
              </div>
              {rs.length > 0 && (
                <div className="ubs-notes">
                  {rs.map((r, i) => (
                    <div key={i} className="ubs-note"><small>{r.name} · {r.rating}/10 · {when(r.at)}</small>{r.note ?? <em style={{ opacity: .5 }}>No comment</em>}</div>
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
