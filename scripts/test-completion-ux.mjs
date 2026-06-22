// Real-browser test of the chat completion UX (truncated / interrupted / complete
// banners + continue/retry buttons). Uses Playwright network interception to
// deterministically force each end state, so it exercises the REAL client
// (hook + ChatMessage) rendering the REAL banners — no model luck required.
//
// Run: node scripts/test-completion-ux.mjs   (dev server on :3000)

import { chromium } from "playwright-core";
import { existsSync } from "fs";
import os from "os";
import path from "path";

const CACHE = path.join(os.homedir(), "Library/Caches/ms-playwright");
const exe = [
  `${CACHE}/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`,
  `${CACHE}/chromium_headless_shell-1169/chrome-mac/headless_shell`,
].find(existsSync);
if (!exe) { console.error("No cached chromium"); process.exit(2); }

const results = [];
const check = (name, cond, detail) => {
  results.push({ name, pass: !!cond });
  console.log(`[${cond ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const line = (o) => JSON.stringify(o) + "\n";
const SOURCES = line({
  type: "sources",
  sources: [{ n: 1, type: "book", title: "Influence: The Psychology of Persuasion", attribution: "Robert Cialdini", quote: "a short test quote", page: 50, cover: "/marketing-brain/book-covers/cialdini-influence.jpg" }],
});
const deltas = (txt) => txt.split(" ").map((w) => line({ type: "delta", text: w + " " })).join("");
const done = (reason) => line({ type: "done", reason });

const browser = await chromium.launch({ executablePath: exe, headless: true });

async function newPage(routeHandler) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  // Disable auto-capture so submit() doesn't fire the memory/extract endpoint.
  await ctx.addInitScript(() => localStorage.setItem("mb-auto-capture", "0"));
  const page = await ctx.newPage();
  await page.route("**/api/marketing-brain/chat", routeHandler);
  // Let any other endpoints (memory) no-op quickly if hit.
  await page.route("**/api/marketing-brain/memory**", (r) => r.fulfill({ status: 200, body: "{}" }));
  await page.goto("http://localhost:3000/marketing-brain", { waitUntil: "networkidle" });
  return { ctx, page };
}

async function ask(page, q) {
  const ta = page.locator('textarea[placeholder="ask the brain…"]');
  await ta.click();
  await ta.fill(q);
  await page.keyboard.press("Enter");
}

const fulfillNdjson = (route, body) =>
  route.fulfill({ status: 200, headers: { "content-type": "application/x-ndjson; charset=utf-8" }, body });

// ---- Scenario 1: clean completion → NO banner ----
{
  const { ctx, page } = await newPage((route) =>
    fulfillNdjson(route, SOURCES + deltas("here is a complete answer that ends naturally.") + done("end_turn")),
  );
  await ask(page, "give me a complete answer");
  await page.waitForTimeout(2500);
  const truncated = await page.getByText("hit the length limit").count();
  const interrupted = await page.getByText("cut off before it finished").count();
  const hasAnswer = (await page.getByText("complete answer that ends").count()) > 0;
  check("S1 clean answer shows no banner", truncated === 0 && interrupted === 0 && hasAnswer, `answer=${hasAnswer}`);
  await ctx.close();
}

// ---- Scenario 2: max_tokens → amber "continue" banner, and continue works ----
{
  let call = 0;
  const { ctx, page } = await newPage((route) => {
    call++;
    if (call === 1) return fulfillNdjson(route, SOURCES + deltas("this answer starts strong but then gets cut off mid") + done("max_tokens"));
    return fulfillNdjson(route, deltas("sentence and now finishes cleanly after continuing.") + done("end_turn"));
  });
  await ask(page, "give me a very long answer");
  await page.waitForTimeout(2000);
  const bannerVisible = await page.getByText("hit the length limit").isVisible().catch(() => false);
  const continueBtn = page.getByRole("button", { name: "continue the answer" });
  const btnVisible = await continueBtn.isVisible().catch(() => false);
  check("S2a truncated answer shows amber 'continue' banner", bannerVisible && btnVisible);

  await continueBtn.click();
  await page.waitForTimeout(2000);
  const bannerGone = (await page.getByText("hit the length limit").count()) === 0;
  const extended = (await page.getByText("finishes cleanly after continuing").count()) > 0;
  const original = (await page.getByText("this answer starts strong").count()) > 0;
  check("S2b continue extends the SAME answer and clears banner", bannerGone && extended && original, `gone=${bannerGone} extended=${extended} kept=${original}`);
  await ctx.close();
}

// ---- Scenario 3: no done frame (dropped/timeout) → red "try again" banner, retry works ----
{
  let call = 0;
  const { ctx, page } = await newPage((route) => {
    call++;
    if (call === 1) return fulfillNdjson(route, SOURCES + deltas("partial answer that never gets a done frame because")); // NO done -> interrupted
    return fulfillNdjson(route, SOURCES + deltas("a full answer after retrying successfully.") + done("end_turn"));
  });
  await ask(page, "answer that will be interrupted");
  await page.waitForTimeout(2000);
  const bannerVisible = await page.getByText("cut off before it finished").isVisible().catch(() => false);
  const retryBtn = page.getByRole("button", { name: "try again" });
  const btnVisible = await retryBtn.isVisible().catch(() => false);
  check("S3a interrupted answer shows red 'try again' banner", bannerVisible && btnVisible);

  await retryBtn.click();
  await page.waitForTimeout(2000);
  const bannerGone = (await page.getByText("cut off before it finished").count()) === 0;
  const fresh = (await page.getByText("full answer after retrying").count()) > 0;
  check("S3b retry replaces the failed answer and clears banner", bannerGone && fresh, `gone=${bannerGone} fresh=${fresh}`);
  await ctx.close();
}

await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(`\n========== COMPLETION-UX SUMMARY ==========`);
console.log(`Total: ${results.length}  Passed: ${passed}  Failed: ${results.length - passed}`);
process.exit(passed === results.length ? 0 : 1);
