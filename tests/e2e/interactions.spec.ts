import { test, expect } from "@playwright/test";

const SAMPLE_RESOURCE = "/claude-outreach";

// Tests 16-18: interactive behavior still works after the restyle.

// Test 16: the homepage header gains a blurred navy background on scroll.
test("16 - header blurs on scroll", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const bar = page.locator("header > div").first();

  // At the top: no backdrop blur.
  const before = await bar.evaluate(
    (el) => getComputedStyle(el).backdropFilter
  );
  expect(before === "none" || before === "").toBe(true);

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);

  const afterFilter = await bar.evaluate(
    (el) => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter
  );
  const afterClass = (await bar.getAttribute("class")) || "";
  expect(afterFilter.includes("blur") || afterClass.includes("bg-navy")).toBe(
    true
  );
});

// Test 17: accordion items open and close on click.
test("17 - accordion opens and closes", async ({ page }) => {
  await page.goto(SAMPLE_RESOURCE, { waitUntil: "networkidle" });
  const firstStep = page
    .getByRole("button", { name: /install visual studio code/i })
    .first();
  await expect(firstStep).toBeVisible();

  const panelText = page.getByText(/code\.visualstudio\.com/i).first();
  await expect(panelText).toBeHidden();

  await firstStep.click();
  await expect(panelText).toBeVisible();

  await firstStep.click();
  await expect(panelText).toBeHidden();
});

// Test 18: a ResourceFooter card navigates to its page. The homepage no longer
// renders the footer, so use a resource page.
test("18 - resource footer link navigates", async ({ page }) => {
  await page.goto("/claude-seo", { waitUntil: "networkidle" });
  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: /cold outreach/i })
    .first();
  await footerLink.click();
  await page.waitForURL(/\/claude-outreach/);
  expect(page.url()).toMatch(/\/claude-outreach/);
});
