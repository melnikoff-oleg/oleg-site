import { POSTS } from "./data";
import { Feed } from "./feed";

export default function UbersuggestFeedPage() {
  return (
    <>
      <header className="ubs-top">
        <h1>Ubersuggest LinkedIn drafts</h1>
        <p>{POSTS.length} posts in six formats, shown as they will look in the LinkedIn feed. Each one folds where LinkedIn folds it; tap “more” to read the rest.</p>
        <div className="ubs-cta-row">
          <a className="ubs-cta" href="/ubersuggest-feed/rate">Rate the posts →</a>
        </div>
      </header>
      <Feed posts={POSTS} />
    </>
  );
}
