"use client";

import { usePathname } from "next/navigation";

/** Every link from oleg.ae to boldane.com goes through this, so Plausible on boldane.com
 *  sees which page sent the visitor: source oleg.ae, medium referral, campaign discovery-call,
 *  content = the page it was clicked on ("home" for the front page). */
export function boldaneUrl(pathname: string) {
  const page = pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";
  return `https://boldane.com/?utm_source=oleg.ae&utm_medium=referral&utm_campaign=discovery-call&utm_content=${encodeURIComponent(page)}`;
}

export function BoldaneAnchor({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  return (
    <a href={boldaneUrl(pathname)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
