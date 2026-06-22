import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Boldane-style redesign verification suite.
 * Runs against a production build (`next build && next start`) so screenshots
 * are stable (no dev overlay) and computed styles match production.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Generous tolerance: entrance animations / font hinting differ slightly.
    toHaveScreenshot: { maxDiffPixelRatio: 0.05, animations: "disabled" },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Framer Motion entrance animations + looping hero video settle faster
    // and screenshots are deterministic when motion is reduced.
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      // iPhone-13-sized viewport on Chromium (avoids a separate WebKit install).
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
