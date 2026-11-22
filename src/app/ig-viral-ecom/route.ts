// oleg.ae/ig-viral-ecom: the funnel calculator for the Duskway Instagram account (2026-11-22),
// plays to site visits to orders to revenue and profit, with sliders. Unlisted, noindex, not in the sitemap.
// page-html.ts is a generated, self-contained document served as is.
import { HTML } from "./page-html";

export const dynamic = "force-static";

export function GET() {
  return new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
