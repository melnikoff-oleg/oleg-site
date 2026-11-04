// "How to do it": every movement on /fitness explained step by step in plain
// English, simple enough to read mid-set. page.tsx shows each one in a fold
// under its exercise, shut by default. Keyed by movement, not by exercise, so a
// movement that appears on two days (face pull, lateral raise, dead hang, ...)
// has one text. A superset or a circuit lists one entry per movement.

export type HowTo = {
  /** Movement name, shown only when an exercise lists more than one. */
  title?: string;
  steps: string[];
  /** The one thing that matters most. Shown after the steps as "Key point". */
  tip?: string;
};

export const HOW = {
  // Warm-up
  bike: {
    steps: [
      "Get on the exercise bike, or on the treadmill with the incline raised to 8-10%.",
      "Pedal or walk at an easy pace for 3-4 minutes.",
      "Go just fast enough to warm up and raise your pulse a little, while you can still talk calmly.",
    ],
    tip: "This is a warm-up, not a workout: it shouldn't tire you.",
  },
  extRotation: {
    steps: [
      "Set the cable handle at waist height, or tie a band at that height.",
      "Stand side-on to the cable. Hold the handle in the hand farther from it: if the cable is on your left, your right arm works.",
      "Bend your elbow to a right angle and press it against your side. You can hold a rolled towel between elbow and ribs so the elbow doesn't drift.",
      "Start: your forearm lies across your stomach, hand near the opposite side.",
      "Slowly turn your forearm outward, like opening a door, until your hand goes a little past pointing straight ahead. The elbow stays where it is.",
      "2 seconds out, 2 seconds back. Do all the reps, turn around and repeat with the other arm.",
    ],
    tip: "The weight is really small. This exercise is for shoulder health, not strength: don't fight the weight.",
  },
  pullAparts: {
    steps: [
      "Hold a band in both hands, palms down, hands shoulder-width apart.",
      "Stretch your straight arms out in front of you at chest height.",
      "Pull your arms apart, stretching the band until it touches your chest. Your shoulder blades come together.",
      "Slowly bring your arms back to the front.",
    ],
    tip: "Arms straight, shoulders not rising to your ears. This works the rear shoulders and the muscles between the shoulder blades.",
  },
  facePull: {
    steps: [
      "Set the cable a little above face height and attach a rope.",
      "Hold the ends of the rope so your thumbs point toward you.",
      "Step back one or two steps so your arms are straight and the rope is tight. One foot can be slightly forward.",
      "Pull the rope toward your eyes, spreading the ends apart. Your elbows go out and up, at shoulder height or slightly above.",
      "At the end your fists are next to your ears, like a bodybuilder showing both biceps. Pause for 1 second.",
      "Slowly bring your arms back to the front.",
    ],
    tip: "Don't lean back: your arms and shoulders do the pulling. This works the rear delts and the muscles that hold your shoulders back.",
  },
  chinTucks: {
    steps: [
      "Sit or stand up straight, looking straight ahead.",
      "Without lowering or raising your chin, slide your head back, as if someone were pushing your chin with a finger. You'll get a double chin.",
      "Reach up with the top of your head.",
      "Hold for 2-3 seconds and relax.",
    ],
    tip: "Your head slides back in a straight line, it doesn't nod. This directly counters the forward head from your phone.",
  },
  thoracic: {
    steps: [
      "Sit on the floor and place the roller across your back, under your shoulder blades.",
      "Cross your arms on your chest or support your head with your hands, elbows forward.",
      "Your hips stay on the floor. Slowly arch back over the roller, as if hugging it with your back. Your head goes back, but don't throw your neck back.",
      "Hold for 2-3 breaths and come back. Move the roller slightly higher and repeat.",
      "Without a roller: lie back on the edge of a bench so the edge is under your shoulder blades, and arch back the same way.",
    ],
    tip: "The upper back arches, not the lower back. Don't put the roller under your lower back.",
  },
  rampUp: {
    steps: [
      "Ramp-up sets are light sets before the first working set, so muscles and joints get used to the movement.",
      "First: about half the working weight, 10 reps.",
      "Second: about 70% of the weight, 5 reps.",
      "Third: about 85% of the weight, 2 reps.",
      "45-60 seconds between them, then go straight to the working set.",
      "Example for a 20 kg dumbbell press: 10 kg ×10, 14 kg ×5, 16 kg ×2.",
    ],
    tip: "Ramp-up sets shouldn't tire you. If they do, you did too much.",
  },

  // Back
  pullUps: {
    steps: [
      "For added weight, wear a dip belt with a plate on the chain, or hold a dumbbell between your feet.",
      "Grab the bar with an overhand grip, palms facing away, hands slightly wider than your shoulders.",
      "Hang on straight arms. Pull your shoulders down, away from your ears.",
      "Pull your chest toward the bar, driving your elbows down and to your sides, until your chin is above the bar.",
      "Slowly lower yourself until your arms are straight.",
      "Don't swing your legs. You can cross them.",
    ],
    tip: "Pull with your elbows, down toward your pockets. If the shoulder hurts (as on the lat pulldown on Oct 30), stop right away and do the one-arm dumbbell row instead.",
  },
  chestRow: {
    steps: [
      "Raise the bench back to 30-45°, as for an incline press.",
      "Lie on it stomach and chest down, face down. Your head is just above the top edge, feet on the floor.",
      "A dumbbell in each hand, arms hanging straight down.",
      "Pull the dumbbells up, driving your elbows back toward your waist, as if putting your hands in your back pockets. Pull with your elbows, not your hands.",
      "At the top squeeze your shoulder blades together, as if holding a pencil between them. Pause for 1 second.",
      "Slowly lower until your arms are straight again.",
    ],
    tip: "Your chest stays on the bench the whole time: don't lift off or swing. The bench holds your body, so the lower back rests and all the load goes to your back. On a chest-supported machine it's the same: sit facing the pad, chest against it, pull the handles with your elbows going back. A seated horizontal cable row also works.",
  },
  oneArmRow: {
    steps: [
      "Stand beside a bench. Put your left knee and left palm on it. Back straight, roughly parallel to the floor. Your right foot stays on the floor.",
      "A dumbbell in your right hand, arm hanging straight down.",
      "Pull the dumbbell up toward your hip, elbow going back along your body, close to your side.",
      "At the top feel the muscle at the side of your back, under your armpit. Pause for 1 second.",
      "Slowly lower until your arm is straight.",
      "Do all the reps and switch sides.",
    ],
    tip: "Your torso doesn't twist or jerk. Your arm never goes overhead, so it's easier on the shoulder than the lat pulldown. This works the lats.",
  },
  pullover: {
    steps: [
      "Set the cable high and attach a straight bar or a rope.",
      "Hold it with both hands, step back one or two steps and lean forward about 30°. Back straight, knees slightly bent.",
      "Arms almost straight, reaching forward and up, hands at forehead height.",
      "Without bending your arms, bring the bar down in an arc to your thighs. Your arms are two long levers, moving only at the shoulders.",
      "At the bottom feel the muscles tense at the sides of your back, under your armpits. Pause for 1 second.",
      "Slowly bring your arms back up, to forehead height and no higher.",
    ],
    tip: "Your elbows don't bend, otherwise it turns into a triceps pushdown. This works the lats, the ones that are hard to feel.",
  },
  hang: {
    steps: [
      "Grab the bar with an overhand grip, hands shoulder-width apart.",
      "Take your feet off the support and just hang on straight arms.",
      "Pull your shoulders slightly down from your ears, so you aren't hanging loose on your ligaments.",
      "Hang until your fingers start to open. Write down the time.",
    ],
    tip: "Trains your grip and forearms, and stretches your back too.",
  },
  farmer: {
    steps: [
      "Place the dumbbells or kettlebells beside your feet.",
      "Squat down with a straight back, grab them and stand up, as in a deadlift.",
      "Stand tall: shoulders back and down, stomach tight, weights hanging at your sides.",
      "Walk with short, even steps for 40 seconds. Short on space: walk back and forth.",
      "Put the weights down the same way, squatting with a straight back.",
    ],
    tip: "Don't lean to the side or hunch. Trains your grip, forearms, traps and whole core.",
  },

  // Shoulders
  seatedPress: {
    steps: [
      "Set the bench back almost vertical, at 80-85°.",
      "Sit with your back against the pad. Rest the dumbbells on your thighs and kick them up to your shoulders with your knees.",
      "Dumbbells beside your head at chin and ear level, palms forward, elbows slightly in front of your body rather than straight out.",
      "Press the dumbbells overhead until your arms are almost straight. At the top they almost touch.",
      "Slowly lower to chin and ear level, no lower.",
    ],
    tip: "Your back doesn't leave the pad or arch. Don't go below your ears: it's easier on the shoulder.",
  },
  lateralRaise: {
    steps: [
      "Stand up straight, dumbbells in your lowered hands at your sides, palms facing your thighs.",
      "Bend your elbows slightly and keep them that way for the whole set.",
      "Raise your arms out to the sides up to shoulder height, like spreading wings. Your elbows lead, hands no higher than your elbows.",
      "Hold for a second and slowly lower.",
    ],
    tip: "Don't swing or toss the dumbbells. Your shoulders don't creep toward your ears. This works the side delts, which give your shoulders their width.",
  },
  cableLateral: {
    steps: [
      "Set the cable at the very bottom and attach a handle.",
      "Stand side-on to the cable. Hold the handle in the farther hand: if the cable is on your left, your right arm works, with the cable running in front of your body.",
      "Hold a post with your free hand. You can lean slightly away from the cable.",
      "Elbow slightly bent. Raise your arm out to the side up to shoulder height.",
      "Hold for a second and slowly lower.",
      "Do all the reps, turn around and repeat with the other arm.",
    ],
    tip: "Like dumbbell raises, except the cable pulls the whole way, even at the bottom. Your shoulder doesn't rise toward your ear and your torso doesn't sway.",
  },
  rearDeltCable: {
    steps: [
      "Set both crossover cables at shoulder or face height. You can remove the handles and hold the cable by the ball at its end.",
      "Stand in the middle. Take the left cable in your right hand and the right cable in your left hand. The cables cross in front of you.",
      "Step back so the cables go tight. Arms stretched forward in front of your face, elbows slightly bent.",
      "Open your arms wide, out and back in an arc, as if spreading big wings, until they form a letter T.",
      "Slowly bring your arms back together in front of you.",
    ],
    tip: "Arms almost straight, and the elbows don't bend more along the way. Your shoulders don't rise toward your ears. This works the rear delts.",
  },
  yRaise: {
    steps: [
      "Set the bench back to 30-45° and lie on it chest down, face down, as for the dumbbell row.",
      "Take 2 kg dumbbells, they really are that light. Hold your fists so your thumbs point up, like a thumbs-up.",
      "Raise your straight arms forward and up on a diagonal, so your body and arms together form a letter Y.",
      "Raise them to head height. Don't pull your shoulders to your ears: shoulder blades down and back.",
      "Hold at the top for 1-2 seconds and slowly lower.",
    ],
    tip: "This works the lower traps, the muscles low down between the shoulder blades. They pull your shoulders back and down, which is good posture and counters rounded shoulders.",
  },
  rearDeltProne: {
    steps: [
      "Set the bench back to 30° and lie on it chest down, face down.",
      "Light dumbbells in your hands, arms hanging down, palms facing each other, elbows slightly bent.",
      "Open your arms out to the sides in an arc up to shoulder height, like wings.",
      "Hold for a second and slowly lower.",
    ],
    tip: "Don't squeeze your shoulder blades hard or pull your shoulders to your ears: the rear delts should work, not your back. If you're swinging, the weight is too heavy.",
  },

  // Chest
  inclineDB: {
    steps: [
      "Set the bench back to 30°.",
      "Sit with the dumbbells on your thighs, lie back and kick them up to your chest with your knees.",
      "Squeeze your shoulder blades together and pull them down, as if putting them in your back pockets. Chest slightly up, feet on the floor.",
      "Press the dumbbells up over your upper chest until your arms are almost straight.",
      "Slowly lower until the dumbbells are at chest level. No deeper than that.",
      "Your elbows point not straight out but about 45° from your body.",
    ],
    tip: "Shoulder blades squeezed the whole set, otherwise your shoulder works instead of your chest. This works the upper chest.",
  },
  inclineBar: {
    steps: [
      "Set a 30° bench inside a rack. Lie down so the bar is above your eyes. Set the safety arms just below where the bar will touch your chest, so a failed rep lands on them.",
      "Feet on the floor. Squeeze your shoulder blades together and pull them down, chest slightly up.",
      "Grip the bar a little wider than your shoulders and lift it off the rack.",
      "Slowly lower the bar to your upper chest, just below your collarbones. Elbows about 45° from your body, not straight out.",
      "Press up until your arms are almost straight.",
    ],
    tip: "Shoulder blades squeezed the whole set. If your shoulder feels tense, use dumbbells: everything else is the same, as on Wednesday. Write down the full weight, including the 20 kg bar.",
  },
  lowToHighFly: {
    steps: [
      "Set both crossover cables at the very bottom and attach the handles.",
      "Take the handles and stand in the middle, one foot a step forward.",
      "Hands low at your sides at thigh height, elbows slightly bent, palms forward.",
      "Bring your arms forward and up in an arc to chin height, as if lifting a big box from below. Your hands meet in front of your face.",
      "Squeeze your chest at the top and slowly lower your arms back.",
    ],
    tip: "Don't stretch deep at the bottom, your arms stay in front of your body: it's safer for the shoulder. Your elbows don't bend along the way. This works the upper chest.",
  },

  // Arms
  overheadExt: {
    title: "Overhead extension",
    steps: [
      "Set the cable low or at chest height and attach a rope.",
      "Take the rope, turn your back to the cable and bring the rope behind your head. Elbows pointing up, hands behind your head.",
      "Step forward, one foot in front, torso leaning slightly forward.",
      "Straighten your arms up and forward until they are straight. Your elbows stay in place next to your head.",
      "Slowly bend your arms back, hands going behind your head.",
    ],
    tip: "Only your forearms move, and your elbows don't flare out. The triceps gets a big stretch here, which is good for growth.",
  },
  pushdown: {
    title: "Pushdown",
    steps: [
      "Set the cable high and attach a rope (or a straight bar).",
      "Stand facing the cable and take the ends of the rope.",
      "Press your elbows against your sides. Start: arms bent, hands at chest height.",
      "Straighten your arms down all the way, and at the bottom spread the rope ends slightly apart.",
      "Slowly bring your hands back to your chest. Your elbows stay at your sides the whole time.",
    ],
    tip: "Only your forearms move, like a lever from the elbow. Don't lean your body onto the weight.",
  },
  frenchPress: {
    steps: [
      "Lie on a flat bench, feet on the floor.",
      "Take an EZ bar with an overhand grip on the curved parts, hands about shoulder-width apart.",
      "Straighten your arms up over your chest.",
      "Bend your elbows and slowly lower the bar to your forehead or slightly behind your head. Your elbows stay in place.",
      "Straighten your arms back up.",
    ],
    tip: "Your elbows point at the ceiling and don't flare out. The bar travels toward your head, so lower it slowly and use a weight you fully control.",
  },
  inclineCurl: {
    steps: [
      "Set the bench back to 45-60° and sit. Back and head against the pad.",
      "Arms with dumbbells hang straight down, slightly behind your body, palms forward. The biceps is stretched.",
      "Bend your arms and raise the dumbbells to your shoulders. Your elbows stay in place, pointing at the floor, and don't drift forward.",
      "Slowly, over 2-3 seconds, lower until your arms are fully straight.",
    ],
    tip: "The incline stretches the biceps more at the bottom than standing, so you feel it better. Your back doesn't leave the pad.",
  },
  reverseCurl: {
    steps: [
      "Stand and take an EZ bar with an overhand grip: palms facing back toward your thighs, knuckles forward. Hands shoulder-width apart.",
      "Press your elbows against your sides.",
      "Bend your arms and raise the bar to your chest. Keep your wrists straight, don't curl them.",
      "Slowly lower.",
    ],
    tip: "This works the top of the forearm and the muscle under the biceps. You're much weaker with an overhand grip, so the weight is small.",
  },
  ezCurl: {
    steps: [
      "Stand up straight and take an EZ bar with an underhand grip on the curved parts, palms forward.",
      "Press your elbows against your sides.",
      "Bend your arms and raise the bar to your chest. Your elbows stay in place.",
      "Squeeze your biceps at the top and slowly lower until your arms are almost straight.",
    ],
    tip: "Don't swing or help with your back: if you're swinging, the weight is too heavy. On a cable it's the same, with a straight bar on the low cable.",
  },
  hammer: {
    steps: [
      "Stand up straight, dumbbells in your lowered hands, palms facing each other, as if holding two hammers.",
      "Press your elbows against your sides.",
      "Bend your arms and raise the dumbbells to your shoulders without turning your hands.",
      "Slowly lower.",
    ],
    tip: "You can do both arms together or alternate. This works the biceps and the muscle at the side of the forearm.",
  },
  wristCurl: {
    title: "Wrist curls",
    steps: [
      "Sit on the edge of a bench and rest your forearms on your thighs, hands hanging past your knees.",
      "Take a barbell or EZ bar with an underhand grip, palms up.",
      "Lower your hands as far as you can. The bar can roll down to your fingers.",
      "Curl your hands up as high as you can, hold for a second and slowly lower.",
    ],
    tip: "Only your hands move. Your forearms stay on your thighs and don't lift.",
  },
  wristExt: {
    title: "Wrist extensions",
    steps: [
      "Sit the same way, forearms on your thighs, hands past your knees.",
      "Take the bar with an overhand grip, palms down. Less weight than on the curls.",
      "Lower your hands.",
      "Raise the backs of your hands as high as you can, hold for a second and slowly lower.",
    ],
    tip: "Again only your hands move. This is the top of the forearm, which is weaker than the underside.",
  },

  // Legs
  barbellSquat: {
    steps: [
      "Set the bar in a rack just below shoulder height. Set the safety bars just below your lowest point, so a failed rep lands on them.",
      "Duck under the bar: it rests on the muscles of your upper back, not on your neck. Hands wider than your shoulders.",
      "Stand up to lift it off the hooks and take two short steps back. Feet shoulder-width apart, toes turned out a little.",
      "Sit down as if onto a low chair: hips back and down, knees pointing the same way as your toes. Back straight, eyes forward.",
      "Go deep for as long as your back stays straight, thighs about parallel to the floor.",
      "Stand up by pushing the floor away with your whole foot. After the last rep walk forward until the bar touches the rack, then lower it onto the hooks.",
    ],
    tip: "Knees don't cave in, heels stay on the floor. Nothing guides the bar now, so keep it moving straight up and down over the middle of your foot. Write down the full weight, including the 20 kg bar.",
  },
  barbellDeadlift: {
    steps: [
      "Load the bar with full-size plates so it sits at mid-shin height. For a lighter set, rest the plates on blocks to keep that height.",
      "Stand close: bar over the middle of your foot, feet hip-width apart.",
      "Bend down and grip the bar just outside your legs. Mixed grip: one palm facing you, the other facing away. Swap hands between sets.",
      "Hips back, shins touching the bar, back straight, chest forward. Tense your stomach, as if about to take a punch.",
      "Stand up: push the floor with your legs and straighten up, with the bar sliding along your legs. At the top stand tall, without leaning back.",
      "Lower in reverse: first hips back and the bar down your thighs, then your knees bend. Set the bar down on the floor and reset before each rep.",
    ],
    tip: "Your back stays straight as a board the whole time. If it starts to round on the last reps, the set is over. Write down the full weight, including the 20 kg bar.",
  },
  bulgarian: {
    steps: [
      "Stand with your back to a bench, about a step away from it. Dumbbells in your hands.",
      "Put the toes of your back foot on the bench, laces down.",
      "Your front foot is far forward, flat on the floor.",
      "Go straight down like an elevator, until your back knee almost touches the floor.",
      "Stand up, pushing through the heel of your front foot.",
      "Do all the reps on one leg, then switch.",
    ],
    tip: "Your front leg does the work, the back one is just for balance. If your knee goes far past your toes, place your front foot farther forward.",
  },
  legCurl: {
    steps: [
      "Lie or sit in the machine so your knees line up with the machine's pivot and the pad rests on your legs just above your heels.",
      "Hold the handles.",
      "Bend your legs, pulling your heels toward your glutes as far as you can.",
      "Hold for a second and slowly, over 2-3 seconds, straighten.",
    ],
    tip: "Your hips stay pressed to the seat and don't lift. This works the backs of your thighs.",
  },
  calves: {
    steps: [
      "Take the dumbbells and stand with your toes on the edge of a step or plate, heels hanging off.",
      "Lower your heels as far as you can and feel your calves stretch.",
      "Rise up on your toes as high as you can and hold for a second.",
      "Slowly come back down.",
    ],
    tip: "Knees straight but not locked. Don't bounce at the bottom, pause at the top.",
  },
  walk: {
    steps: [
      "Get on the treadmill, set the incline to 10-15% and the speed to 5.5-6.5 km/h.",
      "Walk for 35-40 minutes without holding the rails.",
      "Pace: heart rate 125-145, you can talk but singing is already hard.",
    ],
    tip: "Holding the rails takes the load away. A bike at the same heart rate can replace the treadmill.",
  },

  // Abs
  legRaise: {
    title: "Hanging leg raise",
    steps: [
      "Hang from the bar on straight arms, grip shoulder-width.",
      "Bend your knees.",
      "Raise your knees to your chest and at the end curl your pelvis up: your lower stomach rolls up, it isn't just your knees rising.",
      "Slowly lower your legs. Pause for a second at the bottom so your body doesn't swing.",
    ],
    tip: "If you only raise your knees, your hip muscles do the work. The abs switch on when your pelvis curls up.",
  },
  reverseCrunch: {
    title: "Reverse crunch",
    steps: [
      "Lie on your back. Arms along your body, palms on the floor, or hold on to something behind your head: a bench edge, a post.",
      "Raise your bent legs, knees over your hips, at a right angle.",
      "Pull your knees to your chest so your hips and lower back lift off the floor. You roll up from the bottom.",
      "Slowly, over 2-3 seconds, lower your hips back down.",
    ],
    tip: "The movement is lifting your hips, not swinging your legs. If your hips stay on the floor and only your legs move, your hip muscles work instead of your abs. The range is small, and that's normal.",
  },
  deadBug: {
    title: "Dead bug",
    steps: [
      "Lie on your back and raise your straight arms to the ceiling.",
      "Raise your legs, knees bent at a right angle, shins parallel to the floor. You look like a bug on its back.",
      "Press your lower back into the floor, so a hand can't slide under it.",
      "Slowly lower your right arm behind your head and at the same time straighten your left leg forward. Both almost touch the floor, but don't. Breathe out.",
      "Bring them back and do the same with your left arm and right leg.",
      "If your lower back starts to lift, don't lower your arm and leg as far.",
    ],
    tip: "Lower back pressed to the floor for the whole exercise. 10 per side is 20 movements.",
  },
  plank: {
    title: "Plank",
    steps: [
      "Get on your forearms and toes, elbows under your shoulders.",
      "Body straight as a board from head to heels. Your hips neither sag nor stick up.",
      "Tense everything at once: stomach as if about to take a punch, glutes squeezed, legs straight, elbows as if pulling toward your toes.",
      "Hold for 30 seconds and breathe calmly.",
    ],
    tip: "Better 30 seconds with your whole body tense than 2 relaxed minutes.",
  },

  // Stretches
  pecStretch: {
    steps: [
      "Stand in a doorway or next to a post.",
      "Put your forearm on the door frame: elbow at shoulder height, arm bent at a right angle.",
      "Step forward and slowly turn your body away from that arm until you feel a stretch in your chest.",
      "Breathe and hold for 40 seconds. Then the other arm, or both arms at once in a doorway.",
    ],
    tip: "Your chest should stretch, not your shoulder. If it feels bad in the shoulder, lower your elbow.",
  },
  latStretch: {
    steps: [
      "Hold a post with your right hand at chest height.",
      "Step back, arm straight.",
      "Push your hips back and slightly left, as if sitting down, until the right side of your back stretches from armpit to waist.",
      "Hold for 40 seconds and switch arms.",
    ],
    tip: "Breathe into the side you're stretching. On the exhale your hips go a little farther.",
  },
  couchStretch: {
    steps: [
      "Kneel with your back to a wall, couch or bench. Put a mat under your knee.",
      "Place your right knee on the floor right by the wall, shin up the wall.",
      "Put your left foot forward as in a lunge: foot on the floor, knee over the heel.",
      "Straighten your torso up and lightly squeeze your right glute: the front of your right thigh stretches.",
      "Hold for 45 seconds and switch legs.",
    ],
    tip: "Too intense: move your knee away from the wall. This is the main stretch after 12 hours of sitting.",
  },
  hamstring: {
    steps: [
      "Put the heel of a straight leg on a bench or step, toes pulled toward you.",
      "Back straight. Lean forward from your hips, as if to lay your stomach on your thigh rather than your nose on your knee.",
      "Stop when the back of your thigh stretches.",
      "Hold for 45 seconds and switch legs.",
    ],
    tip: "Don't round your back. Your knee can bend slightly.",
  },
  neck: {
    steps: [
      "Sit or stand up straight, shoulders down.",
      "Tilt your head, right ear toward right shoulder, without raising the shoulder. You can rest your right palm on your head for a little weight, without pressing.",
      "Hold for 30 seconds, then the other side.",
      "Then chin to chest, forward and down, another 30 seconds.",
    ],
    tip: "Gently, with no pain and no jerking.",
  },
} satisfies Record<string, HowTo>;
