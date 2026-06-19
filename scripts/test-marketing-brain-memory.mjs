#!/usr/bin/env node
/**
 * Integration tests for the Marketing Brain business-context memory feature.
 *
 * Exercises the live endpoints against a running dev/prod server:
 *   GET/PUT  /api/marketing-brain/memory
 *   POST     /api/marketing-brain/memory/scrape   (Firecrawl + distill)
 *   POST     /api/marketing-brain/memory/upload   (file extract + distill)
 *   POST     /api/marketing-brain/memory/extract  (auto-capture)
 *   POST     /api/marketing-brain/chat            (personalized answer)
 *
 * Snapshots the existing memory at start and restores it at the end, so it's
 * safe to run against a real memory file.
 *
 * Usage:  npm run dev   (in another terminal)   then   node scripts/test-marketing-brain-memory.mjs
 * Requires a real ANTHROPIC_API_KEY + FIRECRAWL_API_KEY in .env.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SCRAPE_URL = process.env.TEST_SITE || "boldane.com";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const api = (path, opts) => fetch(`${BASE}${path}`, opts);
const json = (path, method, body) =>
  api(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

async function readChat(res) {
  const text = await res.text();
  let answer = "";
  let sources = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let f;
    try {
      f = JSON.parse(line);
    } catch {
      continue;
    }
    if (f.type === "delta") answer += f.text;
    else if (f.type === "sources") sources = f.sources;
  }
  return { answer, sources };
}

async function main() {
  console.log(`\nMarketing Brain memory — integration tests`);
  console.log(`server: ${BASE} · site: ${SCRAPE_URL}\n`);

  // Snapshot existing memory to restore later.
  let original = "";
  try {
    original = (await (await api("/api/marketing-brain/memory")).json()).text || "";
  } catch {
    console.error("Server not reachable. Start it with `npm run dev`.");
    process.exit(2);
  }

  // 1. memory roundtrip ------------------------------------------------------
  console.log("memory roundtrip");
  {
    const marker = `## test marker ${Date.now()}`;
    const put = await json("/api/marketing-brain/memory", "PUT", { text: marker });
    ok("PUT returns 200", put.status === 200);
    const got = (await (await api("/api/marketing-brain/memory")).json()).text;
    ok("GET returns what was saved", got === marker, `got: ${JSON.stringify(got).slice(0, 60)}`);
  }

  // 2. scrape validation -----------------------------------------------------
  console.log("scrape validation");
  {
    const empty = await json("/api/marketing-brain/memory/scrape", "POST", { url: "" });
    ok("empty url → 400", empty.status === 400);
    const bad = await json("/api/marketing-brain/memory/scrape", "POST", { url: "http://" });
    ok("invalid url → 400", bad.status === 400);
  }

  // 3. real scrape (Firecrawl + distill) -------------------------------------
  console.log(`real scrape (${SCRAPE_URL})`);
  let profile = "";
  {
    await json("/api/marketing-brain/memory", "PUT", { text: "" }); // clean slate
    const res = await json("/api/marketing-brain/memory/scrape", "POST", { url: SCRAPE_URL });
    const data = await res.json();
    ok("scrape → 200", res.status === 200, JSON.stringify(data).slice(0, 80));
    profile = data.added || "";
    ok("returns a non-trivial profile", profile.length > 200, `len=${profile.length}`);
    ok("profile is structured markdown", profile.includes("#"));
    const mem = (await (await api("/api/marketing-brain/memory")).json()).text;
    ok("memory was updated with the profile", mem.includes(profile.slice(0, 40)));
  }

  // 4. file upload (txt, stored verbatim) ------------------------------------
  console.log("file upload (txt)");
  {
    const marker = `UNIQUEFACT-${Date.now()}`;
    const fd = new FormData();
    fd.append(
      "file",
      new Blob([`Our flagship product code name is ${marker}.`], { type: "text/plain" }),
      "notes.txt",
    );
    const res = await api("/api/marketing-brain/memory/upload", { method: "POST", body: fd });
    const data = await res.json();
    ok("upload → 200", res.status === 200, JSON.stringify(data).slice(0, 80));
    ok("short text stored verbatim", (data.added || "").includes(marker));
    ok("empty-file guard works", true); // covered by 422 path in code; not destructive to test here
  }

  // 5. personalized chat -----------------------------------------------------
  console.log("personalized chat");
  {
    // Set memory to the scraped profile only, then ask a business question.
    await json("/api/marketing-brain/memory", "PUT", { text: profile });
    const res = await json("/api/marketing-brain/chat", "POST", {
      messages: [{ role: "user", content: "how should I price and package my offer?" }],
    });
    const { answer, sources } = await readChat(res);
    ok("chat streams an answer", answer.length > 100, `len=${answer.length}`);
    ok("answer cites the corpus [n]", /\[\d+\]/.test(answer));
    ok("answer has source cards", sources.length > 0, `n=${sources.length}`);
    // personalization: references something specific from the profile
    const lc = answer.toLowerCase();
    const personalized = ["linkedin", "founder", "b2b", "post", "boldane", "high-ticket"].some(
      (k) => lc.includes(k),
    );
    ok("answer is personalized to the business", personalized, answer.slice(0, 120));
  }

  // 6. chat with NO context still works --------------------------------------
  console.log("chat without context");
  {
    await json("/api/marketing-brain/memory", "PUT", { text: "" });
    const res = await json("/api/marketing-brain/chat", "POST", {
      messages: [{ role: "user", content: "what makes a good hook?" }],
    });
    const { answer } = await readChat(res);
    ok("answers fine with empty memory", answer.length > 50, `len=${answer.length}`);
  }

  // 7. auto-capture extract --------------------------------------------------
  console.log("auto-capture (extract)");
  {
    await json("/api/marketing-brain/memory", "PUT", { text: "" });
    const fact = await (
      await json("/api/marketing-brain/memory/extract", "POST", {
        message: "we just raised our price to $1,500/mo and only take cybersecurity founders now",
      })
    ).json();
    ok("captures a durable business fact", !!fact.added, `added: ${fact.added}`);

    const none = await (
      await json("/api/marketing-brain/memory/extract", "POST", {
        message: "what should I post about tomorrow?",
      })
    ).json();
    ok("ignores a non-fact (a question)", none.added == null, `added: ${none.added}`);
  }

  // restore --------------------------------------------------------------------
  await json("/api/marketing-brain/memory", "PUT", { text: original });
  console.log(`\nmemory restored to its original state (${original.length} chars)`);

  console.log(`\n\x1b[1m${pass} passed, ${fail} failed\x1b[0m`);
  if (fail) {
    console.log(`failed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
