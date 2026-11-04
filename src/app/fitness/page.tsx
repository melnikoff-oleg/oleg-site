import Link from "next/link";
import type { ReactNode } from "react";
import { HOW, type HowTo } from "./howto";

// Oleg's training program for the first eight-week cycle, in English, laid out for use in
// the gym: today's workout sits at the top, unfolded, and everything else is a
// native <details> fold he opens when he needs it. A server component with no
// client JavaScript beyond one line that stamps the device's weekday on <html>
// (see fitness.css for how that picks the day before first paint).
// Source: Desktop/Fitness/program_oct_2026.md, which stays in Russian, so a change
// there gets translated here by hand. Every movement has a "How to do it" fold
// with plain step-by-step technique, from howto.ts, and a dated "Last / Goal"
// line (micro on Exercise) that is recomputed from the log weekly.

type Exercise = {
  name: string;
  sets: string;
  /** Starting weight or load, when the program names one. Hidden once `micro.was` has real numbers to go by. */
  start?: string;
  rest?: string;
  note?: string;
  /** This week's small step against the last session. */
  micro?: Micro;
  /** Stick-figure strip(s) in public/fitness, by file stem. A superset or a circuit lists one per movement. */
  img?: string | string[];
  /** Step-by-step technique, folded under the exercise. One per movement, like img. */
  how?: HowTo | HowTo[];
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
  duration: string;
  /** Short dates of the last logged session and the next one, for the micro step lines. */
  lastDate: string;
  nextDate: string;
  exercises: Exercise[];
  /** Lines after the numbered list. */
  extra?: ReactNode;
};

// JavaScript's Date#getDay() order, Sunday first. "mon" is the rest day.
const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const WEEK: { day: string; title: string; time: string; rest?: boolean }[] = [
  {
    day: "Tue",
    title: "Pull A: back width, rear delts, biceps, forearms",
    time: "65-70 min",
  },
  {
    day: "Wed",
    title: "Push A: delts first, upper chest, triceps",
    time: "60-70 min",
  },
  { day: "Thu", title: "Legs + deadlift + abs", time: "65 min" },
  {
    day: "Fri",
    title: "Pull B: back thickness, rear delts, biceps, forearms",
    time: "65 min",
  },
  {
    day: "Sat",
    title: "Push B: upper chest first, delts, triceps",
    time: "60 min",
  },
  {
    day: "Sun",
    title: "Cardio + abs + forearms + long stretch",
    time: "60-75 min",
  },
  { day: "Mon", title: "Rest. Kite-surfing if there's wind", time: "", rest: true },
];

const WARMUP: Drill[] = [
  {
    text: "bike or incline treadmill: 3-4 min",
    img: "khodba-v-goru",
    how: HOW.bike,
  },
  {
    text: "shoulder external rotation with a band or low cable, elbow against your side: 2×15 light, 30 s between",
    img: "naruzhnaya-rotatsiya-na-bloke",
    how: HOW.extRotation,
  },
  {
    text: "band pull-aparts: 2×20, 30 s",
    img: "pull-aparts",
    how: HOW.pullAparts,
  },
  { text: "light face pull: 2×15, 30 s", img: "face-pull", how: HOW.facePull },
  {
    text: "chin tucks (chin back, top of the head up): 10 reps",
    img: "chin-tucks",
    how: HOW.chinTucks,
  },
  {
    text: "thoracic spine on a roller or over a bench edge: 45-60 s",
    img: "grudnoy-otdel-na-rolike",
    how: HOW.thoracic,
  },
  {
    text: "ramp-up sets for the first exercise: 50% ×10, 70% ×5, 85% ×2, 45-60 s between",
    how: HOW.rampUp,
  },
];

const STRETCH: Drill[] = [
  {
    text: "chest, in a doorway or at a post: 2×40 s",
    how: HOW.pecStretch,
  },
  {
    text: "lats, hanging off a post with one hand: 40 s per side",
    how: HOW.latStretch,
  },
  {
    text: "hip flexors, couch stretch (knee by the wall): 45 s per side. The key one after 12 hours of sitting",
    how: HOW.couchStretch,
  },
  { text: "hamstrings: 45 s per side", how: HOW.hamstring },
  { text: "thoracic spine on a roller: 1 min", how: HOW.thoracic },
  {
    text: "neck, head tilted to the side and forward-down: 30 s per side",
    how: HOW.neck,
  },
];

const WORKOUTS: Workout[] = [
  {
    id: "tue",
    day: "Tuesday",
    title: "Pull A",
    focus: "back width, rear delts, biceps, forearms",
    duration: "65-70 min",
    lastDate: "Nov 3",
    nextDate: "Nov 10",
    exercises: [
      {
        name: "Weighted pull-ups, grip slightly wider than shoulders",
        img: "podtyagivaniya-s-vesom",
        how: HOW.pullUps,
        sets: "4×6-10",
        start: "bodyweight, no added load",
        rest: "2.5-3 min",
        note: "The same movement as the lat pulldown that hurt the right shoulder on Oct 30. On Nov 3 with +10 kg the shoulder was fine. If the shoulder hurts, stop right away and switch to the one-arm dumbbell row.",
        micro: {
          was: "+10 kg: 6, 6, 6, 6",
          goal: "+10 kg: 7, 6, 6, 6",
          gain: "+4%",
        },
      },
      {
        name: "Chest-supported dumbbell row on a 30-45° bench, or a chest-supported machine row",
        img: "tyaga-ganteley-lyozha-grudyu",
        how: HOW.chestRow,
        sets: "4×8-12",
        start: "22 kg dumbbells; on a machine, a weight you can do 12 with reps to spare",
        rest: "2 min",
        note: "Replaces the bent-over barbell row: takes the lower back and a weak grip out of the equation.",
        micro: {
          was: "20 kg dumbbells: 12, 12, 12, 12",
          goal: "20 kg: 13, 12, 12, 12",
          gain: "+2%",
        },
      },
      {
        name: "Straight-arm cable pullover",
        img: "pulover-na-bloke",
        how: HOW.pullover,
        sets: "3×12-15",
        start: "15 kg",
        rest: "60-90 s",
        note: "The lats, the ones that are hard to feel.",
        micro: {
          was: "20 kg: 12, 12, 12",
          goal: "20 kg: 13, 12, 12",
          gain: "+3%",
        },
      },
      {
        name: "Cable rear delt fly, arms crossed at face height",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "4×15-20",
        start: "5 kg per side",
        rest: "60-90 s",
        micro: {
          was: "2.5 kg: 20, 20, 20",
          goal: "2.5 kg: 21, 20, 20",
          gain: "+2%",
        },
      },
      {
        name: "Y-raise, lying on an incline bench, thumbs up",
        img: "y-raise-na-naklonnoy-skamye",
        how: HOW.yRaise,
        sets: "3×12-15",
        start: "2 kg",
        rest: "60 s",
        note: "Lower traps, posture.",
        micro: {
          was: "2 kg: 15, 15, 15",
          goal: "2 kg: 16, 15, 15",
          gain: "+2%",
        },
      },
      {
        name: "Seated incline dumbbell curl",
        img: "sgibaniya-s-gantelyami-sidya-naklon",
        how: HOW.inclineCurl,
        sets: "3×8-12",
        start: "10 kg",
        note: "Superset with reverse curls.",
        micro: {
          was: "10 kg: 8, 8, 8",
          goal: "10 kg: 9, 8, 8",
          gain: "+4%",
        },
      },
      {
        name: "Reverse EZ-bar curl",
        img: "obratnye-sgibaniya-ez",
        how: HOW.reverseCurl,
        sets: "3×10-15",
        start: "15 kg (bar plus 2.5 per side)",
        rest: "90 s after the pair",
        micro: {
          was: "15 kg: 12, 12, 12",
          goal: "15 kg: 13, 12, 12",
          gain: "+3%",
        },
      },
      {
        name: "Dead hang",
        img: "vis-na-turnike",
        how: HOW.hang,
        sets: "2× to failure",
        rest: "60-90 s",
        micro: {
          was: "2 sets, time not recorded",
          goal: "time it, aim for Sunday's 1:10",
        },
      },
    ],
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "Push A",
    focus: "delts first, upper chest, triceps",
    duration: "about 70 min",
    lastDate: "Nov 4",
    nextDate: "Nov 11",
    exercises: [
      {
        name: "Seated dumbbell press",
        img: "zhim-ganteley-sidya",
        how: HOW.seatedPress,
        sets: "4×6-10",
        start: "20 kg",
        rest: "2.5-3 min",
        note: "Ramp-up: 10 kg ×10, 14 kg ×5, 16 kg ×3. Bench back at 80-85°, not fully vertical. Lower to chin and ear level, no lower, it's easier on the shoulder. The jump to 22 kg is a full +10%, so reps grow for now: once set 1 reaches 12, next time it goes to 22.",
        micro: {
          was: "20 kg: 10, 10, 10, 10",
          goal: "20 kg: 11, 10, 10, 10",
          gain: "+2.5%",
        },
      },
      {
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "4×10-15",
        start: "10 kg",
        rest: "60-90 s",
        note: "Elbows slightly bent, up to shoulder height, no swinging the torso.",
        micro: {
          was: "10 kg: 12, 12, 12, 12",
          goal: "10 kg: 13, 12, 12, 12",
          gain: "+2%",
        },
      },
      {
        name: "Dumbbell press, 30°",
        img: "zhim-ganteley-30",
        how: HOW.inclineDB,
        sets: "3×8-12",
        start: "22 kg",
        rest: "2-2.5 min",
        note: "Stay on 22 kg until 3×12. Ramp-up: 14 kg ×8, 18 kg ×3, 45-60 s between. Shoulder blades squeezed and down, dumbbells at chest level at the bottom, no deep stretch.",
        micro: {
          was: "22 kg: 8, 8, 8",
          goal: "22 kg: 9, 8, 8",
          gain: "+4%",
        },
      },
      {
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "60-90 s",
        note: "Rope at face height, pull toward the eyes, elbows out and up, 1 s pause at the end.",
        micro: {
          was: "10 kg: 15, 15, 15",
          goal: "10 kg: 16, 15, 15",
          gain: "+2%",
        },
      },
      {
        name: "Triceps superset: overhead cable extension with a rope 10-15, straight into a rope pushdown 12-15",
        img: ["razgibaniya-iz-za-golovy-kanat", "razgibaniya-s-kanatom-vniz"],
        how: [HOW.overheadExt, HOW.pushdown],
        sets: "3 rounds",
        start: "10 kg on both",
        rest: "90 s after the pair",
        note: "No rest between the two. Third round of both close to failure.",
        micro: {
          was: "numbers not recorded. Last known, Oct 28: 10 kg, 15+12, 15+12, 12+10",
          goal: "10 kg: 15+12, 15+12, 13+10, and write the numbers down",
          gain: "+1%",
        },
      },
      {
        name: "Cable external rotation",
        img: "naruzhnaya-rotatsiya-na-bloke",
        how: HOW.extRotation,
        sets: "2×12-15 per arm, light",
        start: "2.5 kg",
        rest: "45-60 s",
        note: "12-15 with one arm, straight into 12-15 with the other, that's one set. The weight is really small, the first or second plate; the last reps stay controlled, not a fight. Elbow at your side the whole time, you can hold a rolled towel between elbow and ribs. Range: the forearm starts across your stomach, hand near the opposite side; turn outward through pointing straight ahead and another 20-40° while it's comfortable, about 110-120° in total, with no forcing at the end. Tempo: 2 seconds out, 2 seconds back.",
        micro: {
          was: "2.5 kg: 15, 15",
          goal: "same again. This is shoulder health, no progression here",
        },
      },
    ],
    extra: (
      <p>
        Timing of the cycle's first workout: 0:00 warm-up, 0:12 seated press,
        0:22 flies, 0:28 30° press, 0:38 face pull, 0:44 triceps, 0:53 rotation,
        0:57 stretch 8-10 min.
      </p>
    ),
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Legs + deadlift + abs",
    focus: "legs for maintenance, deadlift, lower abs",
    duration: "65 min",
    lastDate: "Oct 29",
    nextDate: "Nov 5",
    exercises: [
      {
        name: "Barbell back squat, deep",
        img: "prised-so-shtangoy",
        how: HOW.barbellSquat,
        sets: "3×6-10, later 4",
        start: "60 kg including the 20 kg bar",
        rest: "2.5-3 min",
        note: "In a rack, with the safety bars set just below your lowest point. Ramp-up: empty bar ×10, 40 kg ×5, 50 kg ×3. Three sets the first time, since both the squat and the deadlift are new today.",
        micro: {
          goal: "new lift, Smith numbers don't carry over. Set 1: 60 kg ×8 with 2 reps in reserve. 3+ in reserve: +5 kg on the next set. What comes out is next week's baseline",
        },
      },
      {
        name: "Barbell deadlift",
        img: "stanovaya-tyaga",
        how: HOW.barbellDeadlift,
        sets: "3×5-8",
        start: "60 kg including the 20 kg bar",
        rest: "2.5-3 min",
        note: "Ramp-up: 40 kg ×5. Back straight, 2-3 reps in reserve. Every 2 weeks swap in a Romanian deadlift 3×8-12 with dumbbells or a barbell, at about 70% of the weight; this week it's still the regular one, to set the baseline.",
        micro: {
          goal: "new lift, Smith numbers don't carry over. Set 1: 60 kg ×8 with 2 reps in reserve. 3+ in reserve: +5 kg on the next set. What comes out is next week's baseline",
        },
      },
      {
        name: "Bulgarian split squat with dumbbells",
        img: "bolgarskie-vypady",
        how: HOW.bulgarian,
        sets: "3×8-12 per leg",
        start: "2×12 kg",
        rest: "2 min",
        note: "At 12 per leg, move to 14 kg dumbbells.",
        micro: {
          was: "2×12 kg: 8, 8, 8 per leg",
          goal: "2×12 kg: 9, 8, 8 per leg",
          gain: "+4%",
        },
      },
      {
        name: "Machine leg curl",
        img: "sgibaniya-nog-v-trenazhere",
        how: HOW.legCurl,
        sets: "3×10-15",
        start: "25 kg",
        rest: "60-90 s",
        micro: {
          was: "25 kg: 14, 14, 14",
          goal: "25 kg: 15, 14, 14",
          gain: "+2%",
        },
      },
      {
        name: "Standing calf raise with dumbbells",
        img: "ikry-stoya",
        how: HOW.calves,
        sets: "3×12-20",
        start: "2×18 kg",
        rest: "60 s",
        note: "If the stretch hasn't started by 1:05, skip the calves, not the stretch.",
        micro: {
          was: "2×18 kg: 20, 20, 20",
          goal: "2×18 kg: 21, 20, 20",
          gain: "+2%",
        },
      },
      {
        name: "Hanging leg raise",
        img: "podyom-nog-v-vise",
        how: HOW.legRaise,
        sets: "3×10-15",
        rest: "60-90 s",
        note: "At the top curl your pelvis up, otherwise the hip flexors work instead of the abs. Reverse crunches were taken off this day (Oct 29, not enough time for the stretch); they stay on Sunday.",
        micro: {
          was: "15, 12, 15",
          goal: "15, 13, 15",
          gain: "+2%",
        },
      },
    ],
  },
  {
    id: "fri",
    day: "Friday",
    title: "Pull B",
    focus: "back thickness, rear delts, biceps, forearms",
    duration: "65 min",
    lastDate: "Oct 30",
    nextDate: "Nov 6",
    exercises: [
      {
        name: "Machine or chest-supported row, heavy",
        img: "tyaga-v-trenazhere-s-uporom",
        how: HOW.chestRow,
        sets: "4×6-10",
        start: "26 kg dumbbells; on a machine, one plate more than Tuesday",
        rest: "2.5-3 min",
        micro: {
          was: "horizontal cable row, 45 kg ×10, then 50 kg: 10, 10, 10",
          goal: "cable 50 kg: 10, 10, 10, 10",
          gain: "+3%",
        },
      },
      {
        name: "One-arm dumbbell row, supported on a bench, pulling to the hip",
        how: HOW.oneArmRow,
        sets: "4×8-12 per arm",
        start: "22 kg",
        rest: "2 min",
        note: "Replaces the lat pulldown: on Oct 30 it hurt the right shoulder. Here the arm never goes overhead, and the lats work just the same.",
        micro: {
          goal: "new exercise: 22 kg, 8-10 per arm. What comes out is next week's baseline",
        },
      },
      {
        name: "Rear delt dumbbell fly, lying on a 30° bench",
        img: "razvedeniya-zadnie-delty-lyozha",
        how: HOW.rearDeltProne,
        sets: "4×12-20",
        start: "6 kg",
        rest: "60-90 s",
        micro: {
          was: "6 kg: 20, 20, 20, 10 (right shoulder got in the way)",
          goal: "6 kg: 20, 20, 20, 12. If the shoulder is quiet, take the last set as far as it goes",
          gain: "+3%",
        },
      },
      {
        name: "Face pull",
        img: "face-pull",
        how: HOW.facePull,
        sets: "3×12-15",
        start: "10 kg",
        rest: "60-90 s",
        micro: {
          was: "10 kg ×15, 12.5 kg ×15, 12.5 kg ×15",
          goal: "10 kg ×15, 12.5 kg ×16, 12.5 kg ×15",
          gain: "+2%",
        },
      },
      {
        name: "EZ-bar or cable curl",
        img: "sgibaniya-s-ez-grifom",
        how: HOW.ezCurl,
        sets: "3×8-12",
        start: "20 kg (bar plus 5 per side), on a cable 15 kg",
        note: "Superset with hammer curls.",
        micro: {
          was: "20 kg: 12, 10, 8",
          goal: "20 kg: 12, 10, 9",
          gain: "+3%",
        },
      },
      {
        name: "Hammer curls",
        img: "molotki",
        how: HOW.hammer,
        sets: "3×10-12",
        start: "10 kg",
        rest: "90 s after the pair",
        micro: {
          was: "9 kg: 10, 10, 6",
          goal: "9 kg: 10, 10, 7",
          gain: "+4%",
        },
      },
      {
        name: "Barbell wrist curls",
        img: "sgibaniya-zapyastiy",
        how: HOW.wristCurl,
        sets: "3×15-20",
        start: "15 kg",
        note: "Superset with the farmer's walk, 3 rounds.",
        micro: {
          goal: "not done on Oct 30. If you have time, write it down as the baseline",
        },
      },
      {
        name: "Farmer's walk with dumbbells or kettlebells",
        img: "progulka-fermera",
        how: HOW.farmer,
        sets: "3×40 s",
        start: "2×24 kg",
        rest: "90 s after the pair",
        micro: {
          goal: "not done on Oct 30. If you have time, write it down as the baseline",
        },
      },
    ],
  },
  {
    id: "sat",
    day: "Saturday",
    title: "Push B",
    focus: "upper chest first, delts, triceps",
    duration: "60 min",
    lastDate: "Oct 31",
    nextDate: "Nov 7",
    exercises: [
      {
        name: "Barbell incline press, 30°",
        img: "zhim-shtangi-30",
        how: HOW.inclineBar,
        sets: "4×6-10",
        start: "45 kg including the 20 kg bar",
        rest: "2.5-3 min",
        note: "In a rack, with the safety arms set. If the shoulder feels tense, use 22 kg dumbbells, as on Wednesday.",
        micro: {
          goal: "new lift, Smith numbers don't carry over. Set 1: 45 kg ×8 with 2 reps in reserve. 3+ in reserve: +5 kg on the next set. What comes out is next week's baseline",
        },
      },
      {
        name: "One-arm cable lateral raise",
        img: "makhi-na-bloke-odnoy-rukoy",
        how: HOW.cableLateral,
        sets: "4×12-20",
        start: "5 kg",
        rest: "60-90 s",
        micro: {
          was: "2.5 kg: 20, 20, 20, 20",
          goal: "2.5 kg: 21, 20, 20, 20",
          gain: "+1%",
        },
      },
      {
        name: "Low-to-high cable fly",
        img: "svedeniya-na-bloke-snizu-vverkh",
        how: HOW.lowToHighFly,
        sets: "3×12-15",
        start: "7.5 kg per side",
        rest: "60-90 s",
        note: "Light weight, no deep stretch. If the shoulder aches, swap for a 15° dumbbell press 3×8-12.",
        micro: {
          was: "5 kg: 12, 12, 12",
          goal: "5 kg: 13, 12, 12",
          gain: "+3%",
        },
      },
      {
        name: "Cable rear delt fly",
        img: "razvedeniya-zadnie-delty-na-bloke",
        how: HOW.rearDeltCable,
        sets: "3×15-20",
        start: "5 kg per side",
        rest: "60-90 s",
        micro: {
          was: "2.5 kg: 20, 20, 20",
          goal: "2.5 kg: 21, 20, 20",
          gain: "+2%",
        },
      },
      {
        name: "Shoulder flies (dumbbell lateral raise)",
        img: "makhi-gantelyami-v-storony",
        how: HOW.lateralRaise,
        sets: "3×12-15",
        start: "10 kg",
        rest: "60-90 s",
        micro: {
          was: "10 kg: 15, 15, 15",
          goal: "10 kg: 16, 15, 15",
          gain: "+2%",
        },
      },
      {
        name: "Lying EZ-bar French press",
        img: "frantsuzskiy-zhim-lyozha",
        how: HOW.frenchPress,
        sets: "3×8-12",
        start: "20 kg (bar plus 5 per side)",
        note: "Superset with pushdowns. On Oct 31 you did 2 rounds, and the goal is for those; add a third round if you fit in 90 minutes.",
        micro: {
          was: "20 kg: 12, 12",
          goal: "20 kg: 12, 12",
        },
      },
      {
        name: "Cable pushdown",
        img: "razgibaniya-s-kanatom-vniz",
        how: HOW.pushdown,
        sets: "3×12-15",
        start: "15 kg",
        rest: "90 s after the pair",
        micro: {
          was: "15 kg: 12, 10",
          goal: "15 kg: 12, 11",
          gain: "+2% on the pair",
        },
      },
    ],
  },
  {
    id: "sun",
    day: "Sunday",
    title: "Cardio + abs + forearms + stretch",
    focus: "incline walk, ab circuit, forearms, long stretch",
    duration: "60-75 min",
    lastDate: "Nov 1",
    nextDate: "Nov 8",
    exercises: [
      {
        name: "Incline walk",
        img: "khodba-v-goru",
        how: HOW.walk,
        sets: "35-40 min",
        note: "Incline 10-15%, 5.5-6.5 km/h, heart rate 125-145, able to talk. A bike at the same heart rate is fine too. Running itself isn't bad for the knees; the ankle injury came from a half marathon with no preparation. You don't need it for gaining, but 20-25 min of easy running once a week instead of the treadmill won't hurt.",
        micro: {
          was: "5.5 km/h, incline 10, 40 min",
          goal: "5.6 km/h, incline 10, 40 min",
          gain: "+2%",
        },
      },
      {
        name: "Abs, 3 rounds: hanging leg raise 10-15, reverse crunch 15, dead bug 10 per side, full-body-tension plank 30 s",
        img: [
          "podyom-nog-v-vise",
          "obratnye-skruchivaniya",
          "dead-bug",
          "planka",
        ],
        how: [HOW.legRaise, HOW.reverseCrunch, HOW.deadBug, HOW.plank],
        sets: "3 rounds",
        rest: "60-90 s between rounds",
        micro: {
          was: "3 rounds, numbers not recorded",
          goal: "the same 3 rounds, plank 35 s instead of 30, and write the numbers down",
        },
      },
      {
        name: "Forearms: wrist curls and extensions",
        img: "sgibaniya-zapyastiy",
        how: [HOW.wristCurl, HOW.wristExt],
        sets: "3×15-20",
        micro: {
          goal: "not done on Nov 1. If you have time, write down the weight and reps as the baseline",
        },
      },
      {
        name: "Dead hang",
        img: "vis-na-turnike",
        how: HOW.hang,
        sets: "2× to failure",
        micro: {
          was: "1:10, 1:10",
          goal: "1:15, 1:10",
          gain: "+4%",
        },
      },
      { name: "Stretch, everything on the list, 2 sets each", sets: "15-20 min" },
    ],
  },
];

const WORKOUT_BY_ID = new Map(WORKOUTS.map((w) => [w.id, w]));

const TOC: { href: string; label: string }[] = [
  { href: "#micro", label: "Micro progress" },
  { href: "#week", label: "Week" },
  { href: "#warmup", label: "Warm-up" },
  { href: "#workouts", label: "Workouts" },
  { href: "#stretch", label: "Stretch" },
  { href: "#rules", label: "Rules" },
  { href: "#food", label: "Food" },
  { href: "#log", label: "Log" },
];

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

/** An h3 subsection inside a fold's prose. */
function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className={`mt-8 ${h3Class}`}>{title}</h3>
      <div className="prose-guide mt-3">{children}</div>
    </>
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
    <img
      src={`/fitness/${name}.svg`}
      width={1920}
      height={1080}
      loading="lazy"
      decoding="async"
      alt={`${label}: movement diagram`}
      className={`mt-3 rounded-lg border border-hairline bg-navy ${wide ? "fit-strip-wide" : "w-full"}`}
    />
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

/** The exercises of one workout, used both at the top and inside its fold. */
function WorkoutBody({ w }: { w: Workout }) {
  return (
    <>
      <p className="font-body text-sm text-silver-muted">{w.focus}</p>
      <p className="mt-2 font-body text-sm text-silver-muted">
        Week of Nov 5-11: one small step on every exercise compared to last
        time. If it doesn't work out, just repeat last time's numbers.
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
                  <span className="whitespace-nowrap">start {e.start}</span>
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

/**
 * The block at the top for one weekday: the workout unfolded, with the warm-up
 * and the stretch folded under it so the whole session is in one card.
 * Monday is the rest day and gets a short card instead.
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
            <p className="font-body text-sm text-silver-muted">{w.duration}</p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
            {w.title}
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            <Fold title="Warm-up" meta="10-12 min" heading="h3">
              <DrillList items={WARMUP} />
            </Fold>
          </div>
          <div className="mt-6">
            <WorkoutBody w={w} />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Fold title="Stretch at the end" meta="8-10 min" heading="h3">
              <DrillList items={STRETCH} />
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
            delts, biceps, forearms.
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
          <span className="font-body text-sm text-silver-muted">
            personal page
          </span>
        </div>
      </header>

      <main>
        <section className="pt-8 pb-8 md:pt-14 md:pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              cycle 1 · from Oct 28, 2026
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
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

        <nav
          aria-label="Sections"
          className="mx-auto flex max-w-3xl flex-wrap gap-2 px-6 pb-10"
        >
          {TOC.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
            >
              {t.label}
            </a>
          ))}
        </nav>

        <div className="offscreen-lazy mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-16 md:pb-20">
          <Fold
            id="micro"
            eyebrow="This week's goals"
            title="Micro progress, Nov 5-11"
          >
            <div className="prose-guide">
              <p>
                Every exercise, once a week, a little more than last time:
                usually +1-4% volume. Volume is weight × reps over all sets. The
                last and goal numbers sit under each exercise.
              </p>
              <ul>
                <li>
                  <strong>Main step: +1 rep.</strong> In the first set while
                  you're fresh, or in the weakest one. Over 3-4 sets, one rep is
                  exactly that 1-4%.
                </li>
                <li>
                  <strong>Weight only where the step is small.</strong> Barbell:
                  once all sets are at the top of the range, +2.5 kg, on the
                  first set only. Dumbbells and cables step too coarsely: 20→22
                  kg is +10%, and 2.5→5 kg on a cable is double. There the reps
                  grow. Once the first set is 2 reps above the range, next week
                  it takes the next weight and the others stay as they were.
                </li>
                <li>
                  <strong>One step at a time, no extra sets.</strong> An extra
                  set is +25-33% volume straight away, not a micro step.
                </li>
                <li>
                  <strong>New barbell lifts (squat, deadlift, 30° press):</strong>{" "}
                  set 1 is a test, and the goal line gives the weight. Smith
                  numbers don't carry over, because they counted plates only and
                  the machine guided the bar.
                </li>
                <li>
                  <strong>Hit it with 3+ reps in reserve:</strong> the goal was
                  too low, so next week the first set goes straight to the next
                  weight.
                </li>
                <li>
                  <strong>Missed it:</strong> write down what happened and keep
                  the same goal next week. That's normal, and no reason to grind
                  through bad form.
                </li>
                <li>
                  <strong>Readiness under 80:</strong> skip the step and repeat
                  last time's numbers. <strong>Shoulder pain:</strong> stop right
                  away, as in the rules.
                </li>
                <li>
                  Where there are no numbers yet, just write them down: that's
                  next week's baseline. New goals get worked out from the log
                  after Wednesday, Nov 11.
                </li>
              </ul>
            </div>
          </Fold>

          <Fold
            id="goals"
            eyebrow="About the program"
            title="Goals, and why nothing moved for 5 years"
          >
            <div className="prose-guide">
              <p>
                The first cycle is 8 weeks, then a review based on the log and
                the weight chart. Six workouts a week, up to 90 minutes, Monday
                off, cardio once a week, a stretch at the end of every strength
                session.
              </p>
              <ul>
                <li>
                  Gain muscle. Priorities in order: rear delts, side and front
                  delts, back, posture (forward head), lower abs, upper chest,
                  biceps and triceps, forearms. Legs for maintenance only.
                </li>
                <li>
                  Health and technique come before the weight on the bar. Warm
                  the shoulder up well, and never put two front-delt exercises in
                  a row.
                </li>
                <li>Food: very gradually, without forcing the appetite.</li>
                <li>
                  Body weight target: +0.5-1 kg a month after the first jump from
                  water.
                </li>
              </ul>
              <p>
                <strong>Why nothing moved for 5 years.</strong> From the log: one
                or two exercises per workout, 5-7 working sets per muscle per
                week, gaps of 5-9 days between workouts. That's maintenance
                volume, and food was exactly at maintenance too. The program
                raises volume on the priority groups about 3 times, and food goes
                up in small steps. One leg day a week is enough for maintenance:
                a separate leg session doesn't raise testosterone, that's a myth,
                but squats and deadlifts are still needed.
              </p>
            </div>
          </Fold>

          <Fold id="week" eyebrow="Week structure" title="Six days, one rest">
            <ol className="divide-y divide-hairline">
              {WEEK.map((d) => (
                <li
                  key={d.day}
                  className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span
                    className={`mt-0.5 flex w-9 shrink-0 items-center justify-center rounded-full border border-hairline py-1 font-body text-xs font-semibold ${
                      d.rest
                        ? "text-silver-muted"
                        : "bg-vivid-blue/10 text-vivid-blue"
                    }`}
                  >
                    {d.day}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p
                      className={`font-body text-base ${d.rest ? "text-silver-muted" : "text-silver"}`}
                    >
                      {d.title}
                    </p>
                    {d.time ? (
                      <span className="whitespace-nowrap font-body text-sm text-silver-muted">
                        {d.time}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <div className="prose-guide mt-6">
              <p>
                Cardio gets its own day: abs, forearms and the long stretch go
                there too. An alternative for later: 6 strength days, 20 minutes
                of cardio after Saturday, Sunday for abs and stretching. We start
                with the version in the list.
              </p>
              <p>
                <strong>First 2 weeks: 3 sets everywhere instead of 4.</strong>{" "}
                Shoulders and elbows aren't used to this volume. Where you've
                already gone to 4 (presses), stay on 4: as many sets as the
                week's goal shows.
              </p>
            </div>
          </Fold>

          <Fold
            id="warmup"
            eyebrow="Warm-up"
            title="Every strength day"
            meta="10-12 min"
          >
            <DrillList items={WARMUP} />
          </Fold>

          <h2
            id="workouts"
            className="eyebrow mt-6 scroll-mt-24 font-body text-[13px] text-vivid-blue"
          >
            Workouts by day
          </h2>
          {WORKOUTS.map((w) => (
            <Fold
              key={w.id}
              id={w.id}
              eyebrow={w.day}
              title={w.title}
              meta={w.duration}
            >
              <WorkoutBody w={w} />
            </Fold>
          ))}

          <Fold
            id="stretch"
            eyebrow="Stretch and rest"
            title="At the end of every strength session"
            meta="8-10 min"
          >
            <DrillList items={STRETCH} />
            <div className="prose-guide mt-6">
              <p>
                <strong>Rest between sets.</strong> Ramp-up sets 45-60 s. Heavy
                compounds (seated press, squat, deadlift, pull-ups, heavy rows)
                2.5-3 min. Second press or second row in a workout 2 min.
                Isolation (raises, rear delts, face pull, biceps, triceps,
                forearms, abs) 60-90 s. Superset: none between the exercises, 90
                s after the pair.
              </p>
              <p>
                Between exercises, as long as the changeover takes, usually 2-3
                min. It isn't timed rest: move the bench, pick up the weight, do
                a ramp-up set, and go. Before isolation work you can start after
                1.5-2 min. Don't sit longer than 3 minutes, or the workout
                sprawls past 90.
              </p>
            </div>
          </Fold>

          <Fold id="rules" eyebrow="Rules" title="Progression and technique">
            <div className="prose-guide">
              <ul>
                <li>
                  First 2 weeks: 3 sets everywhere instead of 4. Shoulders and
                  elbows aren't used to this volume. Where you've already gone to
                  4, stay on 4.
                </li>
                <li>
                  Weight: on the first workout find a weight you can do the
                  bottom of the range with, 2 reps in reserve. After that, one
                  step a week, as in Micro progress: +1 rep, and added weight on
                  the first set only at first.
                </li>
                <li>
                  No Smith machine. Free barbell in a rack with the safety bars
                  set. Log the full weight, including the 20 kg bar.
                </li>
                <li>
                  Reserve: compounds 1-3 reps in reserve, isolation last set
                  close to failure.
                </li>
                <li>
                  Never two presses in a row: always raises or rear delts between
                  them. Dips and flat pressing are left out of the program on
                  purpose.
                </li>
                <li>
                  Sharp shoulder pain: skip that exercise for the day, and next
                  time use dumbbells or a machine.
                </li>
                <li>
                  Every 7th week is a deload: same exercises, half the sets,
                  weight minus 15%.
                </li>
                <li>
                  Straps (wrist loops that hook around the bar, so grip doesn't
                  limit pulling) aren't needed yet, forearms are one of the
                  goals. Mixed grip on the deadlift. Come back to this in 2 months
                  if grip starts holding the back work back.
                </li>
                <li>
                  Time left in the gym: don't add exercises, stretch longer.
                </li>
              </ul>
              <p>
                <strong>Posture outside the gym.</strong> Phone and screen at eye
                level, laptop on a stand. Every hour of sitting, 2 minutes
                standing and 10 chin tucks. 7-8 thousand steps a day, far fewer
                right now; it'll help the appetite too.
              </p>
              <p>
                <strong>Lower abs.</strong> Visible from about 8-10% body fat;
                you're at 12 with a gaining phase ahead. Genetics affect the
                shape of the abs, not whether you can see them. This cycle we
                thicken them (hanging leg raises, reverse crunches, dead bug),
                and they'll show on a cut in a few months. Don't expect them in
                the mirror in the next 2-3 months.
              </p>
            </div>
          </Fold>

          <Fold id="food" eyebrow="Food" title="Very gradually">
            <div className="prose-guide">
              <ul>
                <li>
                  Appetite is small, so calories get added where there's no
                  volume: liquid (milk, protein with banana and honey) and dense
                  food (bread, rice, honey, banana), not bigger plates.
                </li>
                <li>
                  Steps of 150-200 kcal every 1-2 weeks. Don't force-feed, disgust
                  will break the gain.
                </li>
                <li>
                  Breakfast (eggs, avocado, cheese, salad) is the most filling
                  calories there are. Bread, honey, banana, milk and rice give the
                  same calories in far less volume.
                </li>
                <li>
                  Don't increase fats (cheese, nuts, avocado, chocolate), carbs
                  are what should grow.
                </li>
                <li>
                  After 2-3 weeks at this training volume, appetite usually comes
                  on its own. We follow it, we don't run ahead of it.
                </li>
              </ul>
            </div>
            <Sub title="The ladder">
              <ul>
                <li>
                  <strong>Weeks 1-2.</strong> Right after the gym, protein in 300
                  ml of milk + a banana + a spoon of honey, just drink it (about
                  400 kcal, not filling after half an hour). At breakfast swap 2
                  crispbreads for 2 slices of bread, same fullness, +100 kcal. In
                  the usual meal after the gym swap half the salad for a handful
                  of rice or buckwheat, or 2 slices of bread. In the evening, if
                  you like, a glass of milk or 100 g of cottage cheese; if you
                  don't feel like it, skip it.
                </li>
                <li>
                  <strong>Weeks 3-4.</strong> A snack at 11 before the gym: a
                  banana with honey or 40 g of oatmeal in milk.
                </li>
                <li>
                  <strong>After that, by the scale.</strong> Weekly average isn't
                  growing: one more step of 150-200. It's growing: hold.
                </li>
              </ul>
            </Sub>
            <Sub title="Sample training day">
              <p>Workout ends at 15:00, food until 19:30, bed at 23:00.</p>
              <ul>
                <li>15:15: protein in 300 ml of milk + a banana + a spoon of honey</li>
                <li>
                  17:30: the usual meal at the usual size, a handful of rice or
                  buckwheat instead of half the salad, or 2 slices of bread
                  instead of crispbread
                </li>
                <li>19:15: if you like, a glass of milk or 100 g of cottage cheese</li>
              </ul>
              <p>
                That's +300-400 kcal on a normal day without a single extra
                bite. Not eating after 19:30 with bed at 23 doesn't affect the
                gain, as long as the daily total is reached.
              </p>
            </Sub>
            <Sub title="Protein, creatine, water">
              <ul>
                <li>
                  Protein target 130-150 g a day, without forcing it. A shake and
                  cottage cheese fill the gaps. Meat, fish and chicken make it
                  easier if you eat them.
                </li>
                <li>
                  Creatine monohydrate 5 g every day with any food, no loading.
                  After 2-3 weeks, +1-1.5 kg of water in the muscles, which is
                  normal.
                </li>
                <li>
                  Water 2.5-3 L a day. On carbs and creatine you'll want more.
                </li>
                <li>Morning coffee is fine, leave it alone.</li>
              </ul>
            </Sub>
            <Sub title="Tracking">
              <ul>
                <li>
                  Weigh in every morning after the toilet, and look at the weekly
                  average.
                </li>
                <li>
                  In the first 2 weeks weight will jump 1-2 kg from carbs and
                  creatine. That's water.
                </li>
                <li>
                  After that the goal is +0.5-1 kg a month. Average not growing
                  over 2 weeks: one more step of +150-200 kcal. Growing faster
                  than 1 kg in 2 weeks: a step back.
                </li>
              </ul>
            </Sub>
          </Fold>

          <Fold id="log" eyebrow="Log" title="How to record, and what to expect">
            <div className="prose-guide">
              <pre className="surface-card whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-silver">
                {
                  "Tue Oct 28 Pull A\npull-ups +5: 9 8 7 6\nchest row 27.5: 12 11 10 9\n..."
                }
              </pre>
              <p>
                When everything is at the top of the range, mark it ↑: next time
                take a step by the micro progress rules. Where the last set had
                3+ reps in reserve, go heavier. Where you didn't reach the bottom
                of the range, go lighter.
              </p>
              <p>
                <strong>What to expect.</strong> Soreness for the first 2-3
                weeks. Strength should start climbing after 4-6 weeks. Checkpoint
                after 8 weeks: the log and the weight chart, then rebuild the
                program.
              </p>
            </div>
          </Fold>
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-12 font-body text-sm text-silver-muted">
        Written Oct 28, 2026. Goals for Nov 5-11 added Nov 4. Review after week
        eight.
      </footer>
    </>
  );
}
