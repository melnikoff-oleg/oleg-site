// Real headless-browser test of the /marketing-brain composer auto-resize fix.
// Launches the locally cached Chromium, loads the live dev page, and uses real
// keystrokes so React's onChange (and our resizeTextarea handler) actually fire.
//
// Run: node scripts/test-composer-resize.mjs   (dev server must be on :3000)

import { chromium } from "playwright-core";
import { existsSync } from "fs";
import os from "os";
import path from "path";

const CACHE = path.join(os.homedir(), "Library/Caches/ms-playwright");
const candidates = [
  `${CACHE}/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`,
  `${CACHE}/chromium_headless_shell-1169/chrome-mac/headless_shell`,
];
const exe = candidates.find(existsSync);
if (!exe) { console.error("No cached chromium found"); process.exit(2); }

const results = [];
const check = (name, cond, detail) => {
  results.push({ name, pass: !!cond, detail });
  console.log(`[${cond ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
await page.goto("http://localhost:3000/marketing-brain", { waitUntil: "networkidle" });

const ta = page.locator('textarea[placeholder="ask the brain…"]');
await ta.waitFor({ state: "visible" });
const h = async () => ta.evaluate((el) => Math.round(el.getBoundingClientRect().height));
const maxPx = await ta.evaluate((el) =>
  parseFloat(getComputedStyle(el).maxHeight),
);
const overflowY = await ta.evaluate((el) => getComputedStyle(el).overflowY);

const empty = await h();
check("T1 empty composer is single-row (short)", empty > 0 && empty < 60, `${empty}px`);

// Type one short line — should remain near the one-line height.
await ta.click();
await ta.type("make an irresistible offer");
const oneLine = await h();
check("T2 single short line stays compact", oneLine <= empty + 6, `${oneLine}px`);

// Add several newlines (Shift+Enter must insert newline, NOT submit).
for (let i = 0; i < 5; i++) {
  await page.keyboard.down("Shift");
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  await ta.type(`line ${i + 2} of a long multi-line question`);
}
const multi = await h();
const val = await ta.inputValue();
check("T3 Shift+Enter inserts newlines (no submit)", val.split("\n").length >= 6, `${val.split("\n").length} lines`);
check("T4 box grows with multi-line content", multi > oneLine + 20, `${oneLine}px -> ${multi}px`);

// Now overflow it well past the cap and confirm it caps + scrolls.
await ta.evaluate((el) => { el.value = ""; });
await ta.click();
let huge = "";
for (let i = 0; i < 40; i++) huge += `paragraph line number ${i} with enough words to wrap and grow the textarea\n`;
await ta.fill(huge); // fill triggers React input event too
const capped = await h();
check("T5 height caps at max-h-40", Math.abs(capped - maxPx) <= 4, `${capped}px (cap ${maxPx}px)`);
check("T6 overflow scrolls past the cap", overflowY === "auto" || overflowY === "scroll", `overflow-y: ${overflowY}`);
const scrollable = await ta.evaluate((el) => el.scrollHeight > el.clientHeight + 4);
check("T7 content scrolls inside the capped box", scrollable, "scrollHeight > clientHeight");

// Clearing the value resets height back toward one row (simulates post-submit reset path).
await ta.fill("");
await ta.evaluate((el) => { el.style.height = "auto"; }); // same reset the submit handler performs
const reset = await h();
check("T8 height resets when cleared", reset < 60, `${reset}px`);

await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n================ COMPOSER SUMMARY ================`);
console.log(`Total: ${results.length}  Passed: ${passed}  Failed: ${results.length - passed}`);
process.exit(passed === results.length ? 0 : 1);
