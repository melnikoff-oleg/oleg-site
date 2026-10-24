// Cold-load timing for every public page, on three connections: broadband
// desktop, a 4G phone, and the slow-4G + 4x CPU phone perf-home.mjs uses.
// For each it reports when the first byte, first paint, largest paint and the
// readable headline happen, and what was fetched before the visitor scrolled.
// "Headline readable" is the number a visitor feels: the first visible heading
// on screen with its opacity past 0.9.
//
// Run against a production build:
//   npm run build && npx next start -p 3100 & npm run perf -- [base] [route...]
// Exits non-zero when a page's headline is not readable within BUDGET_MS on
// broadband ("open a link on a laptop") or on the 4G phone. The slow-4G phone
// is reported, not gated: at 150 ms a round trip, the connection alone uses
// most of the budget.
import { chromium } from "@playwright/test";
import { ROUTES as SITE_ROUTES } from "../tests/e2e/routes.ts";

const BASE = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
// Every public route by default, from the list the test suite uses, so a new
// page is measured the moment it is added there. The filmed page is kept out
// of that list for the shell specs' sake (see routes.ts), not for this one.
const ROUTES = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [...SITE_ROUTES, "/claude-riemann-hypothesis"];
// The site's speed standard (CLAUDE.md, "Speed"): every page's headline
// readable within 200 ms of the click.
const BUDGET_MS = 200;

// [name, width, height, dpr, mobile, latency ms, down kbit/s, cpu slowdown]
const GATED = new Set(["broadband desktop", "4G phone"]);
const PROFILES = [
  ["broadband desktop", 1440, 900, 2, false, 20, 50_000, 1],
  ["4G phone", 390, 844, 3, true, 70, 9_000, 2],
  ["slow 4G phone", 390, 844, 3, true, 150, 1_600, 4],
];

const browser = await chromium.launch();
const rows = [];
let over = 0;
for (const route of ROUTES) {
  for (const [name, width, height, dpr, mobile, latency, kbps, cpu] of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency, downloadThroughput: (kbps * 1024) / 8, uploadThroughput: (kbps * 1024) / 16 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    await page.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0, tbt: 0, h1: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
      const op = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
      const t0 = performance.now();
      const poll = () => {
        // The first heading a visitor can see: the h1, or on a page that hides it
        // at this width (the filmed Riemann page on desktop), the first h2.
        const seen = (el) => el.getBoundingClientRect().height > 0 && op(el) > 0.9;
        const h = [...document.querySelectorAll("h1:not(.sr-only), h2")].find(seen);
        if (h) window.__m.h1 = performance.now();
        else if (performance.now() - t0 < 15000) requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    });
    const res = await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(2000); // idle, no scroll
    const r = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      const kinds = {};
      for (const e of performance.getEntriesByType("resource")) {
        const k = !e.name.startsWith(location.origin) ? "3rd" : /\.js/.test(e.name) ? "js" : /\.css/.test(e.name) ? "css" : /\.woff2?/.test(e.name) ? "font" : /\.(mp4|webm)/.test(e.name) ? "video" : /(_next\/image|\.(png|jpe?g|webp|avif|svg))/.test(e.name) ? "img" : "other";
        kinds[k] = (kinds[k] ?? 0) + (e.transferSize || e.encodedBodySize || 0);
      }
      const frames = [...document.querySelectorAll("iframe")].map((f) => f.src.split("?")[0]);
      return { ttfb: nav.responseStart, fcp, doc: nav.transferSize, kinds, frames, ...window.__m };
    });
    const ok = res?.status() === 200;
    // The bare tool pages (/reels, /viral, /creators) carry no visible heading
    // at all, so first paint is the moment that counts there.
    r.h1 ||= r.fcp;
    rows.push({ route, name, status: res?.status(), ...r });
    if (GATED.has(name) && (!ok || r.h1 > BUDGET_MS)) over++;
    const kb = (n) => Math.round(n / 1024);
    console.log(
      `${route.padEnd(28)} ${name.padEnd(18)} ttfb ${String(Math.round(r.ttfb)).padStart(4)}  fcp ${String(Math.round(r.fcp)).padStart(5)}  lcp ${String(Math.round(r.lcp)).padStart(5)}  h1 ${String(Math.round(r.h1)).padStart(5)}  cls ${r.cls.toFixed(3)}  tbt ${String(Math.round(r.tbt)).padStart(4)}  doc ${kb(r.doc)}KB ` +
        Object.entries(r.kinds).map(([k, v]) => `${k} ${kb(v)}KB`).join(" "),
    );
    await ctx.close();
  }
}
await browser.close();
if (process.env.PERF_JSON) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(process.env.PERF_JSON, JSON.stringify(rows, null, 2));
}
const gated = [...GATED].join(" and ");
console.log(over ? `\n${over} load(s) missed the ${BUDGET_MS} ms headline budget on ${gated}.` : `\nEvery page's headline readable within ${BUDGET_MS} ms on ${gated}.`);
process.exit(over ? 1 : 0);
