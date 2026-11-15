"use client";

// The two small interactive bits of /fitness. The log itself lives in Apple
// Notes again (since 2026-11-15), so the page only has to hand over a starting
// point and stay out of the way:
//  - DayPicker: shows any day's workout, whatever the weekday is.
//  - CopyButton: copies that workout as a bullet list for Notes, with today's
//    date and the planned weight x reps of every set, to be corrected by hand.

import { useState } from "react";

export function DayPicker({ days }: { days: { id: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((d) => (
        <button
          key={d.id}
          type="button"
          data-day={d.id}
          className="fit-btn fit-pick"
          onClick={() => document.documentElement.setAttribute("data-today", d.id)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older Safari, or no clipboard permission: the hidden textarea way.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** `title` and `lines` come from the workout; the date is the device's, at the moment of the tap. */
export function CopyButton({ title, lines }: { title: string; lines: string[] }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const onClick = async () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const text = [`workout ${p(d.getMonth() + 1)}-${p(d.getDate())} ${title}`, ...lines.map((l) => `- ${l}`)].join("\n");
    setState((await copyText(text)) ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2500);
  };
  return (
    <button type="button" onClick={onClick} className="fit-btn fit-btn-primary">
      {state === "copied" ? "Copied" : state === "failed" ? "Couldn't copy" : "Copy for Notes"}
    </button>
  );
}
