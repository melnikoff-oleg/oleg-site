import type { Metadata } from "next";
import { ReelNav } from "@/components/reel-nav";
import { viralAdaptConfigured, viralSearchConfigured } from "@/lib/reels/viral";
import { Viral } from "./components/viral";

// The root layout appends " | Oleg Melnikov", and Google cuts a title past ~65
// characters, so this stays under 49.
const title = "Your Next Viral Reel, Built From What Worked";
const description =
  "Describe what you do. See the reels in your niche that went viral from small accounts in the last 3 months, then get one rewritten for your brand.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", url: "https://www.oleg.ae/viral" },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "https://www.oleg.ae/viral" },
};

// Static on purpose: the page is a shell the client fills (search and
// adaptation are API calls), so there is nothing per request to render. It used
// to be force-dynamic, which put a serverless function between every visitor
// and an HTML file that never changes. The two flags are read from env at
// build time, which on Vercel is the same env the functions see.

export default function ViralPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="sr-only">Your next viral reel</h1>
      <ReelNav current="/viral" />
      <Viral configured={viralSearchConfigured} adaptConfigured={viralAdaptConfigured} />
    </main>
  );
}
