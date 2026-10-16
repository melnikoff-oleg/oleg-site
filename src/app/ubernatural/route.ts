// oleg.ae/ubernatural: the übernatural founders' LinkedIn post drafts as a plain feed, for
// their review (2026-10-16). Unlisted, noindex, not in the sitemap. The document is generated
// in the vault (projects/ubernatural/reset_2026-10-13/feed/build_site.py writes page-html.ts
// and public/ubernatural/feed/) and served as is. The earlier rating board is /ubernatural/round-7.
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
