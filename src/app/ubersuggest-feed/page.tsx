import { POSTS } from "./data";
import { Feed } from "./feed";

export default function UbersuggestFeedPage() {
  const formats = new Set(POSTS.map((p) => p.format)).size;
  return (
    <>
      <header className="ubs-hero">
        <div className="ubs-eyebrow"><span className="ubs-dot" />Ubersuggest · LinkedIn drafts</div>
        <h1>Thirty posts, <em>six formats</em>, one feed.</h1>
        <p>Every draft exactly as it will appear on LinkedIn, folding where LinkedIn folds it. Tap “more” to read the rest.</p>
        <div className="ubs-stats">
          <div><b>{POSTS.length}</b><span>posts</span></div>
          <div><b>{formats}</b><span>formats</span></div>
          <div><b>6</b><span>viral references</span></div>
        </div>
        <div className="ubs-cta-row">
          <a className="ubs-cta" href="/ubersuggest-feed/rate">Rate the posts <span aria-hidden="true">→</span></a>
          <span className="ubs-hint">3 minutes, one post from each format · <a href="/ubersuggest-feed/results" style={{ color: "inherit" }}>See the ratings</a></span>
        </div>
      </header>
      <Feed posts={POSTS} />
    </>
  );
}
