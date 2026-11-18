// oleg.ae/vibe-coder-filter: TEST deploy of Anastasia Koroleva's (Quala) lead magnet landing page, 2026-11-18.
// Work email, then role and hires (skippable), then the PDF and a Quala demo link. Unlisted, noindex, not in the sitemap.
// Generated in the MS repo (projects/accounts/anastasia_koroleva/lead_magnet_2026-11-18/tools/build_site.py). Its real home is quala.dev/filter.
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
