import { test, expect } from "@playwright/test";

// Deterministic, key-free guard-rail branches of the personalization backend.
// These never call Firecrawl/Anthropic (validation precedes those), so they run
// in CI without any secret. Run once (desktop).

test.describe("api: memory routes validation", () => {

  test("PUT /memory with non-JSON body -> 400 bad_request", async ({ request }) => {
    // Raw Buffer so Playwright doesn't re-serialize the string into valid JSON.
    const res = await request.put("/api/marketing-brain/memory", {
      data: Buffer.from("}{"),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("bad_request");
  });

  test("scrape with no url -> 400 missing_url", async ({ request }) => {
    const res = await request.post("/api/marketing-brain/memory/scrape", {
      data: {},
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("missing_url");
  });

  test("scrape with a bad url -> 400 invalid_url", async ({ request }) => {
    const res = await request.post("/api/marketing-brain/memory/scrape", {
      data: { url: "http://" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("invalid_url");
  });

  test("scrape of a private/loopback host is rejected (SSRF guard)", async ({
    request,
  }) => {
    const res = await request.post("/api/marketing-brain/memory/scrape", {
      data: { url: "http://169.254.169.254/latest/meta-data" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("invalid_url");
  });

  test("upload with no file -> 400 missing_file", async ({ request }) => {
    const res = await request.post("/api/marketing-brain/memory/upload", {
      multipart: {},
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("missing_file");
  });

  test("upload over the size cap -> 413 too_large", async ({ request }) => {
    const big = Buffer.alloc(15 * 1024 * 1024 + 1, 0x61);
    const res = await request.post("/api/marketing-brain/memory/upload", {
      multipart: {
        file: { name: "big.txt", mimeType: "text/plain", buffer: big },
      },
    });
    expect(res.status()).toBe(413);
    expect((await res.json()).error).toBe("too_large");
  });
});
