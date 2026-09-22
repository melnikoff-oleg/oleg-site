import type { Metadata } from "next";
import { ReelNav } from "@/components/reel-nav";
import { viralAdaptConfigured, viralSearchConfigured } from "@/lib/reels/viral";
import { Viral } from "./components/viral";

const title = "Your Next Viral Reel: Describe Your Brand, Copy What Already Worked";
const description =
  "Describe what you do. See the reels in your niche that went viral from small accounts in the last three months. Pick one and get it rewritten for your brand, script included.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", url: "https://www.oleg.ae/viral" },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "https://www.oleg.ae/viral" },
};

export const dynamic = "force-dynamic";

export default function ViralPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="sr-only">Your next viral reel</h1>
      <ReelNav current="/viral" />
      <Viral configured={viralSearchConfigured} adaptConfigured={viralAdaptConfigured} />
    </main>
  );
}
