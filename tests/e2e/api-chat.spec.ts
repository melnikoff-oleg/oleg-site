import { test, expect } from "@playwright/test";

// The marketing-brain chat route is real backend logic with deterministic,
// key-free error branches. These run identically with or without an Anthropic
// key because the parse/validation checks precede the key check. Run once
// (desktop) since they're transport-level, not viewport-dependent.

test.describe("api: /api/marketing-brain/chat validation", () => {

  const URL = "/api/marketing-brain/chat";

  test("malformed JSON body -> 400 bad_request", async ({ request }) => {
    // Raw Buffer so Playwright doesn't re-serialize the string into valid JSON.
    const res = await request.post(URL, { data: Buffer.from("{ not json") });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("bad_request");
  });

  test("empty messages -> 400 empty", async ({ request }) => {
    const res = await request.post(URL, { data: { messages: [] } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("empty");
  });

  test("whitespace-only user turn -> 400 empty", async ({ request }) => {
    const res = await request.post(URL, {
      data: { messages: [{ role: "user", content: "   " }] },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("empty");
  });

  test("message object missing content does not 500 (hardened validation)", async ({
    request,
  }) => {
    // Previously `m.content.trim()` on a content-less message threw an unhandled
    // 500 outside the try/catch. It must now be treated as no valid turn -> 400.
    const res = await request.post(URL, {
      data: { messages: [{ role: "user" }] },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("empty");
  });
});
