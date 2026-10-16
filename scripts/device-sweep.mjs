// Every common screen, phone to 4K: no horizontal overflow at the top or after
// scrolling the whole page, the headline fully on screen, nothing below the
// fold fetched before scroll, the video fetched once reached, and, under the
// same slow-4G + 4x CPU throttle as perf-home.mjs, when the headline is readable
// and the hero photo is shown. Run against `next start -p 3100`:
//   node scripts/device-sweep.mjs [url]
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const DEVICES = [
  ["small phone", 320, 568, 2, true],
  ["Galaxy S", 360, 780, 3, true],
  ["iPhone SE", 375, 667, 2, true],
  ["iPhone 15", 393, 852, 3, true],
  ["iPhone Pro Max", 430, 932, 3, true],
  ["phone landscape", 852, 393, 3, true],
  ["iPad mini", 768, 1024, 2, true],
  ["iPad Air", 820, 1180, 2, true],
  ["iPad Pro 12.9", 1024, 1366, 2, true],
  ["iPad landscape", 1180, 820, 2, true],
  ["iPad Pro landscape", 1366, 1024, 2, true],
  ["laptop", 1280, 800, 2, false],
  ["MacBook 14", 1512, 982, 2, false],
  ["desktop 1080p", 1920, 1080, 1, false],
  ["desktop 1440p", 2560, 1440, 1, false],
];

const browser = await chromium.launch();
let bad = 0;
for (const [name, width, height, dpr, mobile] of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const urls = [];
  page.on("request", (r) => urls.push(decodeURIComponent(r.url())));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__t = {};
    const op = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
    const poll = () => {
      const h = document.querySelector("h1 [data-reveal]");
      const img = document.querySelector("main img");
      if (h && !window.__t.h && op(h) > 0.9) window.__t.h = performance.now();
      if (img && !window.__t.p && img.complete && img.naturalWidth > 100 && op(img) > 0.9) window.__t.p = performance.now();
      if (!(window.__t.h && window.__t.p)) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const top = await page.evaluate(() => {
    const h1 = document.querySelector("h1").getBoundingClientRect();
    return { over: document.documentElement.scrollWidth > innerWidth, h1in: h1.left >= 0 && h1.right <= innerWidth, ...window.__t };
  });
  const early = urls.filter((u) => /preview|icons\/(math|trading|building|media|life)/.test(u)).length;
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  for (let y = 0; y < 16000; y += 500) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(40); }
  await page.waitForTimeout(800);
  const end = await page.evaluate(() => ({ over: document.documentElement.scrollWidth > innerWidth }));
  const video = urls.some((u) => /preview\.mp4/.test(u));
  const ok = !top.over && !end.over && top.h1in && early === 0 && video;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name.padEnd(18)} ${String(width).padStart(4)}x${String(height).padEnd(4)}` +
      ` headline ${Math.round(top.h ?? -1)}ms  photo ${Math.round(top.p ?? -1)}ms` +
      `  overflow ${top.over || end.over ? "YES" : "no"}  h1 ${top.h1in ? "in" : "CLIPPED"}  early media ${early}  video on reach ${video ? "yes" : "NO"}`,
  );
  await ctx.close();
}
await browser.close();
console.log(bad ? `\n${bad} device(s) failed` : `\nall ${DEVICES.length} devices pass`);
process.exit(bad ? 1 : 0);
