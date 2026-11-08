import Link from "next/link";
import type { ReactNode } from "react";
import { HOW, type HowTo } from "./howto";
import { LogPanel, type LogExercise } from "./log-panel";

// Oleg's training program for the first eight-week cycle, in English, laid out for use in
// the gym: today's workout sits at the top, unfolded, and everything else is a
// native <details> fold he opens when he needs it. A server component with no
// client JavaScript beyond one line that stamps the device's weekday on <html>
// (see fitness.css for how that picks the day before first paint), plus the
// in-gym log panel (log-panel.tsx), a client component that writes each set to
// Supabase through /api/fitness/log and runs the 90-minute clock.
// Source: Desktop/Fitness/program_oct_2026.md, which stays in Russian, so a change
// there gets translated here by hand. Every movement has a "How to do it" fold
// with plain step-by-step technique, from howto.ts, and a dated "Last / Goal"
// line (micro on Exercise) that is recomputed from the log weekly.

type Exercise = {
  name: string;
  sets: string;
  /** Starting weight or load, when the program names one. Hidden once `micro.was` has real numbers to go by. */
  start?: string;
  /** One number, the rest Oleg actually takes. Compounds 3 min, isolation 90 s, superset 90 s after the pair. */
  rest?: string;
  note?: string;
  /** This week's small step against the last session. */
  micro?: Micro;
  /** Stick-figure strip(s) in public/fitness, by file stem. A superset or a circuit lists one per movement. */
  img?: string | string[];
  /** Step-by-step technique, folded under the exercise. One per movement, like img. */
  how?: HowTo | HowTo[];
  /** Overrides for the log panel's fields; the rest is derived from `sets` and `how`. */
  log?: Partial<LogExercise>;
};

/**
 * One exercise's micro step: what the log says happened last time, and the
 * next session's target. `was` is absent when there are no numbers to compare
 * with yet. `gain` is the change in volume, weight × reps summed over the sets.
 */
type Micro = { was?: string; goal: string; gain?: string };

/** A warm-up drill or a stretch: one line of text, an optional strip, its technique. */
type Drill = { text: string; img?: string; how?: HowTo };

type Workout = {
  /** Short weekday, also the anchor id. */
  id: string;
  day: string;
  title: string;
  focus: string;
  /** Short dates of the last logged session and the next one, for the micro step lines. */
  lastDate: string;
  nextDate: string;
  /** Minute by minute, so the 90 minutes are visible before they're gone. */
  timeline: string[];
  /** Minutes from the start: in-gym warm-up starts, first exercise starts, stretch starts, done. The clock's marks. */
  marks: { warmup: number; work: number; stretch: number; end: number };
  warmup: Drill[];
  exercises: Exercise[];
  stretch: Drill[];
  /** Lines after the numbered list. */
  extra?: ReactNode;
};

// JavaScript's Date#getDay() order, Sunday first. "mon" is the rest day.
const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const DOOR = "90 min";

const WEEK: { day: string; title: string; time: string; rest?: boolean }[] = [
  { day: "Tue", title: "Pull A: back width, rear delts, biceps, posture", time: DOOR },
  { day: "Wed", title: "Push A: delts first, upper chest, triceps", time: DOOR },
  { day: "Thu", title: "Legs + deadlift + abs", time: DOOR },
  { day: "Fri", title: "Pull B: back thickness, rear delts, biceps, posture", time: DOOR },
  { day: "Sat", title: "Push B: upper chest first, delts, triceps", time: DOOR },
  { day: "Sun", title: "Cardio + abs + forearms + long stretch", time: DOOR },
  { day: "Mon", title: "Rest. Kite-surfing if there's wind", time: "", rest: true },
];

/* Warm-ups. The 12-minute walk to the gym is the cardio part on every day, so
   nothing here is on a bike or a treadmill. What's left is 6 minutes in the gym,
   specific to what the day loads. */

const WALK: Drill = {
  text: "the walk to the gym, 12 min: that's the cardio warm-up, keep a brisk pace and a long neck",
  how: HOW.walk,
};

const WARMUP_PULL_A: Drill[] = [
  WALK,
  { text: "band pull-aparts: 2×20, 30 s between", img: "pull-aparts", how: HOW.pullAparts },
  {
    text: "band external rotation, elbow against your side: 1×15 per arm",
    img: "naruzhnaya-rotatsiya-na-bloke",
    how: HOW.extRotation,
  },
  { text: "scapular pull-ups, arms straight: 1×8", img: "vis-na-turnike", how: HOW.scapPullUps },
  { text: "thoracic spine over a bench edge: 45 s", img: "grudnoy-otdel-na-rolike", how: HOW.thoracic },
  { text: "ramp-up: bodyweight pull-ups ×5, then ×3, 60 s between", how: HOW.rampUp },
];

const WARMUP_PULL_B: Drill[] = [
  WALK,
  { text: "band pull-aparts: 2×20, 30 s between", img: "pull-aparts", how: HOW.pullAparts },
  {
    text: "band external rotation, elbow against your side: 1×15 per arm",
    img: "naruzhnaya-rotatsiya-na-bloke",
    how: HOW.extRotation,
  },
  { text: "light row on the machine, squeeze at the end: 1×15", img: "tyaga-v-trenazhere-s-uporom", how: HOW.lightRow },
  { text: "thoracic spine over a bench edge: 45 s", img: "grudnoy-otdel-na-rolike", how: HOW.thoracic },
  { text: "ramp-up on the machine row: half the weight ×10, three quarters ×5, 60 s between", how: HOW.rampUp },
];

const WARMUP_PUSH = (ramp: string): Drill[] => [
  WALK,
  { text: "arm circles, small then big, 10 each way, then 10 shoulder rolls back", how: HOW.armCircles },
  { text: "band pull-aparts: 2×15, 30 s between", img: "pull-aparts", how: HOW.pullAparts },
  {
    text: "band external rotation, elbow against your side: 1×15 per arm",
    img: "naruzhnaya-rotatsiya-na-bloke",
    how: HOW.extRotation,
  },
  { text: "light face pull: 1×15", img: "face-pull", how: HOW.facePull },
  { text: ramp, how: HOW.rampUp },
];

const WARMUP_LEGS: Drill[] = [
  WALK,
  { text: "leg swings, forward-back and side to side: 10 each, both legs", how: HOW.legSwings },
  { text: "bodyweight squats ×10, slow, then 5 lunges per leg", img: "prised-so-shtangoy", how: HOW.airSquat },
  { text: "ramp-up to the squat: empty bar ×10, 40 kg ×5, 50 kg ×3, 60 s between", how: HOW.rampUp },
];

/* Stretches, 10 minutes, what the day loaded. Sunday does all of them, twice. */

const STRETCH_PULL: Drill[] = [
  { text: "lats, hanging off a post with one hand: 40 s per side", how: HOW.latStretch },
  { text: "chest, in a doorway or at a post: 2×40 s", how: HOW.pecStretch },
  { text: "biceps and forearm, palm on the wall, fingers back: 30 s per side", how: HOW.bicepsStretch },
  { text: "rear shoulder, arm across the chest: 30 s per side", how: HOW.shoulderStretch },
  { text: "neck, head tilted to the side only, long neck: 30 s per side", how: HOW.neck },
  { text: "thoracic spine on a roller: 1 min", how: HOW.thoracic },
];

const STRETCH_PUSH: Drill[] = [
  { text: "chest, in a doorway or at a post: 2×40 s", how: HOW.pecStretch },
  { text: "triceps, elbow overhead: 30 s per side", how: HOW.tricepsStretch },
  { text: "rear shoulder, arm across the chest: 30 s per side", how: HOW.shoulderStretch },
  { text: "lats, hanging off a post with one hand: 40 s per side", how: HOW.latStretch },
  { text: "thoracic spine on a roller: 1 min", how: HOW.thoracic },
  { text: "neck, head tilted to the side only, long neck: 30 s per side", how: HOW.neck },
];

const STRETCH_LEGS: Drill[] = [
  {
    text: "hip flexors, couch stretch (knee by the wall): 45 s per side. The key one after 12 hours of sitting",
    how: HOW.couchStretch,
  },
  { text: "hamstrings: 45 s per side", how: HOW.hamstring },
  { text: "quads, standing, heel to the glute: 30 s per side", how: HOW.quadStretch },
  { text: "glutes, figure 4 on the floor: 30 s per side", how: HOW.gluteStretch },
  { text: "calves at the wall, straight knee then bent: 30 + 20 s per side", how: HOW.calfStretch },
];

const STRETCH_ALL: Drill[] = [
  ...STRETCH_LEGS,
  ...STRETCH_PULL.filter((d) => !STRETCH_LEGS.includes(d)),
  ...STRETCH_PUSH.filter((d) => !STRETCH_PULL.some((p) => p.text === d.text)),
];

/* The two posture exercises from the video Oleg sent (Bryan Johnson, "How I Fixed
   My Terrible Posture", built with Kjetil Larsen). Larsen's rule: at most twice a
   week, one set to fatigue. They sit at the end of both pull days. */

const POSTURE_LARSEN: Exercise = {
  name: "Posture pair (Kjetil Larsen): levator scapulae shrug, then head-up against the hands",
  how: [HOW.levatorShrug, HOW.headUp],
  sets: "1 set each, to fatigue",
  start: "shrug: 2×16 kg dumbbells and find the weight; head-up: hands only",
  note: "Twice a week at most, Tuesday and Friday, one set each: that's Larsen's limit, not a shortcut. Shrug up and forward with a long neck, pull with the shoulders, not the wrists. The head-up is tiny and nearly effortless; if anything clenches, ease off. Replaces the chin tucks.",
  micro: { goal: "new: write down the shrug weight and reps, and the head-up reps" },
  log: { movements: ["Levator shrug", "Head-up"], sets: 1 },
};

const MARKS = { warmup: 12, work: 18, stretch: 80, end: 90 };

const WORKOUTS: Workout[] = [
  {
    id: "tue",
    day: "Tuesday",
    title: "Pull A",
    focus: "back width, rear delts, biceps, posture",
    lastDate: "Nov 3",
    nextDate: "Nov 10",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym, warm-up",
      "0:18 pull-ups",
      "0:32 chest-supported row",
      "0:42 pullover",
      "0:49 rear delts",
      "0:58 Y-raise",
      "1:05 biceps superset",
      "1:14 posture pair",
      "1:18 stretch",
      "1:28 done",
    ],
    marks: MARKS,
    warmup: WARMUP_PULL_A,
    exercises: [
      {
        name: "Weighted pull-ups, grip slightly wider than shoulders",
        img: "podtyagivaniya-s-vesom",
        how: HOW.pullUps,
        sets: "4×6-10",
        start: "+10 kg",
        rest: "3 min",
        note: "The same movement as the lat pulldown that hurt the right shoulder on Oct 30. On Nov 3 with +10 kg the shoulder was fine. If the shoulder hurts, stop right away and switch to the one-arm dumbbell row.",
        micro: { was: "+10 kg: 6, 6, 6, 6", goal: "+10 kg: 7, 6, 6, 6", gain: "+4%" },
      },
      {
        name: "Chest-supported dumbbell row on a 30-45° bench, or a chest-supported machine row",
        img: "tyaga-ganteley-lyozha-grudyu",
        how: HOW.chestRow,
        sets: "3×8-12",
        start: "22 kg dumbbells",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. Replaces the bent-over barbell row: takes the lower back and a weak grip out of the equation.",
        micro: { was: "20 kg dumbbells: 12, 12, 12, 12", goal: "20 kg: 13, 12, 12 (three sets)", gain: "+1 rep in set 1" },
      },
      {
        name: "Straight-arm cable pullover",
        img: "pulover-na-bloke",
        how: HOW.pullover,
        sets: "3×12-15",
        start: "15 kg",
        rest: "90 s",
        note: "The lats, the ones that are hard to feel.",
        micro: { was: "20 kg: 12, 12, 12", goal: "20 kg: 13, 12, 12", gain: "+3%" },
      },
      {
        name: "Cable rear delt fly, arms crossed at face height",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "4×15-20",
        start: "5 kg per side",
        rest: "90 s",
        micro: { was: "2.5 kg: 20, 20, 20", goal: "2.5 kg: 21, 20, 20, 20", gain: "+1 set, you have the time here" },
      },
      {
        name: "Y-raise, lying on an incline bench, thumbs up",
        img: "y-raise-na-naklonnoy-skamye",
        how: HOW.yRaise,
        sets: "3×12-15",
        start: "2 kg",
        rest: "90 s",
        note: "Lower traps, posture.",
        micro: { was: "2 kg: 15, 15, 15", goal: "2 kg: 16, 15, 15", gain: "+2%" },
      },
      {
        name: "Biceps superset: seated incline dumbbell curl 8-12, straight into a reverse EZ-bar curl 8-12",
        img: ["sgibaniya-s-gantelyami-sidya-naklon", "obratnye-sgibaniya-ez"],
        how: [HOW.inclineCurl, HOW.reverseCurl],
        sets: "3 rounds",
        start: "10 kg dumbbells; EZ bar 15 kg (bar plus 2.5 per side)",
        rest: "90 s after the pair",
        note: "Same rep range on both, 8-12. No rest between the two.",
        micro: { was: "10 kg: 8, 8, 8 + 15 kg: 12, 12, 12", goal: "10 kg: 9, 8, 8 + 15 kg: 13, 12, 12", gain: "+3%" },
        log: { movements: ["Incline curl", "Reverse EZ curl"] },
      },
      POSTURE_LARSEN,
    ],
    stretch: STRETCH_PULL,
    extra: <p>The dead hang moved to Sunday: it didn't fit the 90 minutes here.</p>,
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "Push A",
    focus: "delts first, upper chest, triceps",
    lastDate: "Nov 4",
    nextDate: "Nov 11",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym, warm-up",
      "0:18 seated press",
      "0:32 lateral raises",
      "0:41 30° dumbbell press",
      "0:51 face pull",
      "0:58 triceps superset",
      "1:07 external rotation",
      "1:12 stretch",
      "1:22 done, 8 min spare",
    ],
    marks: MARKS,
    warmup: WARMUP_PUSH("ramp-up to the seated press: 10 kg ×10, 14 kg ×5, 16 kg ×3, 60 s between"),
    exercises: [
      {
        name: "Seated dumbbell press",
        img: "zhim-ganteley-sidya",
        how: HOW.seatedPress,
        sets: "4×6-10",
        start: "20 kg",
        rest: "3 min",
        note: "Bench back at 80-85°, not fully vertical. Lower to chin and ear level, no lower, it's easier on the shoulder. The jump to 22 kg is a full +10%, so reps grow for now: once set 1 reaches 12, next time it goes to 22.",
        micro: { was: "20 kg: 10, 10, 10, 10", goal: "20 kg: 11, 10, 10, 10", gain: "+2.5%" },
      },
      {
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "4×10-15",
        start: "10 kg",
        rest: "90 s",
        note: "Elbows slightly bent, up to shoulder height, no swinging the torso.",
        micro: { was: "10 kg: 12, 12, 12, 12", goal: "10 kg: 13, 12, 12, 12", gain: "+2%" },
      },
      {
        name: "Dumbbell press, 30°",
        img: "zhim-ganteley-30",
        how: HOW.inclineDB,
        sets: "3×8-12",
        start: "22 kg",
        rest: "3 min",
        note: "Stay on 22 kg until 3×12. Ramp-up: 14 kg ×8, 18 kg ×3, 60 s between. Shoulder blades squeezed and down, dumbbells at chest level at the bottom, no deep stretch.",
        micro: { was: "22 kg: 8, 8, 8", goal: "22 kg: 9, 8, 8", gain: "+4%" },
      },
      {
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "90 s",
        note: "Rope at face height, pull toward the eyes, elbows out and up, 1 s pause at the end.",
        micro: { was: "10 kg: 15, 15, 15", goal: "10 kg: 16, 15, 15", gain: "+2%" },
      },
      {
        name: "Triceps superset: overhead cable extension with a rope 12-15, straight into a rope pushdown 12-15",
        img: ["razgibaniya-iz-za-golovy-kanat", "razgibaniya-s-kanatom-vniz"],
        how: [HOW.overheadExt, HOW.pushdown],
        sets: "3 rounds",
        start: "10 kg on both",
        rest: "90 s after the pair",
        note: "Same rep range on both, 12-15. No rest between the two. Third round of both close to failure.",
        micro: {
          was: "numbers not recorded. Last known, Oct 28: 10 kg, 15+12, 15+12, 12+10",
          goal: "10 kg: 15+12, 15+12, 13+10, and write the numbers down",
          gain: "+1%",
        },
        log: { movements: ["Overhead extension", "Pushdown"] },
      },
      {
        name: "Cable external rotation",
        img: "naruzhnaya-rotatsiya-na-bloke",
        how: HOW.extRotation,
        sets: "2×12-15 per arm, light",
        start: "2.5 kg",
        rest: "60 s",
        note: "12-15 with one arm, straight into 12-15 with the other, that's one set. The weight is really small, the first or second plate; the last reps stay controlled, not a fight. Elbow at your side the whole time, you can hold a rolled towel between elbow and ribs. Range: the forearm starts across your stomach, hand near the opposite side; turn outward through pointing straight ahead and another 20-40° while it's comfortable, about 110-120° in total, with no forcing at the end. Tempo: 2 seconds out, 2 seconds back.",
        micro: { was: "2.5 kg: 15, 15", goal: "same again. This is shoulder health, no progression here" },
      },
    ],
    stretch: STRETCH_PUSH,
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Legs + deadlift + abs",
    focus: "legs for maintenance, deadlift, lower abs",
    lastDate: "Nov 5",
    nextDate: "Nov 12",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym, warm-up",
      "0:18 squat",
      "0:32 deadlift",
      "0:42 Bulgarian split squat",
      "0:54 leg curl",
      "1:01 calves",
      "1:08 hanging leg raise",
      "1:15 stretch",
      "1:25 done, 5 min spare",
    ],
    marks: MARKS,
    warmup: WARMUP_LEGS,
    exercises: [
      {
        name: "Barbell back squat, deep",
        img: "prised-so-shtangoy",
        how: HOW.barbellSquat,
        sets: "4×6-10",
        start: "60 kg including the 20 kg bar",
        rest: "3 min",
        note: "In a rack, with the safety bars set just below your lowest point.",
        micro: { was: "60 kg: 8, 8, 8, 8", goal: "60 kg: 9, 8, 8, 8", gain: "+3%" },
      },
      {
        name: "Barbell deadlift",
        img: "stanovaya-tyaga",
        how: HOW.barbellDeadlift,
        sets: "3×5-8",
        start: "80 kg including the 20 kg bar",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. Ramp-up: 60 kg ×5. Back straight, 2-3 reps in reserve. Every 2 weeks swap in a Romanian deadlift 3×8-12 at about 70% of the weight; Nov 12 is the regular one again.",
        micro: { was: "80 kg: 8, 8, 8, 8", goal: "80 kg: 8, 8, 8 (three sets); all three at 8 with reps to spare: 85 kg next week" },
      },
      {
        name: "Bulgarian split squat with dumbbells",
        img: "bolgarskie-vypady",
        how: HOW.bulgarian,
        sets: "3×8-12 per leg",
        start: "2×12 kg",
        rest: "3 min",
        note: "At 12 per leg, move to 14 kg dumbbells. A compound, so 3 minutes after both legs are done.",
        micro: { was: "2×12 kg: 9, 8, 8 per leg", goal: "2×12 kg: 9, 9, 8 per leg", gain: "+4%" },
      },
      {
        name: "Machine leg curl",
        img: "sgibaniya-nog-v-trenazhere",
        how: HOW.legCurl,
        sets: "3×10-15",
        start: "25 kg",
        rest: "90 s",
        micro: { was: "25 kg: 15, 14, 14", goal: "25 kg: 15, 15, 14", gain: "+2%" },
      },
      {
        name: "Calf raise, machine or standing with dumbbells",
        img: "ikry-stoya",
        how: HOW.calves,
        sets: "3×12-20",
        start: "20 kg on the machine",
        rest: "90 s",
        micro: { was: "machine 20 kg: 12, 12, 12", goal: "machine 20 kg: 13, 12, 12", gain: "+3%" },
      },
      {
        name: "Hanging leg raise",
        img: "podyom-nog-v-vise",
        how: HOW.legRaise,
        sets: "3×10-15",
        rest: "90 s",
        note: "At the top curl your pelvis up, otherwise the hip flexors work instead of the abs. Skipped on Nov 5 for time; the timeline now has room for it. If you're past 1:15 anyway, skip this, not the stretch.",
        micro: { was: "skipped Nov 5. Last, Oct 29: 15, 12, 15", goal: "15, 13, 15", gain: "+2%" },
        log: { weight: false },
      },
    ],
    stretch: STRETCH_LEGS,
  },
  {
    id: "fri",
    day: "Friday",
    title: "Pull B",
    focus: "back thickness, rear delts, biceps, posture",
    lastDate: "Nov 6",
    nextDate: "Nov 13",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym, warm-up",
      "0:18 machine row",
      "0:32 one-arm dumbbell row",
      "0:44 rear delts, lying",
      "0:53 face pull",
      "1:00 back extension + pull-aparts",
      "1:06 biceps superset",
      "1:15 posture pair",
      "1:19 stretch",
      "1:29 done",
    ],
    marks: MARKS,
    warmup: WARMUP_PULL_B,
    exercises: [
      {
        name: "Machine row, heavy",
        img: "tyaga-v-trenazhere-s-uporom",
        how: HOW.chestRow,
        sets: "4×6-10",
        start: "70 kg on the machine",
        rest: "3 min",
        micro: { was: "70 kg: 10, 10, 10, 10", goal: "70 kg: 11, 10, 10, 10; all four at 10 with reps to spare: next plate", gain: "+2.5%" },
      },
      {
        name: "One-arm dumbbell row, supported on a bench, pulling to the hip",
        how: HOW.oneArmRow,
        sets: "3×8-12 per arm",
        start: "24 kg",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. A compound, so 3 minutes after both arms are done. Replaces the lat pulldown: on Oct 30 it hurt the right shoulder. Here the arm never goes overhead, and the lats work just the same.",
        micro: { was: "24 kg: 10, 10, 10, 10", goal: "24 kg: 11, 10, 10 (three sets)", gain: "+1 rep in set 1" },
      },
      {
        name: "Rear delt dumbbell fly, lying on a 30° bench",
        img: "razvedeniya-zadnie-delty-lyozha",
        how: HOW.rearDeltProne,
        sets: "4×12-20",
        start: "7 kg",
        rest: "90 s",
        micro: { was: "7 kg: 20, 20, 20, 20", goal: "7 kg: 21, 20, 20, 20; at 4×20 with reps to spare, 8 kg", gain: "+1%" },
      },
      {
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "90 s",
        micro: { was: "not done Nov 6. Last, Oct 30: 10 kg ×15, 12.5 kg ×15, 12.5 kg ×15", goal: "10 kg ×15, 12.5 kg ×16, 12.5 kg ×15", gain: "+2%" },
      },
      {
        name: "Back superset (Bryan Johnson): weighted back extension 15-20, straight into band pull-aparts 15-20",
        img: "pull-aparts",
        how: [HOW.backExtension, HOW.pullAparts],
        sets: "2 rounds",
        start: "back extension: bodyweight, then a 10 kg plate on the chest; pull-aparts: the warm-up band",
        rest: "90 s after the pair",
        note: "Same rep range on both, 15-20. From Johnson's daily back circuit (he does 1×25 and 1×15): lower back, glutes, the muscles between the shoulder blades. If you're past 1:06 when you get here, skip this pair first.",
        micro: { goal: "new: write down what comes out as the baseline" },
        log: { movements: ["Back extension", "Pull-aparts"] },
      },
      {
        name: "Biceps superset: EZ-bar curl 8-12, straight into hammer curls 8-12",
        img: ["sgibaniya-s-ez-grifom", "molotki"],
        how: [HOW.ezCurl, HOW.hammer],
        sets: "3 rounds",
        start: "EZ bar 20 kg (bar plus 5 per side); 9-10 kg dumbbells",
        rest: "90 s after the pair",
        note: "Same rep range on both, 8-12. No rest between the two.",
        micro: { was: "Oct 30: 20 kg: 12, 10, 8 + 9 kg: 10, 10, 6", goal: "20 kg: 12, 10, 9 + 9 kg: 10, 10, 7", gain: "+3%" },
        log: { movements: ["EZ curl", "Hammer curl"] },
      },
      POSTURE_LARSEN,
    ],
    stretch: STRETCH_PULL,
    extra: <p>Wrist curls moved to Sunday and the farmer&apos;s walk is out: they didn&apos;t fit the 90 minutes here.</p>,
  },
  {
    id: "sat",
    day: "Saturday",
    title: "Push B",
    focus: "upper chest first, delts, triceps",
    lastDate: "Nov 7",
    nextDate: "Nov 14",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym, warm-up",
      "0:18 incline barbell press",
      "0:32 one-arm cable laterals",
      "0:44 low-to-high fly",
      "0:51 rear delts, cable",
      "0:58 lateral raises",
      "1:05 triceps superset",
      "1:14 stretch",
      "1:24 done, 6 min spare",
    ],
    marks: MARKS,
    warmup: WARMUP_PUSH("ramp-up to the incline press: empty bar ×10, 40 kg ×5, 55 kg ×3, 60 s between"),
    exercises: [
      {
        name: "Barbell incline press, 30°",
        img: "zhim-shtangi-30",
        how: HOW.inclineBar,
        sets: "4×6-10",
        start: "65 kg including the 20 kg bar",
        rest: "3 min",
        note: "In a rack, with the safety arms set. If the shoulder feels tense, use 22 kg dumbbells, as on Wednesday.",
        micro: { was: "65 kg: 6, 6, 6, 6", goal: "65 kg: 7, 6, 6, 6", gain: "+4%" },
      },
      {
        name: "One-arm cable lateral raise",
        img: "makhi-na-bloke-odnoy-rukoy",
        how: HOW.cableLateral,
        sets: "4×12-20",
        start: "5 kg",
        rest: "90 s",
        micro: { was: "5 kg: 12, 12, 12, 12", goal: "5 kg: 13, 12, 12, 12", gain: "+2%" },
      },
      {
        name: "Low-to-high cable fly",
        img: "svedeniya-na-bloke-snizu-vverkh",
        how: HOW.lowToHighFly,
        sets: "3×12-15",
        start: "7.5 kg per side",
        rest: "90 s",
        note: "Light weight, no deep stretch. If the shoulder aches, swap for a 15° dumbbell press 3×8-12.",
        micro: { was: "7.5 kg: 14, 14, 14", goal: "7.5 kg: 15, 14, 14", gain: "+2%" },
      },
      {
        name: "Cable rear delt fly",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "3×15-20",
        start: "2.5 kg per side",
        rest: "90 s",
        micro: { was: "2.5 kg: 21, 21, 21", goal: "2.5 kg: 22, 21, 21; at 3×22, try 5 kg for 15", gain: "+2%" },
      },
      {
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "3×12-15",
        start: "12 kg",
        rest: "90 s",
        micro: { was: "12 kg: 12, 12, 12", goal: "12 kg: 13, 12, 12", gain: "+3%" },
      },
      {
        name: "Triceps superset: lying EZ-bar French press 10-12, straight into a cable pushdown 10-12",
        img: ["frantsuzskiy-zhim-lyozha", "razgibaniya-s-kanatom-vniz"],
        how: [HOW.frenchPress, HOW.pushdown],
        sets: "3 rounds",
        start: "EZ bar 20 kg (bar plus 5 per side); cable 15 kg",
        rest: "90 s after the pair",
        note: "Same rep range on both, 10-12. No rest between the two. Three rounds fit now; on Nov 7 it was two with no numbers written down.",
        micro: { was: "2 rounds, numbers not recorded. Oct 31: 20 kg 12, 12 + 15 kg 12, 10", goal: "20 kg: 12, 12, 10 + 15 kg: 12, 11, 10, and write the numbers down" },
        log: { movements: ["French press", "Pushdown"] },
      },
    ],
    stretch: STRETCH_PUSH,
  },
  {
    id: "sun",
    day: "Sunday",
    title: "Cardio + abs + forearms + stretch",
    focus: "incline walk, ab circuit, forearms, dead hang, long stretch. The 12-minute walk is the first 10 of the 40 minutes of cardio, so the treadmill is 30.",
    lastDate: "Nov 1",
    nextDate: "Nov 8",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 straight onto the treadmill, 30 min",
      "0:42 abs circuit, 3 rounds",
      "0:54 forearm superset, 3 rounds",
      "1:02 dead hang",
      "1:06 long stretch",
      "1:24 done, 6 min spare",
    ],
    marks: { warmup: 12, work: 12, stretch: 66, end: 90 },
    warmup: [{ text: "the walk to the gym, 12 min, then straight onto the treadmill: no other warm-up today", how: HOW.walk }],
    exercises: [
      {
        name: "Incline walk",
        img: "khodba-v-goru",
        how: HOW.walk,
        sets: "30 min",
        note: "30 minutes on the treadmill plus the 12-minute walk there is the 40 the program wants. Incline 10-15%, 5.5-6.5 km/h, heart rate 125-145, able to talk. A bike at the same heart rate is fine too.",
        micro: { was: "5.5 km/h, incline 10, 40 min", goal: "5.6 km/h, incline 10, 30 min on the treadmill" },
        log: { unit: "min", weight: false, sets: 1 },
      },
      {
        name: "Abs, 3 rounds: hanging leg raise 10-15, reverse crunch 15, dead bug 10 per side, full-body-tension plank 35 s",
        img: ["podyom-nog-v-vise", "obratnye-skruchivaniya", "dead-bug", "planka"],
        how: [HOW.legRaise, HOW.reverseCrunch, HOW.deadBug, HOW.plank],
        sets: "3 rounds",
        rest: "90 s between rounds",
        micro: { was: "3 rounds, numbers not recorded", goal: "the same 3 rounds, plank 35 s instead of 30, and write the numbers down" },
        log: { movements: ["Leg raise", "Reverse crunch", "Dead bug (per side)", "Plank (s)"], weight: false },
      },
      {
        name: "Forearm superset: barbell wrist curls 15-20, straight into wrist extensions 15-20",
        img: "sgibaniya-zapyastiy",
        how: [HOW.wristCurl, HOW.wristExt],
        sets: "3 rounds",
        start: "15 kg curls, 10 kg extensions",
        rest: "90 s after the pair",
        note: "Same rep range on both, 15-20. Moved here from Friday.",
        micro: { goal: "not done yet. Write down the weight and reps as the baseline" },
        log: { movements: ["Wrist curl", "Wrist extension"] },
      },
      {
        name: "Dead hang",
        img: "vis-na-turnike",
        how: HOW.hang,
        sets: "2× to failure",
        rest: "90 s",
        note: "Moved here from Tuesday, so this is the one place it lives now. The farmer's walk is out: the forearm superset and the hang cover grip, and the 90 minutes didn't fit it.",
        micro: { was: "1:10, 1:10", goal: "1:15, 1:10", gain: "+4%" },
        log: { unit: "s", weight: false },
      },
      { name: "Long stretch, everything on the list, twice", sets: "18 min", log: { sets: 0 } },
    ],
    stretch: STRETCH_ALL,
  },
];

const WORKOUT_BY_ID = new Map(WORKOUTS.map((w) => [w.id, w]));


const h3Class =
  "font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver";

function Chevron({
  className = "size-5 text-silver-muted",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`fit-chev shrink-0 ${className}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * A fold: a native <details> on a surface card, shut by default. The summary
 * is the whole top row, at least 56px tall, so it is an easy tap in the gym.
 */
function Fold({
  id,
  eyebrow,
  title,
  meta,
  heading = "h2",
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  /** Short text at the right of the summary, such as a duration. */
  meta?: string;
  heading?: "h2" | "h3";
  children: ReactNode;
}) {
  const Heading = heading;
  return (
    <details id={id} className="fit-fold surface-card scroll-mt-24">
      <summary className="flex min-h-14 items-center justify-between gap-4 px-5 py-4 md:px-6">
        <span className="min-w-0">
          {eyebrow ? (
            <span className="eyebrow block font-body text-[13px] text-vivid-blue">
              {eyebrow}
            </span>
          ) : null}
          <Heading className={`${eyebrow ? "mt-1 " : ""}${h3Class}`}>
            {title}
          </Heading>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="whitespace-nowrap font-body text-sm text-silver-muted">
              {meta}
            </span>
          ) : null}
          <Chevron />
        </span>
      </summary>
      <div className="border-t border-hairline px-5 pt-5 pb-6 md:px-6">
        {children}
      </div>
    </details>
  );
}

/**
 * A stick-figure strip for one movement: three panels, start to finish, drawn
 * from joint geometry (Desktop/Fitness/draw_exercise.py) and served as a small
 * SVG from public/fitness. Lazy, so a strip inside a shut fold is never fetched,
 * and sized up front so nothing shifts when it arrives.
 */
function Figure({
  name,
  label,
  wide,
}: {
  name: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <details className="fit-how mt-1">
      <summary className="inline-flex min-h-11 items-center gap-1.5 font-body text-sm font-semibold text-vivid-blue">
        Picture
        <Chevron className="size-4 text-vivid-blue" />
      </summary>
      <img
        src={`/fitness/${name}.svg`}
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        alt={`${label}: movement diagram`}
        className={`mt-2 rounded-lg border border-hairline bg-navy ${wide ? "fit-strip-wide" : "w-full"}`}
      />
    </details>
  );
}

/** `wide` lets a strip in the numbered list span under the number gutter on phones, where every pixel of width counts. */
function Figures({
  img,
  label,
  wide,
}: {
  img?: string | string[];
  label: string;
  wide?: boolean;
}) {
  if (!img) return null;
  return (
    <>
      {(Array.isArray(img) ? img : [img]).map((name) => (
        <Figure key={name} name={name} label={label} wide={wide} />
      ))}
    </>
  );
}

/**
 * "How to do it": the movement step by step, in a native <details> shut by
 * default, so it stays out of the way until it's tapped mid-set. A superset or
 * a circuit shows each movement under its own name.
 */
function How({ how }: { how?: HowTo | HowTo[] }) {
  if (!how) return null;
  const parts = Array.isArray(how) ? how : [how];
  const titled = parts.length > 1;
  return (
    <details className="fit-how mt-1">
      <summary className="inline-flex min-h-11 items-center gap-1.5 font-body text-sm font-semibold text-vivid-blue">
        How to do it
        <Chevron className="size-4 text-vivid-blue" />
      </summary>
      <div className="mt-1 flex flex-col gap-5 rounded-lg border border-hairline bg-vivid-blue/5 px-4 py-4">
        {parts.map((p, i) => (
          <div key={p.title ?? i}>
            {titled && p.title ? (
              <p className="mb-2 font-body text-sm font-semibold text-white">
                {p.title}
              </p>
            ) : null}
            <ol className="list-decimal space-y-1.5 pl-5 font-body text-sm leading-relaxed text-silver marker:text-silver-muted">
              {p.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {p.tip ? (
              <p className="mt-3 font-body text-sm leading-relaxed text-silver-muted">
                <strong className="font-semibold text-silver">Key point.</strong>{" "}
                {p.tip}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}

/** Warm-up drills and stretches: a line each, its technique fold, its strip. */
function DrillList({ items }: { items: Drill[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((it) => (
        <li
          key={it.text}
          className="font-body text-base leading-relaxed text-silver"
        >
          {it.text}
          <How how={it.how} />
          <Figures img={it.img} label={it.text} />
        </li>
      ))}
    </ol>
  );
}

/** Last time and the next target, side by side under the exercise's numbers. */
function MicroStep({
  micro,
  lastDate,
  nextDate,
}: {
  micro: Micro;
  lastDate: string;
  nextDate: string;
}) {
  return (
    <div className="mt-2 rounded-lg border border-hairline bg-vivid-blue/5 px-3 py-2.5 font-body text-sm leading-relaxed">
      {micro.was ? (
        <p className="text-silver-muted">
          Last, {lastDate}: {micro.was}
        </p>
      ) : null}
      <p className="text-silver">
        <strong className="font-semibold text-white">Goal, {nextDate}:</strong>{" "}
        {micro.goal}
        {micro.gain ? (
          <span className="whitespace-nowrap font-semibold text-vivid-blue">
            {" "}
            {micro.gain}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/** What the log panel needs to know about an exercise: how many sets, which movements, which fields. */
function logSpec(e: Exercise): LogExercise {
  const m = /^(\d+)/.exec(e.sets);
  const sets = m ? Number(m[1]) : 1;
  const movements =
    e.log?.movements ??
    (Array.isArray(e.how) ? e.how.map((h, i) => h.title ?? `Part ${i + 1}`) : [e.name]);
  return {
    name: e.name,
    movements,
    sets: e.log?.sets ?? sets,
    unit: e.log?.unit ?? "reps",
    weight: e.log?.weight ?? true,
  };
}

/** The exercises of one workout, used both at the top and inside its fold. */
function WorkoutBody({ w }: { w: Workout }) {
  return (
    <>
      <p className="font-body text-sm text-silver-muted">{w.focus}</p>
      <p className="mt-2 font-body text-sm text-silver-muted">
        Week of Nov 10-15: one small step on every exercise compared to last
        time. If it doesn't work out, just repeat last time's numbers. Rest is
        one number, and it's the rest you take.
      </p>
      <ol className="mt-5 flex flex-col gap-5">
        {w.exercises.map((e, i) => (
          <li key={e.name} className="flex gap-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-vivid-blue/10 font-body text-xs font-semibold text-vivid-blue">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-body text-base text-silver">
                <strong className="font-semibold text-white">{e.name}</strong>
              </p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-body text-sm text-silver-muted">
                <span className="whitespace-nowrap text-silver">{e.sets}</span>
                {e.start && !e.micro?.was ? (
                  <span>start {e.start}</span>
                ) : null}
                {e.rest ? (
                  <span className="whitespace-nowrap">rest {e.rest}</span>
                ) : null}
              </p>
              {e.micro ? (
                <MicroStep
                  micro={e.micro}
                  lastDate={w.lastDate}
                  nextDate={w.nextDate}
                />
              ) : null}
              {e.note ? (
                <p className="mt-1.5 font-body text-sm leading-relaxed text-silver-muted">
                  {e.note}
                </p>
              ) : null}
              <How how={e.how} />
              <Figures img={e.img} label={e.name} wide />
            </div>
          </li>
        ))}
      </ol>
      {w.extra ? (
        <div className="mt-6 border-t border-hairline pt-5 font-body text-sm text-silver-muted">
          {w.extra}
        </div>
      ) : null}
    </>
  );
}

/** The minute-by-minute plan of one day. */
function Timeline({ items }: { items: string[] }) {
  return (
    <ol className="grid grid-cols-1 gap-y-1 font-body text-sm text-silver sm:grid-cols-2">
      {items.map((t) => {
        const [time, ...rest] = t.split(" ");
        return (
          <li key={t} className="flex gap-3">
            <span className="w-10 shrink-0 tabular-nums text-vivid-blue">{time}</span>
            <span>{rest.join(" ")}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The block at the top for one weekday: the clock and the log panel first,
 * then the workout unfolded, with the day's warm-up and stretch folded under
 * it so the whole session is in one card. Monday is the rest day and gets a
 * short card instead.
 */
function TodayCard({ dayId }: { dayId: (typeof DAY_IDS)[number] }) {
  const w = WORKOUT_BY_ID.get(dayId);
  return (
    <div className="fit-today" data-day={dayId}>
      {w ? (
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="eyebrow font-body text-[13px] text-vivid-blue">
              Today, {w.day}
            </p>
            <p className="font-body text-sm text-silver-muted">{DOOR}</p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
            {w.title}
          </h2>
          <LogPanel
            dayId={w.id}
            marks={w.marks}
            exercises={w.exercises.map(logSpec).filter((e) => e.sets > 0)}
          />
          <div className="mt-6 flex flex-col gap-3">
            <Fold title="Plan, minute by minute" meta="90 min" heading="h3">
              <Timeline items={w.timeline} />
            </Fold>
            <Fold title="Warm-up" meta="12 + 6 min" heading="h3">
              <DrillList items={w.warmup} />
            </Fold>
          </div>
          <div className="mt-6">
            <WorkoutBody w={w} />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Fold title="Stretch at the end" meta={w.id === "sun" ? "18 min" : "10 min"} heading="h3">
              <DrillList items={w.stretch} />
            </Fold>
          </div>
        </div>
      ) : (
        <div className="surface-card p-6 md:p-8">
          <p className="eyebrow font-body text-[13px] text-vivid-blue">
            Today, Monday
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
            Rest
          </h2>
          <p className="mt-3 font-body text-base text-silver-muted">
            Kite-surfing if there's wind. Tomorrow is Pull A: back width, rear
            delts, biceps, posture.
          </p>
        </div>
      )}
    </div>
  );
}

export default function FitnessPage() {
  return (
    <>
      {/*
        Picks today's card before the rest of the body is parsed, so the first
        painted frame already shows the right day. The ids follow getDay():
        Sunday first. Runs on the device, so it is the device's date, which
        is the one that matters in the gym.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-today",${JSON.stringify(DAY_IDS)}[new Date().getDay()])`,
        }}
      />

      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="brand-wordmark font-display text-lg tracking-tight"
          >
            Oleg Melnikov
          </Link>
        </div>
      </header>

      <main>
        <section className="pt-8 pb-8 md:pt-14 md:pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
              Muscle gain program
            </h1>
          </div>
        </section>

        <section
          id="today"
          className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-12 md:pb-16"
        >
          {DAY_IDS.map((id) => (
            <TodayCard key={id} dayId={id} />
          ))}
          <noscript>
            <p className="font-body text-base text-silver-muted">
              Today's workout is shown with JavaScript. Without it, open the
              right day in the list below.
            </p>
          </noscript>
        </section>


        <div className="offscreen-lazy mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-16 md:pb-20">
          <h2
            id="workouts"
            className="eyebrow mt-6 scroll-mt-24 font-body text-[13px] text-vivid-blue"
          >
            Other days
          </h2>
          {WORKOUTS.map((w) => (
            <Fold
              key={w.id}
              id={w.id}
              eyebrow={w.day}
              title={w.title}
              meta={DOOR}
            >
              <Fold title="Warm-up" meta="12 + 6 min" heading="h3">
                <DrillList items={w.warmup} />
              </Fold>
              <div className="mt-5">
                <WorkoutBody w={w} />
              </div>
              <div className="mt-6">
                <Fold title="Stretch at the end" meta={w.id === "sun" ? "18 min" : "10 min"} heading="h3">
                  <DrillList items={w.stretch} />
                </Fold>
              </div>
            </Fold>
          ))}
        </div>
      </main>

    </>
  );
}
