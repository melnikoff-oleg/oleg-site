import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Boldane-style redesign verification suite.
 * Runs against a production build (`next build && next start`) so screenshots
 * are stable (no dev overlay) and computed styles match production.
 *
 * Port is configurable via $PORT (default 3000) so a checkout in one git
 * worktree doesn't collide with a server another worktree already has on 3000
 * (which silently makes the suite test a stale build).
 */
const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Resolve test imports with the tests' node-resolution tsconfig. The app's
  // root tsconfig uses moduleResolution:"bundler", which Playwright's resolver
  // can't parse (it throws on any cross-file import like the shared ./routes).
  tsconfig: "./tsconfig.json",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // `animations` defaults to "disabled", which freezes CSS/WAAPI entrance
    // animations and can leave reveal elements at their hidden (opacity 0)
    // state, producing blank screenshots. Force "allow" and let `settle()`
    // (scroll + wait) drive the entrance animations to completion instead.
    // The only continuous motion (looping hero/preview video) is masked.
    toHaveScreenshot: { maxDiffPixelRatio: 0.05, animations: "allow" },
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // NOTE: do not set `reducedMotion: "reduce"` here. The reveal primitives
    // honor prefers-reduced-motion by showing content immediately (no scroll
    // animation), so screenshots that rely on `settle()` scrolling to trigger
    // the IntersectionObserver reveals would differ. `settle()` scrolls + waits.
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
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
