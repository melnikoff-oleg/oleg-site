"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Copy `text` to the clipboard on demand. `copied` turns true for two seconds
 * after a copy that worked, and only then: a denied write (permission, or an
 * in-app browser whose page is not focused) must not claim it copied.
 */
export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setCopied(false), 2000);
  }

  return { copied, copy };
}

/** The copy icon, or the check mark once a copy has landed. */
export function CopyGlyph({ copied, className }: { copied: boolean; className?: string }) {
  return copied ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

/**
 * Shared copy-to-clipboard button for prompts and commands. Extracted from the
 * /60k-linkedin-post inline pattern (that page was deleted on 2026-10-23) so every page that hands out a paste-able
 * prompt can offer one-tap copy (on a phone, selecting a long prompt by hand is
 * the single most fiddly interaction on the site).
 *
 * 44px min tap target, never wraps (whitespace-nowrap + shrink-0), brief
 * "copied" confirmation state.
 */
export function CopyButton({
  text,
  label = "copy prompt",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { copied, copy } = useCopy(text);

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white",
        className
      )}
    >
      <CopyGlyph copied={copied} className="size-4" />
      {copied ? "copied" : label}
    </button>
  );
}
