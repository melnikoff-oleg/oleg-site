import { test, expect } from "@playwright/test";
import { ROUTES, FOOTER_ROUTES } from "./routes";

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

// Test 4: ResourceFooter ("more free resources") renders on every
// resource/tool/lead-magnet/knowledge page.
test("4 - resource footer renders on footer routes", async ({ page }) => {
  for (const route of FOOTER_ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/more free resources/i),
      `${route} footer`
    ).toBeVisible();
  }
});

// Test 5: no uncaught console errors on any route load.
test("5 - no console errors on load", async ({ page }) => {
  const errors: Record<string, string[]> = {};
  const THIRD_PARTY =
    /youtube|ytimg|plausible|favicon|googletagmanager|gstatic|permissions policy|compute-pressure/i;
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // A failed-resource error's text is often just "Failed to load resource:
      // ... 404" with no URL; the URL lives in msg.location(). Check both so
      // third-party noise (e.g. a YouTube embed's missing maxres thumbnail) is
      // correctly ignored regardless of which field carries the URL.
      const loc = msg.location()?.url ?? "";
      if (THIRD_PARTY.test(msg.text()) || THIRD_PARTY.test(loc)) return;
      const url = page.url();
      (errors[url] ||= []).push(msg.text());
    }
  });
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }
  const meaningful = Object.entries(errors).filter(
    ([, msgs]) => (msgs as string[]).length > 0
  );
  expect(meaningful, JSON.stringify(meaningful, null, 2)).toEqual([]);
});

// Test 6: homepage section anchors resolve.
test("6 - homepage section anchors exist", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const id of ["about", "results", "watch", "connect"]) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
  }
});
