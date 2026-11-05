import { expect, test, type Page } from "@playwright/test";
import { shortLinks } from "../../short-links";

const boldaneLink = (page: Page) => page.locator('a[href^="https://boldane.com"]').first();

/** The link's tags once hydration has swapped in the first touch. */
async function tagsOnceHydrated(page: Page, source: string) {
  await expect.poll(async () => new URL((await boldaneLink(page).getAttribute("href"))!).searchParams.get("utm_source")).toBe(source);
  return new URL((await boldaneLink(page).getAttribute("href"))!).searchParams;
}

test("120: every short link answers a temporary redirect and its page opens", async ({ request }) => {
  for (const { path, to } of shortLinks) {
    const hop = await request.get(path, { maxRedirects: 0 });
    expect(hop.status(), path).toBe(307);
    expect(hop.headers().location, path).toBe(to);
    expect((await request.get(to)).status(), to).toBe(200);
  }
});

test("121: the tagged landing still names one canonical page", async ({ request }) => {
  const html = await (await request.get("/yt-ig")).text();
  expect(html).toMatch(/rel="canonical" href="https:\/\/www\.oleg\.ae\/claude-reels"/);
});

test("122: the server's HTML already links to Boldane with all five tags", async ({ request }) => {
  const html = await (await request.get("/claude-reels")).text();
  const href = html.match(/href="(https:\/\/boldane\.com\/[^"]+)"/)?.[1].replace(/&amp;/g, "&");
  const tags = new URL(href!).searchParams;
  expect(tags.get("utm_source")).toBe("oleg.ae");
  expect(tags.get("utm_medium")).toBe("referral");
  expect(tags.get("utm_campaign")).toBe("discovery-call");
  expect(tags.get("utm_content")).toBe("claude-reels");
  expect(tags.get("utm_term")).toBe("oleg.ae-claude-reels");
});

test("123: YouTube to oleg.ae to Boldane keeps the video, across pages and return visits", async ({ page }) => {
  await page.goto("/yt-ig");
  let tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_medium")).toBe("social");
  expect(tags.get("utm_campaign")).toBe("discovery-call");
  expect(tags.get("utm_content")).toBe("description-viral-instagram-reels");
  expect(tags.get("utm_term")).toBe("oleg.ae-claude-reels");
  expect(await boldaneLink(page).getAttribute("rel")).toBe("noopener");

  // Moving around the site: still the video, and the bridge names the page they are on now.
  await page.getByTestId("see-all-resources").click();
  await page.locator('details[open] a[href="/claude-tiktok"]').first().click();
  await page.waitForURL("**/claude-tiktok");
  await expect.poll(async () => (await boldaneLink(page).getAttribute("href"))!).toContain("utm_term=oleg.ae-claude-tiktok");
  tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_content")).toBe("description-viral-instagram-reels");

  // Coming back later, straight to the site.
  await page.goto("/claude-content");
  tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_content")).toBe("description-viral-instagram-reels");
  expect(tags.get("utm_term")).toBe("oleg.ae-claude-content");

  // A second video does not take the credit from the first.
  await page.goto("/yt-tt");
  tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_content")).toBe("description-viral-instagram-reels");
});

test("124: an untagged visit is named from its referrer", async ({ page }) => {
  await page.goto("/claude-code-pricing", { referer: "https://www.google.com/" });
  const tags = await tagsOnceHydrated(page, "google");
  expect(tags.get("utm_medium")).toBe("organic");
  expect(tags.get("utm_content")).toBe("claude-code-pricing");
});

test("125: a direct visit reads as oleg.ae, and a later video replaces it", async ({ page }) => {
  await page.goto("/claude-reels");
  let tags = await tagsOnceHydrated(page, "oleg.ae");
  expect(tags.get("utm_content")).toBe("claude-reels");
  await page.goto("/yt-tt");
  tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_content")).toBe("description-viral-tiktok-videos");
});

test("126: an expired source gives way", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "first-touch",
      JSON.stringify({ source: "youtube", medium: "social", content: "description-old", at: Date.now() - 31 * 864e5 }),
    ),
  );
  await page.goto("/claude-reels", { referer: "https://www.linkedin.com/" });
  await tagsOnceHydrated(page, "linkedin");
});

test("127: storage switched off still attributes the page load", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/yt-ig");
  const tags = await tagsOnceHydrated(page, "youtube");
  expect(tags.get("utm_content")).toBe("description-viral-instagram-reels");
});
