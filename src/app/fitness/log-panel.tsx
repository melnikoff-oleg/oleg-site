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
  }, [dayId]);

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
    setStatus("Saving…");
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
      setStatus(`Saved ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`);
    } catch {
      // Put it back for the next try.
      for (const k of setKeys) dirty.current.sets.add(k);
      if (sendSession) dirty.current.session = true;
      setStatus("Not saved yet, kept on the phone");
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
      {/* The clock */}
      <div className="rounded-xl border border-hairline bg-vivid-blue/5 px-4 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="eyebrow font-body text-[13px] text-vivid-blue">90 min</p>
          <p className="font-body text-sm text-silver-muted">{phase}</p>
        </div>
        <p
          className={`mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight ${over ? "text-red-400" : "text-white"}`}
          aria-live="off"
        >
          {fmt(elapsed)}
        </p>
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
