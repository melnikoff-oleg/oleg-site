import { Shell, meta } from "./shell";

export const metadata = meta("Ubersuggest LinkedIn drafts, November 2026", "Twenty-five LinkedIn post drafts for Ubersuggest and its team, shown as they will look in the feed.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
