"use client";

import { CopyGlyph, useCopy } from "@/components/copy-button";

// One real command: tap to copy, with the same copied-check feedback as the
// shared CopyButton. The command text lives in its own span so it can wrap
// ([overflow-wrap:anywhere]) while the icon stays put; min-h keeps the tap
// target at 44px. The only client code on the page.
export function CmdChip({ cmd }: { cmd: string }) {
  const { copied, copy } = useCopy(cmd);
  return (
    <button
      type="button"
      aria-label={`copy ${cmd}`}
      onClick={copy}
      className="inline-flex min-h-[44px] items-center gap-2 rounded border border-vivid-blue/40 px-3 py-1.5 text-left font-mono text-sm font-semibold text-vivid-blue/90 transition-colors hover:border-vivid-blue hover:text-vivid-blue"
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{cmd}</span>
      <CopyGlyph copied={copied} className="size-3.5 shrink-0" />
    </button>
  );
}
