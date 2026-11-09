import { Shell, meta } from "../ubs-posts/shell";

export const metadata = meta("Rate the Ubersuggest drafts", "Five LinkedIn post drafts for Ubersuggest. Score each from 1 to 10.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
