import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vote on the Next Video",
  description:
    "A public board for the next YouTube video. Vote for the ideas you want made and watch them move from planned to filmed to published.",
  keywords: [
    "video ideas",
    "Claude Code tutorials",
    "AI for marketing",
    "AI video requests",
    "Oleg Melnikov",
    "Vote on video ideas",
  ],
  openGraph: {
    title: "Video Ideas: Vote On What I Build Next",
    description:
      "Vote for the video you want to see next. The ideas with the most votes get made.",
    type: "website",
    url: "https://www.oleg.ae/ideas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Ideas: Vote On What I Build Next",
    description:
      "Vote for the video you want to see next. The ideas with the most votes get made.",
  },
  alternates: {
    canonical: "https://www.oleg.ae/ideas",
  },
};

export default function IdeasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
