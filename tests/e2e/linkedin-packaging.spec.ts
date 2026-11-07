import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTE = "/linkedin-packaging";
const ZIP = "https://github.com/melnikoff-oleg/linkedin-packaging/archive/refs/heads/main.zip";

test.beforeEach(async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "networkidle" });
});

test("LinkedIn guide gives the download and proof before three visible setup steps", async ({ page }) => {
  const cta = page.getByTestId("hero-cta").getByRole("link");
  await expect(cta).toHaveAttribute("href", ZIP);
  await expect(cta).toContainText("Download the project");
  const boxes = await Promise.all([cta, page.locator("#before-after"), page.locator("#setup-guide")].map((item) => item.boundingBox()));
  expect(boxes[0]!.y).toBeLessThan(boxes[1]!.y);
  expect(boxes[1]!.y).toBeLessThan(boxes[2]!.y);
  for (const number of [1, 2, 3]) await expect(page.locator(`#step-${number}`)).toBeVisible();
  await expect(page.locator('[id^="step-"]')).toHaveCount(3);
  await expect(page.locator("iframe, video")).toHaveCount(0);
  await expect(page.getByTestId("example-scope")).toBeVisible();
  await expect(page.getByTestId("example-scope")).toContainText("Company branding is extra customization");
  await expect(page.getByTestId("prerequisites")).toBeVisible();
  const prerequisites = page.getByTestId("prerequisites");
  await expect(prerequisites.locator("p").first()).toBeHidden();
  await prerequisites.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(prerequisites.locator("p").first()).toBeVisible();
  await expect(prerequisites).toContainText("python3 --version");
  await page.keyboard.press("Enter");
  await expect(prerequisites.locator("p").first()).toBeHidden();
  await expect(page.getByTestId("reference-example")).toBeHidden();
  await page.getByTestId("reference-details").locator("summary").click();
  await expect(page.getByTestId("reference-example")).toBeVisible();
  const referenceImage = page.getByTestId("reference-example").locator("img");
  await referenceImage.scrollIntoViewIfNeeded();
  await expect.poll(() => referenceImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("Each person's styles change independently and preserve the before image", async ({ page }) => {
  for (const person of ["kayla", "emily"]) {
    const comparison = page.getByTestId(`${person}-comparison`);
    await expect(comparison.getByRole("group", { name: /Preview styles/ })).toBeVisible();
    await expect(comparison.getByRole("button", { name: "Clare", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(comparison.getByTestId(`${person}-headline`)).toBeHidden();
    await page.getByTestId(`${person}-details`).locator("summary").click();
    const before = comparison.locator('img').first();
    const beforeSrc = await before.getAttribute("src");
    for (const style of ["Clare", "Charlie", "Lara"]) {
      await comparison.getByRole("button", { name: style, exact: true }).click();
      await expect(comparison.getByRole("button", { name: style, exact: true })).toHaveAttribute("aria-pressed", "true");
      const after = comparison.locator("img").last();
      await expect(after).toHaveAttribute("alt", new RegExp(`proposed ${style} style`));
      await expect(after).toHaveJSProperty("complete", true);
      await expect.poll(() => after.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      expect(await before.getAttribute("src")).toBe(beforeSrc);
      await expect(comparison.getByRole("link", { name: "Open full-size preview ↗", exact: true })).toHaveAttribute("href", `/linkedin-packaging/${person}-after-${style.toLowerCase()}.webp`);
      await expect(comparison.getByTestId(`${person}-headline`)).toHaveCSS("font-size", "16px");
      expect((await comparison.getByTestId(`${person}-headline`).innerText()).length).toBeGreaterThan(100);
      await expect(page.getByLabel("Style", { exact: true })).toHaveValue("clarekitching");
    }
  }
  await expect(page.getByTestId("emily-comparison")).toContainText("original banner unavailable");
});

test("The OS switch changes setup, settings and run commands, and copies exact text", async ({ page }) => {
  // Stubbing only clipboard avoids requiring OS clipboard permission in CI.
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copiedCommand: string }).copiedCommand = text; } } });
  });
  await expect(page.getByTestId("Setup command").locator("code")).toHaveText("bash setup.sh");
  await expect(page.getByTestId("Open settings").locator("code")).toHaveText("open -e .env");
  const selector = page.getByLabel("Style", { exact: true });
  await expect(selector).toHaveValue("clarekitching");
  await expect(selector.locator("option")).toHaveCount(10);
  await expect(page.getByTestId("Create command").locator("code")).toHaveText("./package.sh --linkedin https://www.linkedin.com/in/your-handle/ --style clarekitching");
  const windows = page.getByRole("button", { name: "Windows", exact: true });
  await windows.click();
  await expect(windows).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("Setup command").locator("code")).toHaveText("powershell -NoProfile -ExecutionPolicy Bypass -File .\\setup.ps1");
  await expect(page.getByTestId("Open settings").locator("code")).toHaveText("notepad .env");
  await expect(page.getByTestId("prerequisites")).toContainText("Add Python to PATH");
  await expect(page.getByTestId("prerequisites")).toContainText("py --version");
  const command = ".\\.venv\\Scripts\\python.exe -m linkedin_pack create --linkedin https://www.linkedin.com/in/your-handle/ --style clarekitching";
  await expect(page.getByTestId("Create command").locator("code")).toHaveText(command);
  await page.getByTestId("Create command").getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.getByTestId("Create command").getByRole("button")).toHaveText("copied");
  expect(await page.evaluate(() => (window as unknown as { copiedCommand: string }).copiedCommand)).toBe(command);
  await selector.selectOption("charlie-hills");
  const selectedCommand = command.replace("clarekitching", "charlie-hills");
  await expect(page.getByTestId("Create command").locator("code")).toHaveText(selectedCommand);
  await expect(page.getByTestId("Create command").getByRole("button")).toHaveText("Copy");
  await page.getByTestId("Create command").getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { copiedCommand: string }).copiedCommand)).toBe(selectedCommand);
  await page.getByRole("button", { name: "Mac / Linux", exact: true }).click();
  await expect(selector).toHaveValue("charlie-hills");
  await expect(page.getByTestId("Create command").locator("code")).toHaveText("./package.sh --linkedin https://www.linkedin.com/in/your-handle/ --style charlie-hills");
});

test("Profile comparisons stack on phones and fit without horizontal scrolling", async ({ page }, testInfo) => {
  for (const os of ["Mac / Linux", "Windows"]) {
    await page.getByRole("button", { name: os, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const pair = page.getByTestId("kayla-comparison").getByTestId("comparison-pair");
  const before = await pair.locator("figure").first().boundingBox();
  const after = await pair.locator("figure").last().boundingBox();
  if (testInfo.project.name === "mobile") {
    expect(after!.y).toBeGreaterThanOrEqual(before!.y + before!.height);
    expect(Math.abs(after!.x - before!.x)).toBeLessThan(1);
  } else {
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(after!.x).toBeGreaterThan(before!.x);
  }
  for (const button of await page.locator('#before-after button, #setup-guide button').all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.locator("#setup-guide").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Array.from(document.querySelectorAll("#setup-guide [data-reveal]")).every((element) => Number(getComputedStyle(element).opacity) === 1));
  await page.locator("#setup-guide").screenshot({ path: testInfo.outputPath(`setup-${testInfo.project.name}.png`) });
  await page.locator("#before-after").screenshot({ path: testInfo.outputPath(`examples-${testInfo.project.name}.png`) });
});

test("Metadata, structured steps and accessibility agree with the visible guide", async ({ page }) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.oleg.ae/linkedin-packaging");
  const schema = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((text) => JSON.parse(text));
  const howTo = schema.find((entry) => entry["@type"] === "HowTo");
  expect(howTo.step).toHaveLength(3);
  for (const step of howTo.step) await expect(page.locator(new URL(step.url).hash)).toHaveCount(1);
  expect(schema.some((entry) => entry["@type"] === "VideoObject")).toBe(false);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.id === "heading-order")).toEqual([]);
});
