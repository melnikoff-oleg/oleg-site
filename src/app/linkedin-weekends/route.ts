// oleg.ae/linkedin-weekends: proof for the Ubersuggest team that LinkedIn weekend posts are not
// much weaker than weekday posts (2026-10-17). Unlisted, noindex, not in the sitemap. The document
// is generated in the vault (areas/ubersuggest/2026-10-17_weekend_posting/build_page.py writes
// page-html.ts) and served as is.
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
