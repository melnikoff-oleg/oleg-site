import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bounded highlights",
  description: "Instagram highlights for Bounded: covers, names and stories.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
