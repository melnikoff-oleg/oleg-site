// The commands and prompts from Elvar's article "How I Turn Any Machine Into a
// 3D Simulator You Can Take Apart" (x.com/elvar_official/status/2116174609355571402),
// copied word for word because they are meant to be pasted. Generated from the
// Apify scrape of the article (MS repo, projects/accounts/oleg_melnikov/
// twitter_spy/saved_2026-11-01/src/article/apify_article.json); do not retype them.
// The step names in the comments are the article's own headings.

/** Step 1, the install */
export const INSTALL_SKILL = "npx skills add elvarofficial/teardown -g -a claude-code";

/** Step 1, once, in the installed folder */
export const INSTALL_DEPS = "cd ~/.claude/skills/teardown && npm install && npx playwright install chromium";

/** Step 3. Build the machine */
export const BUILD_MACHINE = "/teardown Build [the Cessna 337 main landing gear] as an interactive 3D simulator. Reference attached: [a cutaway drawing of the gear].\n\nBuild it from code in real units: [the main plate, the hydraulic actuator, the rack, the pinion on its output shaft, the universal joints, the side tubes, the spring legs and the wheels].\n\nBefore you draw anything, write the model as pure functions of one input: [stroke from 0 to 1]. Use the real numbers: [the rack travels 201 mm, the pinion has 32 teeth at module 4 mm, so the legs turn exactly 180°]. Check them by hand and show me the check. If you are not sure a number is real, say so and tell me where it comes from.\n\nEvery part, every panel and every label reads from that one model. Nothing is animated by hand.";

/** Step 4. Build the console */
export const BUILD_CONSOLE = "Lay out a console around the machine at 1600×900:\n- the title and the main live number top left, big: [engine speed in rpm]\n- live charts that move with the machine: [valve lift over 720° of crank, the pressure-volume loop of the tracked cylinder]\n- a schematic panel that redraws the mechanism in 2D from the same model\n- one button per subsystem: isolate it, cut it, show it alone\n- camera views as buttons: [hero, front, side, top, inside the valley]\n- callouts with thin leader lines into the parts they name\nEvery panel redraws from the frame's state. No number on screen is typed in.";

/** Step 5. Give it the look */
export const GIVE_LOOK = "Style: a clean study model on a pale studio.\n- light background, soft shadows on an invisible floor, one accent colour for the part that is working right now\n- the machine fills 60 to 70% of its view\n- dark parts glossy, liners glass, metal roughness at least 0.45 so it never streaks white\n- if a part is near-white, give it a thin ink outline or a darker ground\n- pick the camera for the mechanism: if it collapses into a lattice face-on, use a 3/4 view";

/** Step 6. Check it like a critic */
export const CHECK_CRITIC = "Before you show me anything:\n1. Render a still at every beat of the tour and read each one: a part passing through another, a part floating off its mount, a label covering what it names, a number that disagrees with the pose.\n2. Scrub every transition at 0.2 s steps and look for a jump.\n3. Fix collisions with a number in the parameter block. Never hide them with the camera.\nTell me what you checked and what you fixed. Show me the stills.";

/** Step 7. Make it a page you drive */
export const PAGE_YOU_DRIVE = "Make the simulator a page people drive:\n- the tour from the film plays by itself, with a cursor that walks to each button and presses it\n- any click, drag, scroll or key hands control to the visitor; 25 seconds of quiet hands it back\n- drag to orbit, scroll to zoom, a key to hide the panels\n- warm every shader before the first frame so the page never freezes\n- test it on an integrated GPU and add quality steps: no ambient occlusion, a lower pixel ratio, smaller shadows, panels redrawn every other frame";

/** Step 8. Turn it into a video: record it */
export const RECORD = "Record the tour: render(t) has to be a pure function of time, so draw every frame at 60 fps at 1920×1080 in headless Chrome and pipe it into ffmpeg as H.264, yuv420p, faststart. Then show me a contact sheet of every beat.";

/** Step 8. Turn it into a video: score it */
export const SCORE = "Score it in code on the same timeline: [Am9 chords at 92 bpm, a soft thump on every power stroke so the beat tightens when the throttle opens, a quiet click on every button press, rising air under the throttle drag]. Master to -14 LUFS with the true peak under -1 dB and mux it into the video.";

/** Step 9. Put it online */
export const PUT_ONLINE = "Publish the simulator as a page:\n- keep the HTML under 1 MB; move any large model out as a file next to the page\n- a 1200×630 preview card from the best frame, with absolute image URLs\n- deploy it to Vercel";

/** Bonus. Let them break it */
export const LET_THEM_BREAK = "Add one slider for [the wind, 0 to 15 m/s] and run the model live when it moves: [a light breeze barely turns the crank, a gale makes the legs blur]. Show it on the same panels.";
