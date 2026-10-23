"use client";

import { useEffect, useRef, useState } from "react";

// One real command: tap to copy, with the same copied-check feedback as the
// shared CopyButton. The command text lives in its own span so it can wrap
// ([overflow-wrap:anywhere]) while the icon stays put; min-h keeps the tap
// target at 44px. The only client code on the page.
export function CmdChip({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);
  return (
    <button
      type="button"
      aria-label={`copy ${cmd}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(cmd);
        } catch {
          // Permission denied or the page not focused (in-app browsers): no
          // check mark for a copy that did not happen.
          return;
        }
        setCopied(true);
        clearTimeout(reset.current);
        reset.current = setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex min-h-[44px] items-center gap-2 rounded border border-vivid-blue/40 px-3 py-1.5 text-left font-mono text-sm font-semibold text-vivid-blue/90 transition-colors hover:border-vivid-blue hover:text-vivid-blue"
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{cmd}</span>
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 shrink-0">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}
