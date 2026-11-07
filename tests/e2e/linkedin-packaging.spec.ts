import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { stat } from "node:fs/promises";

const ROUTE = "/linkedin-packaging";
const ZIP = "/downloads/linkedin-packaging.zip";

test.beforeEach(async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "networkidle" });
});

test("One direct download leads to the agent brief and local review", async ({ page, request }) => {
  const cta = page.getByTestId("hero-cta").getByRole("link");
  await expect(cta).toHaveAttribute("href", ZIP);
  await expect(cta).toHaveAttribute("download", "linkedin-packaging.zip");
  await expect(cta).not.toHaveAttribute("target", "_blank");
  for (const number of [1, 2, 3]) await expect(page.locator(`#step-${number}`)).toBeVisible();
  await expect(page.locator('[id^="step-"]')).toHaveCount(3);
  await expect(page.locator("#setup-guide")).toContainText("Claude Code");
  await expect(page.locator("#setup-guide")).toContainText("Codex");
  await expect(page.locator("#setup-guide")).toContainText("localhost");
  await expect(page.locator("#setup-guide")).not.toContainText(/terminal|GitHub|powershell|bash setup/);
  await expect(page.locator("#setup-guide select, #setup-guide details")).toHaveCount(0);
  const response = await request.head(ZIP);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/zip");
  expect(response.headers()["content-disposition"]).toContain('attachment; filename="linkedin-packaging.zip"');
  const downloadEvent = page.waitForEvent("download");
  await cta.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("linkedin-packaging.zip");
  expect((await stat((await download.path())!)).size).toBeGreaterThan(1_000_000);
  expect(page.url()).toContain(ROUTE);
});

test("The brief copies natural-language inputs and complete delivery instructions", async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copiedBrief: string }).copiedBrief = text; } } });
  });
  const prompt = page.getByTestId("starter-prompt");
  const text = await prompt.locator("pre").innerText();
  for (const phrase of ["LinkedIn:", "Website:", "Branding:", "About me:", "Photo:", "localhost preview", "feedback", "editable source files"]) expect(text).toContain(phrase);
  await prompt.getByRole("button", { name: "Copy prompt", exact: true }).click();
  await expect(prompt.getByRole("button")).toHaveText("copied");
  expect(await page.evaluate(() => (window as unknown as { copiedBrief: string }).copiedBrief)).toBe(text);
});

test("All six example variants work and headline details stay optional", async ({ page }) => {
  for (const person of ["kayla", "emily"]) {
    const comparison = page.getByTestId(`${person}-comparison`);
    const beforeSrc = await comparison.locator("img").first().getAttribute("src");
    await expect(comparison.getByTestId(`${person}-headline`)).toBeHidden();
    const summary = page.getByTestId(`${person}-details`).locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    for (const style of ["Clare", "Lara", "Charlie"]) {
      await comparison.getByRole("button", { name: style, exact: true }).click();
      const after = comparison.locator("img").last();
      await expect(after).toHaveAttribute("alt", new RegExp(`proposed ${style} style`));
      await expect.poll(() => after.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      expect(await comparison.locator("img").first().getAttribute("src")).toBe(beforeSrc);
      await expect(comparison.getByTestId(`${person}-headline`)).toBeVisible();
    }
    await summary.click();
    await expect(comparison.getByTestId(`${person}-headline`)).toBeHidden();
  }
  await expect(page.getByTestId("emily-comparison")).toContainText("original banner unavailable");
});

test("The concise page stays readable and usable on phones", async ({ page }, testInfo) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const pair = page.getByTestId("kayla-comparison").getByTestId("comparison-pair");
  const before = (await pair.locator("figure").first().boundingBox())!;
  const after = (await pair.locator("figure").last().boundingBox())!;
  if (testInfo.project.name === "mobile") expect(after.y).toBeGreaterThanOrEqual(before.y + before.height);
  else expect(Math.abs(after.y - before.y)).toBeLessThan(1);
  for (const control of await page.locator("#before-after button, #before-after summary, #setup-guide button").all()) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.locator("#setup-guide").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Array.from(document.querySelectorAll("#setup-guide [data-reveal]")).every((element) => Number(getComputedStyle(element).opacity) === 1));
  await page.locator("#setup-guide").screenshot({ path: testInfo.outputPath(`setup-${testInfo.project.name}.png`) });
  await page.locator("#before-after").screenshot({ path: testInfo.outputPath(`examples-${testInfo.project.name}.png`) });
});

test("Metadata and accessibility describe the same agent workflow", async ({ page }) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.oleg.ae/linkedin-packaging");
  const schema = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((text) => JSON.parse(text));
  const howTo = schema.find((entry) => entry["@type"] === "HowTo");
  expect(howTo.step).toHaveLength(3);
  expect(JSON.stringify(howTo)).toContain("Codex");
  for (const step of howTo.step) await expect(page.locator(new URL(step.url).hash)).toHaveCount(1);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((v) => v.impact === "critical" || v.id === "heading-order")).toEqual([]);
});
