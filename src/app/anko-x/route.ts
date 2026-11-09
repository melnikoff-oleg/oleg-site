// oleg.ae/anko-x: the 50 best X posts on coding interviews and tech hiring in the AI era, shown as
// an X feed with profile pictures, for Anastasia Koroleva's X content (2026-11-09). Unlisted,
// noindex, not in the sitemap. The document is generated in the MS repo
// (projects/accounts/anastasia_koroleva/x_outlier_hunt_2026-11-08/tools/build_site.py writes
// page-html.ts and public/anko-x/) and served as is.
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
