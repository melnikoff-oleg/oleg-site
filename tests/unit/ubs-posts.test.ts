// /ubs-posts, /ubs-posts-rate, /ubs-posts-ratings: the 25 Ubersuggest drafts of
// November 2026, five of them rated by the team. The data comes from the MS repo
// (projects/accounts/ubersuggest/content/sync_site.py); these tests keep the
// copy here honest and pin the rules a submission must pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RATE_POST_IDS, ROUND } from "@/app/ubs-posts/rate-ids";
import { parseSubmission } from "@/lib/ubs-posts/validate";

type P = { id: string; n: number; format: string; title: string; author: { key: string; name: string }; media: string; text: string; w: number; h: number };
const POSTS = JSON.parse(readFileSync(join(process.cwd(), "src/app/ubs-posts/posts.json"), "utf8")) as P[];
const byId = new Map(POSTS.map((p) => [p.id, p]));

test("the feed holds all 25 drafts, numbered in order, each with its picture", () => {
  assert.equal(POSTS.length, 25);
  assert.equal(new Set(POSTS.map((p) => p.id)).size, 25);
  POSTS.forEach((p, i) => {
    assert.equal(p.n, i + 1);
    assert.ok(p.text.length > 200, `${p.id}: text too short`);
    assert.ok(p.w > 0 && p.h > 0);
    assert.ok(existsSync(join(process.cwd(), "public", p.media)), `${p.id}: ${p.media} is missing`);
  });
});

test("thirteen drafts are the page's and three belong to each of the four people", () => {
  const count = (k: string) => POSTS.filter((p) => p.author.key === k).length;
  assert.equal(count("ubersuggest"), 13);
  for (const k of ["mike", "neil", "salun", "gabriel"]) assert.equal(count(k), 3, k);
});

test("five posts are rated, all real, and no two share a format", () => {
  assert.equal(RATE_POST_IDS.length, 5);
  for (const id of RATE_POST_IDS) assert.ok(byId.has(id), `${id} is not in posts.json`);
  assert.equal(new Set(RATE_POST_IDS.map((id) => byId.get(id)!.format)).size, 5);
  // The team should see their own pages too, not only the company page.
  assert.ok(new Set(RATE_POST_IDS.map((id) => byId.get(id)!.author.key)).size >= 3);
});

test("the round is this batch's own, so its votes never mix with September's", () => {
  assert.equal(ROUND, "2026-11-09");
});

const full = (over: Record<string, unknown> = {}) => ({
  name: "  Jeff   Johnson ",
  votes: RATE_POST_IDS.map((post_id, i) => ({ post_id, rating: i + 5, note: i === 0 ? "  strong hook  " : "" })),
  ...over,
});

test("a complete submission passes, with the name and notes tidied", () => {
  const r = parseSubmission(full(), RATE_POST_IDS);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.name, "Jeff Johnson");
  assert.equal(r.votes.length, 5);
  assert.deepEqual(r.votes[0], { post_id: RATE_POST_IDS[0], rating: 5, note: "strong hook" });
  assert.equal(r.votes[1].note, null);
});

test("a submission without a real name is refused", () => {
  for (const name of ["", " a ", 7, undefined, "x".repeat(81)]) {
    const r = parseSubmission(full({ name }), RATE_POST_IDS);
    assert.equal(r.ok, false, String(name));
    if (!r.ok) assert.equal(r.status, 400);
  }
});

test("every one of the five posts must be rated, and the reply names the missing ones", () => {
  const body = full();
  body.votes = body.votes.slice(0, 4);
  const r = parseSubmission(body, RATE_POST_IDS);
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(r.missing, [RATE_POST_IDS[4]]);
});

test("ratings outside 1 to 10, fractions and unknown posts do not count", () => {
  for (const bad of [0, 11, 5.5, "abc", null]) {
    const body = full();
    body.votes[2] = { post_id: RATE_POST_IDS[2], rating: bad as number, note: "" };
    const r = parseSubmission(body, RATE_POST_IDS);
    assert.equal(r.ok, false, String(bad));
  }
  const extra = full();
  extra.votes.push({ post_id: "not_a_post", rating: 9, note: "" });
  const r = parseSubmission(extra, RATE_POST_IDS);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.votes.length, 5);
});

test("a note is cut at 2,000 characters and junk bodies are refused", () => {
  const body = full();
  body.votes[0].note = "x".repeat(2500);
  const r = parseSubmission(body, RATE_POST_IDS);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.votes[0].note!.length, 2000);
  for (const junk of [null, "hi", 3, { name: "Jeff Johnson" }, { name: "Jeff Johnson", votes: "all tens" }]) {
    assert.equal(parseSubmission(junk, RATE_POST_IDS).ok, false);
  }
});
