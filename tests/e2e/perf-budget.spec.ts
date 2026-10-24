import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Tests 81-84: performance budgets.
 *
 * Real perf work had shipped here and had never been measured, so there was no
 * number to regress against. These are budgets, not benchmarks: they are set a
 * little above where the site actually sits, so ordinary work does not trip
 * them and a genuine regression does.
 *
 * Measured with the Resource Timing API in a cold context (Playwright gives
 * each test a fresh one), so these are first-visit numbers, which is the visit
 * that matters when 84% of traffic arrives from a video description.
 */

type Weights = { doc: number; js: number; css: number; font: number; media: number; total: number };

async function weigh(page: import("@playwright/test").Page, route: string): Promise<Weights> {
  await page.goto(route, { waitUntil: "networkidle" });
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const w = { doc: nav.transferSize, js: 0, css: 0, font: 0, media: 0, total: 0 };
    for (const e of res) {
      if (/\.js(\?|$)/.test(e.name)) w.js += e.transferSize;
      else if (/\.css(\?|$)/.test(e.name)) w.css += e.transferSize;
      else if (/\.(woff2?|ttf)(\?|$)/.test(e.name)) w.font += e.transferSize;
      else if (/\.(png|jpe?g|webp|avif|svg|mp4)(\?|$)/.test(e.name) || e.name.includes("/_next/image"))
        w.media += e.transferSize;
    }
    w.total = w.doc + w.js + w.css + w.font + w.media;
    return w;
  });
}

const KB = 1024;

// Test 81: the homepage is the cold-start page and carries the whole shared
// payload, so it is the one worth budgeting hardest.
test("81 - the homepage stays under its weight budget", async ({ page }) => {
  const w = await weigh(page, "/");
  expect(w.font / KB, "fonts").toBeLessThan(70);
  expect(w.js / KB, "javascript").toBeLessThan(140);
  // 280 until 2026-10-16, when the CSS was inlined into the HTML (next.config.ts
  // experimental.inlineCss): +~15 KB net on the wire, bought for one less
  // render-blocking round trip (FCP 1.6 s to 0.8 s on throttled mobile).
  expect(w.total / KB, "total").toBeLessThan(310);
});

// Test 82: a guide page is pure server-rendered reading matter. It must not
// start shipping a runtime because someone reached for a client component to
// solve a layout problem.
test("82 - a guide page ships almost no javascript of its own", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" }); // warm the shared chunks
  const before = await page.evaluate(
    () =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((e) => /\.js(\?|$)/.test(e.name))
        .reduce((a, e) => a + e.transferSize, 0),
  );
  expect(before).toBeGreaterThan(0);
  const w = await weigh(page, "/claude-code-tutorial");
  // Its own route chunk, not the shared runtime, which the homepage already paid for.
  expect(w.js / KB, "route javascript").toBeLessThan(140);
  expect(w.doc / KB, "server-rendered html").toBeGreaterThan(20);
});

// Test 83: no route may ship a font family it does not render. Three families
// were loaded and one of them (Inter) appeared on nothing: it was the body
// default and every element overrode it, so 47 kB was downloaded on every cold
// visit to render almost no text.
test("83 - only the fonts the design uses are downloaded", async ({ page }) => {
  const w = await weigh(page, "/claude-code-tutorial");
  const files = await page.evaluate(
    () =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((e) => /\.woff2?(\?|$)/.test(e.name)).length,
  );
  expect(files, "font files").toBeLessThanOrEqual(2);
  expect(w.font / KB, "font bytes").toBeLessThan(70);
});

// Test 84: content paints fast. Guide pages are static HTML, so a slow first
// paint means something started blocking it.
test("84 - first contentful paint is prompt on a guide page", async ({ page }) => {
  await page.goto("/claude-cowork-outreach", { waitUntil: "load" });
  // The paint entry can land after the load event, so wait for it rather than
  // reading a buffer that may not have been filled yet.
  const fcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const seen = performance
          .getEntriesByType("paint")
          .find((p) => p.name === "first-contentful-paint");
        if (seen) return resolve(seen.startTime);
        new PerformanceObserver((list, obs) => {
          for (const e of list.getEntries()) {
            if (e.name === "first-contentful-paint") {
              obs.disconnect();
              resolve(e.startTime);
            }
          }
        }).observe({ type: "paint", buffered: true });
      }),
  );
  // Generous against a local server: this is a smoke alarm for a render-blocking
  // resource creeping in, not a Lighthouse score.
  expect(fcp, "first contentful paint (ms)").toBeLessThan(1500);
});

// Test 84a: the homepage fetches nothing from below the fold until the visitor
// heads there (2026-10-16). The preview poster used to download on first load
// because `<video poster>` fetches eagerly; the hero copy waited for hydration.
test("84a - homepage: below-the-fold media waits, hero copy needs no javascript", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(decodeURIComponent(r.url())));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  expect(urls.filter((u) => /preview(-poster)?\.(jpg|mp4)/.test(u)), "video media before scroll").toEqual([]);
  expect(urls.filter((u) => /\/icons\/(math|trading|building|media|life)\.webp/.test(u)), "story icons before scroll").toEqual([]);
  expect(urls.filter((u) => /hero[^&]*&w=(2048|3840)/.test(u)), "oversized hero").toEqual([]);

  // Server HTML alone must carry the headline, in its final state: no entrance
  // animation and nothing that waits for JavaScript (84b holds every route to
  // the same rule).
  const html = await (await page.request.get("/")).text();
  const h1 = html.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? "";
  expect(h1).toContain("marketing.");
  expect(h1).not.toContain("data-reveal");

  // Scrolling to the video does fetch it. The sections above it render as the
  // page scrolls (content-visibility) and can push it back down, so re-aim on
  // every poll, as a reader's thumb would.
  await expect
    .poll(async () => {
      await page.locator("video").scrollIntoViewIfNeeded();
      return urls.some((u) => /preview\.mp4/.test(u));
    })
    .toBe(true);
});

// Test 84b: nothing a page sends is hidden (2026-10-23, the Telegram pass). The
// hero used to fade in from opacity 0, which held every headline unreadable
// for 0.3-0.7 s after it had arrived. Reveals now arm only after hydration and
// only for content still off screen, so the server HTML carries no reveal
// state at all, on any route.
test("84b - no route's server HTML hides content behind a reveal", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "server HTML is the same for every viewport");
  for (const route of ROUTES) {
    const html = await (await request.get(route)).text();
    // An attribute on an element, not the [data-reveal=...] rules in the
    // inlined stylesheet.
    expect(html, route).not.toMatch(/<[a-z][^<>]*\sdata-reveal=/i);
  }
});

// Test 84c: web fonts never hold the first paint. A <link rel=preload as=font>
// in <head> is render-blocking in Chrome (up to ~100 ms, measured 152-196 ms vs
// 64-72 ms first paint on a 4G phone), so the site has none: FontKickoff starts
// the downloads from the body instead (src/components/font-kickoff.tsx). The
// files must still arrive, which is what 83 counts.
test("84c - no font preload in <head>; the body kicks the downloads off", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "server HTML is the same for every viewport");
  for (const route of ["/", "/claude-code-tutorial", "/claude-riemann-hypothesis", "/reels"]) {
    const html = await (await request.get(route)).text();
    const head = html.slice(0, html.indexOf("<body"));
    expect(head, route).not.toMatch(/<link[^>]+as="font"/);
    expect(html.slice(html.indexOf("<body")), route).toMatch(/document\.fonts\)<\/script>/);
  }
});

// Test 84d: the fallback faces still attach. With no preload, text paints in a
// fallback first, and globals.css gives titles a real 600 face by adding one to
// the family next/font generates, "Wix Madefor Display Fallback", by name. If a
// Next upgrade renames that family the rule matches nothing, silently: titles
// fall back to faux-bold Arial and reflow when the font lands. So check that the
// title's font stack really names the family the extra face is declared for,
// and the same for the caps labels' own fallback.
test("84d - the title and caps fallback faces are the ones the page uses", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "font stacks are the same for every viewport");
  await page.goto("/");
  const found = await page.evaluate(() => {
    const declared = [...document.fonts].map((f) => `${f.family.replace(/"/g, "")}|${f.weight}`);
    const stack = (sel: string) => getComputedStyle(document.querySelector(sel)!).fontFamily;
    return { declared, title: stack("h1"), caps: stack(".eyebrow") };
  });
  expect(found.declared).toContain("Wix Madefor Display Fallback|600");
  expect(found.title).toContain("Wix Madefor Display Fallback");
  // The caps face declares no weight (it is used at the one the labels set).
  expect(found.declared.some((d) => d.startsWith("Wix Madefor Caps Fallback|"))).toBe(true);
  expect(found.caps).toContain("Wix Madefor Caps Fallback");
});
