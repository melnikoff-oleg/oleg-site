import type { Metadata } from "next";

const title = "30 Viral LinkedIn Formats for Designers";
const description =
  "30 LinkedIn post formats that went viral for designers in 2026, each with the original post, its numbers and a template for the picture and the text.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["designer LinkedIn posts", "LinkedIn post formats", "viral LinkedIn posts", "design content ideas", "LinkedIn post templates"],
  alternates: { canonical: "https://www.oleg.ae/design-linkedin-formats" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "https://www.oleg.ae/design-linkedin-formats",
    publishedTime: "2026-11-11T00:00:00Z",
    modifiedTime: "2026-11-11T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function DesignLinkedinFormatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
