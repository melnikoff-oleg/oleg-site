import { expect, test } from "@playwright/test";

// The tracker ignores localhost and automated browsers, so give it a real-looking host and the flag
// it looks for. Events are answered here and never reach Plausible.
const PORT = process.env.PORT ?? "3000";
const ORIGIN = `http://attribution.test:${PORT}`;
test.use({ launchOptions: { args: ["--host-resolver-rules=MAP attribution.test 127.0.0.1"] } });

test("128: the pageview carries the tags and the address keeps them; a click is one row per destination", async ({ page, context }) => {
  const events: { n: string; u: string; p?: { url?: string } }[] = [];
  await context.route("https://plausible.io/**", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 202, body: "ok" });
  });
  await context.route("https://boldane.com/**", (route) => route.fulfill({ status: 200, body: "boldane" }));
  await page.addInitScript(() => ((window as unknown as { __plausible: boolean }).__plausible = true));

  await page.goto(`${ORIGIN}/yt-ig`);
  await expect.poll(() => events.find((e) => e.n === "pageview")?.u).toContain("utm_content=description-viral-instagram-reels");

  const link = page.locator('a[href^="https://boldane.com"]').first();
  await expect.poll(async () => (await link.getAttribute("href"))!).toContain("utm_source=youtube");

  // Checked after hydration, so a script that cleaned the address would have run by now.
  expect(page.url()).toContain("utm_content=description-viral-instagram-reels");
  expect(events.filter((e) => e.n === "pageview")).toHaveLength(1);

  const popup = context.waitForEvent("page");
  await link.click();
  const opened = await popup;
  expect(new URL(opened.url()).searchParams.get("utm_content")).toBe("description-viral-instagram-reels");
  await expect.poll(() => events.find((e) => e.n === "Outbound Link: Click")?.p?.url).toBe("https://boldane.com/");
});
