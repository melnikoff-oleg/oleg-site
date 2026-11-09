import { POSTS } from "./data";
import { Feed } from "./feed";

export default function UbsPostsPage() {
  const people = new Set(POSTS.filter((p) => !p.author.company).map((p) => p.author.key)).size;
  const page = POSTS.filter((p) => p.author.company).length;
  return (
    <>
      <header className="ubs-hero">
        <div className="ubs-eyebrow"><span className="ubs-dot" />Ubersuggest · LinkedIn drafts · November 2026</div>
        <h1>Twenty-five posts, <em>five pages</em>, one feed.</h1>
        <p>Thirteen drafts for the Ubersuggest page and three each for Mike, Neil, Salun and Gabriel. Every one exactly as it will appear on LinkedIn. Tap “more” to read the rest.</p>
        <div className="ubs-stats">
          <div><b>{POSTS.length}</b><span>posts</span></div>
          <div><b>{page}</b><span>for the page</span></div>
          <div><b>{POSTS.length - page}</b><span>for {people} people</span></div>
        </div>
        <div className="ubs-cta-row">
          <a className="ubs-cta" href="/ubs-posts-rate">Rate five posts <span aria-hidden="true">→</span></a>
          <span className="ubs-hint">3 minutes, five very different posts · <a href="/ubs-posts-ratings" style={{ color: "inherit" }}>See the ratings</a></span>
        </div>
      </header>
      <Feed posts={POSTS} />
    </>
  );
}
