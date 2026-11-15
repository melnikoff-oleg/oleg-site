import type { ReactNode } from "react";
import { HOW, type HowTo } from "./howto";
import { CopyButton, DayPicker } from "./gym-tools";

// Oleg's training program for the first eight-week cycle, in English, laid out for use in
// the gym. One workout is shown at a time: the device's weekday picks it before first
// paint (a one-line script stamps the weekday on <html>, see fitness.css), and the day
// buttons at the top switch to any other day, because the days do get moved around.
// The log is kept in Apple Notes (since 2026-11-15; the Supabase log panel is gone):
// "Copy workout for Notes" copies the shown day as a bullet list with the planned
// weight x reps of every set, and Oleg corrects it in the note as he goes. The
// interactive bits (day buttons, copy) are in gym-tools.tsx. Each card opens with
// a short overview: every exercise with its sets, reps and rest on one line.
// Source: Desktop/Fitness/program_oct_2026.md, which stays in Russian, so a change
// there gets translated here by hand. Every movement has a "How to do it" fold
// with plain step-by-step technique, from howto.ts, and a "Last / Next" block
// (micro and copy on Exercise) that is recomputed from the log weekly.

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
  /**
   * The line(s) this exercise puts into the Notes template, without the bullet:
   * a short name and the planned weight x reps of each set, which is last time
   * plus one small step. A superset or a circuit has one line per movement.
   */
  copy?: string | string[];
  /** Below the 90-minute line: done only when there is time left. Not in the Notes template. */
  optional?: boolean;
};

/** What the log says happened last time (with its date), and a remark on the next step. The next numbers are `copy`. */
type Micro = { was?: string; note?: string };

/** A warm-up drill or a stretch: one line of text, an optional strip, its technique. */
type Drill = { text: string; img?: string; how?: HowTo };

type Workout = {
  /** Short weekday, also the anchor id. */
  id: string;
  day: string;
  title: string;
  focus: string;
  /** The name in the first line of the Notes template. */
  short: string;
  /** Minute by minute, so the 90 minutes are visible before they're gone. */
  timeline: string[];
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
   nothing here is on a bike or a treadmill. What's left is about 9 minutes in the gym
   (6 was the plan, 9 is what the drills and the ramp-up sets really take),
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
  { text: "ramp-up to the barbell row: empty bar ×10, 40 kg ×5, 60 s between", how: HOW.rampUp },
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

/* Stretches, 10 minutes, what the day loaded. Sunday does all of them, 14 minutes. */

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

const POSTURE_SHRUG: Exercise = {
  name: "Posture shrug (levator scapulae, Kjetil Larsen)",
  how: HOW.levatorShrug,
  sets: "3×15",
  rest: "90 s",
  note: "Tuesday and Friday only: twice a week is Larsen's limit. Shrug up and slightly forward with a long neck, pull with the shoulders, not the wrists. The head-up against the hands is out of the gym days; it's in the Posture fold below if you want it at home.",
  micro: { was: "Nov 13: 2×12 kg dumbbells, 15, 15, 15" },
  copy: "posture shrugs 12x15, 12x15, 12x15",
};

const WORKOUTS: Workout[] = [
  {
    id: "tue",
    day: "Tuesday",
    title: "Pull A",
    short: "pull A",
    focus: "back width, rear delts, biceps, posture",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym: bag, water",
      "0:14 warm-up",
      "0:23 pull-ups",
      "0:40 chest-supported row",
      "0:52 posture shrug",
      "1:00 rear delts",
      "1:10 biceps superset",
      "1:19 stretch",
      "1:29 done",
    ],
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
        micro: { was: "Nov 10: +10 kg, 7, 7, 6, 6" },
        copy: "pull-ups +10x8, +10x7, +10x6, +10x6",
      },
      {
        name: "Chest-supported dumbbell row on a 30-45° bench, or a chest-supported machine row",
        img: "tyaga-ganteley-lyozha-grudyu",
        how: HOW.chestRow,
        sets: "3×8-12",
        start: "22 kg dumbbells",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. Replaces the bent-over barbell row: takes the lower back and a weak grip out of the equation.",
        micro: { was: "Nov 10: 60 kg on the machine, 12, 12, 12" },
        copy: "chest-supported rows 60x13, 60x12, 60x12",
      },
      POSTURE_SHRUG,
      {
        name: "Cable rear delt fly, arms crossed at face height",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "3×15-20",
        start: "5 kg per side",
        rest: "90 s",
        micro: { was: "Nov 10: 3.75 kg, 16, 16, 16, 16" },
        copy: "rear delt cable flies 3.75x17, 3.75x16, 3.75x16",
      },
      {
        name: "Biceps superset: seated incline dumbbell curl 8-12, straight into a reverse EZ-bar curl 8-12",
        img: ["sgibaniya-s-gantelyami-sidya-naklon", "obratnye-sgibaniya-ez"],
        how: [HOW.inclineCurl, HOW.reverseCurl],
        sets: "2 rounds",
        start: "10 kg dumbbells; EZ bar 15 kg (bar plus 2.5 per side)",
        rest: "90 s after the pair",
        note: "Same rep range on both, 8-12. No rest between the two.",
        micro: { was: "Nov 3: 10 kg 8, 8, 8 + 15 kg 12, 12, 12. Not written down on Nov 10" },
        copy: ["incline curls 10x9, 10x8", "reverse ez curls 15x13, 15x12"],
      },
      {
        optional: true,
        name: "Y-raise, lying on an incline bench, thumbs up",
        img: "y-raise-na-naklonnoy-skamye",
        how: HOW.yRaise,
        sets: "3×12-15",
        start: "2 kg",
        rest: "90 s",
        note: "Lower traps, posture.",
        micro: { was: "Nov 10: 4 kg, 16, 16, 16", note: "16 is above the 12-15 range, so the weight goes up. No 5 kg dumbbells: 4 kg for 17." },
        copy: "y-raise 5x12, 5x12, 5x12",
      },
      {
        optional: true,
        name: "Straight-arm cable pullover",
        img: "pulover-na-bloke",
        how: HOW.pullover,
        sets: "3×12-15",
        start: "15 kg",
        rest: "90 s",
        note: "The lats, the ones that are hard to feel.",
        micro: { was: "Nov 10: 22.5 kg ×12, then 20 kg ×12, 12" },
        copy: "pullover 22.5x12, 22.5x12, 20x12",
      },
    ],
    stretch: STRETCH_PULL,
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "Push A",
    short: "push A",
    focus: "delts first, upper chest, triceps",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym: bag, water",
      "0:14 warm-up",
      "0:23 seated press",
      "0:40 lateral raises",
      "0:51 30° dumbbell press",
      "1:04 face pull",
      "1:12 triceps superset",
      "1:21 stretch",
      "1:31 done",
    ],
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
        micro: { was: "Nov 11: 20 kg, 11, 11, 11, 11" },
        copy: "seated dumbbell press 20x12, 20x11, 20x11, 20x11",
      },
      {
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "4×10-15",
        start: "10 kg",
        rest: "90 s",
        note: "Elbows slightly bent, up to shoulder height, no swinging the torso.",
        micro: { was: "Nov 11: 12 kg, 12, 12, 12, 12" },
        copy: "shoulder flies 12x13, 12x12, 12x12, 12x12",
      },
      {
        name: "Dumbbell press, 30°",
        img: "zhim-ganteley-30",
        how: HOW.inclineDB,
        sets: "3×8-12",
        start: "22 kg",
        rest: "3 min",
        note: "Stay on 24 kg until 3×12. Ramp-up: one set, 18 kg ×5; the shoulders are warm from the seated press. Shoulder blades squeezed and down, dumbbells at chest level at the bottom, no deep stretch.",
        micro: { was: "Nov 11: 24 kg, 8, 8, 8" },
        copy: "dumbbell press 30 degrees 24x9, 24x8, 24x8",
      },
      {
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "90 s",
        note: "Rope at face height, pull toward the eyes, elbows out and up, 1 s pause at the end.",
        micro: { was: "Nov 11: 12.5 kg, 15, 15, 15" },
        copy: "face pull 12.5x16, 12.5x15, 12.5x15",
      },
      {
        name: "Triceps superset: overhead cable extension with a rope 12-15, straight into a rope pushdown 12-15",
        img: ["razgibaniya-iz-za-golovy-kanat", "razgibaniya-s-kanatom-vniz"],
        how: [HOW.overheadExt, HOW.pushdown],
        sets: "2 rounds",
        start: "10 kg on both",
        rest: "90 s after the pair",
        note: "Same rep range on both, 12-15. No rest between the two. Second round of both close to failure.",
        micro: { was: "Nov 11: overhead 10 kg ×15, 12.5 kg ×14, ×10; pushdown 12.5 kg 15, 14, 10" },
        copy: ["overhead triceps extension 12.5x15, 12.5x14", "triceps pushdown 12.5x15, 12.5x14"],
      },
      {
        optional: true,
        name: "Cable external rotation",
        img: "naruzhnaya-rotatsiya-na-bloke",
        how: HOW.extRotation,
        sets: "2×12-15 per arm, light",
        start: "2.5 kg",
        rest: "60 s",
        note: "12-15 with one arm, straight into 12-15 with the other, that's one set. The weight is really small, the first or second plate; the last reps stay controlled, not a fight. Elbow at your side the whole time, you can hold a rolled towel between elbow and ribs. Range: the forearm starts across your stomach, hand near the opposite side; turn outward through pointing straight ahead and another 20-40° while it's comfortable, about 110-120° in total, with no forcing at the end. Tempo: 2 seconds out, 2 seconds back.",
        micro: { was: "Nov 4: 2.5 kg, 15, 15", note: "Shoulder health, no progression here." },
        copy: "external rotation 2.5x15, 2.5x15",
      },
    ],
    stretch: STRETCH_PUSH,
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Legs + deadlift + abs",
    short: "legs",
    focus: "legs for maintenance, deadlift, lower abs",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym: bag, water",
      "0:14 warm-up",
      "0:23 squat",
      "0:40 deadlift",
      "0:53 Bulgarian split squat",
      "1:09 hanging leg raise",
      "1:17 stretch",
      "1:27 done, 3 min spare",
    ],
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
        micro: { was: "Nov 5: 60 kg, 8, 8, 8, 8" },
        copy: "squats 60x9, 60x8, 60x8, 60x8",
      },
      {
        name: "Barbell deadlift",
        img: "stanovaya-tyaga",
        how: HOW.barbellDeadlift,
        sets: "3×5-8",
        start: "80 kg including the 20 kg bar",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. Ramp-up: 60 kg ×5. Back straight, 2-3 reps in reserve. Every 2 weeks swap in a Romanian deadlift 3×8-12 at about 70% of the weight.",
        micro: { was: "Nov 5: 80 kg, 8, 8, 8, 8", note: "All three at 8 with reps to spare: 85 kg next time." },
        copy: "deadlift 80x8, 80x8, 80x8",
      },
      {
        name: "Bulgarian split squat with dumbbells",
        img: "bolgarskie-vypady",
        how: HOW.bulgarian,
        sets: "3×8-12 per leg",
        start: "2×12 kg",
        rest: "3 min",
        note: "At 12 per leg, move to 14 kg dumbbells. A compound, so 3 minutes after both legs are done.",
        micro: { was: "Nov 5: 2×12 kg, 9, 8, 8 per leg" },
        copy: "bulgarian lunges 12x9, 12x9, 12x8",
      },
      {
        name: "Hanging leg raise",
        img: "podyom-nog-v-vise",
        how: HOW.legRaise,
        sets: "3×10-15",
        rest: "90 s",
        note: "At the top curl your pelvis up, otherwise the hip flexors work instead of the abs.",
        micro: { was: "Oct 29: 15, 12, 15" },
        copy: "hanging leg raises 15, 13, 15",
      },
      {
        optional: true,
        name: "Machine leg curl",
        img: "sgibaniya-nog-v-trenazhere",
        how: HOW.legCurl,
        sets: "3×10-15",
        start: "25 kg",
        rest: "90 s",
        micro: { was: "Nov 5: 25 kg, 15, 14, 14" },
        copy: "legs curls 25x15, 25x15, 25x14",
      },
      {
        optional: true,
        name: "Calf raise, machine or standing with dumbbells",
        img: "ikry-stoya",
        how: HOW.calves,
        sets: "3×12-20",
        start: "20 kg on the machine",
        rest: "90 s",
        micro: { was: "Nov 5: machine 20 kg, 12, 12, 12" },
        copy: "calves machine 20x13, 20x12, 20x12",
      },
    ],
    stretch: STRETCH_LEGS,
  },
  {
    id: "fri",
    day: "Friday",
    title: "Pull B",
    short: "pull B",
    focus: "back thickness, rear delts, biceps, posture",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym: bag, water",
      "0:14 warm-up",
      "0:23 barbell row",
      "0:40 one-arm dumbbell row",
      "0:55 posture shrug",
      "1:03 rear delts, lying",
      "1:13 biceps superset",
      "1:22 stretch",
      "1:32 done: the tightest day, late means biceps goes",
    ],
    warmup: WARMUP_PULL_B,
    exercises: [
      {
        name: "Bent-over barbell row",
        how: HOW.barbellRow,
        sets: "4×6-10",
        start: "50 kg including the 20 kg bar",
        rest: "3 min",
        note: "Free weight first, like every strength day. Replaces the machine row (Nov 13: 70 kg, 11, 11, 11, 11). Start light and strict: torso at about 45°, back flat, no jerking the bar up. If the lower back is tired from Thursday's deadlift, do the same sets as a chest-supported dumbbell row on a 30° bench.",
        micro: { note: "New: 50 kg is a test. All four sets at 8 with reps to spare: 55 kg next time." },
        copy: "barbell rows 50x8, 50x8, 50x8, 50x8",
      },
      {
        name: "One-arm dumbbell row, supported on a bench, pulling to the hip",
        how: HOW.oneArmRow,
        sets: "3×8-12 per arm",
        start: "24 kg",
        rest: "3 min",
        note: "Three sets now, not four: the 90 minutes don't fit a fourth. A compound, so 3 minutes after both arms are done. Replaces the lat pulldown: on Oct 30 it hurt the right shoulder. Here the arm never goes overhead, and the lats work just the same.",
        micro: { was: "Nov 13: 24 kg, 11, 10, 10" },
        copy: "one-arm dumbbell rows 24x11, 24x11, 24x10",
      },
      POSTURE_SHRUG,
      {
        name: "Rear delt dumbbell fly, lying on a 30° bench",
        img: "razvedeniya-zadnie-delty-lyozha",
        how: HOW.rearDeltProne,
        sets: "3×12-20",
        start: "7 kg",
        rest: "90 s",
        micro: { was: "Nov 13: 8 kg, 20, 20, 20, 20" },
        copy: "rear delt flies lying 8x21, 8x20, 8x20",
      },
      {
        name: "Biceps superset: EZ-bar curl 8-12, straight into hammer curls 8-12",
        img: ["sgibaniya-s-ez-grifom", "molotki"],
        how: [HOW.ezCurl, HOW.hammer],
        sets: "2 rounds",
        start: "EZ bar 20 kg (bar plus 5 per side); 9-10 kg dumbbells",
        rest: "90 s after the pair",
        note: "Same rep range on both, 8-12. No rest between the two.",
        micro: { was: "Nov 13, two rounds: 20 kg 12, 10 + 10 kg 9, 10" },
        copy: ["ez curls 20x12, 20x11", "hammer curls 10x10, 10x10"],
      },
      {
        optional: true,
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "90 s",
        micro: { was: "Nov 13: 12.5 kg, 15, 15, 15" },
        copy: "face pull 12.5x16, 12.5x15, 12.5x15",
      },
      {
        optional: true,
        name: "Back superset (Bryan Johnson): weighted back extension 15-20, straight into band pull-aparts 15-20",
        img: "pull-aparts",
        how: [HOW.backExtension, HOW.pullAparts],
        sets: "2 rounds",
        start: "back extension: bodyweight, then a 10 kg plate on the chest; pull-aparts: the warm-up band",
        rest: "90 s after the pair",
        note: "Same rep range on both, 15-20. From Johnson's daily back circuit (he does 1×25 and 1×15): lower back, glutes, the muscles between the shoulder blades.",
        micro: { note: "Not done yet: write down what comes out." },
        copy: ["back extension 15, 15", "pull-aparts 15, 15"],
      },
    ],
    stretch: STRETCH_PULL,
  },
  {
    id: "sat",
    day: "Saturday",
    title: "Push B",
    short: "push B",
    focus: "upper chest first, delts, triceps",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 in the gym: bag, water",
      "0:14 warm-up",
      "0:23 incline barbell press",
      "0:40 one-arm cable laterals",
      "0:54 low-to-high fly",
      "1:02 rear delts, cable",
      "1:12 triceps superset",
      "1:21 stretch",
      "1:31 done",
    ],
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
        micro: { was: "Nov 7: 65 kg, 6, 6, 6, 6" },
        copy: "barbell press 30 degrees 65x7, 65x6, 65x6, 65x6",
      },
      {
        name: "One-arm cable lateral raise",
        img: "makhi-na-bloke-odnoy-rukoy",
        how: HOW.cableLateral,
        sets: "4×12-20",
        start: "5 kg",
        rest: "90 s",
        micro: { was: "Nov 7: 5 kg, 12, 12, 12, 12" },
        copy: "cable shoulder flies 5x13, 5x12, 5x12, 5x12",
      },
      {
        name: "Low-to-high cable fly",
        img: "svedeniya-na-bloke-snizu-vverkh",
        how: HOW.lowToHighFly,
        sets: "3×12-15",
        start: "7.5 kg per side",
        rest: "90 s",
        note: "Light weight, no deep stretch. If the shoulder aches, swap for a 15° dumbbell press 3×8-12.",
        micro: { was: "Nov 7: 7.5 kg, 14, 14, 14" },
        copy: "low-to-high cable flies 7.5x15, 7.5x14, 7.5x14",
      },
      {
        name: "Cable rear delt fly",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "3×15-20",
        start: "2.5 kg per side",
        rest: "90 s",
        micro: { was: "Nov 7: 2.5 kg, 21, 21, 21. Tuesday Nov 10 at 3.75 kg: 16, 16, 16, 16" },
        copy: "rear delt cable flies 3.75x16, 3.75x16, 3.75x16",
      },
      {
        name: "Triceps superset: lying EZ-bar French press 10-12, straight into a cable pushdown 10-12",
        img: ["frantsuzskiy-zhim-lyozha", "razgibaniya-s-kanatom-vniz"],
        how: [HOW.frenchPress, HOW.pushdown],
        sets: "2 rounds",
        start: "EZ bar 20 kg (bar plus 5 per side); cable 15 kg",
        rest: "90 s after the pair",
        note: "Same rep range on both, 10-12. No rest between the two.",
        micro: { was: "Nov 7: two rounds, no numbers. Oct 31: 20 kg 12, 12 + 15 kg 12, 10" },
        copy: ["french press 20x12, 20x12", "triceps pushdown 15x12, 15x11"],
      },
      {
        optional: true,
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "3×12-15",
        start: "12 kg",
        rest: "90 s",
        micro: { was: "Nov 7: 12 kg, 12, 12, 12" },
        copy: "shoulder flies 12x13, 12x12, 12x12",
      },
    ],
    stretch: STRETCH_PUSH,
  },
  {
    id: "sun",
    day: "Sunday",
    title: "Cardio + abs + forearms + stretch",
    short: "cardio abs",
    focus: "incline walk, ab circuit, forearms, dead hang, long stretch. The 12-minute walk is the first 10 of the 40 minutes of cardio, so the treadmill is 30.",
    timeline: [
      "0:00 walk, 12 min",
      "0:12 straight onto the treadmill, 30 min",
      "0:42 abs circuit, 3 rounds",
      "0:58 forearm superset, 3 rounds",
      "1:11 dead hang",
      "1:16 long stretch, 14 min",
      "1:30 done",
    ],
    warmup: [{ text: "the walk to the gym, 12 min, then straight onto the treadmill: no other warm-up today", how: HOW.walk }],
    exercises: [
      {
        name: "Incline walk",
        img: "khodba-v-goru",
        how: HOW.walk,
        sets: "30 min",
        note: "30 minutes on the treadmill plus the 12-minute walk there is the 40 the program wants. Incline 10-15%, 5.5-6.5 km/h, heart rate 125-145, able to talk. A bike at the same heart rate is fine too.",
        micro: { was: "Nov 8: 15 min on the treadmill, plus 25 min walking to the gym and back" },
        copy: "incline walk 30 min, 5.6 km/h, incline 10",
      },
      {
        name: "Abs, 3 rounds: hanging leg raise 10-15, reverse crunch 15, dead bug 10 per side, full-body-tension plank 35 s",
        img: ["podyom-nog-v-vise", "obratnye-skruchivaniya", "dead-bug", "planka"],
        how: [HOW.legRaise, HOW.reverseCrunch, HOW.deadBug, HOW.plank],
        sets: "3 rounds",
        rest: "90 s between rounds",
        micro: { was: "Nov 8: leg raise 10, 10, 10; reverse crunch 10, 12, 12; dead bug 8, 10, 10; plank 35 s ×3" },
        copy: ["hanging leg raises 11, 10, 10", "reverse crunches 12, 12, 12", "dead bug 10, 10, 10", "plank 35s, 35s, 35s"],
      },
      {
        name: "Forearm superset: barbell wrist curls 15-20, straight into wrist extensions 15-20",
        img: "sgibaniya-zapyastiy",
        how: [HOW.wristCurl, HOW.wristExt],
        sets: "3 rounds",
        start: "15 kg curls, 10 kg extensions",
        rest: "90 s after the pair",
        note: "Same rep range on both, 15-20. Moved here from Friday.",
        micro: { note: "Not done yet: write down the weight and reps as the baseline." },
        copy: ["wrist curls 15x15, 15x15, 15x15", "wrist extensions 10x15, 10x15, 10x15"],
      },
      {
        name: "Dead hang",
        img: "vis-na-turnike",
        how: HOW.hang,
        sets: "2× to failure",
        rest: "90 s",
        note: "Moved here from Tuesday, so this is the one place it lives now. The farmer's walk is out: the forearm superset and the hang cover grip, and the 90 minutes didn't fit it.",
        micro: { was: "Nov 1: 1:10, 1:10" },
        copy: "hang 75s, 70s",
      },
      { name: "Long stretch, everything on the list", sets: "14 min" },
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

/** The exercise's lines for the Notes template. */
function copyLines(e: Exercise): string[] {
  return e.copy ? (Array.isArray(e.copy) ? e.copy : [e.copy]) : [];
}

/** The whole Notes template of one workout, without the first line (that one carries today's date). */
function noteLines(w: Workout): string[] {
  return [
    "90 min",
    ...(w.id === "sun" ? [] : ["warm-up"]),
    ...w.exercises.filter((e) => !e.optional).flatMap(copyLines),
    "stretch",
  ];
}

/**
 * One overview line per exercise: short name (the one the Notes template uses),
 * sets, reps, rest. A superset is one line, its reps taken from the range in its name.
 */
function overviewLine(e: Exercise): string | null {
  const names = copyLines(e).map((l) => l.split(/\s(?=\+?[\d.]+x\d|\d+s?,|\d+s?$|\d+ min)/)[0]);
  if (!names.length) return null;
  const sets = /^(\d+)×\s*(.+)$/.exec(e.sets);
  const rounds = /^(\d+) rounds/.exec(e.sets);
  const range = /\d+-\d+/.exec(e.name)?.[0];
  const amount = sets
    ? `${sets[1]} sets ${/^\d/.test(sets[2]) ? "× " : ""}${sets[2].replace(", light", "")}`
    : rounds
      ? `${rounds[1]} rounds${names.length === 2 && range ? ` × ${range}` : ""}`
      : e.sets;
  return `${names.join(" + ")}: ${amount}${e.rest ? `, rest ${e.rest}` : ""}`;
}

/** Last time and the next numbers, under the exercise. The next numbers are exactly what the copy button writes. */
function MicroStep({ e }: { e: Exercise }) {
  const next = copyLines(e);
  if (!e.micro?.was && !e.micro?.note && !next.length) return null;
  return (
    <div className="mt-2 rounded-lg border border-hairline bg-vivid-blue/5 px-3 py-2.5 font-body text-sm leading-relaxed">
      {e.micro?.was ? (
        <p className="text-silver-muted">Last, {e.micro.was}</p>
      ) : null}
      {next.map((line, i) => (
        <p key={line} className="text-silver">
          {i === 0 ? (
            <strong className="font-semibold text-white">Next: </strong>
          ) : null}
          {line}
        </p>
      ))}
      {e.micro?.note ? (
        <p className="text-silver-muted">{e.micro.note}</p>
      ) : null}
    </div>
  );
}

/** The exercises of one workout. */
function WorkoutBody({ w }: { w: Workout }) {
  return (
    <>
      <p className="font-body text-sm text-silver-muted">
        Next is last time plus one small step. If it doesn't work out, repeat
        last time's numbers. Rest is one number, and it's the rest you take.
      </p>
      <ol className="mt-5 flex flex-col gap-5">
        {w.exercises.map((e, i) => (
          <li key={e.name} className="flex gap-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-vivid-blue/10 font-body text-xs font-semibold text-vivid-blue">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-body text-base text-silver">
                {e.optional ? (
                  <span className="mr-2 font-body text-xs font-semibold tracking-wide text-silver-muted uppercase">
                    If there&apos;s time
                  </span>
                ) : null}
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
              <MicroStep e={e} />
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
 * One weekday's card: the copy button, then the workout unfolded, with the
 * day's plan, warm-up and stretch folded around it. Only the card whose day is
 * stamped on <html> is visible. Monday is the rest day and gets a short card.
 */
function TodayCard({ dayId }: { dayId: (typeof DAY_IDS)[number] }) {
  const w = WORKOUT_BY_ID.get(dayId);
  return (
    <div className="fit-today" data-day={dayId}>
      {w ? (
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="eyebrow font-body text-[13px] text-vivid-blue">
              {w.day}
            </p>
            <p className="font-body text-sm text-silver-muted">{DOOR}</p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
            {w.title}
          </h2>
          <p className="mt-2 font-body text-sm text-silver-muted">{w.focus}</p>
          <ul className="mt-4 list-disc space-y-1.5 rounded-lg border border-hairline bg-vivid-blue/5 py-3 pr-4 pl-8 font-body text-sm leading-relaxed text-silver marker:text-silver-muted">
            {w.exercises.filter((e) => !e.optional).map(overviewLine).map((line) =>
              line ? <li key={line}>{line}</li> : null,
            )}
            {w.exercises.some((e) => e.optional) ? (
              <li className="list-none pt-1 text-silver-muted">
                Only if there&apos;s time left:{" "}
                {w.exercises.filter((e) => e.optional).map(overviewLine).filter(Boolean).join("; ")}
              </li>
            ) : null}
          </ul>
          <div className="mt-4">
            <CopyButton title={w.short} lines={noteLines(w)} />
            <p className="mt-2 font-body text-sm text-silver-muted">
              Copies this workout as a list for Apple Notes, with today&apos;s
              date and the planned weight × reps of every set. Paste it, then
              fix what turned out different.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Fold title="Plan, minute by minute" meta="90 min" heading="h3">
              <Timeline items={w.timeline} />
            </Fold>
            <Fold title="Warm-up" meta="12 + 9 min" heading="h3">
              <DrillList items={w.warmup} />
            </Fold>
          </div>
          <div className="mt-6">
            <WorkoutBody w={w} />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Fold title="Stretch at the end" meta={w.id === "sun" ? "14 min" : "10 min"} heading="h3">
              <DrillList items={w.stretch} />
            </Fold>
          </div>
        </div>
      ) : (
        <div className="surface-card p-6 md:p-8">
          <p className="eyebrow font-body text-[13px] text-vivid-blue">
            Monday
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
            Rest
          </h2>
          <p className="mt-3 font-body text-base text-silver-muted">
            Kite-surfing if there&apos;s wind. Training anyway? Pick the day
            above.
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
        Sunday first. The day buttons overwrite the same attribute.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-today",${JSON.stringify(DAY_IDS)}[new Date().getDay()])`,
        }}
      />

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
          <DayPicker days={WORKOUTS.map((w) => ({ id: w.id, label: `${w.day.slice(0, 3)} · ${w.title.split(" + ")[0]}` }))} />
          <div className="mt-6">
            {DAY_IDS.map((id) => (
              <TodayCard key={id} dayId={id} />
            ))}
          </div>
          <noscript>
            <p className="font-body text-base text-silver-muted">
              The workout is shown with JavaScript.
            </p>
          </noscript>
        </section>


        <div className="offscreen-lazy mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-16 md:pb-20">
          <Fold
            id="posture"
            eyebrow="Posture"
            title="The shrug, the head-up and three habits"
          >
            <div className="prose-guide">
              <p>
                From Bryan Johnson&apos;s posture video, built with the corrective
                exercise specialist Kjetil Larsen. The shrug is the third exercise on
                Tuesday and Friday, 3×15, the way it was done on Nov 13.
                Larsen&apos;s limit is twice a week, so it doesn&apos;t go
                anywhere else. The head-up is optional, at home. They replace
                the chin tucks, which Larsen considers counterproductive: the
                cue is a long neck with the crown going up, never the chin
                going back.
              </p>
              <ul>
                <li>
                  <strong>Levator scapulae shrug</strong> with dumbbells: elbows
                  back, wrists back, neck long, shoulders up and slightly
                  forward. Pull with the shoulders, not the wrists. Heavy is
                  right.
                </li>
                <li>
                  <strong>Head-up against the hands:</strong> heels of the hands
                  on the forehead, light pressure, the head lifts a tiny bit
                  against them. Minimal effort, nothing clenches.
                </li>
              </ul>
              <p>
                <strong>Habits, all day.</strong> Imagine a string through the
                spine pulling the top of the head straight up; that&apos;s the
                position to come back to. Phone at eye level: looking down into
                your lap is the single worst input. Move every five minutes when
                sitting: a lunge, a kneel, arms overhead, any stretch, then sit
                back down tall. Expect soreness in muscles you&apos;ve never felt
                for the first weeks.
              </p>
            </div>
          </Fold>
        </div>
      </main>

    </>
  );
}
