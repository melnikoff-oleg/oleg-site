import { test, expect } from "@playwright/test";

test("Riemann guide loads its bundled font weights and keeps its layout", async ({ page }, testInfo) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });
  await page.goto("/claude-riemann-hypothesis", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const fonts = await page.locator(".crh-page").evaluate((element) => {
    const style = getComputedStyle(element);
    return ["--font-nunito", "--font-comic"].map((variable) => {
      const family = style.getPropertyValue(variable).split(",")[0].trim().replace(/["']/g, "");
      return { variable, family, faces: Array.from(document.fonts).filter((face) => face.family.replace(/["']/g, "") === family).map((face) => ({ weight: face.weight, status: face.status, display: face.display })) };
    });
  });
  expect(fonts[0].faces.map((face) => face.weight).sort()).toEqual(["600", "800", "900"]);
  expect(fonts[1].faces.map((face) => face.weight)).toEqual(["700"]);
  for (const font of fonts) {
    expect(font.family).toBeTruthy();
    for (const face of font.faces) {
      expect(face.status).toBe("loaded");
      expect(face.display).toBe("swap");
    }
  }
  expect(fontRequests.length).toBeGreaterThanOrEqual(2);
  expect(fontRequests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
  // Full original TTFs are emitted once each, even though Nunito declares three weights.
  expect(fontRequests.filter((url) => url.endsWith(".ttf"))).toHaveLength(2);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".slide").first().screenshot({ path: testInfo.outputPath(`riemann-${testInfo.project.name}.png`) });
});
