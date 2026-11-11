import type { Metadata } from "next";

const title = "LinkedIn Profile Swipe File: 30 Best Banners";
const description =
  "30 LinkedIn creators with the best banner, profile picture and headline in 2026, each with a note on what to take from it and a link to the live profile.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["LinkedIn banner examples", "LinkedIn profile examples", "LinkedIn headline examples", "LinkedIn swipe file", "LinkedIn profile picture"],
  alternates: { canonical: "https://www.oleg.ae/linkedin-swipe-file" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "https://www.oleg.ae/linkedin-swipe-file",
    publishedTime: "2026-11-11T00:00:00Z",
    modifiedTime: "2026-11-11T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function LinkedInSwipeFileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
