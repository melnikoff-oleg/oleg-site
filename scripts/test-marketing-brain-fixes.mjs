// Real end-to-end test of the /marketing-brain chat fixes against a running dev
// server (http://localhost:3000). Hits the actual API, parses the live NDJSON
// stream, and validates:
//   - Truncation fix: long answers complete (no max_tokens sentinel, end on a
//     natural sentence boundary, substantial length).
//   - Cialdini recall fix: persuasion/Cialdini questions surface the BOOK
//     "Influence: The Psychology of Persuasion" as a source (not only videos).
//
// Run: node scripts/test-marketing-brain-fixes.mjs
//
// (The composer auto-resize fix is UI behavior and is verified separately in
// the browser; it isn't reachable through the API.)

const BASE = process.env.MB_BASE || "http://localhost:3000";
const TRUNC_SENTINEL = "that answer ran long";
const TERMINAL = new Set([".", "!", "?", '"', ")", "]", "'", "”", "’", "…", ":"]);

// 10 Cialdini/persuasion questions (test BOTH completion AND book surfacing) +
// 10 other deep questions that demand a long answer (test completion).
const CIALDINI_QS = [
  "what does the book Influence by Cialdini say about reciprocity? give me a detailed breakdown with examples i can use in marketing.",
  "explain Cialdini's six principles of persuasion in depth and how a founder should apply each one to selling a high-ticket B2B service.",
  "according to Cialdini's Influence, how does the principle of commitment and consistency work, and how do i use it in an email sequence?",
  "break down the persuasion principle of social proof from Cialdini and give me 5 concrete ways to show it on a landing page.",
  "what does Cialdini teach about authority as a persuasion lever, and how do i build authority as an unknown founder?",
  "explain scarcity and the contrast principle from the book Influence with real campaign examples.",
  "compare what Cialdini says about liking with how other marketers think about building rapport. go deep.",
  "i want a full study guide on Cialdini's Influence: the psychology of persuasion. summarize every major idea.",
  "how does the rejection-then-retreat (door-in-the-face) technique from Cialdini work, and when should i use it in sales?",
  "using Cialdini's principles, design a complete persuasion strategy for a cold outreach campaign step by step.",
];

const DEEP_QS = [
  "give me a complete, detailed playbook for making an irresistible offer, drawing on Hormozi and others. cover value equation, guarantees, bonuses, scarcity, and naming.",
  "walk me through a full lead generation strategy for a new B2B founder with no audience. be exhaustive and concrete.",
  "explain in depth how to write hooks that stop the scroll, with many examples and the underlying psychology.",
  "what is the complete framework for building a personal brand on LinkedIn as a technical founder? give me a step-by-step system.",
  "give me a thorough breakdown of how MrBeast thinks about thumbnails and retention, and how i apply it to my content.",
  "explain everything about the value ladder and how to structure offers from free to high ticket, with examples.",
  "i want a deep dive on storytelling in marketing: structures, frameworks, and how to use story to sell without being salesy.",
  "lay out a full content strategy to grow a YouTube channel about AI for marketing from zero to 100k subscribers.",
  "explain Gary Vaynerchuk's jab jab jab right hook philosophy in detail and how to apply it across modern social platforms.",
  "give me an exhaustive guide to cold outreach that gets replies: targeting, copy, personalization, follow-ups, and metrics.",
];

async function ask(question) {
  const res = await fetch(`${BASE}/api/marketing-brain/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }
  let sources = [];
  let text = "";
  let errored = null;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let f;
      try { f = JSON.parse(line); } catch { continue; }
      if (f.type === "sources") sources = f.sources;
      else if (f.type === "delta") text += f.text;
      else if (f.type === "error") errored = f.message;
    }
  }
  return { sources, text, errored };
}

function checkComplete(text, errored) {
  const reasons = [];
  if (errored) reasons.push(`error frame: ${errored}`);
  if (text.includes(TRUNC_SENTINEL)) reasons.push("max_tokens truncation sentinel present");
  const trimmed = text.trim();
  if (trimmed.length < 400) reasons.push(`answer too short (${trimmed.length} chars)`);
  const last = trimmed.slice(-1);
  if (!TERMINAL.has(last)) reasons.push(`does not end on sentence boundary (ends '${last}')`);
  return reasons;
}

function checkCialdiniBook(sources) {
  const book = sources.find(
    (s) =>
      s.type === "book" &&
      (/cialdini/i.test(s.attribution || "") || /influence/i.test(s.title || "")),
  );
  return book
    ? { ok: true, detail: `book source #${book.n}: "${book.title}" — ${book.attribution} (p.${book.page})` }
    : { ok: false, detail: `no Cialdini book in sources (${sources.map((s) => `${s.type}:${s.attribution}`).join(", ")})` };
}

// Limited concurrency runner (keeps the dev server + API responsive).
async function runPool(items, worker, concurrency = 3) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, lane));
  return results;
}

const tests = [
  ...CIALDINI_QS.map((q, i) => ({ id: `C${i + 1}`, kind: "cialdini", q })),
  ...DEEP_QS.map((q, i) => ({ id: `D${i + 1}`, kind: "deep", q })),
];

const t0 = Date.now();
const results = await runPool(tests, async (t) => {
  const started = Date.now();
  try {
    const { sources, text, errored } = await ask(t.q);
    const completeReasons = checkComplete(text, errored);
    let bookCheck = { ok: true, detail: "n/a" };
    if (t.kind === "cialdini") bookCheck = checkCialdiniBook(sources);
    const pass = completeReasons.length === 0 && bookCheck.ok;
    return {
      ...t, pass,
      ms: Date.now() - started,
      chars: text.trim().length,
      sourceCount: sources.length,
      completeReasons, bookDetail: bookCheck.detail, bookOk: bookCheck.ok,
      tail: text.trim().slice(-80).replace(/\s+/g, " "),
    };
  } catch (e) {
    return { ...t, pass: false, ms: Date.now() - started, completeReasons: [String(e)], bookOk: false, bookDetail: "request failed", chars: 0, sourceCount: 0, tail: "" };
  }
}, 3);

let passCount = 0;
for (const r of results) {
  if (r.pass) passCount++;
  const status = r.pass ? "PASS" : "FAIL";
  console.log(`\n[${status}] ${r.id} (${r.kind}) ${r.ms}ms  chars=${r.chars} sources=${r.sourceCount}`);
  console.log(`   Q: ${r.q.slice(0, 90)}${r.q.length > 90 ? "…" : ""}`);
  if (r.kind === "cialdini") console.log(`   book: ${r.bookOk ? "✓" : "✗"} ${r.bookDetail}`);
  console.log(`   tail: …${r.tail}`);
  if (!r.pass) console.log(`   >>> FAILURES: ${r.completeReasons.join("; ")}${!r.bookOk ? "; missing Cialdini book" : ""}`);
}

console.log(`\n================ SUMMARY ================`);
console.log(`Total: ${results.length}  Passed: ${passCount}  Failed: ${results.length - passCount}`);
console.log(`Cialdini book surfaced: ${results.filter((r) => r.kind === "cialdini" && r.bookOk).length}/${CIALDINI_QS.length}`);
console.log(`Wall time: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(passCount === results.length ? 0 : 1);
