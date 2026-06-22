import { test, expect } from "@playwright/test";

const SAMPLE_RESOURCE = "/claude-outreach";

// Tests 12-15: visual regression snapshots. The first run establishes the
// baselines (committed); later runs diff against them. Looping <video> regions
// are masked so they never cause false diffs.

async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

// Test 12: homepage (desktop).
test("12 - homepage visual (desktop)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/");
  await settle(page);
  await expect(page).toHaveScreenshot("home-desktop.png", {
    fullPage: true,
    mask: [page.locator("video")],
  });
});

// Test 13: a representative resource page (desktop).
test("13 - resource page visual (desktop)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto(SAMPLE_RESOURCE);
  await settle(page);
  await expect(page).toHaveScreenshot("resource-desktop.png", {
    fullPage: true,
    mask: [page.locator("iframe")],
  });
});

// Test 14: marketing-brain empty state (desktop).
test("14 - marketing-brain visual (desktop)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/marketing-brain");
  await settle(page);
  await expect(page).toHaveScreenshot("marketing-brain-desktop.png", {
    fullPage: true,
    mask: [page.locator("img")],
  });
});

// Test 15: homepage (mobile / iPhone viewport).
test("15 - homepage visual (mobile)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  await page.goto("/");
  await settle(page);
  await expect(page).toHaveScreenshot("home-mobile.png", {
    fullPage: true,
    mask: [page.locator("video")],
  });
});
