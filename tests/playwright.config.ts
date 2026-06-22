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
    // `animations` defaults to "disabled", which cancels Framer Motion's WAAPI
    // entrance animations and freezes elements at their hidden (opacity 0)
    // state, producing blank screenshots. Force "allow" and let `settle()`
    // (scroll + wait) drive the entrance animations to completion instead.
    // The only continuous motion (looping hero/preview video) is masked.
    toHaveScreenshot: { maxDiffPixelRatio: 0.05, animations: "allow" },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // NOTE: do not set `reducedMotion: "reduce"` here. Framer Motion treats it
    // as a signal to suppress entrance animations, which leaves `whileInView`
    // sections at opacity 0 in screenshots. `settle()` scrolls + waits instead.
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
