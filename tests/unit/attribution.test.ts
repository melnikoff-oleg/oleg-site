import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  TTL_MS,
  boldaneUrl,
  chooseFirstTouch,
  fromLanding,
  pageSlug,
  parseStored,
  withoutUtm,
  type FirstTouch,
} from "@/lib/attribution";
import { shortLinks } from "../../short-links";

const NOW = 1_800_000_000_000;
const landing = (over: Partial<Parameters<typeof fromLanding>[0]> = {}) =>
  fromLanding({ search: "", referrer: "", pathname: "/claude-reels", host: "www.oleg.ae", now: NOW, ...over });

test("a tagged landing keeps source, medium and content, and normalizes their spelling", () => {
  const t = landing({
    search: "?utm_source=YouTube&utm_medium=Social&utm_campaign=free-guide&utm_content=Description-Viral Reels",
  });
  assert.equal(t.source, "youtube");
  assert.equal(t.medium, "social");
  assert.equal(t.content, "description-viral-reels");
  assert.equal(t.fallback, undefined);
});

test("partial tags are completed, because source, medium and campaign must always be filled", () => {
  const t = landing({ search: "?utm_source=chatgpt.com" });
  assert.equal(t.source, "chatgpt.com");
  assert.equal(t.medium, "referral");
  assert.equal(t.content, "claude-reels");
});

test("tags beat the referrer", () => {
  const t = landing({ search: "?utm_source=linkedin&utm_medium=social", referrer: "https://www.youtube.com/" });
  assert.equal(t.source, "linkedin");
});

test("only utm_source counts as a tag, because that is all our links use", () => {
  const t = landing({ search: "?ref=someone", referrer: "https://www.youtube.com/" });
  assert.equal(t.source, "youtube");
  assert.equal(landing({ search: "?ref=someone" }).fallback, true);
});

test("an untagged click is named from its referrer", () => {
  const cases: [string, string, string][] = [
    ["https://www.youtube.com/", "youtube", "social"],
    ["https://m.youtube.com/", "youtube", "social"],
    ["android-app://com.google.android.youtube/", "youtube", "social"],
    ["https://www.google.com/", "google", "organic"],
    ["https://www.google.co.uk/", "google", "organic"],
    ["https://www.linkedin.com/", "linkedin", "social"],
    ["https://t.co/", "x", "social"],
    ["https://search.brave.com/", "brave", "organic"],
    ["https://gemini.google.com/", "gemini.google.com", "referral"],
    ["https://chatgpt.com/", "chatgpt.com", "referral"],
    ["https://github.com/", "github.com", "referral"],
  ];
  for (const [referrer, source, medium] of cases) {
    const t = landing({ referrer });
    assert.deepEqual([t.source, t.medium, t.fallback], [source, medium, undefined], referrer);
  }
});

test("look-alike hostnames are not mistaken for a platform", () => {
  assert.equal(landing({ referrer: "https://notyoutube.com/" }).source, "notyoutube.com");
  assert.equal(landing({ referrer: "https://google.evil.com/" }).source, "google.evil.com");
});

test("direct, and our own site as referrer, fall back to oleg.ae and the entry page", () => {
  for (const referrer of ["", "not a url", "https://www.oleg.ae/claude-tiktok", "https://oleg.ae/"]) {
    const t = landing({ referrer });
    assert.deepEqual([t.source, t.medium, t.content, t.fallback], ["oleg.ae", "referral", "claude-reels", true], referrer);
  }
});

test("the first known source is never overwritten while it is fresh", () => {
  const video: FirstTouch = { source: "youtube", medium: "social", content: "description-a", at: NOW - 1000 };
  const other = landing({ search: "?utm_source=linkedin&utm_medium=social" });
  assert.equal(chooseFirstTouch(video, other, NOW), video);
  assert.equal(chooseFirstTouch(video, landing(), NOW), video);
});

test("a direct visit never replaces a source, and a real source replaces a direct visit", () => {
  const direct = landing();
  const video = landing({ search: "?utm_source=youtube&utm_medium=social" });
  assert.equal(chooseFirstTouch(direct, video, NOW), video);
  assert.equal(chooseFirstTouch(direct, landing({ pathname: "/" }), NOW), direct);
});

test("a stored source expires after 30 days", () => {
  const old: FirstTouch = { source: "youtube", medium: "social", content: "description-a", at: NOW - TTL_MS };
  const fresh = landing();
  assert.equal(chooseFirstTouch(old, fresh, NOW), fresh);
  assert.equal(chooseFirstTouch({ ...old, at: NOW - TTL_MS + 1 }, fresh, NOW).source, "youtube");
});

test("corrupt storage is ignored", () => {
  for (const raw of [null, "", "{", "null", "{}", '{"source":"","medium":"x","content":"y","at":1}', '{"source":"a"}']) {
    assert.equal(parseStored(raw), null, String(raw));
  }
});

test("the Boldane link carries the original source, and the bridge in utm_term", () => {
  const touch: FirstTouch = { source: "youtube", medium: "social", content: "description-viral-instagram-reels", at: NOW };
  assert.equal(
    boldaneUrl("/claude-tiktok", touch),
    "https://boldane.com/?utm_source=youtube&utm_medium=social&utm_campaign=discovery-call&utm_content=description-viral-instagram-reels&utm_term=oleg.ae-claude-tiktok",
  );
});

test("without a touch (server HTML) the Boldane link says what the page knows", () => {
  assert.equal(
    boldaneUrl("/", null),
    "https://boldane.com/?utm_source=oleg.ae&utm_medium=referral&utm_campaign=discovery-call&utm_content=home&utm_term=oleg.ae-home",
  );
});

test("odd stored values cannot break out of the Boldane link", () => {
  const url = new URL(boldaneUrl("/", { source: "a&utm_medium=evil", medium: "b c", content: "d#e", at: NOW }));
  assert.equal(url.searchParams.get("utm_source"), "a&utm_medium=evil");
  assert.equal(url.searchParams.get("utm_medium"), "b c");
  assert.equal(url.searchParams.get("utm_content"), "d#e");
  assert.equal(url.hash, "");
});

test("pageSlug matches the values already in Plausible", () => {
  assert.equal(pageSlug("/"), "home");
  assert.equal(pageSlug("/instagram-viral-pages"), "instagram-viral-pages");
  assert.equal(pageSlug("/creators/drjulie/"), "creators-drjulie");
});

test("withoutUtm removes only the tags", () => {
  assert.equal(withoutUtm("https://boldane.com/?utm_source=a&utm_term=b"), "https://boldane.com/");
  assert.equal(withoutUtm("https://www.oleg.ae/x?utm_source=a&keep=1#top"), "https://www.oleg.ae/x?keep=1#top");
  assert.equal(withoutUtm("https://drive.google.com/d?usp=drive_link"), "https://drive.google.com/d?usp=drive_link");
  assert.equal(withoutUtm("not a url"), "not a url");
});

test("short links follow the rules", () => {
  const paths = shortLinks.map((l) => l.path);
  assert.equal(new Set(paths).size, paths.length, "duplicate slug");
  for (const { path, to } of shortLinks) {
    const slug = path.slice(1);
    assert.ok(slug.length <= 5 && !/\d/.test(slug) && /^[a-z-]+$/.test(slug), `slug rule: ${path}`);
    const url = new URL(to, "https://www.oleg.ae");
    const source = url.searchParams.get("utm_source");
    assert.ok(source === "youtube" || source === "linkedin", path);
    assert.equal(url.searchParams.get("utm_medium"), "social", path);
    assert.equal(url.searchParams.get("utm_campaign"), "free-guide", path);
    // A YouTube link names its spot under the video, a LinkedIn link the post it was given away in.
    assert.match(url.searchParams.get("utm_content") ?? "", source === "linkedin" ? /^post-[a-z0-9-]+$/ : /^(description|pinned-comment)-[a-z0-9-]+$/, path);
    // Links to boldane.com (five resources moved there on 2026-11-11) have no page here to check.
    if (url.origin === "https://www.oleg.ae" && url.pathname !== "/") {
      const page = join(process.cwd(), "src", "app", url.pathname.slice(1), "page.tsx");
      assert.ok(statSync(page, { throwIfNoEntry: false }), `no such page: ${url.pathname}`);
    }
  }
});

test("each video's content tag is used once per spot", () => {
  const contents = shortLinks.map((l) => new URL(l.to, "https://x").searchParams.get("utm_content"));
  assert.equal(new Set(contents).size, contents.length);
});

test("nothing links to Boldane except through BoldaneAnchor", () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name) && /href=\{?["'`]https?:\/\/(www\.)?boldane\.com/.test(readFileSync(path, "utf8"))) {
        offenders.push(path);
      }
    }
  };
  walk(join(process.cwd(), "src"));
  assert.deepEqual(offenders, []);
});
