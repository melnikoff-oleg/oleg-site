import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

// The CLAUDE.md mandate: every page must be fully usable at 390px with NO
// horizontal scrolling of content. Previously only /5-levels-ai was guarded
// (mobile-ladder test 21); this parametrizes the same check over every route so
// a future wide table / un-wrapped string / fixed-width image on any page is
// caught, not just on the ladder page.

test.describe("mobile: no horizontal overflow at 390px", () => {
  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile", "mobile only");
      await page.goto(route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      // (a) The document itself must not scroll sideways.
      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(
        scrollW,
        `${route}: document scrollWidth ${scrollW} exceeds viewport ${clientW}`,
      ).toBeLessThanOrEqual(clientW + 1);

      // (b) No visible element may extend past the right viewport edge, EXCEPT
      // content inside an intentional horizontal scroller (overflow-x auto/scroll,
      // e.g. the knowledge page's sticky nav rail) — that content is meant to
      // scroll within its own box and does not make the page scroll sideways.
      const offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const insideScroller = (el: Element) => {
          let p = el.parentElement;
          while (p && p !== document.body) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === "auto" || ox === "scroll") return true;
            p = p.parentElement;
          }
          return false;
        };
        const bad: string[] = [];
        for (const el of Array.from(document.body.querySelectorAll("*"))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (r.right > vw + 1 && !insideScroller(el)) {
            const cls = typeof el.className === "string" ? el.className : "";
            bad.push(`${el.tagName.toLowerCase()}.${cls.split(" ")[0]} right=${Math.round(r.right)}`);
          }
        }
        return bad.slice(0, 8);
      });
      expect(offenders, `${route}: elements overflow right edge: ${offenders.join("; ")}`).toEqual([]);
    });
  }
});
