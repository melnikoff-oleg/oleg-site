"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { boldaneUrl, firstTouch } from "@/lib/attribution";

const neverChanges = () => () => {};

/** Every link from oleg.ae to boldane.com goes through this, so Plausible on boldane.com sees where
 *  the visitor originally came from, and which oleg.ae page sent them on (see lib/attribution.ts).
 *  The server renders the page's own default, and hydration swaps in the real first touch.
 *  No `noreferrer`: Boldane is ours, and the referrer is a second record of the hop. */
export function BoldaneAnchor({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const touch = useSyncExternalStore(neverChanges, firstTouch, () => null);
  return (
    <a href={boldaneUrl(pathname, touch)} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}
