// Measures the homepage cold load on phone, tablet and desktop under a slow-4G,
// 4x-CPU throttle: FCP, LCP, CLS, total blocking JS long tasks, and every byte
// fetched BEFORE the visitor scrolls. Run against a production build:
//   npm run build && npx next start -p 3100 & node scripts/perf-home.mjs [url]
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3100/";
const DEVICES = [
  ["phone", 390, 844, true],
  ["tablet", 820, 1180, true],
  ["desktop", 1440, 900, false],
];

const browser = await chromium.launch();
for (const [name, width, height, mobile] of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: "", cls: 0, tbt: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = (e.element?.tagName ?? "") + " " + (e.element?.textContent ?? e.url ?? "").trim().slice(0, 40) + (e.url ? " " + e.url.split("/").pop().slice(0, 50) : ""); } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    // What a visitor sees, not what the browser reports: the moment the headline
    // is readable (opacity past 0.9) and the moment the hero photo is loaded and
    // fully shown. LCP alone misses this, because it ignores invisible elements.
    const t0 = performance.now();
    const poll = () => {
      const h = document.querySelector("h1");
      const img = document.querySelector("main img");
      const op = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
      if (h && !window.__m.headline && op(h) > 0.9) window.__m.headline = performance.now();
      if (img && !window.__m.photo && img.complete && img.naturalWidth > 100 && op(img) > 0.9) window.__m.photo = performance.now();
      if (!(window.__m.headline && window.__m.photo) && performance.now() - t0 < 15000) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(3000); // idle, no scroll
  const r = await page.evaluate(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    const nav = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource");
    const kinds = {};
    for (const e of res) {
      const k = /\.js/.test(e.name) ? "js" : /\.css/.test(e.name) ? "css" : /\.woff2?/.test(e.name) ? "font" : /\.(mp4|webm)/.test(e.name) ? "video" : /(_next\/image|\.(png|jpe?g|webp|avif|svg))/.test(e.name) ? "image" : "other";
      kinds[k] = (kinds[k] ?? 0) + e.transferSize;
    }
    const media = res.filter((e) => /(_next\/image|\.(png|jpe?g|webp|avif|mp4))/.test(e.name)).map((e) => decodeURIComponent(e.name.split("/").pop()).slice(0, 70) + ` ${Math.round(e.transferSize / 1024)}KB`);
    const hero = res.find((e) => e.name.includes("hero"));
    const heroT = hero ? `${Math.round(hero.startTime)}-${Math.round(hero.responseEnd)}ms` : "";
    return { fcp, ...window.__m, doc: nav.transferSize, kinds, media, heroT };
  });
  const kb = (n) => Math.round(n / 1024);
  console.log(`\n${name} ${width}x${height}: FCP ${Math.round(r.fcp)}ms  LCP ${Math.round(r.lcp)}ms  CLS ${r.cls.toFixed(3)}  TBT ${Math.round(r.tbt)}ms  LCP element: ${r.lcpEl}`);
  console.log(`  headline readable ${Math.round(r.headline ?? 0)}ms  hero photo shown ${Math.round(r.photo ?? 0)}ms  hero fetched ${r.heroT}`);
  console.log(`  before scroll: doc ${kb(r.doc)}KB ` + Object.entries(r.kinds).map(([k, v]) => `${k} ${kb(v)}KB`).join("  "));
  for (const m of r.media) console.log("   media:", m);
  await ctx.close();
}
await browser.close();
