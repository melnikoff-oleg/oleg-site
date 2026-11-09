import { Shell, meta } from "../ubs-posts/shell";

export const metadata = meta("Ubersuggest drafts: the ratings", "How the team rated five LinkedIn post drafts for Ubersuggest, with their comments.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
