import { test, expect } from "@playwright/test";

const REFERENCE_IDS = ["clarekitching", "diandraescobar", "laraacostar", "mattgray1", "adrian-kul", "donnellychris", "rob-hoffman-ceo", "jakezward", "charlie-hills", "liamkarlsson"];

test.beforeEach(async ({ page }) => {
  await page.goto("/linkedin-packaging", { waitUntil: "networkidle" });
});

test("The bottom gallery shows all ten original references with source links", async ({ page }, testInfo) => {
  const gallery = page.getByTestId("reference-gallery");
  const cards = gallery.getByTestId("reference-card");
  await expect(cards).toHaveCount(10);
  await expect(gallery).toContainText("Live profiles may have changed");
  expect(await gallery.evaluate((element) => !!(document.querySelector("#setup-guide")!.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  for (const [index, id] of REFERENCE_IDS.entries()) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-reference", id);
    await expect(card.getByRole("link")).toHaveAttribute("href", `https://www.linkedin.com/in/${id}/`);
    await expect.poll(() => card.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(card.locator("img")).toHaveAttribute("alt", /saved original banner, portrait and headline/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const first = (await cards.nth(0).boundingBox())!;
  const second = (await cards.nth(1).boundingBox())!;
  if (testInfo.project.name === "mobile") expect(second.y).toBeGreaterThan(first.y + first.height);
  else expect(Math.abs(first.y - second.y)).toBeLessThan(1);
  await gallery.screenshot({ path: testInfo.outputPath(`references-${testInfo.project.name}.png`) });
});

test("Presentation view navigates all ten references and restores focus", async ({ page }, testInfo) => {
  const button = page.getByRole("button", { name: "Present all 10", exact: true });
  await button.click();
  const dialog = page.getByTestId("reference-presentation");
  await expect(dialog).toBeVisible();
  for (const id of REFERENCE_IDS) {
    const image = dialog.getByTestId("presented-reference");
    await expect(image).toHaveAttribute("src", `/linkedin-packaging/references/${id}.png`);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(792);
    await page.keyboard.press("ArrowRight");
  }
  await expect(dialog.getByRole("heading", { name: "Clare Kitching", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Previous reference", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Liam Karlsson", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Next reference", exact: true }).click();
  expect(await dialog.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
  for (const control of await dialog.locator("button").all()) {
    const box = (await control.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await dialog.screenshot({ path: testInfo.outputPath(`reference-presentation-${testInfo.project.name}.png`) });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
  const lara = page.getByRole("button", { name: "Preview Lara Acosta's original profile", exact: true });
  await lara.click();
  await expect(dialog.getByRole("heading", { name: "Lara Acosta", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close reference preview", exact: true }).click();
  await expect(lara).toBeFocused();
});
