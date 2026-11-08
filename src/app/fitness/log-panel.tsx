"use client";

// The in-gym panel of /fitness: a 90-minute clock from the moment Oleg leaves home,
// and a weight + reps field for every set of today's workout. Everything typed is
// kept in localStorage at once and sent to /api/fitness/log (Supabase) a moment
// later, so a dead signal in the gym loses nothing. The phone stays awake through
// the Screen Wake Lock API while the clock runs and the page is visible.
//
// One instance is rendered per weekday card; only the one for the device's weekday
// does anything, the others render nothing.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LogExercise = {
  name: string;
  /** One entry for a plain exercise; one per movement for a superset or a circuit. */
  movements: string[];
  sets: number;
  /** What the second field counts. */
  unit: "reps" | "s" | "min";
  /** Whether the first field (kg) is shown. Bodyweight work hides it. */
  weight: boolean;
};

type Props = {
  dayId: string;
  exercises: LogExercise[];
  /** Minutes from leaving home: warm-up starts, first exercise starts, stretch starts, done. */
  marks: { warmup: number; work: number; stretch: number; end: number };
};

type Entry = { weight: string; reps: string };
type Entries = Record<string, Entry>; // key: `${exerciseIdx}.${movementIdx}.${setIdx}`

type ServerSet = {
  exercise_idx: number;
  movement_idx: number;
  set_idx: number;
  weight: number | null;
  reps: number | null;
  unit: string;
};

const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private mode etc. */
  }
}

export function LogPanel({ dayId, exercises, marks }: Props) {
  const [active, setActive] = useState(false);
  const [date, setDate] = useState("");
  const [key, setKey] = useState<string>("");
  const [keyDraft, setKeyDraft] = useState("");
  const [entries, setEntries] = useState<Entries>({});
  const [note, setNote] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState<string>("");
  const [last, setLast] = useState<{ date: string; sets: ServerSet[] } | null>(null);
  const dirty = useRef<{ sets: Set<string>; session: boolean }>({ sets: new Set(), session: false });
  const timer = useRef<number | null>(null);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  // Rest timer between sets: when it ends (ms since epoch), and how long it was set for.
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [restLen, setRestLen] = useState<number>(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const rang = useRef(false);

  // Only today's instance wakes up.
  useEffect(() => {
    if (DAY_IDS[new Date().getDay()] !== dayId) return;
    const d = todayISO();
    setDate(d);
    setActive(true);
    setKey(readLS<string>("fit:key", ""));
    setEntries(readLS<Entries>(`fit:log:${d}`, {}));
    setNote(readLS<string>(`fit:note:${d}`, ""));
    setStartedAt(readLS<number | null>(`fit:start:${d}`, null));
    setFinishedAt(readLS<number | null>(`fit:finish:${d}`, null));
    const r = readLS<{ end: number; len: number } | null>("fit:rest", null);
    if (r && r.end > Date.now()) {
      setRestEnd(r.end);
      setRestLen(r.len);
    }
  }, [dayId]);

  // Ring once when the rest runs out: a vibration and a short beep. The audio
  // context is created on the button tap, which is what iOS needs to allow sound.
  useEffect(() => {
    if (!active || restEnd == null) return;
    if (now < restEnd) {
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
  }, [active, now, restEnd]);

  const startRest = (seconds: number) => {
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
            /* will try again on the next tap */
            audio.current = null;
          });
        }
      } catch {
        /* no audio */
      }
    }
    const end = Date.now() + seconds * 1000;
    rang.current = false;
    setRestEnd(end);
    setRestLen(seconds);
    setNow(Date.now());
    writeLS("fit:rest", { end, len: seconds });
  };
  const stopRest = () => {
    setRestEnd(null);
    writeLS("fit:rest", null);
  };

  // Pull what the server has (this device may be fresh) and last time's numbers.
  useEffect(() => {
    if (!active || !key || !date) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fitness/log?date=${date}&day=${dayId}`, {
          headers: { "x-fitness-key": key },
        });
        if (res.status === 401) {
          setKey("");
          writeLS("fit:key", "");
          setStatus("Wrong PIN");
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as {
          session: { started_at: string | null; finished_at: string | null; note: string | null } | null;
          sets: ServerSet[];
          last: { session: { session_date: string }; sets: ServerSet[] } | null;
        };
        if (cancelled) return;
        if (data.last) setLast({ date: data.last.session.session_date, sets: data.last.sets });
        // Server fills only what this device doesn't have yet; local typing wins.
        setEntries((cur) => {
          const next = { ...cur };
          for (const s of data.sets) {
            const k = `${s.exercise_idx}.${s.movement_idx}.${s.set_idx}`;
            if (!next[k] || (!next[k].weight && !next[k].reps)) {
              next[k] = { weight: s.weight == null ? "" : String(s.weight), reps: s.reps == null ? "" : String(s.reps) };
            }
          }
          writeLS(`fit:log:${date}`, next);
          return next;
        });
        if (data.session) {
          if (data.session.started_at) {
            setStartedAt((cur) => {
              const v = cur ?? new Date(data.session!.started_at as string).getTime();
              writeLS(`fit:start:${date}`, v);
              return v;
            });
          }
          if (data.session.finished_at) {
            setFinishedAt((cur) => {
              const v = cur ?? new Date(data.session!.finished_at as string).getTime();
              writeLS(`fit:finish:${date}`, v);
              return v;
            });
          }
          if (data.session.note) setNote((cur) => cur || (data.session!.note as string));
        }
      } catch {
        /* offline: localStorage is enough for now */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, key, date, dayId]);

  // The clock.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  // Keep the screen on while the session runs.
  useEffect(() => {
    if (!active) return;
    const running = startedAt != null && finishedAt == null;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    async function acquire() {
      if (!running || !nav.wakeLock || document.visibilityState !== "visible") return;
      try {
        wakeLock.current = await nav.wakeLock.request("screen");
      } catch {
        /* denied or low battery: the clock still works off Date.now() */
      }
    }
    async function release() {
      try {
        await wakeLock.current?.release();
      } catch {
        /* already released */
      }
      wakeLock.current = null;
    }
    acquire();
    const onVis = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      release();
    };
  }, [active, startedAt, finishedAt]);

  const flush = useCallback(async () => {
    if (!key || !date) return;
    const d = dirty.current;
    if (!d.sets.size && !d.session) return;
    const setKeys = [...d.sets];
    const sendSession = d.session;
    dirty.current = { sets: new Set(), session: false };
    const sets = setKeys.map((k) => {
      const [ei, mi, si] = k.split(".").map(Number);
      const e = entries[k] ?? { weight: "", reps: "" };
      const ex = exercises[ei];
      return {
        exerciseIdx: ei,
        movementIdx: mi,
        setIdx: si,
        exercise: ex?.name ?? "",
        movement: ex && ex.movements.length > 1 ? ex.movements[mi] : null,
        weight: e.weight.trim() === "" ? null : Number(e.weight.replace(",", ".")),
        reps: e.reps.trim() === "" ? null : Number(e.reps.replace(",", ".")),
        unit: ex?.unit ?? "reps",
      };
    });
    const body: Record<string, unknown> = { date, day: dayId, sets };
    if (sendSession) {
      body.session = {
        startedAt: startedAt ? new Date(startedAt).toISOString() : null,
        finishedAt: finishedAt ? new Date(finishedAt).toISOString() : null,
        note,
      };
    }
    setStatus("Sending…");
    try {
      const res = await fetch("/api/fitness/log", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-fitness-key": key },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setKey("");
        writeLS("fit:key", "");
        setStatus("Wrong PIN");
        return;
      }
      if (!res.ok) throw new Error();
      const t = new Date();
      setStatus(
        `On the server, ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
      );
    } catch {
      // Put it back for the next try.
      for (const k of setKeys) dirty.current.sets.add(k);
      if (sendSession) dirty.current.session = true;
      setStatus(`On the phone only, ${dirty.current.sets.size} set(s) waiting for signal`);
    }
  }, [key, date, dayId, entries, exercises, startedAt, finishedAt, note]);

  const schedule = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void flush();
    }, 1500);
  }, [flush]);

  // Whenever something is dirty and the inputs settle, send it.
  useEffect(() => {
    if (dirty.current.sets.size || dirty.current.session) schedule();
  }, [entries, note, startedAt, finishedAt, schedule]);

  // Retry when the connection comes back.
  useEffect(() => {
    if (!active) return;
    const onLine = () => void flush();
    window.addEventListener("online", onLine);
    return () => window.removeEventListener("online", onLine);
  }, [active, flush]);

  const update = (k: string, field: keyof Entry, value: string) => {
    setEntries((cur) => {
      const prev = cur[k] ?? { weight: "", reps: "" };
      const nextEntry = { ...prev, [field]: value };
      // Typing reps into a set with no weight yet copies the weight from the set before.
      if (field === "reps" && !prev.weight && value) {
        const [ei, mi, si] = k.split(".").map(Number);
        const before = cur[`${ei}.${mi}.${si - 1}`];
        if (before?.weight) nextEntry.weight = before.weight;
      }
      const next = { ...cur, [k]: nextEntry };
      writeLS(`fit:log:${date}`, next);
      return next;
    });
    dirty.current.sets.add(k);
  };

  const start = () => {
    const t = Date.now();
    setStartedAt(t);
    setFinishedAt(null);
    writeLS(`fit:start:${date}`, t);
    writeLS(`fit:finish:${date}`, null);
    dirty.current.session = true;
  };
  const finish = () => {
    const t = Date.now();
    setFinishedAt(t);
    writeLS(`fit:finish:${date}`, t);
    dirty.current.session = true;
  };
  const resetClock = () => {
    setStartedAt(null);
    setFinishedAt(null);
    writeLS(`fit:start:${date}`, null);
    writeLS(`fit:finish:${date}`, null);
    dirty.current.session = true;
  };

  const lastByKey = useMemo(() => {
    const m = new Map<string, ServerSet>();
    for (const s of last?.sets ?? []) m.set(`${s.exercise_idx}.${s.movement_idx}.${s.set_idx}`, s);
    return m;
  }, [last]);

  /** Whether last time has any set for this exercise and movement; without one the "last time" column is hidden. */
  const hasLast = (ei: number, mi: number) => {
    for (const k of lastByKey.keys()) if (k.startsWith(`${ei}.${mi}.`)) return true;
    return false;
  };

  if (!active) return null;

  const elapsed = startedAt ? (finishedAt ?? now) - startedAt : 0;
  const minutes = elapsed / 60000;
  const phase =
    !startedAt
      ? "Not started"
      : finishedAt
        ? "Done"
        : minutes < marks.warmup
          ? "Walk"
          : minutes < marks.work
            ? "Warm-up"
            : minutes < marks.stretch
              ? "Exercises"
              : minutes < marks.end
                ? "Stretch"
                : "Over 90 minutes";
  const over = startedAt && !finishedAt && minutes >= marks.end;
  const pct = Math.min(100, (minutes / marks.end) * 100);

  return (
    <div className="fit-log mt-6 flex flex-col gap-5">
      {/* The clock and the rest timer, pinned to the top while you scroll the sets */}
      <div className="fit-clock sticky top-0 z-10 -mx-6 border-y border-hairline bg-navy-raised px-6 py-3 md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="eyebrow font-body text-[13px] text-vivid-blue">90 min</p>
          <p className="font-body text-sm text-silver-muted">{phase}</p>
        </div>
        <div className="mt-1 flex items-end justify-between gap-4">
          <p
            className={`font-display text-3xl font-semibold tabular-nums tracking-tight ${over ? "text-red-400" : "text-white"}`}
            aria-live="off"
          >
            {fmt(elapsed)}
          </p>
          {restEnd != null ? (
            <button
              type="button"
              onClick={stopRest}
              className={`font-display text-3xl font-semibold tabular-nums tracking-tight ${
                now >= restEnd ? "text-red-400" : "text-vivid-blue"
              }`}
              aria-label="stop the rest timer"
            >
              {now >= restEnd ? "GO" : fmt(restEnd - now).replace(/^0:/, "")}
            </button>
          ) : null}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy">
          <div
            className={`h-full ${over ? "bg-red-400" : "bg-vivid-blue"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 font-body text-xs text-silver-muted">
          0:{String(marks.warmup).padStart(2, "0")} warm-up · 0:{String(marks.work).padStart(2, "0")} first exercise · 1:
          {String(marks.stretch - 60).padStart(2, "0")} stretch · 1:30 done
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-xs text-silver-muted">rest</span>
          {[5, 60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => startRest(sec)}
              className={`fit-btn ${restEnd != null && restLen === sec && now < restEnd ? "fit-btn-primary" : ""}`}
            >
              {sec < 120 ? `${sec} s` : `${sec / 60} min`}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!startedAt ? (
            <button type="button" onClick={start} className="fit-btn fit-btn-primary">
              Start
            </button>
          ) : !finishedAt ? (
            <>
              <button type="button" onClick={finish} className="fit-btn fit-btn-primary">
                Finished
              </button>
              <button type="button" onClick={resetClock} className="fit-btn">
                Reset
              </button>
            </>
          ) : (
            <button type="button" onClick={resetClock} className="fit-btn">
              Reset clock
            </button>
          )}
        </div>
      </div>

      {/* PIN, once per device */}
      {!key ? (
        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            const k = keyDraft.trim();
            if (!k) return;
            setKey(k);
            writeLS("fit:key", k);
            setStatus("");
          }}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1 font-body text-sm text-silver-muted">
            PIN to save the log
            <input
              type="password"
              inputMode="text"
              autoComplete="off"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              className="fit-input"
            />
          </label>
          <button type="submit" className="fit-btn fit-btn-primary">
            Unlock
          </button>
          {status ? <p className="w-full font-body text-sm text-red-400">{status}</p> : null}
        </form>
      ) : null}

      {/* The sets */}
      <ol className="flex flex-col gap-5">
        {exercises.map((ex, ei) => (
          <li key={ex.name} className="rounded-xl border border-hairline px-4 py-4">
            <p className="font-body text-base font-semibold text-white">
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full border border-hairline bg-vivid-blue/10 font-body text-xs font-semibold text-vivid-blue">
                {ei + 1}
              </span>
              {ex.name}
            </p>
            {ex.movements.map((mv, mi) => (
              <div key={mv} className={mi > 0 || ex.movements.length > 1 ? "mt-3" : "mt-2"}>
                {ex.movements.length > 1 ? (
                  <p className="mb-1.5 font-body text-sm font-semibold text-silver">{mv}</p>
                ) : null}
                <div
                  className={`grid items-center gap-x-2 gap-y-2 font-body text-sm ${
                    hasLast(ei, mi) ? "grid-cols-[2.5rem_1fr_1fr_auto]" : "grid-cols-[2.5rem_1fr_1fr]"
                  }`}
                >
                  <span className="text-xs text-silver-muted">set</span>
                  <span className="text-xs text-silver-muted">{ex.weight ? "kg" : ""}</span>
                  <span className="text-xs text-silver-muted">{ex.unit === "reps" ? "reps" : ex.unit === "s" ? "seconds" : "minutes"}</span>
                  {hasLast(ei, mi) ? (
                    <span className="text-xs text-silver-muted">last time{last ? `, ${last.date.slice(5).replace("-", "/")}` : ""}</span>
                  ) : null}
                  {Array.from({ length: ex.sets }, (_, si) => {
                    const k = `${ei}.${mi}.${si}`;
                    const e = entries[k] ?? { weight: "", reps: "" };
                    const l = lastByKey.get(k);
                    const prevWeight = entries[`${ei}.${mi}.${si - 1}`]?.weight ?? "";
                    return (
                      <FragmentRow
                        key={k}
                        n={si + 1}
                        showWeight={ex.weight}
                        weight={e.weight}
                        reps={e.reps}
                        weightPlaceholder={prevWeight || (l?.weight != null ? String(l.weight) : "")}
                        repsPlaceholder={l?.reps != null ? String(l.reps) : ""}
                        last={hasLast(ei, mi) ? (l ? `${l.weight != null ? `${l.weight}×` : ""}${l.reps ?? ""}` : "–") : null}
                        onWeight={(v) => update(k, "weight", v)}
                        onReps={(v) => update(k, "reps", v)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </li>
        ))}
      </ol>

      {/* Note and status */}
      <div className="rounded-xl border border-hairline px-4 py-4">
        <label className="flex flex-col gap-1 font-body text-sm text-silver-muted">
          How it went: pain, soreness, what to change
          <textarea
            value={note}
            rows={2}
            onChange={(e) => {
              setNote(e.target.value);
              writeLS(`fit:note:${date}`, e.target.value);
              dirty.current.session = true;
            }}
            className="fit-input min-h-20 resize-y"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-sm text-silver-muted">
            {last ? `Last ${dayId.toUpperCase()}: ${last.date}` : "No earlier session in the log yet"}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-silver-muted">{status}</span>
            <button
              type="button"
              className="fit-btn"
              onClick={() => {
                for (const k of Object.keys(entries)) dirty.current.sets.add(k);
                dirty.current.session = true;
                void flush();
              }}
              disabled={!key}
            >
              Save now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  n,
  showWeight,
  weight,
  reps,
  weightPlaceholder,
  repsPlaceholder,
  last,
  onWeight,
  onReps,
}: {
  n: number;
  showWeight: boolean;
  weight: string;
  reps: string;
  weightPlaceholder: string;
  repsPlaceholder: string;
  last: string | null;
  onWeight: (v: string) => void;
  onReps: (v: string) => void;
}) {
  return (
    <>
      <span className="text-silver">{n}</span>
      {showWeight ? (
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={weight}
          placeholder={weightPlaceholder}
          onChange={(e) => onWeight(e.target.value)}
          className="fit-input"
          aria-label={`set ${n} weight`}
        />
      ) : (
        <span />
      )}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={reps}
        placeholder={repsPlaceholder}
        onChange={(e) => onReps(e.target.value)}
        className="fit-input"
        aria-label={`set ${n} reps`}
      />
      {last !== null ? (
        <span className="min-w-10 text-right text-xs tabular-nums text-silver-muted">{last}</span>
      ) : null}
    </>
  );
}
