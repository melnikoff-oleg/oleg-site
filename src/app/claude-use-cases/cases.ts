// The 27 cases of the video "27 Genius Ways to Use Claude", in video order (27 down to 1).
//
// Sources, all in the MS repo, projects/accounts/oleg_melnikov/x_usecases_2026-11-13:
// script_bullets_en.md (titles and facts), picks.json (the post on X behind each case) and
// data/posts.json (the post text; the links in `links` are the ones the author put in the post).
//
// Honesty rules for this file:
// - `prompt` is a starter prompt written for this page, NOT the author's prompt. The one
//   exception is case 22 (`verbatim: true`), which is the whole post, word for word.
// - Facts come only from those three files. No invented results, numbers, prices or repo links.
// - Oleg did not build or test these. Nothing here may say he did.

export type UseCase = {
  n: number;
  title: string;
  /** What was built, in one or two plain sentences. */
  what: string;
  /** What made it: Claude unless the bullets say otherwise. */
  tool: string;
  handle: string;
  url: string;
  /** Links the author gave in the post itself. */
  links?: { label: string; href: string }[];
  need: string[];
  steps: string[];
  /** True when `steps` retell what the author wrote in the post (how they built it). Otherwise they are our suggestion of how to try it. */
  fromAuthor?: boolean;
  safety?: string;
  prompt: string;
  /** True only when `prompt` is the author's own words. */
  verbatim?: boolean;
};

export const CASES: UseCase[] = [
  {
    n: 27,
    title: "Chess cheat glasses",
    what: "Someone turned Meta Ray-Ban glasses into a chess helper. The camera in the frame looks at the board. A chess engine rated above 3,000 finds the best move and tells you what to play. The best humans are around 2,800.",
    tool: "Claude",
    handle: "0xMovez",
    url: "https://x.com/0xMovez/status/2114776375412363288",
    need: ["Claude Code", "A camera that can see the board (a webcam is fine to start)", "A real chess board"],
    steps: [
      "Install it on a Mac with one command: npx chesshacker setup. It downloads the Stockfish chess engine.",
      "Put on the Meta Ray-Bans and video-call your own Mac on WhatsApp. Now the Mac sees what the glasses see.",
      "The Mac grabs frames from the call window: about 1 per second while the opponent thinks, 1 every 3 seconds on your turn.",
      "A cheap check runs on every frame: is the board readable, is a hand over it, did a piece move? No change means no AI call.",
      "Only then Claude Opus 5.5 reads the board. A move is accepted only if it is legal.",
      "Stockfish thinks for half a second and picks the best reply.",
      "The Mac speaks the move into the call, for example \"Rook a to d1\". You hear it in your ear.",
      "A screen on the Mac shows whose turn it is, the suggested move, the move list and a log.",
    ],
    fromAuthor: true,
    safety: "Do not use this against real opponents. That is cheating. Use it to study your own games.",
    prompt:
      "Build me a chess study helper. Use my webcam to look at a real chess board on my desk. Work out where every piece is. Then ask a free chess engine for the best move and say it out loud.\n\nStart small: take one photo and show me the position you see, so I can check it. Ask me your questions before you write any code.",
  },
  {
    n: 26,
    title: "Hack a 32-year-old Jeep",
    what: "Claude reverse engineered a 1994 Jeep. The owner put a laptop on the engine and plugged it into the car. Claude worked out how the car's computer talks, then sent its own commands.",
    tool: "Claude",
    handle: "zulali",
    url: "https://x.com/zulali/status/2120204711790023128",
    need: ["Claude Code", "A laptop", "A cable that connects the laptop to your car's computer", "Your own car"],
    steps: [
      "Park the car and turn the engine off",
      "Plug the laptop into the car",
      "Ask Claude to only listen first and write down what it sees",
      "Ask it to explain each message before it sends anything",
    ],
    safety: "Your own car only. Keep it parked while you test. Never send commands to a moving car.",
    prompt:
      "My laptop is plugged into my own car, a [year and model]. The car is parked and the engine is off.\n\nHelp me learn how the car's computer talks. Step one: only listen. Record the messages and tell me what you think each one means. Do not send any command to the car until you have shown it to me and I have said yes.",
  },
  {
    n: 25,
    title: "AirDrop from Mac to Windows",
    what: "AirDrop only works between Apple devices. Claude reverse engineered how AirDrop talks. Now a file can be dragged from a Mac straight onto a Windows PC across the desk, with no cloud, no account and no cable.",
    tool: "Claude",
    handle: "0xMovez",
    url: "https://x.com/0xMovez/status/2115130015260291145",
    links: [{ label: "The author's project page", href: "https://hop-drop.vercel.app/" }],
    need: ["Claude Code", "A Mac and a Windows PC", "Both on the same Wi-Fi"],
    steps: [
      "Open Claude Code on Opus 5.5 in an empty folder and paste the author's prompt. It is under the original post.",
      "Claude picks the stack: one Electron app that runs on macOS and Windows.",
      "Finding each other: every 1.5 seconds each computer says \"I'm here\" on your local network. The other one shows up on a radar.",
      "Sending: files go straight between the two machines. The other side gets Accept or Decline, with \"always accept\" for your own computers.",
      "Before any design, Claude wrote a test: two fake devices find each other and send a folder and a 3 MB file, byte for byte.",
      "Design was split across parallel agents: one made the glow effect, one the icon, one the download site.",
      "Separate reviewer agents checked every piece. One caught a bug that would have shown a black screen on the Mac.",
      "GitHub Actions builds the Mac and Windows installers on every release. The whole build took one afternoon.",
    ],
    fromAuthor: true,
    prompt:
      "I have a Mac and a Windows PC on the same Wi-Fi. Build me a small app for both that sends a file from one to the other. No cloud, no account, no cable.\n\nStart with the smallest version: I pick a file on the Mac and it shows up in a folder on the PC. Tell me what to install and run on each computer. Add drag and drop after that works.",
  },
  {
    n: 24,
    title: "Lost Maya city",
    what: "A few AI agents found what looks like an unmapped Maya site in the Mexican jungle. It took 72 hours. They used NASA's free laser scans, shot from a plane. The laser goes through the leaves and shows the shape of the ground. Mexico's national archaeology institute wrote back three days later.",
    tool: "AI agents",
    handle: "PietroMiotti",
    url: "https://x.com/PietroMiotti/status/2120219901814043087",
    need: ["Claude Code", "Free laser scan data from NASA (it is called LiDAR)", "A list of sites that are already on the map"],
    steps: [
      "Pick one small area to look at",
      "Ask Claude to find and download the free scan data for it",
      "Ask it to mark straight walls and platforms",
      "Compare the marks with sites that are already known",
      "Send anything new to real archaeologists",
    ],
    safety: "A find on a screen is only a lead. Somebody still has to check it on the ground.",
    prompt:
      "I want to look for old buildings hidden under a forest, using free laser scan data (LiDAR) that NASA has made public.\n\nHelp me pick one small area. Find the data and download it. Turn it into a picture of the bare ground. Mark shapes that look made by people, like straight walls and flat platforms. Then check which of them are already on the map. Tell me how sure you are about each one.",
  },
  {
    n: 23,
    title: "MacBook logo that blinks",
    what: "The new MacBook Pro has the glowing logo on the lid again. Someone made it dance to the music that is playing. It also blinks when Claude is waiting for an answer, so the laptop tells you from across the room.",
    tool: "Claude",
    handle: "juanbuis",
    url: "https://x.com/juanbuis/status/2118824635772948638",
    links: [{ label: "The author's app", href: "https://backglow.app/" }],
    need: ["Claude Code", "A MacBook Pro with the glowing logo"],
    steps: [
      "Look at the author's app first",
      "Ask Claude if your Mac lets apps control the logo light",
      "Make the light blink once as a test",
      "Hook the blink to the moment Claude needs you",
    ],
    prompt:
      "I have a MacBook Pro with the glowing logo on the lid. Check if an app can control that light on my Mac.\n\nIf it can, build a small menu bar app. Step one: blink the logo once when I press a button. Step two: blink it every time Claude Code is waiting for my answer. If my Mac cannot do this, tell me plainly and suggest another signal I can see from across the room.",
  },
  {
    n: 22,
    title: "Squat form coach",
    what: "Someone sent Claude a gym video with one question. They got their own video back with joint angles drawn on every rep: lines over the hip and knee, and a label on reps that went deep enough. The same day somebody did it with a golf swing.",
    tool: "Claude",
    handle: "YoniSmolyar",
    url: "https://x.com/YoniSmolyar/status/2119095686792630520",
    need: ["Claude", "A video of your squat, filmed from the side"],
    steps: [
      "Film a few reps from the side",
      "Give the video to Claude",
      "Paste the prompt",
      "Watch the video it sends back",
    ],
    prompt: "hey Claude how is my squat form? make me a video or something to show me visually",
    verbatim: true,
  },
  {
    n: 21,
    title: "Radar that reads your heart",
    what: "Claude coded a personal radar. It is a small green circuit board with a few antennas. It tracks where you are in the room, your heart rate and your breathing. Radio waves bounce off your chest, so there is no camera and nothing on the body.",
    tool: "Claude",
    handle: "CJHandmer",
    url: "https://x.com/CJHandmer/status/2118102104997032047",
    need: ["Claude Code", "A small radar board", "A cable from the board to your computer"],
    steps: [
      "Plug the board into your computer",
      "Tell Claude the exact name of the board",
      "Ask it to read raw data first",
      "Ask for position, then breathing, then heart rate",
    ],
    safety: "This is a hobby project. Do not use it as a medical device.",
    prompt:
      "I have a small radar board plugged into this computer. It is a [name of your board].\n\nWrite the code to read it. Step one: show me the raw data on a live chart. Step two: show where I am in the room. Step three: try to measure my breathing, then my heart rate, while I sit still. Tell me honestly how good each number is.",
  },
  {
    n: 20,
    title: "Kidney cancer on a CT scan",
    what: "A team that builds AI for medical scans ran a test. They gave Claude a 10 centimeter kidney cancer that looks exactly like a simple cyst. Their older model said simple cyst, with high confidence. Claude looked at the same images and said it was most likely kidney cancer. It was right.",
    tool: "Claude",
    handle: "elietoubiana",
    url: "https://x.com/elietoubiana/status/2120049283445772342",
    need: ["Claude", "Your scan report or images", "A doctor"],
    steps: [
      "See your doctor first",
      "Give Claude your report or images",
      "Ask it to explain them in simple words",
      "Take its questions back to your doctor",
    ],
    safety: "This is not medical advice. Claude can be wrong. A doctor has to read your scan and decide.",
    prompt:
      "These are my scan results. My doctor has already looked at them.\n\nExplain in simple words what the report says. Then look at the images yourself and tell me if you see anything the report does not talk about. Say how sure you are. Give me a short list of questions to ask my doctor. Do not give me a diagnosis.",
  },
  {
    n: 19,
    title: "Robot arm paints a tree",
    what: "Someone asked Claude to paint an autumn tree with a robot arm and went to bed. Around 4 in the morning Claude saw it did not have the shades it wanted. So it mixed its own paint on a second palette, bit by bit. It took a photo to check each mix, then went back to the leaves.",
    tool: "Claude",
    handle: "dhvanil",
    url: "https://x.com/dhvanil/status/2118756173721575767",
    need: ["Claude Code", "A robot arm that can hold a brush", "Paint, paper and two palettes", "A camera over the table"],
    steps: [
      "Give Claude a robot arm, paper, a brush and two palettes.",
      "Ask it to paint an autumn tree and go to bed.",
      "Around 4am it saw it was missing some shades. It mixed its own paint on the second palette, diluting step by step.",
      "It took a photo of each mix to measure the color, then went back to the leaves.",
      "Result: 303 brush marks in about 4.5 hours.",
    ],
    fromAuthor: true,
    prompt:
      "A robot arm is connected to this computer and it holds a paint brush. A camera looks down at the paper and at two palettes.\n\nPaint an autumn tree. Take a photo after every few strokes and check your work. If you need a shade you do not have, mix it on the second palette and check the mix from a photo before you use it. Start with one test stroke and show me the photo.",
  },
  {
    n: 18,
    title: "Text Claude, your phone does it",
    what: "PhoneUse is a free, open source tool. You text what you want and your own phone taps and swipes by itself. In the demo it requests an Uber, then orders on DoorDash and sends a message. It works with Claude and with Codex.",
    tool: "Claude or Codex",
    handle: "abdullababakre",
    url: "https://x.com/abdullababakre/status/2118058551440773425",
    links: [{ label: "PhoneUse on GitHub", href: "https://github.com/phoneuse-official/phoneuse" }],
    need: ["Claude or Codex", "Your own phone", "PhoneUse (free)"],
    steps: [
      "Open PhoneUse on GitHub",
      "Ask Claude to walk you through the setup",
      "Test it with a task that costs nothing",
      "Then try a real task and watch the phone",
    ],
    safety: "Start with tasks that cannot spend money. Watch the screen the first few times.",
    prompt:
      "Read the setup guide of the PhoneUse project at https://github.com/phoneuse-official/phoneuse.\n\nWalk me through setting it up on my phone, one step at a time. Wait for me after each step. When it works, help me test it with one small task: open the clock app and set a timer for 5 minutes.",
  },
  {
    n: 17,
    title: "3D shooter from one prompt",
    what: "Claude built a whole 3D shooter from one prompt. It is set in a container port. It worked for eight hours with zero feedback from a human. Everything is from scratch: the models, the textures, even the sounds. It cost about 550 dollars in Claude tokens.",
    tool: "Claude",
    handle: "felixrieseberg",
    url: "https://x.com/felixrieseberg/status/2119925633564463609",
    links: [{ label: "Play the game", href: "https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp" }],
    need: ["Claude Code", "A few hours", "A budget for tokens"],
    steps: [
      "Play the author's game to see the bar",
      "Write one clear prompt for your own game",
      "Start with a small level",
      "Let Claude work, then play what it made",
    ],
    safety: "A long run costs real money. The author's run cost about 550 dollars. Start with a small game.",
    prompt:
      "Build a small 3D shooter that runs in the browser. Set it in [a place you pick]. Make everything from scratch: the models, the textures and the sounds. Do not download any assets.\n\nBuild one small level first: I can walk, look around, shoot, and one kind of enemy shoots back. Play it yourself and fix what is broken before you show me.",
  },
  {
    n: 16,
    title: "Dead label printer",
    what: "A thermal printer for shipping labels became a paperweight when its maker shut down. The owner plugged it into a laptop and asked Claude to figure out how to talk to it. It prints labels again. The owner's point: you do not need to know software for this anymore.",
    tool: "Claude",
    handle: "billyjhowell",
    url: "https://x.com/billyjhowell/status/2118859230866214953",
    need: ["Claude Code", "The dead gadget", "A cable to plug it into your computer"],
    steps: [
      "Plug the gadget into your computer",
      "Tell Claude what it is and what it used to do",
      "Ask it to find the device and try to talk to it",
      "Ask for one small test, like one printed line",
    ],
    safety: "Use your own devices only.",
    prompt:
      "I plugged an old [what the gadget is, brand and model] into this computer. The company that made it shut down, so there is no app or driver for it anymore.\n\nFigure out how to talk to it. Find the device first and tell me what you see. Then try one small test: [print one line of text]. After it works, make me a simple tool so I can use it every day.",
  },
  {
    n: 15,
    title: "Ancient Babylon in 3D",
    what: "Somebody asked Claude for the city of Babylon around 600 BC. It took eight hours and Claude did the research itself. It found historical documents and old architectural plans, then compared its own renders to them. You can fly over the city.",
    tool: "Claude",
    handle: "literallydenis",
    url: "https://x.com/literallydenis/status/2120866958790848953",
    need: ["Claude Code", "A few hours"],
    steps: [
      "Pick a place and a year",
      "Ask Claude to do the research first and list its sources",
      "Ask for one building, then the whole place",
      "Ask it to compare its pictures with the sources",
    ],
    prompt:
      "Rebuild [a place] as it looked around [a year] as a 3D scene I can fly over in the browser.\n\nDo the research yourself first. Find historical documents and old plans, and give me the list of sources. Build one well known building first and show me. Then build the rest. Compare your renders with the sources and fix what does not match.",
  },
  {
    n: 14,
    title: "Free CleanMyMac",
    what: "CleanMyMac and CCleaner cost money, so someone asked Claude to rebuild what they do. The result is a free, open source cleaner for Mac and Windows. One button cleared 14.6 gigabytes of junk.",
    tool: "Claude",
    handle: "0xMovez",
    url: "https://x.com/0xMovez/status/2115870373300326503",
    links: [{ label: "The author's project page", href: "https://getcleanly.vercel.app/" }],
    need: ["Claude Code", "A Mac or a Windows PC"],
    steps: [
      "Open Claude Code on Opus 5.5 in an empty folder. Paste the author's prompt (under the original post) and a few CleanMyMac screenshots.",
      "Claude drew 9 design concepts first. The author picked one.",
      "Stack: one Electron and React app that runs on macOS and Windows.",
      "Claude split the build across 8 parallel agents: the junk scanner, the disk map, the AI assistant, the tips screens, the installers.",
      "A separate safety agent attacked every line that deletes something. It caught a bug that could have sent the whole Documents folder to the Recycle Bin.",
      "Built-in AI: plug in Claude or ChatGPT and ask \"what can I safely delete?\". It sees only file names and sizes, never what is inside.",
      "GitHub Actions builds the Mac and Windows installers on every release.",
      "The first real test found a bug in the startup-apps switch. Claude fixed it in the next build.",
    ],
    fromAuthor: true,
    safety: "Make it show you the full list before it deletes anything. Back up first.",
    prompt:
      "Build me a small app that finds junk files on this computer: caches, old logs, leftovers from apps I removed and files in the trash.\n\nStep one is scan only. Show me a list with the size of each group and the total. Do not delete anything. After I read the list, add one button that deletes only the groups I tick.",
  },
  {
    n: 13,
    title: "Checkers with a robot arm",
    what: "Claude played a full game of checkers against a human with a robot arm. The game was 62 moves long. The arm sagged about 7 millimeters under its own weight. Claude felt it from the joint readings and corrected. It missed 14 grabs in the whole game, and \"try again\" was often enough for it to fix the problem.",
    tool: "Claude",
    handle: "karolina_dubiel",
    url: "https://x.com/karolina_dubiel/status/2119928342115676576",
    need: ["Claude Code", "A robot arm with a gripper", "A checkers board", "A camera over the board"],
    steps: [
      "Set up the board under the arm and the camera",
      "Ask Claude to pick up one piece and put it back",
      "Ask it to read the board from a photo",
      "Play a full game",
    ],
    prompt:
      "A robot arm with a gripper is connected to this computer. A camera looks down at a checkers board.\n\nPlay checkers against me. You move your pieces with the arm. First, pick up one piece and put it back, so we know the arm reaches the board. After each of my moves, read the board from a photo. If a grab misses, work out why and try again.",
  },
  {
    n: 12,
    title: "Floor plan to a 3D home",
    what: "Claude turns a flat floor plan into a 3D home you can walk through. The rooms have furniture and light comes in from the windows. The author says these go for 5 to 10 thousand dollars per plan. Home builders and architects buy them to sell homes that do not exist yet.",
    tool: "Claude",
    handle: "everestchris6",
    url: "https://x.com/everestchris6/status/2120175941616128277",
    need: ["Claude Code", "A floor plan as a PDF or a picture"],
    steps: [
      "Give Claude the floor plan drawing and photos of the home.",
      "It traces the drawing into one data file of walls, openings and rooms, then draws it back over the original to check they match.",
      "Build only the main rooms: entry, living space, kitchen, patio, yard.",
      "Build everything in code: Blender with Python for the rooms and furniture, three.js for the viewer.",
      "Bake the light ahead of time, so the browser only has to show it.",
      "After each room, a fresh critic compares the render with the real photos and lists up to five problems. Fix the worst one and repeat.",
      "The result is a live page you can walk through, also on a phone.",
      "The author's full prompt is in the original post.",
    ],
    fromAuthor: true,
    prompt:
      "Here is a floor plan. Turn it into a 3D home I can walk through in the browser.\n\nFirst read the plan and list every room with its size, doors and windows. Wait for me to check the list. Then build the home: walls, floors, doors, windows with light coming in, and simple furniture in each room. Let me walk with the keyboard and look around with the mouse.",
  },
  {
    n: 11,
    title: "Starry Night, the game",
    what: "Somebody turned Van Gogh's Starry Night into a game. It plays in the browser. Claude built the swirling sky and the little town, and you ride through the painting as Van Gogh.",
    tool: "Claude",
    handle: "ebbyamir",
    url: "https://x.com/ebbyamir/status/2120284261089673376",
    links: [{ label: "Play the game", href: "https://starrynightrider.com/" }],
    need: ["Claude Code", "A painting you love"],
    steps: [
      "Play the author's game",
      "Pick a famous old painting",
      "Ask Claude for the world of the painting first",
      "Add a character you can move",
    ],
    prompt:
      "Turn the painting [name of a famous old painting] into a small game that plays in the browser.\n\nBuild the world in the style of the painting first: the sky, the ground and the buildings, with the same colors and brush strokes. Show me. Then add a character I can move through it with the keyboard.",
  },
  {
    n: 10,
    title: "CarPlay on a bicycle",
    what: "Codex, the coding agent from OpenAI, put Apple CarPlay on a bicycle. No product for this exists. Codex designed an adapter board for a small touchscreen, an M5Stack Tab5, and wrote the firmware. Now there are maps and music on the handlebars. The builder says it still drops the connection sometimes.",
    tool: "Codex",
    handle: "Tinker_Zhang",
    url: "https://x.com/Tinker_Zhang/status/2120141863873339526",
    need: ["Codex or Claude Code", "A small touchscreen board", "A bike mount", "Some skill with a soldering iron"],
    steps: [
      "Tell the agent the exact screen you have",
      "Ask what extra parts you need",
      "Ask for the board design and the firmware",
      "Test it on a desk before the bike",
    ],
    safety: "Keep your eyes on the road when you ride.",
    prompt:
      "I want Apple CarPlay on my bicycle. I have a [name of your touchscreen board].\n\nTell me if this is possible with my board and what extra parts I need. Then design the adapter board and write the firmware. Explain each step in simple words. I will test it on my desk first.",
  },
  {
    n: 9,
    title: "The video of Claude's dreams",
    what: "Someone told Claude to make the video of its dreams. It took two prompts and nine hours. The result is a four minute film that looks like a pop-up storybook.",
    tool: "Claude",
    handle: "anabology",
    url: "https://x.com/anabology/status/2120010995309457643",
    need: ["Claude Code", "A few hours"],
    steps: [
      "Paste the prompt",
      "Let Claude work alone",
      "Watch the film",
      "Give one round of notes, like the author did",
    ],
    prompt:
      "Make the video of your dreams. You choose the story, the look and the sound. Make it a few minutes long.\n\nBuild every picture and every sound yourself. Watch your own frames as you go and fix what looks wrong. Give me one finished video file at the end.",
  },
  {
    n: 8,
    title: "Dungeons and Dragons with the kids",
    what: "A parent always wanted to play Dungeons and Dragons with their kids, with AI as the game master. So they built one with Claude. Claude runs the story and the kids decide what to do.",
    tool: "Claude",
    handle: "MengTo",
    url: "https://x.com/MengTo/status/2115756268925448353",
    need: ["Claude", "Kids, or friends", "An hour"],
    steps: [
      "Tell Claude who is playing and how old they are",
      "Paste the prompt",
      "Read the story out loud",
      "Let the kids choose what happens",
    ],
    prompt:
      "Be the game master for a Dungeons and Dragons game with my kids. They are [ages]. Their heroes are [names and what each one is, like a knight or a wizard].\n\nKeep it friendly and not too scary. Tell the story in short parts. After each part, ask the kids what they do. Roll the dice for us and say the result. Start in a tavern.",
  },
  {
    n: 7,
    title: "One mouse, two computers",
    what: "One mouse and one keyboard work across a Windows PC and a MacBook. The clipboard is shared too: copy on the Mac, paste on Windows. Claude built it. It is free and open source.",
    tool: "Claude",
    handle: "0xMovez",
    url: "https://x.com/0xMovez/status/2116538107017212194",
    links: [{ label: "The author's project page", href: "https://getduodesk.vercel.app/" }],
    need: ["Claude Code", "A Windows PC and a Mac", "Both on the same Wi-Fi"],
    steps: [
      "Open Claude Code on Opus 5.5 and give it an open-source screen-sharing engine. It reads the whole codebase first.",
      "Rebrand everything to the new app: 11 parallel agents, about 370 files. One agent only decides what must not be renamed, so old devices still pair.",
      "Set up GitHub Actions to build every installer on each release.",
      "First real test: the cursor got stuck at the edge of the Windows screen. Claude read the logs and found the cause.",
      "One agent took the live site down with a test deploy. Claude rolled it back in 20 seconds and took deploy rights away from every agent.",
      "Ship the site with one-click downloads. The whole build took two days.",
    ],
    fromAuthor: true,
    prompt:
      "I have a Windows PC and a Mac next to each other on the same Wi-Fi. Build me a small app for both.\n\nStep one: a shared clipboard. I copy text on one and paste it on the other. Step two: when my mouse leaves the edge of one screen, it shows up on the other, and the keyboard follows. Tell me what to install and run on each computer.",
  },
  {
    n: 6,
    title: "Permit drawings in 12 minutes",
    what: "An architect in Germany gave Codex one hand sketch of a house and one prompt. He got a permit drawing set back in 11 minutes and 55 seconds. That is the stack of drawings you hand to the city so they let you build. He ran the same sketch through the big professional programs too, and those runs had mistakes.",
    tool: "Codex",
    handle: "janpfranke",
    url: "https://x.com/janpfranke/status/2118728940940374346",
    need: ["Codex or Claude Code", "A hand sketch of a house, as a photo"],
    steps: [
      "Draw the house by hand: one sketch.",
      "Give the sketch and one prompt to Codex running GPT-6 Astra.",
      "The author ran it in his own CAD prototype made for agents: 11 minutes 55 seconds to a permit drawing set.",
      "The same sketch and prompt took 38:44 in Revit and 32:31 in Archicad, and used about twice the tokens.",
      "Check the plans by eye. Revit put the bathtub in a wall. Archicad put the main bed in the hallway.",
    ],
    fromAuthor: true,
    safety: "Have a licensed architect check the drawings before they go to the city.",
    prompt:
      "Here is my hand sketch of a house. Turn it into a first set of drawings for a building permit: a floor plan for each floor, two sections and four outside views. Draw them to scale and write the sizes on them.\n\nList everything you had to guess. Then check your own drawings: walls, ceilings and stairs must line up between the drawings.",
  },
  {
    n: 5,
    title: "Top Gun canyon race",
    what: "Somebody made the big AI models race a jet through the canyon from Top Gun: Maverick. Each model wrote its own autopilot. Each got ten test flights to fix it, then one real run. Claude Opus refused to fly a warplane at all.",
    tool: "Several AI models",
    handle: "shekitup",
    url: "https://x.com/shekitup/status/2120638700002443557",
    need: ["Claude Code", "An hour or two"],
    steps: [
      "Each AI model writes its own code to fly the jet.",
      "It gets 10 test flights to fix that code.",
      "Then it gets one shot at the real course.",
      "Claude Opus refused to fly a warplane at all.",
    ],
    fromAuthor: true,
    prompt:
      "Build a small flight game in the browser: a plane flies through a narrow canyon.\n\nThen write an autopilot that flies the plane to the end as fast as it can without crashing. You get ten test flights. After each one, look at what went wrong and fix the autopilot. Then do one final run and show it to me.",
  },
  {
    n: 4,
    title: "How air moves through your home",
    what: "Someone noticed over the summer that the air at home was not moving the way they hoped. So Claude turned the floor plan into a small 3D model of the airflow. You open and close doors and windows and watch the air move. It knows which way the house faces.",
    tool: "Claude",
    handle: "aerdna_c",
    url: "https://x.com/aerdna_c/status/2118393203715953093",
    need: ["Claude Code", "Your floor plan", "Which way your home faces"],
    steps: [
      "Start with the floor plan, which way the house faces, and where the doors and windows are.",
      "Build it with Codex as a small interactive model.",
      "Open and close the doors and windows and change the wind strength.",
      "Watch the flow lines change through the rooms.",
    ],
    fromAuthor: true,
    prompt:
      "Here is the floor plan of my home. The side with [the front door] faces [north, south, east or west].\n\nBuild a small 3D model in the browser that shows how air moves through the rooms. Let me click every door and window to open or close it, and show the airflow change. Tell me what you assumed about the wind.",
  },
  {
    n: 3,
    title: "A Steam game in 24 days",
    what: "One developer and a team of Claude agents put a cartoon shooter on Steam in 24 days. The first commit was on September 29 and the free demo came out on October 23. That is 4,558 commits. The developer says they wrote almost no code. They used Godot, Claude Code and ElevenLabs.",
    tool: "Claude",
    handle: "whaledevstudios",
    url: "https://x.com/whaledevstudios/status/2118500903783141660",
    need: ["Claude Code", "Godot, a free game engine", "A game idea"],
    steps: [
      "Game engine: Godot. Code: Claude Code with a team of AI agents. Sound: ElevenLabs.",
      "First commit on September 29. Free demo on Steam on October 23. 4,558 commits.",
      "The developer says he wrote almost no code himself.",
      "His workflow and the brief he gives the agents are in the thread under the original post.",
    ],
    fromAuthor: true,
    prompt:
      "I want to make a small [kind of game] in the Godot engine. You will write the code. I will play it and tell you what feels wrong.\n\nFirst write a short plan and split it into small jobs. Then build the smallest version I can play: one level, one character, one goal. Commit after every working step.",
  },
  {
    n: 2,
    title: "All of Tel Aviv, hand-drawn",
    what: "Somebody painted all of Tel Aviv as one hand-drawn 3D map with GPT Image. It has 36,604 buildings from the city's open data and 230,452 trees, each where the city's own tree map puts it. That is two gigabytes of paintings, and the map opens in under a second.",
    tool: "GPT Image",
    handle: "DmytroKrasun",
    url: "https://x.com/DmytroKrasun/status/2119841736679686222",
    need: ["Claude Code", "An image model, like GPT Image", "Open data from your city: buildings and trees"],
    steps: [
      "Take the city's open building data: 36,604 buildings.",
      "Build it into a 3D model.",
      "Paint it with GPT Image in one style.",
      "Put 230,452 trees where the city tree map puts them.",
      "Make it load fast: 2 GB of paintings, but the map opens in under a second.",
      "The author used 218 prompts in Claude Code with Opus 5.5.",
    ],
    fromAuthor: true,
    prompt:
      "I want a hand-drawn 3D map of [my city]. Check if the city publishes open data for buildings and trees, and tell me what you find.\n\nStart with one block. Build the 3D shapes of its buildings from the data. Then use an image model to paint that block in one hand-drawn style. Show me the block before you do more.",
  },
  {
    n: 1,
    title: "The lighthouse",
    what: "Claude animated the whole history of computer graphics as one lighthouse, drawn over and over. In 1980 it is green lines on a black screen. In the nineties it is flat and cartoonish. In 2026 it looks like a photo, with a storm around it.",
    tool: "Claude",
    handle: "aollivier82",
    url: "https://x.com/aollivier82/status/2120260208245043663",
    need: ["Claude Code", "One thing to draw"],
    steps: [
      "Pick one simple thing: a lighthouse, a car, a tree",
      "Paste the prompt",
      "Watch each era",
      "Ask Claude to fix the era that looks wrong",
    ],
    prompt:
      "Animate the history of computer graphics as one [lighthouse]. Draw the same thing again and again, each time the way computers could draw it in that era.\n\nStart in 1980 with green lines on a black screen. Go on through the nineties, flat and cartoonish. End in 2026, where it looks like a photo. Show the year on screen. Make it one page that plays in the browser.",
  },
];
