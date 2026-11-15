"use client";

// The three small interactive bits of /fitness. The log itself lives in Apple
// Notes again (since 2026-11-15), so the page only has to hand over a starting
// point and stay out of the way:
//  - DayPicker: shows any day's workout, whatever the weekday is.
//  - CopyButton: copies that workout as a bullet list for Notes, with today's
//    date and the planned weight x reps of every set, to be corrected by hand.
//  - RestTimer: a countdown between sets that chimes and vibrates at zero.

import { useEffect, useRef, useState } from "react";

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
      {state === "copied" ? "Copied, paste into Notes" : state === "failed" ? "Couldn't copy" : "Copy workout for Notes"}
    </button>
  );
}

/**
 * The rest chime as a small WAV file in a data URI: two soft short tones. It is
 * played through an <audio> element, not the Web Audio API, because iOS treats a
 * media element as playback and lets it sound with the ring/silent switch on,
 * while it mutes Web Audio in silent mode.
 */
function chimeDataUri(): string {
  const rate = 22050;
  const tones: [number, number, number][] = [
    [660, 0, 0.28],
    [880, 0.3, 0.28],
  ];
  const length = Math.ceil(rate * 0.65);
  const pcm = new Int16Array(length);
  for (const [freq, start, dur] of tones) {
    const s0 = Math.floor(start * rate);
    const n = Math.floor(dur * rate);
    for (let i = 0; i < n; i++) {
      const t = i / rate;
      const env = Math.min(1, t / 0.02) * Math.exp(-t * 9);
      const v = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
      pcm[s0 + i] += Math.round(v * 32767);
    }
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const dv = new DataView(buf);
  const str = (o: number, v: string) => {
    for (let i = 0; i < v.length; i++) dv.setUint8(o + i, v.charCodeAt(i));
  };
  str(0, "RIFF");
  dv.setUint32(4, 36 + pcm.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  str(36, "data");
  dv.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const REST_KEY = "fit:rest";

export function RestTimer() {
  // When the rest ends (ms since epoch) and how long it was set for.
  const [end, setEnd] = useState<number | null>(null);
  const [len, setLen] = useState(0);
  const [now, setNow] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const rang = useRef(false);

  // A rest that was running survives a reload or the phone locking.
  useEffect(() => {
    setNow(Date.now());
    try {
      const r = JSON.parse(localStorage.getItem(REST_KEY) ?? "null") as { end: number; len: number } | null;
      if (r && r.end > Date.now()) {
        setEnd(r.end);
        setLen(r.len);
      }
    } catch {
      /* nothing stored */
    }
  }, []);

  useEffect(() => {
    if (end == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [end]);

  // Ring once when the rest runs out.
  useEffect(() => {
    if (end == null || now < end) {
      rang.current = false;
      return;
    }
    if (rang.current) return;
    rang.current = true;
    try {
      navigator.vibrate?.([120, 80, 120]);
    } catch {
      /* no vibration on this device */
    }
    const el = audio.current;
    if (el) {
      try {
        el.currentTime = 0;
        void el.play();
      } catch {
        /* audio blocked */
      }
    }
  }, [now, end]);

  const store = (v: { end: number; len: number } | null) => {
    try {
      localStorage.setItem(REST_KEY, JSON.stringify(v));
    } catch {
      /* private mode */
    }
  };

  const start = (seconds: number) => {
    // iOS allows a media element to play later only after it has played once
    // inside a tap. So on the first tap it starts, and is stopped straight away:
    // the chime's 20 ms fade-in keeps that inaudible.
    if (!audio.current) {
      try {
        const el = new Audio(chimeDataUri());
        el.preload = "auto";
        el.setAttribute("playsinline", "");
        audio.current = el;
        const p = el.play();
        if (p) {
          p.then(() => {
            el.pause();
            el.currentTime = 0;
          }).catch(() => {
            audio.current = null; // will try again on the next tap
          });
        }
      } catch {
        /* no audio */
      }
    }
    const e = Date.now() + seconds * 1000;
    rang.current = false;
    setEnd(e);
    setLen(seconds);
    setNow(Date.now());
    store({ end: e, len: seconds });
  };
  const stop = () => {
    setEnd(null);
    store(null);
  };

  const left = end == null ? 0 : Math.max(0, Math.ceil((end - now) / 1000));
  const done = end != null && now >= end;

  return (
    <div className="fit-rest sticky top-0 z-10 -mx-6 mt-4 flex flex-wrap items-center gap-2 border-y border-hairline bg-navy-raised px-6 py-3">
      <span className="mr-1 font-body text-xs text-silver-muted">rest</span>
      {[60, 90, 120, 180].map((sec) => (
        <button
          key={sec}
          type="button"
          onClick={() => start(sec)}
          className={`fit-btn ${end != null && len === sec && !done ? "fit-btn-primary" : ""}`}
        >
          {sec < 120 ? `${sec} s` : `${sec / 60} min`}
        </button>
      ))}
      {end != null ? (
        <button
          type="button"
          onClick={stop}
          aria-label="stop the rest timer"
          className={`ml-auto font-display text-2xl font-semibold tabular-nums tracking-tight ${done ? "text-red-400" : "text-vivid-blue"}`}
        >
          {done ? "GO" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}
        </button>
      ) : null}
    </div>
  );
}
