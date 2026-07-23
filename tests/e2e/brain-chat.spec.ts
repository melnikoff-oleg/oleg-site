import { test, expect, type Page } from "@playwright/test";

// Drives the marketing-brain chat end to end with a stubbed NDJSON stream, so
// the site's only dynamic feature (streaming answer, source cards, continue/retry
// banners) has real coverage without spending an Anthropic key/tokens. Fully
// offline and deterministic.

const CHAT = "**/api/marketing-brain/chat";

const SOURCES = [
  {
    n: 1,
    type: "book",
    title: "Influence",
    attribution: "Robert Cialdini",
    quote: "reciprocity is a powerful lever",
    page: 42,
    cover: "/marketing-brain/book-covers/influence.jpg",
  },
  {
    n: 2,
    type: "video",
    title: "How MrBeast Designs Thumbnails",
    attribution: "MrBeast · The Diary Of A CEO",
    quote: "the thumbnail decides the click",
    videoId: "dQw4w9WgXcQ",
    timecode: "1:23",
    seconds: 83,
    url: "https://youtu.be/dQw4w9WgXcQ",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
];

function ndjson(lines: object[]): string {
  return lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
}

// Silence the auxiliary memory calls so the test is fully offline/deterministic.
async function stubMemory(page: Page) {
  await page.route("**/api/marketing-brain/memory", (r) =>
    r.fulfill({ contentType: "application/json", body: JSON.stringify({ text: "" }) }),
  );
  await page.route("**/api/marketing-brain/memory/extract", (r) =>
    r.fulfill({ contentType: "application/json", body: JSON.stringify({ added: null }) }),
  );
}

async function ask(page: Page, question: string) {
  const box = page.getByPlaceholder("ask the brain…");
  await box.click();
  await box.fill(question);
  await page.getByRole("button", { name: "Send" }).click();
}

test.describe("marketing-brain chat", () => {

  test("clean answer renders streamed text + source cards", async ({ page }) => {
    await stubMemory(page);
    await page.route(CHAT, (route) =>
      route.fulfill({
        contentType: "application/x-ndjson",
        body: ndjson([
          { type: "sources", sources: SOURCES },
          { type: "delta", text: "Reciprocity " },
          { type: "delta", text: "drives replies [1]." },
          { type: "done", reason: "end_turn" },
        ]),
      }),
    );
    await page.goto("/marketing-brain", { waitUntil: "networkidle" });
    await ask(page, "how do i get more replies?");

    // Streamed answer text appears.
    await expect(page.getByText(/Reciprocity drives replies/)).toBeVisible();
    // Both source cards render (book title + video title).
    await expect(page.getByText("Influence", { exact: true })).toBeVisible();
    await expect(page.getByText("How MrBeast Designs Thumbnails")).toBeVisible();
    // The book citation shows its page number.
    await expect(page.getByText(/p\.\s*42/)).toBeVisible();
  });

  test("max_tokens finish shows a 'continue the answer' control", async ({ page }) => {
    await stubMemory(page);
    await page.route(CHAT, (route) =>
      route.fulfill({
        contentType: "application/x-ndjson",
        body: ndjson([
          { type: "sources", sources: SOURCES },
          { type: "delta", text: "A long answer that got cut" },
          { type: "done", reason: "max_tokens" },
        ]),
      }),
    );
    await page.goto("/marketing-brain", { waitUntil: "networkidle" });
    await ask(page, "give me a long answer");
    await expect(page.getByRole("button", { name: /continue the answer/i })).toBeVisible();
  });

  test("dropped stream (no done frame) shows a 'try again' control", async ({ page }) => {
    await stubMemory(page);
    await page.route(CHAT, (route) =>
      route.fulfill({
        contentType: "application/x-ndjson",
        // No `done` frame -> the client treats the stream as interrupted.
        body: ndjson([
          { type: "sources", sources: SOURCES },
          { type: "delta", text: "Half an answer" },
        ]),
      }),
    );
    await page.goto("/marketing-brain", { waitUntil: "networkidle" });
    await ask(page, "this will drop");
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });
});
