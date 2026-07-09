import { test, expect } from "@playwright/test";

// Every public route on the site.
const ROUTES = [
  "/",
  "/claude-outreach",
  "/claude-b2b-outreach",
  "/claude-cowork-outreach",
  "/claude-twitter",
  "/claude-content",
  "/claude-reels",
  "/claude-tiktok",
  "/claude-social-growth",
  "/claude-trend-scanner",
  "/claude-marketing",
  "/claude-seo",
  "/claude-website",
  "/claude-interviewer",
  "/ads-ai",
  "/60k-linkedin-post",
  "/marketing-brain",
  "/marketing-brain-knowledge",
];
// Pages that render the cross-linked ResourceFooter (all except the chat).
const FOOTER_ROUTES = ROUTES.filter((r) => r !== "/marketing-brain");

// Tests 1-6: route health across the whole site.

// Test 1: every route returns HTTP 200.
test("1 - every route responds 200", async ({ page }) => {
  for (const route of ROUTES) {
    const res = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(res, `no response for ${route}`).not.toBeNull();
    expect(res!.status(), `${route} status`).toBe(200);
  }
});

// Test 2: every route renders exactly one <h1>.
test("2 - every route has exactly one h1", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const count = await page.locator("h1").count();
    expect(count, `${route} h1 count`).toBe(1);
  }
});

// Test 3: the header wordmark renders on every route.
test("3 - header wordmark present on every route", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const wordmark = page.getByRole("link", { name: /oleg melnikov/i }).first();
    await expect(wordmark, `${route} wordmark`).toBeVisible();
  }
});

// Test 4: ResourceFooter renders on the homepage (collapsed disclosure) and
// every resource/tool/lead-magnet/knowledge page (full "more free resources" card).
test("4 - resource footer renders on footer routes", async ({ page }) => {
  for (const route of FOOTER_ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/free resources/i).first(),
      `${route} footer`
    ).toBeVisible();
  }
});

// Test 5: no uncaught console errors on any route load.
test("5 - no console errors on load", async ({ page }) => {
  const errors: Record<string, string[]> = {};
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const url = page.url();
      (errors[url] ||= []).push(msg.text());
    }
  });
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }
  // Ignore noise from third-party embeds (YouTube iframes, analytics).
  const meaningful = Object.entries(errors)
    .map(([url, msgs]) => [
      url,
      msgs.filter(
        (m) =>
          !/youtube|ytimg|plausible|favicon|googletagmanager|gstatic/i.test(m) &&
          // permissions-policy noise emitted by the embedded YouTube iframes
          !/permissions policy|compute-pressure/i.test(m)
      ),
    ])
    .filter(([, msgs]) => (msgs as string[]).length > 0);
  expect(meaningful, JSON.stringify(meaningful, null, 2)).toEqual([]);
});

// Test 6: homepage section anchors resolve.
test("6 - homepage section anchors exist", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const id of ["about", "results", "watch", "connect"]) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
  }
});
