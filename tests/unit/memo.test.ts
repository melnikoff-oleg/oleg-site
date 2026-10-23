import { test } from "node:test";
import assert from "node:assert/strict";
import { memoize } from "@/lib/perf/memo";

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("a kept answer is served without reading again", async () => {
  let reads = 0;
  const get = memoize(1000, async () => ++reads);
  assert.equal(await get(), 1);
  assert.equal(await get(), 1);
  assert.equal(reads, 1);
});

test("concurrent callers share one in-flight read", async () => {
  let reads = 0;
  const get = memoize(1000, async () => {
    reads++;
    await tick(20);
    return "facts";
  });
  const answers = await Promise.all([get(), get(), get()]);
  assert.deepEqual(answers, ["facts", "facts", "facts"]);
  assert.equal(reads, 1);
});

test("an expired answer is read again", async () => {
  let reads = 0;
  const get = memoize(10, async () => ++reads);
  await get();
  await tick(25);
  assert.equal(await get(), 2);
});

test("a failed read is not kept: the next caller tries again", async () => {
  let reads = 0;
  const get = memoize(1000, async () => {
    if (++reads === 1) throw new Error("upstream is down");
    return "recovered";
  });
  await assert.rejects(get(), /upstream is down/);
  assert.equal(await get(), "recovered");
  assert.equal(reads, 2);
});
