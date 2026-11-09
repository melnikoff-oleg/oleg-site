// /ubs-posts (all 25 Ubersuggest drafts), /ubs-posts-rate (five of them, rated
// by the team) and /ubs-posts-ratings (what they said). The POST is answered by
// the test, so the suite never writes a vote to the real database.
import { test, expect } from "@playwright/test";

const RATED = ["09_company_case", "13_layers", "05_table", "mike_brand_search", "gabriel_dev_then_now"];

test("ubs-posts shows all 25 drafts, each with its own author, and links to the rating page", async ({ page }) => {
  const res = await page.goto("/ubs-posts");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".ubs-card")).toHaveCount(25);
  await expect(page.locator(".ubs-card .ubs-nm").first()).toHaveText("Ubersuggest");
  await expect(page.locator(".ubs-card .ubs-nm", { hasText: "Mike Kamo" })).toHaveCount(3);
  await expect(page.locator('a[href="/ubs-posts-rate"]').first()).toBeVisible();
  // Filtering by author leaves only that author's posts.
  await page.getByRole("button", { name: /Salun Marvin/ }).click();
  await expect(page.locator(".ubs-card")).toHaveCount(3);
  // No first comments on these posts, ever.
  await expect(page.locator(".ubs-cmt")).toHaveCount(0);
});

test("ubs-posts folds long texts and opens them on 'more'", async ({ page }) => {
  await page.goto("/ubs-posts");
  const card = page.locator(".ubs-card").first();
  const more = card.locator(".ubs-more").first();
  await expect(more).toBeVisible();
  await more.click();
  await expect(card.locator(".ubs-full")).toContainText("AI Search Visibility");
});

test("ubs-posts-rate: name, five scores, submit, then everyone's results", async ({ page }) => {
  let sent: { name: string; votes: { post_id: string; rating: number; note: string | null }[] } | null = null;
  await page.route("**/api/ubs-posts/votes", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    sent = route.request().postDataJSON();
    await route.fulfill({
      json: { ok: true, results: RATED.map((post_id, i) => ({ post_id, count: 2, average: 7.5, notes: i === 0 ? [{ name: "Jeff J.", rating: 9, note: "Love the playbook", at: "2026-11-09T10:00:00Z" }] : [] })) },
    });
  });

  await page.goto("/ubs-posts-rate");
  await expect(page.locator(".ubs-card")).toHaveCount(5);
  await expect(page.locator(".ubs-rate")).toHaveCount(0); // no score buttons before the name

  await page.getByRole("button", { name: "Rate the posts" }).click();
  await page.locator("#ubs-name").fill("Playwright Tester");
  await page.getByRole("button", { name: "Start rating" }).click();
  await expect(page.locator(".ubs-rate")).toHaveCount(5);

  // Submitting early does not send anything: it points at the first unrated post.
  // The button is aria-disabled until all five are rated but still takes the click (that is how it
  // explains itself), so the click is forced past Playwright's own "enabled" check.
  await page.getByRole("button", { name: "Submit ratings" }).click({ force: true });
  await expect(page.locator(".ubs-toast")).toContainText("Please rate this post too");
  expect(sent).toBeNull();

  for (let i = 0; i < 5; i++) {
    await page.locator(`#panel-${RATED[i]} .ubs-scale button`).nth(5 + (i % 4)).click();
  }
  await page.locator(`#panel-${RATED[0]} textarea`).fill("Strong case, clear steps");
  await expect(page.locator(".ubs-count")).toHaveText("5 of 5 rated");
  await page.getByRole("button", { name: "Submit ratings" }).click();

  await expect(page.locator("h1")).toContainText("Thanks, Playwright");
  await expect(page.locator(".ubs-res")).toHaveCount(5);
  await expect(page.locator(".ubs-note").first()).toContainText("Love the playbook");
  expect(sent!.name).toBe("Playwright Tester");
  expect(sent!.votes.map((v) => v.post_id)).toEqual(RATED);
  expect(sent!.votes[0]).toEqual({ post_id: RATED[0], rating: 6, note: "Strong case, clear steps" });
});

test("ubs-posts-ratings lists the five rated posts with their scores", async ({ page }) => {
  const res = await page.goto("/ubs-posts-ratings");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".ubs-res")).toHaveCount(5);
  await expect(page.locator(".ubs-stats")).toContainText("ratings");
  await expect(page.locator('a[href="/ubs-posts-rate"]').first()).toBeVisible();
});

test("the votes API refuses an incomplete submission", async ({ request }) => {
  const res = await request.post("/api/ubs-posts/votes", { data: { name: "Playwright Tester", votes: [{ post_id: RATED[0], rating: 8 }] } });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.missing).toEqual(RATED.slice(1));
  const get = await request.get("/api/ubs-posts/votes");
  expect(get.status()).toBe(200);
  expect((await get.json()).results.map((r: { post_id: string }) => r.post_id)).toEqual(RATED);
});

for (const path of ["/ubs-posts", "/ubs-posts-rate", "/ubs-posts-ratings"]) {
  test(`${path} is kept out of search and does not scroll sideways`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(1);
  });
}
