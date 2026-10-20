// oleg.ae/for-laura: a personal page for Laura Moiseja (a Boldane client) explaining why her
// 14 October interviews turned into 29 posts (2026-10-20). Unlisted, noindex, not in the sitemap.
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
