import { test, expect, type Page } from "@playwright/test";

// Playing a reel in place, from our own storage, instead of leaving for
// Instagram. Two halves.
//
// The API guard rails are deterministic without a secret: every one of them
// returns before the route reaches Supabase.
//
// The player is driven with BOTH routes stubbed, so it does not depend on which
// files happen to be on storage today. It does need tiles to exist, and tiles
// come from the live index, so in an environment with no keys that half skips
// itself and says so rather than passing on an empty page.

const HELD = "/api/viral-reels/video/held";

test.describe("reel video: API guard rails", () => {
  test("held refuses a body that is not JSON", async ({ request }) => {
    const res = await request.post(HELD, {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from("nope"),
    });
    expect(res.status()).toBe(400);
  });

  test("held refuses anything that is not a list of shortcodes", async ({ request }) => {
    for (const codes of [undefined, "DZKJowos9cH", ["a b"], ["x)or(1=1"], ["../secret"], [42]]) {
      const res = await request.post(HELD, { data: { codes } });
      expect(res.status(), JSON.stringify(codes)).toBe(400);
    }
  });

  test("held refuses more than 200 codes", async ({ request }) => {
    const codes = Array.from({ length: 201 }, (_, i) => `CODE${String(i).padStart(6, "0")}`);
    const res = await request.post(HELD, { data: { codes } });
    expect(res.status()).toBe(400);
  });

  test("the video route refuses a path that is not a shortcode", async ({ request }) => {
    for (const bad of ["a", "has space", "..%2fsecret", "x".repeat(40)]) {
      const res = await request.get(`/api/viral-reels/video/${bad}`, { maxRedirects: 0 });
      expect(res.status(), bad).toBe(400);
    }
  });
});

/** Stub both routes: `held` answers with exactly these codes, the file itself is empty. */
async function stub(page: Page, held: string[]) {
  await page.route(`**${HELD}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ held }) }),
  );
  // A function, not a pattern. "held" is itself a run of shortcode characters,
  // so a regex for /video/<shortcode> also matches /video/held, and Playwright
  // asks the most recently registered route first: the first version of this
  // stub answered the lookup with an empty video and every tile stayed a link.
  await page.route(
    (url) => /\/api\/viral-reels\/video\/[A-Za-z0-9_-]+$/.test(url.pathname) && !url.pathname.endsWith("/held"),
    (route) => route.fulfill({ status: 200, contentType: "video/mp4", body: "" }),
  );
}

/** The first two tiles' shortcodes, read off their Instagram links. */
async function firstTwo(page: Page): Promise<string[]> {
  return page.$$eval("article a[href*='instagram.com']", (links) =>
    links
      .map((a) => (a as HTMLAnchorElement).href.replace(/\/$/, "").split("/").pop() ?? "")
      .filter(Boolean)
      .slice(0, 2),
  );
}

for (const route of ["/reels", "/creators/kyle"]) {
  test.describe(`reel video: the player on ${route}`, () => {
    test("only a held tile plays, the player opens on it, Escape closes it", async ({ page }) => {
      // First load with nothing held, to learn which reels are on the page.
      await stub(page, []);
      await page.goto(route, { waitUntil: "networkidle" });
      const codes = await firstTwo(page);
      test.skip(codes.length < 2, "no tiles: this environment has no index to draw from");
      await expect(page.locator("[data-reel-play]")).toHaveCount(0);

      // Now hold the first one only.
      const [held, notHeld] = codes;
      await page.unroute(`**${HELD}`);
      await stub(page, [held]);
      await page.reload({ waitUntil: "networkidle" });

      const play = page.locator(`[data-reel-play="${held}"]`);
      await expect(play).toBeVisible();
      await expect(page.locator("[data-reel-play]")).toHaveCount(1);
      await expect(page.locator(`[data-reel-play="${notHeld}"]`)).toHaveCount(0);

      // The tile we hold nothing for is what it always was: a link to Instagram.
      await expect(page.locator(`article a[href*="${notHeld}"]`)).toHaveAttribute("target", "_blank");

      // The control covers the picture, so it clears the 44px tap floor easily.
      const box = await play.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);

      // The stub serves an empty file, so the <video> errors the moment it
      // loads and the player swaps to its fallback. That is the app doing the
      // right thing, and it means the element cannot be inspected afterwards:
      // the first version of this test looked for it and found nothing. What
      // is checked instead is what is true either way. The player asked for
      // THIS reel's file, and a file that will not play leaves the visitor a
      // sentence and a way to Instagram, never a black box.
      const asked = page.waitForRequest(
        (req) => new URL(req.url()).pathname === `/api/viral-reels/video/${held}`,
      );
      await play.click();
      const player = page.locator(`[data-reel-player="${held}"]`);
      await expect(player).toBeVisible();
      await asked;
      await expect(player.getByText("This one would not load")).toBeVisible();
      await expect(player.getByRole("link", { name: "Open on Instagram" })).toHaveAttribute(
        "href",
        new RegExp(held),
      );

      // The player never widens the page.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      await page.keyboard.press("Escape");
      await expect(player).toHaveCount(0);
      // And the page scrolls again once it is gone.
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    });
  });
}
