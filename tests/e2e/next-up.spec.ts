import { test, expect, type Page } from "@playwright/test";

// Tests 45+: the "up next" recommendation surface that replaces the old wall of
// ~18 equal links (ResourceFooter) as the FIRST thing a visitor sees after they
// grab a resource. YouTube-style hierarchy: one prominent hero pick on top,
// then a short ranked list of secondary picks, then the full library collapsed
// behind a "see all free resources" disclosure (SEO internal links preserved).
//
// Runs on BOTH projects (desktop 1280px + mobile 390px). Written to assert the
// structural contract, not which specific pages get recommended, so refreshing
// recommendations.json never breaks these.

const MIN_TAP = 44;

// A representative spread of resource pages across the topic clusters.
const NEXT_UP_ROUTES = [
  "/claude-reels",
  "/claude-cowork-outreach",
  "/high-converting-website",
  "/5-levels-ai",
  "/marketing-brain-knowledge",
];

async function settle(page: Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

async function fontSize(sel: ReturnType<Page["locator"]>) {
  return sel.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
}

for (const route of NEXT_UP_ROUTES) {
  test(`45 - up next: ${route} shows a hero + ranked secondary picks`, async ({ page }) => {
    await settle(page, route);

    const block = page.getByTestId("next-up");
    await expect(block, `${route} next-up block`).toBeVisible();

    // Exactly one hero, and 1-2 secondary picks (a short list, never a wall).
    const hero = page.getByTestId("next-up-hero");
    await expect(hero).toHaveCount(1);
    const secondary = page.getByTestId("next-up-secondary");
    const secCount = await secondary.count();
    expect(secCount, `${route} secondary count`).toBeGreaterThanOrEqual(1);
    expect(secCount, `${route} secondary count`).toBeLessThanOrEqual(2);
  });

  test(`46 - up next: ${route} links are internal, ranked, and never the current page`, async ({ page }) => {
    await settle(page, route);

    const links = page
      .getByTestId("next-up")
      .locator("a[data-testid^='next-up-']");
    const n = await links.count();
    expect(n, `${route} total picks`).toBeGreaterThanOrEqual(2);

    const hrefs: string[] = [];
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href, `${route} pick #${i} href`).toBeTruthy();
      // Internal resource route, and never a self-recommendation.
      expect(href!.startsWith("/"), `${route} pick ${href} internal`).toBe(true);
      expect(href, `${route} self-recommendation`).not.toBe(route);
      hrefs.push(href!);
    }
    // No duplicate recommendations.
    expect(new Set(hrefs).size, `${route} duplicate picks`).toBe(hrefs.length);
  });
}

test("47 - up next: hero is visually dominant over the secondary picks", async ({ page }) => {
  await settle(page, "/claude-reels");
  const heroTitle = page.getByTestId("next-up-hero").locator("p").first();
  const secTitle = page.getByTestId("next-up-secondary").first().locator("p").first();
  const heroPx = await fontSize(heroTitle);
  const secPx = await fontSize(secTitle);
  expect(heroPx, `hero ${heroPx}px vs secondary ${secPx}px`).toBeGreaterThan(secPx);
});

test("48 - up next: hero comes before the secondary picks in the DOM/layout", async ({ page }) => {
  await settle(page, "/claude-reels");
  const heroBox = await page.getByTestId("next-up-hero").boundingBox();
  const secBox = await page.getByTestId("next-up-secondary").first().boundingBox();
  expect(heroBox && secBox).toBeTruthy();
  expect(heroBox!.y, "hero above secondary").toBeLessThan(secBox!.y);
});

test("49 - up next: the full library is collapsed behind a disclosure by default", async ({ page }) => {
  await settle(page, "/claude-reels");

  const summary = page.getByTestId("see-all-resources");
  await expect(summary).toBeVisible();

  // The full library grid stays in the HTML for crawlers, but is hidden until
  // the visitor opts to see everything. Scope to the grid container so this
  // holds no matter which pages the recommender happens to surface above it.
  const grid = page.getByTestId("all-resources-grid");
  const gridLinks = grid.locator("a[href^='/']");
  expect(await gridLinks.count(), "grid keeps all internal links").toBeGreaterThan(10);
  await expect(grid, "grid hidden while collapsed").toBeHidden();

  await summary.click();
  await expect(grid, "grid visible after expand").toBeVisible();
});

// ── Mobile-only guarantees (390px) ────────────────────────────────────────────

test("50 - up next (mobile): hero, secondary, and disclosure are >=44px tap targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  await settle(page, "/claude-reels");

  const hero = page.getByTestId("next-up-hero");
  const hBox = await hero.boundingBox();
  expect(Math.min(hBox!.width, hBox!.height), `hero ${hBox!.width}x${hBox!.height}`).toBeGreaterThanOrEqual(MIN_TAP - 0.5);

  const sec = page.getByTestId("next-up-secondary").first();
  const sBox = await sec.boundingBox();
  expect(sBox!.height, `secondary height ${sBox!.height}`).toBeGreaterThanOrEqual(MIN_TAP - 0.5);

  const summary = page.getByTestId("see-all-resources");
  const smBox = await summary.boundingBox();
  expect(smBox!.height, `summary height ${smBox!.height}`).toBeGreaterThanOrEqual(MIN_TAP - 0.5);
});

test("51 - up next (mobile): hero copy is >=16px and stacks full-width without overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  await settle(page, "/claude-reels");

  const heroDesc = page.getByTestId("next-up-hero").locator("p").nth(1);
  expect(await fontSize(heroDesc), "hero description px").toBeGreaterThanOrEqual(16);

  // Secondary picks stack (single column) on a phone: each spans most of the row.
  const sec = page.getByTestId("next-up-secondary").first();
  const box = await sec.boundingBox();
  expect(box!.width, "secondary near full width on mobile").toBeGreaterThan(300);

  // No horizontal overflow contributed by the block.
  const doc = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  expect(doc.scrollW, "no horizontal overflow").toBeLessThanOrEqual(doc.clientW + 1);
});
