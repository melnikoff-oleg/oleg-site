import { test, expect, type Page } from "@playwright/test";

// Tests 59+: the /ideas board (vote on the video ideas already there). The
// suggest-a-video form was removed on 2026-10-24: nobody used it.
//
// Two halves, both deterministic without any secret:
//  - the API guard rails, which all return before the route touches Supabase or
//    Anthropic, so they cost nothing and cannot flake on a network call;
//  - the page itself, which renders a 200 empty state when the database env is
//    absent (that graceful degradation is a design requirement precisely so this
//    suite runs in a key-free environment).
//
// The vote happy path needs a live database and are verified by hand
// against a real Supabase project, not here.

const MOBILE_ONLY = (testInfo: { project: { name: string } }) =>
  test.skip(testInfo.project.name !== "mobile", "mobile only");

const MIN_TAP = 44;

async function settle(page: Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

// ── API guard rails ──────────────────────────────────────────────────────────

test.describe("59 - ideas api validation", () => {
  test("the submit endpoint is gone -> 405", async ({ request }) => {
    const res = await request.post("/api/ideas", { data: { title: "a real video idea here" } });
    expect(res.status()).toBe(405);
  });

  test("vote with a non-uuid ideaId -> 400 invalid_idea", async ({ request }) => {
    const res = await request.post("/api/ideas/vote", { data: { ideaId: "1; drop" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("invalid_idea");
  });

  test("vote without the wanted state -> 400 bad_request", async ({ request }) => {
    // A toggle is not accepted: the client must say whether it is voting or
    // unvoting (see setVote in src/lib/ideas/db.ts).
    const res = await request.post("/api/ideas/vote", {
      data: { ideaId: "00000000-0000-4000-8000-000000000000" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("bad_request");
  });

  test("vote with no body -> 400", async ({ request }) => {
    const res = await request.post("/api/ideas/vote", { data: Buffer.from("nope") });
    expect(res.status()).toBe(400);
  });

  test("admin actions are refused without the secret", async ({ request }) => {
    const res = await request.post("/api/ideas/admin", {
      data: { action: "delete", id: "whatever" },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe("denied");
  });

  test("admin login with a wrong secret does not let you in", async ({ request }) => {
    const res = await request.post("/api/ideas/admin", {
      data: { action: "login", secret: "definitely-not-it" },
    });
    // 401 when a secret is configured, 503 when the env var is absent (CI).
    expect([401, 503]).toContain(res.status());
    expect(res.headers()["set-cookie"]).toBeUndefined();
  });
});

// ── The page ─────────────────────────────────────────────────────────────────

test("60 - ideas: hero and board render", async ({ page }) => {
  await settle(page, "/ideas");

  await expect(page.locator("h1")).toHaveText(/what should i build next/i);

  // The sort control is the board's own affordance and must always be there,
  // whether or not the board has any ideas on it yet.
  await expect(page.getByRole("group", { name: /sort ideas/i })).toBeVisible();
});

test("61 - no suggest-a-video form, on the board or in any footer", async ({ page }) => {
  await settle(page, "/ideas");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("input, textarea")).toHaveCount(0);

  // The footer used to invite every reader to the board ("Got an idea for a
  // video?"); it no longer links there.
  await settle(page, "/claude-code-tutorial");
  await expect(page.locator('footer a[href="/ideas"]')).toHaveCount(0);
  await expect(page.getByText(/got an idea for a video/i)).toHaveCount(0);
});

test("62 - ideas: no em dashes in the copy", async ({ page }) => {
  await settle(page, "/ideas");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/[–—]/);
});

test("63 - ideas admin: locked behind the secret", async ({ page }) => {
  await settle(page, "/ideas/admin");
  // The login form, and nothing else: no idea list, no activity log.
  await expect(page.locator("#admin-secret")).toBeVisible();
  await expect(page.getByText(/recent activity/i)).toHaveCount(0);
});

// ── Mobile ───────────────────────────────────────────────────────────────────

test("65 - ideas: sort controls are >=44px tap targets", async ({
  page,
}, testInfo) => {
  MOBILE_ONLY(testInfo);
  await settle(page, "/ideas");

  const targets = [
    page.getByRole("button", { name: "top", exact: true }),
    page.getByRole("button", { name: "new", exact: true }),
  ];
  for (const t of targets) {
    const box = await t.boundingBox();
    expect(box, "tap target box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TAP);
  }
});
