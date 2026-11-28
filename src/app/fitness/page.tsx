import { CopyButton, DayPicker } from "./gym-tools";
import { HOW, type HowTo } from "./howto";

// Oleg's training program, as bare as it gets (his request, 2026-11-15): the day
// buttons, and for the chosen day one line per exercise (sets, reps, rest) plus a
// button that copies the workout as a bullet list for Apple Notes, where the log
// is kept. The device's weekday picks the day before first paint (a one-line
// script stamps it on <html>, see fitness.css); the buttons switch to any other.
// The only extra is one quiet fold at the bottom of the card, rarely opened:
// per exercise, last time's numbers and the technique step by step (howto.ts).
// No warm-up, stretch, pictures or notes here: those live in the
// source, Desktop/Fitness/program_oct_2026.md (Russian). A change there gets
// translated here by hand, and `copy` is recomputed from the log (section 9.1).

type Exercise = {
  /** The overview line: short name, sets and reps, rest. */
  line: string;
  /** The line(s) for the Notes template, without the bullet: name and planned weight x reps per set. */
  copy: string[];
  /** Step-by-step technique, one entry per movement. Shown only inside the fold at the bottom of the card. */
  how: HowTo[];
  /** What the log says was done last time, with its date. Shown in the same fold. */
  last?: string;
  /** Outside the 90 minutes: done only when there is time left. Not in the Notes template. */
  optional?: boolean;
};

type Workout = {
  /** Short weekday, as the day buttons and the <html data-today> attribute use it. */
  id: string;
  day: string;
  title: string;
  /** The name in the first line of the Notes template. */
  short: string;
  /** False on Sunday, which has no gym warm-up. */
  warmup: boolean;
  exercises: Exercise[];
};

// JavaScript's Date#getDay() order, Sunday first. "mon" is the rest day.
const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const WORKOUTS: Workout[] = [
  {
    id: "tue",
    day: "Tuesday",
    title: "Pull A",
    short: "pull A",
    warmup: true,
    exercises: [
      { line: "pull-ups: 4 sets × 6-10, rest 3 min", copy: ["pull-ups +10x8, +10x7, +10x7, +10x6"], how: [HOW.pullUps], last: "Nov 24: +10x8, +10x7, +10x6, +10x6" },
      { line: "chest-supported rows: 3 sets × 8-12, rest 3 min", copy: ["chest-supported rows 22x10, 22x10, 22x10"], how: [HOW.chestRow], last: "Nov 24: 18x16, 18x16, 18x16" },
      {
        line: "posture shrugs + back extension: 3 rounds × 15, rest 90 s",
        copy: ["posture shrugs 14x15, 14x15, 14x15", "back extension 15, 15, 15"], how: [HOW.levatorShrug, HOW.backExtension], last: "Nov 24: 14x15, 14x15, 14x15 + new",
      },
      { line: "rear delt cable flies: 3 sets × 15-20, rest 90 s", copy: ["rear delt cable flies 3.75x17, 3.75x17, 3.75x16"], how: [HOW.rearDeltCable], last: "Nov 24: 3.75x17, 3.75x16, 3.75x16" },
      {
        line: "incline curls + reverse ez curls: 2 rounds × 8-12, rest 90 s",
        copy: ["incline curls 12x7, 12x6", "reverse ez curls 15x13, 15x12"], how: [HOW.inclineCurl, HOW.reverseCurl], last: "Nov 24: 12x6, 12x6 + 15x12, 15x12",
      },
      { line: "y-raise: 3 sets × 12-15, rest 90 s", copy: ["y-raise 4x13, 4x12, 4x12"], how: [HOW.yRaise], last: "Nov 24: 4x12, 4x12", optional: true },
      { line: "pullover: 3 sets × 12-15, rest 90 s", copy: ["pullover 22.5x12, 22.5x12, 20x12"], how: [HOW.pullover], last: "Nov 10: 22.5x12, 20x12, 20x12", optional: true },
    ],
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "Push A",
    short: "push A",
    warmup: true,
    exercises: [
      { line: "seated dumbbell press: 4 sets × 6-10, rest 3 min", copy: ["seated dumbbell press 22.5x8, 22.5x8, 22.5x8, 22.5x8"], how: [HOW.seatedPress], last: "Nov 25: 20x12, 20x12, 20x12, 20x12" },
      { line: "shoulder flies: 4 sets × 10-15, rest 90 s", copy: ["shoulder flies 12x14, 12x13, 12x13, 12x13"], how: [HOW.lateralRaise], last: "Nov 25: 12x13, 12x13, 12x13, 12x13" },
      { line: "dumbbell press 30 degrees: 3 sets × 8-12, rest 3 min", copy: ["dumbbell press 30 degrees 24x10, 24x9, 24x9"], how: [HOW.inclineDB], last: "Nov 25: 24x9, 24x9, 24x9" },
      { line: "face pull: 3 sets × 12-15, rest 90 s", copy: ["face pull 12.5x16, 12.5x16, 12.5x15"], how: [HOW.facePull], last: "Nov 25: 12.5x16, 12.5x15, 12.5x15" },
      {
        line: "overhead triceps extension + triceps pushdown: 2 rounds × 12-15, rest 90 s",
        copy: ["overhead triceps extension 15x12, 15x12", "triceps pushdown 15x12, 15x12"], how: [HOW.overheadExt, HOW.pushdown], last: "Nov 25: 12.5 to failure, 2 rounds, reps not counted. Nov 18: 12.5x15, 12.5x15, 12.5x13 + 12.5x15, 12.5x15, 12.5x13",
      },
      { line: "external rotation: 2 sets × 12-15 per arm, rest 60 s", copy: ["external rotation 2.5x15, 2.5x15"], how: [HOW.extRotation], last: "Nov 4: 2.5x15, 2.5x15", optional: true },
    ],
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Legs",
    short: "legs",
    warmup: true,
    exercises: [
      { line: "squats: 4 sets × 6-10, rest 3 min", copy: ["squats 65x9, 65x8, 65x8, 65x8"], how: [HOW.barbellSquat], last: "Nov 26: 65x8, 65x8, 65x8, 65x8" },
      { line: "deadlift: 3 sets × 5-8, rest 3 min", copy: ["deadlift 80x8, 80x8, 80x8"], how: [HOW.barbellDeadlift], last: "Nov 26: 70x8, 70x8, 70x8. Nov 19: 80x8, 80x8, 80x8" },
      { line: "bulgarian lunges: 3 sets × 8-12 per leg, rest 3 min", copy: ["bulgarian lunges 12x10, 12x9, 12x9"], how: [HOW.bulgarian], last: "Nov 26: 12x9, 12x9, 12x9" },
      { line: "posture shrugs: 3 sets × 15, rest 90 s", copy: ["posture shrugs 14x15, 14x15, 14x15"], how: [HOW.levatorShrug], last: "Nov 24: 14x15, 14x15, 14x15" },
      { line: "hanging leg raises: 3 sets × 10-15, rest 90 s", copy: ["hanging leg raises 15, 14, 13"], how: [HOW.legRaise], last: "Nov 26: 15, 13, 13" },
      { line: "calves dumbbells: 3 sets × 12-20, rest 90 s", copy: ["calves dumbbells 22.5x15, 22.5x15, 22.5x15"], how: [HOW.calves], last: "Nov 26: 20x20, 20x20, 20x20", optional: true },
      { line: "legs curls: 3 sets × 10-15, rest 90 s", copy: ["legs curls 25x15, 25x15, 25x14"], how: [HOW.legCurl], last: "Nov 5: 25x15, 25x14, 25x14", optional: true },
    ],
  },
  {
    id: "fri",
    day: "Friday",
    title: "Pull B",
    short: "pull B",
    warmup: true,
    exercises: [
      { line: "barbell rows: 4 sets × 6-10, rest 3 min", copy: ["barbell rows 62.5x8, 60x10, 60x10, 60x10"], how: [HOW.barbellRow], last: "Nov 27: 50x9, 50x9, 50x9, 50x9, after 4 sets of pull-ups. Nov 20: 60x10, 60x10, 60x10, 60x10" },
      { line: "one-arm dumbbell rows: 3 sets × 8-12 per arm, rest 3 min", copy: ["one-arm dumbbell rows 24x12, 24x11, 24x11"], how: [HOW.oneArmRow], last: "Nov 27: 22.5x12, 22.5x12, 22.5x12. Nov 20: 24x11, 24x11, 24x11" },
      { line: "posture shrugs: 3 sets × 15, rest 90 s", copy: ["posture shrugs 14x15, 14x15, 14x15"], how: [HOW.levatorShrug], last: "Nov 27: 12x15, 12x15, 12x15" },
      { line: "rear delt flies lying: 3 sets × 12-20, rest 90 s", copy: ["rear delt flies lying 10x20, 10x20, 10x15"], how: [HOW.rearDeltProne], last: "Nov 27: 10x20, 10x20, 8x20" },
      {
        line: "ez curls + hammer curls: 2 rounds × 8-12, rest 90 s",
        copy: ["ez curls 20x11, 20x10", "hammer curls 12x10, 12x9"], how: [HOW.ezCurl, HOW.hammer], last: "Nov 27: 20x10, 20x10 + 10x10, 10x10",
      },
      { line: "face pull: 3 sets × 12-15, rest 90 s", copy: ["face pull 12.5x16, 12.5x15, 12.5x15"], how: [HOW.facePull], last: "Nov 13: 12.5x15, 12.5x15, 12.5x15", optional: true },
    ],
  },
  {
    id: "sat",
    day: "Saturday",
    title: "Push B",
    short: "push B",
    warmup: true,
    exercises: [
      { line: "barbell press 30 degrees: 4 sets × 6-10, rest 3 min", copy: ["barbell press 30 degrees 65x7, 65x7, 65x6, 65x6"], how: [HOW.inclineBar], last: "Nov 21: 65x7, 65x6, 65x6, 65x6" },
      { line: "cable shoulder flies: 4 sets × 12-20, rest 90 s", copy: ["cable shoulder flies 3.75x15, 3.75x15, 3.75x15, 3.75x15"], how: [HOW.cableLateral], last: "Nov 21: 3.75x13, 3.75x15, 3.75x13, 3.75x15" },
      { line: "low-to-high cable flies: 3 sets × 12-15, rest 90 s", copy: ["low-to-high cable flies 7.5x16, 7.5x15, 7.5x15"], how: [HOW.lowToHighFly], last: "Nov 21: 7.5x15, 7.5x15, 7.5x15" },
      { line: "rear delt cable flies: 3 sets × 15-20, rest 90 s", copy: ["rear delt cable flies 3.75x16, 3.75x15, 3.75x15"], how: [HOW.rearDeltCable], last: "Nov 21: 3.75x15, 3.75x15, 3.75x15" },
      {
        line: "french press + triceps pushdown: 2 rounds × 10-12, rest 90 s",
        copy: ["french press 22.5x10, 20x12", "triceps pushdown 17.5x10, 15x12"], how: [HOW.frenchPress, HOW.pushdown], last: "Nov 21: 20x12, 20x12 + 15x15, 15x12",
      },
      { line: "shoulder flies: 3 sets × 12-15, rest 90 s", copy: ["shoulder flies 12x13, 12x12, 12x12"], how: [HOW.lateralRaise], last: "Nov 7: 12x12, 12x12, 12x12", optional: true },
    ],
  },
  {
    id: "sun",
    day: "Sunday",
    title: "Cardio",
    short: "cardio abs",
    warmup: false,
    exercises: [
      { line: "incline walk: 30 min", copy: ["incline walk 30 min, 5.6 km/h, incline 12"], how: [HOW.walk], last: "Nov 23: 30 min, 5.6 km/h, incline 10, max heart rate 121 (target 125-145), 280 kcal" },
      {
        line: "hanging leg raises + reverse crunches + dead bug + plank: 3 rounds, rest 90 s",
        copy: ["hanging leg raises 12, 10, 10", "reverse crunches 13, 12, 12", "dead bug 10, 10, 10", "plank 40s, 35s, 35s"], how: [HOW.legRaise, HOW.reverseCrunch, HOW.deadBug, HOW.plank], last: "Nov 23: 11, 10, 10 + 12, 12, 12 + 10, 10, 10 + 35s, 35s, 35s",
      },
      {
        line: "wrist curls + wrist extensions + posture shrugs: 3 rounds × 15-20, rest 90 s",
        copy: ["wrist curls 15x17, 15x16, 15x16", "wrist extensions 10x15, 10x14, 10x12", "posture shrugs 14x15, 14x15, 14x15"], how: [HOW.wristCurl, HOW.wristExt, HOW.levatorShrug], last: "Nov 23: 15x16, 15x16, 15x16 + 10x15, 10x13, 10x12 + new on this day",
      },
      { line: "hang: 2 sets to failure, rest 90 s", copy: ["hang 70s, 70s"], how: [HOW.hang], last: "Nov 23: 70s, 65s" },
    ],
  },
];

const WORKOUT_BY_ID = new Map(WORKOUTS.map((w) => [w.id, w]));

/** The Notes template of one workout, without the first line (that one carries today's date). */
function noteLines(w: Workout): string[] {
  return [
    "90 min",
    ...(w.warmup ? ["warm-up"] : []),
    ...w.exercises.filter((e) => !e.optional).flatMap((e) => e.copy),
    "stretch",
  ];
}

/** One weekday's card; only the one whose day is stamped on <html> is visible. Monday is the rest day. */
function DayCard({ dayId }: { dayId: (typeof DAY_IDS)[number] }) {
  const w = WORKOUT_BY_ID.get(dayId);
  const core = w?.exercises.filter((e) => !e.optional) ?? [];
  const extra = w?.exercises.filter((e) => e.optional) ?? [];
  return (
    <div className="fit-today" data-day={dayId}>
      <div className="surface-card p-6 md:p-8">
        <p className="eyebrow font-body text-[13px] text-vivid-blue">
          {w ? w.day : "Monday"}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
          {w ? w.title : "Rest"}
        </h2>
        {w ? (
          <>
            <ul className="mt-5 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-silver marker:text-silver-muted">
              {core.map((e) => (
                <li key={e.line}>{e.line}</li>
              ))}
            </ul>
            {extra.length ? (
              <>
                <p className="mt-5 font-body text-sm text-silver-muted">If there&apos;s time</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-silver-muted marker:text-silver-muted">
                  {extra.map((e) => (
                    <li key={e.line}>{e.line}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="mt-6">
              <CopyButton title={w.short} lines={noteLines(w)} />
            </div>
            <details className="fit-more mt-8">
              <summary className="font-body text-xs text-silver-muted">How to do the exercises</summary>
              <div className="mt-2 flex flex-col">
                {w.exercises.map((e) => (
                  <details key={e.line} className="fit-more border-t border-hairline">
                    <summary className="py-3 font-body text-sm text-silver">{e.line.split(":")[0]}</summary>
                    <div className="flex flex-col gap-4 pb-4 font-body text-sm leading-relaxed text-silver-muted">
                      {e.last ? <p>Last time, {e.last}</p> : null}
                      {e.how.map((h, i) => (
                        <div key={i}>
                          {e.how.length > 1 ? (
                            <p className="mb-1 text-silver">{e.line.split(":")[0].split(" + ")[i] ?? h.title}</p>
                          ) : null}
                          <ol className="list-decimal space-y-1 pl-5">
                            {h.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                          {h.tip ? <p className="mt-2">Key point: {h.tip}</p> : null}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function FitnessPage() {
  return (
    <>
      {/*
        Picks today's card before the rest of the body is parsed, so the first
        painted frame already shows the right day. The ids follow getDay():
        Sunday first. The day buttons overwrite the same attribute.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-today",${JSON.stringify(DAY_IDS)}[new Date().getDay()])`,
        }}
      />
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-14">
        <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
          Muscle gain program
        </h1>
        <div className="mt-8">
          <DayPicker days={WORKOUTS.map((w) => ({ id: w.id, label: `${w.day.slice(0, 3)} · ${w.title}` }))} />
        </div>
        <div className="mt-6">
          {DAY_IDS.map((id) => (
            <DayCard key={id} dayId={id} />
          ))}
        </div>
      </main>
    </>
  );
}
