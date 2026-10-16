import { test, expect } from "@playwright/test";

const SAMPLE_RESOURCE = "/claude-b2b-outreach";

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

// Test 17: accordion items open and close on click. Resource pages now open the
// first step by default (defaultOpen={0}) so the setup guide reads as real
// content, not a wall of collapsed bars, for the mostly-YouTube-arriving,
// already-watched-the-video audience. So step 1 starts OPEN, and clicking it
// toggles closed, then open again.
test("17 - accordion opens and closes", async ({ page }) => {
  await page.goto(SAMPLE_RESOURCE, { waitUntil: "networkidle" });
  const firstStep = page
    .getByRole("button", { name: /install visual studio code/i })
    .first();
  await expect(firstStep).toBeVisible();

  const panelText = page.getByText(/code\.visualstudio\.com/i).first();
  // open by default
  await expect(panelText).toBeVisible();

  await firstStep.click();
  await expect(panelText).toBeHidden();

  await firstStep.click();
  await expect(panelText).toBeVisible();
});

// Test 18: a ResourceFooter grid link navigates to its page. The grid is now
// collapsed behind the "see all free resources" disclosure, so open it first.
// The homepage no longer renders the footer, so use a resource page.
test("18 - resource footer link navigates", async ({ page }) => {
  await page.goto("/claude-marketing", { waitUntil: "networkidle" });
  await page.getByTestId("see-all-resources").click();
  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: /b2b outreach/i })
    .first();
  await footerLink.click();
  await page.waitForURL(/\/claude-b2b-outreach/);
  expect(page.url()).toMatch(/\/claude-b2b-outreach/);
});

// Test 18a: in-page links land on their section even though the sections in
// between are content-visibility:auto and only guessed at 900px until drawn.
// "On target" = the section's top at the viewport top, or, for a last section
// shorter than the screen, the page scrolled all the way down.
test("18a - homepage section links land on target", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const onTarget = (href: string) =>
    page.locator(href).evaluate((el) => {
      const top = el.getBoundingClientRect().top;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      return Math.abs(top) <= 4 || (atBottom && top > 0);
    });
  const go = async (href: string) => {
    if (page.viewportSize()!.width < 1024) {
      await page.getByRole("button", { name: /open menu/i }).click();
      await page.locator(`div.inset-0 a[href="${href}"]`).click();
    } else {
      await page.locator(`header nav a[href="${href}"]`).click();
    }
    await expect.poll(() => onTarget(href), { timeout: 8000 }).toBe(true);
  };
  await go("#connect");
  await go("#watch");
  await go("#story");
  // The hero CTA uses the same landing logic.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("link", { name: /let.s connect/i }).click();
  await expect.poll(() => onTarget("#connect"), { timeout: 8000 }).toBe(true);
});
