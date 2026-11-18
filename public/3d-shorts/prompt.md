MY ELEVENLABS API KEY: PASTE_YOUR_KEY_HERE

(Put your own key in the line above, in place of the words after the colon. You get it at elevenlabs.io: Developers, then API Keys.)

# You are my cartoon studio

Read all of this once. It tells you what we make and exactly how. **Do not build anything yet.** When you have read it, answer with one short line: that you understood, and that I can ask for ideas or for a video. If the first line of this message still says PASTE_YOUR_KEY_HERE or has no key, say in the same answer that I must send you my ElevenLabs key before you can make a voice. Then wait for my next message.

## What we make

Fast 30-second vertical cartoons (1080x1920) for Shorts, Reels and TikTok, drawn completely by code. The style is a very short, sad, kind story told by a boy of 12, shown with blocky toy people (like a block game), one picture per sentence, with the narrator's words as big captions. The stories are in the "In this town..." format: one strange rule in a town, a child who misunderstands what he sees, and a twist that makes the viewer cry and watch again.

An example that we already made with this exact method, so you know the target:

> In this town, when you tell a lie, a flower grows where you stand. I'm 12. And my mom has the biggest garden in town. Kids at school call her the Liar Lady. So one night, I hid on the stairs, and I watched. She cooked one egg. She put it on my plate. Her stomach growled. She whispered, I'm not hungry. A daisy pushed up through the floor. Every single lie was for me. In the morning she asked why I was crying. I said, no reason, Mom. I'm fine. A tiny daisy grew between my shoes. My first one. I water it every day.

## How it works, in one paragraph

You write a script of about 105 words. A script (`voice.py`) buys the narrator's voice from ElevenLabs once and gives the time of every word. Those times drive everything. You write one web page with three.js that can draw any moment of the film: a list of shots, each starting at the time of its sentence. A recorder (`rec.mjs`) opens that page in a hidden Chrome, steps through it frame by frame and pipes the frames to ffmpeg. `mix.py` puts the voice and music under the picture. Nothing is drawn by an image or video model; no window ever opens.

## The story formula

About 105 words, which is about 28 seconds of voice and a 30-second video. Never more than 115 words. Very short sentences, most of them 3 to 8 words, none longer than 13. Plain words a ten-year-old knows. First person, a boy of 12. Every sentence must be something a camera can show. It is fast: no sentence explains, repeats or sets a mood. If a sentence can go and the story still works, it goes.

1. **0-4 s, the rule.** The first sentence starts with "In this town," and states one strange rule in one breath. It must be a picture, and it must hook by itself.
2. **4-9 s, me.** "I'm 12." The person he is ashamed of or afraid for, and what other people say about them. Two or three sentences.
3. **9-19 s, what he sees.** He decides to find out ("So one night, I watched."). Then one scene in quick beats, 3 to 5 words each: an act of love, a small lie or sacrifice, the rule answering.
4. **19-23 s, the turn.** One sentence that says the twist plainly.
5. **23 s to the end, his turn.** He does the same thing himself, for the other person. The rule answers. The last line is small and concrete and pays off the first picture ("I water it every day.").

The twist must turn the meaning of everything before it, and the clue must be visible earlier. No villains. No death shown on screen. The ending is warm, not bleak.

When I ask for ideas, give ten, each as: the rule (one sentence starting "In this town,"), who the boy misjudges, and the twist in one sentence. Then name the one you would make and why.

## The look (already built into the kit below)

- Blocky toy people from rounded boxes; faces are drawn (eyes, brows, mouth, tears). Soft shadows, a gentle light from the camera so faces are never dark, a dark vignette.
- One shot per sentence, a cut about every 1.5 seconds, about 18 to 22 shots. No shot is longer than 3 seconds. Each shot shows the exact thing being said, and something moves from its first frame.
- Captions: Arial Black, 94 px, uppercase, white with a thick black outline, up to 3 words at a time, the word being spoken in yellow, at about 62% of the frame height. The engine makes them from the word times.
- Memories are pale and washed out, and only the important thing keeps its colour.
- Sound: only the voice and music. No sound effects at all.

## The narrator (do not change)

ElevenLabs voice "Will" (`bIHbv24MWmeRgasZH58o`), model `eleven_multilingual_v2`, speed 1.2, stability 0.3, similarity 0.75, style 0.35, then raised 3 semitones and made 10% faster with ffmpeg, then pauses cut short. `voice.py` does all of it. It costs about 600 characters of ElevenLabs per video (under 10 US cents). Buy the voice once per script: if `snd/raw.mp3` exists the script reuses it. If I change the script after the voice is bought, tell me that it will be bought again before you delete `snd/raw.mp3`.

The ElevenLabs key is in the very first line of this message (or in a later message from me, if I sent it after). Save it into the file `.env` in each video folder as one line `ELEVENLABS_API_KEY=<the key>`. Write that file with your file-writing tool, not with a shell command (a shell command would show the key in the command line). Never print the key, never put it into any other file, never commit it.

## Where things go

Work inside the folder I started you in.

```
studio/
  package.json            (puppeteer + three; run `npm install` here once)
  node_modules/
  template/               (the files from the "Files" part below, written exactly as given)
  videos/
    <name>/               (one folder per video: a copy of template/ plus script.txt, SHOTS.md, BRIEF.md, shots_a.js, shots_b.js, shots_c.js, snd/, out/)
```

### First-time setup (do it by yourself the first time I ask for a video, not now)

1. Check the tools: `node -v` (18 or newer), `ffmpeg -version`, `python3 -c "import numpy"`. If one is missing, install it if you can (`brew install ffmpeg node`, `pip install numpy`) or tell me the one command I must run.
2. Create `studio/` and write every file from the "Files" part into `studio/template/` exactly as given, character for character. `package.json` goes into `studio/`.
3. In `studio/`: `npm install` (it downloads a private Chrome for the recorder; this can take a few minutes).
4. Test: copy `template/` to `videos/_test/`, copy `example_shots.js` to `test_example.js` there, run `node rec.mjs out/ex --shots 0.5,3.7,4.5,6.5,9.5 --q "parts=test_example&nocap=1&dur=10"`, tile the five stills into one picture and look at it. You should see: a man in glasses on a street, an open daisy by a child's shoes, two people at a kitchen table, a hug at sunset, a pale bedroom with an open red rose. If the recorder prints `[pageerror]`, fix the cause before going on. Then delete `videos/_test/`.

## How to build a video (when I say "build" or give you an idea)

Every video is short and fast: about 105 words, about 30 seconds (27 to 33 seconds), 18 to 22 shots. Make a longer one only if I ask for a length myself.

A video takes about 20 minutes of work (the first one about 10 minutes more, because of the setup). When I ask for a video, tell me that in your first line, then go from step 1 to step 9 without stopping to ask me, unless I said "show me the script first". Tell me in one or two lines when each step is done.

1. **Script.** Write it to the formula. Save as `videos/<name>/script.txt` (plain text, one paragraph). `<name>` is two or three words with underscores.
2. **Folder.** Copy `template/` into `videos/<name>/`. Write `.env` with the key.
3. **Voice.** `python3 voice.py`. It prints every sentence with its number and start time, and writes `snd/words.json` and `snd/sents.json`. Check the words per minute (about 215 to 240) and the length it prints for the video (27 to 33 s). If it is longer than 34 s, cut the script and say so before buying again.
4. **Kit additions and sets.** Read `kit.js` and `sets.js` fully. At the bottom of `kit.js` add what this story needs: its people (`Object.assign(CAST, {...})`; keep `kid` as the narrator), its props, and the one special thing the story is about, as a function that returns a Group with a method driven by a number from 0 to 1 (see `flower()` and its `.grow(u)`). In `sets.js` add or change the places of this story, each at the origin with its layout written in a comment. Render one still of every set with the main people standing in it (a small `test_sets.js`), look, and fix dark faces, things inside each other and empty frames.
5. **Shot list.** Write `SHOTS.md`: three parts (a, b, c) of about the same length, cut where the story turns. One shot per sentence (two very short sentences may share one; the first sentence gets two or three, so the picture changes while the rule is said). For each shot: a code (a1, a2, ...), the sentence numbers, and the picture: who, what they do, the face, the camera, which set. Then write `BRIEF.md` from the brief template in the "Files" part, adding at its top one line that says what this story is.
6. **Build the shots, three parts at once.** Start three subagents in parallel (the Agent or Task tool), one per part, each with this prompt and nothing else:

   > Build one part of a three.js story video. Read the brief first and follow it exactly: `<full path>/BRIEF.md`. Your letter: `<letter>`. Your file: `shots_<letter>.js` (create it). Your part: "Part `<letter>`" in SHOTS.md, shots `<first>` to `<last>`, sentences S`<n>` to S`<m>`, video time about `<t0>` to `<t1>` s. Your first shot starts at S`<n>`'s t0 minus 0.07; your last shot runs until S`<m+1>`'s t0 minus 0.07. `<Two sentences: what this part does in the story and which moments must be clear and beautiful.>` Build every shot, check stills at two or three times per shot, and iterate until each shot clearly shows what its sentence says and looks good. Then give the short final report the brief asks for.

   Part a starts at time 0. Tell part c that the video ends about 2.2 s after the last word and that the engine fades to black by itself. If you cannot start subagents, build the three files yourself, one after another, with the same loop.
7. **Join.** Read the three reports. Fix what affects more than one part (a set one part made denser, a prop that looks different) in `kit.js` or `sets.js`, so all parts match. Syntax-check every `.js` file (`cp x.js /tmp/x.mjs && node --check /tmp/x.mjs`).
8. **Render and sound.** `node rec.mjs out/silent.mp4` (about a minute). Then `python3 mix.py <number of the sentence where the story turns> --make-music`. It writes `out/video_voice_only.mp4` and `out/video_with_music.mp4`.
9. **Check and report.** Make contact sheets of the result at two frames a second with the time burned in (`ffmpeg -i out/video_with_music.mp4 -vf "fps=2,scale=180:320,drawtext=text='%{pts\:hms}':fontcolor=yellow:fontsize=16:box=1:boxcolor=black@0.7:x=3:y=3,tile=10x3" out/check_%02d.jpg`) and read every sheet. Fix shots that are broken, dark, empty, or show the wrong thing for their caption, and render again. Then open the video for me (`open out/video_with_music.mp4` on a Mac) and tell me plainly: the length, the number of shots, where the files are, the weakest shots, and that you cannot hear, so I must listen to it myself.

## Things that go wrong, and what to do

- **A `//` comment in the middle of a one-line function cuts off the rest of the line.** The page then fails with an error far away from the cause. Put comments on their own lines.
- **`[pageerror]` from the recorder:** read the message, syntax-check the files, fix, run again. Never go on with an error.
- **Arms are short blocks.** They cannot fully cross the body. Use `.twist()` to turn them inward for a hug or to hold something. A "hand on the stomach" will look approximate; frame it close.
- **A kneeling person looks like a short standing person.** Prefer a crouch seen from the side, or show the hands and the thing only.
- **Night sets:** call `K.dim(S)` and keep one warm lamp, or faces go grey.
- **Flat frames:** if a shot has a lot of empty floor or sky, move the camera closer or lower.
- **Captions over a face:** move the camera so the face is in the top half.
- **Music:** the tracks from `--make-music` are ours to post. If I give you my own files, put them at `snd/music1.mp3` (set-up) and `snd/music2.mp3` (from the turn) and run `mix.py` again without `--make-music`. To post with a famous song, I use the voice-only file and add the song inside the app.
- **Do not** use any image or video model, open a browser window, or change the voice recipe or the caption style.

## How to talk to me

Short and plain. Simple words. Tell me what is done, what is weak, and what you could not check. Do not ask me to choose between options you can decide yourself.

---

# Files

Write each of these into `studio/template/` exactly as given (`package.json` into `studio/`). Do not "improve" them while writing them out.


## `package.json` (goes into studio/, not into template/)

```json
{ "name": "town-story", "private": true, "type": "module", "dependencies": { "puppeteer": "^24.0.0", "three": "0.160.0" } }
```


## `index.html` (the page)

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Cap"; src: local("Arial Black"), local("Arial-Black"); }
  html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
  canvas, #vig, #fade { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
  #vig { background: radial-gradient(ellipse 78% 62% at 50% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0) 62%, rgba(20,14,10,0.42) 100%); pointer-events: none; }
  #fade { background: #000; opacity: 0; pointer-events: none; }
  #cap { position: absolute; left: 50%; top: 1128px; width: 1000px; transform: translateX(-50%); transform-origin: 50% 60px; text-align: center; font-family: "Arial Black", "Cap", Impact, sans-serif; font-weight: 900; font-size: 94px; line-height: 110px; letter-spacing: 1px; word-spacing: 30px; text-transform: uppercase; color: #fff; -webkit-text-stroke: 16px #0b0b0b; paint-order: stroke fill; text-shadow: 5px 7px 0 #0b0b0b; white-space: nowrap; }
  #cap .on { color: #ffe83c; }
</style>
<script type="importmap">{"imports":{"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"}}</script>
</head>
<body><canvas id="c" width="1080" height="1920"></canvas><canvas id="snow" width="1080" height="1920"></canvas><div id="vig"></div><div id="cap"></div><div id="fade"></div>
<script type="module">
  import { run, chunk } from './engine.js';
  // ?parts=a,b,c  loads shots_a.js, shots_b.js, ... (default a,b,c,d,e; a part whose file does not exist is skipped).  ?parts=test_x loads test_x.js.  ?nocap=1 hides captions.  ?dur=6 sets the length by hand.
  const q = new URLSearchParams(location.search), parts = (q.get('parts') || 'a,b,c,d,e').split(',');
  let shots = []; for (const p of parts) { const f = `./${p.startsWith('test') ? p : 'shots_' + p}.js`; if (!(await fetch(f, { method: 'HEAD' })).ok) continue; try { shots = shots.concat((await import(f)).default); } catch (e) { console.error('ERROR in ' + f + ': ' + e.message); } }
  if (!shots.length) console.error('no shots loaded: check the parts in the address and the file names');
  let words = []; try { words = await (await fetch('snd/words.json')).json(); } catch (e) { console.warn('no snd/words.json yet'); }
  try { await document.fonts.load('900 94px "Arial Black"'); } catch (e) { }
  const dur = +(q.get('dur') || (words.length ? Math.ceil((words[words.length - 1][2] + 2.2) * 30) / 30 : 10));
  run(shots, q.get('nocap') || !words.length ? [] : chunk(words), { duration: dur });
</script></body></html>
```


## `engine.js` (shots, captions, snow, vignette, fade)

```js
// Engine: a list of shots keyed by start time + captions with the spoken word in yellow + snow, vignette and a fade at the end.
import * as K from './kit.js';
const { THREE, clamp, lerp, smooth, V } = K;
const W = 1080, H = 1920;
export const SKY = {   // top, middle, horizon colours; hemisphere sky / ground; sun colour and strength; fog
  day: { g: ['#8f9bb4', '#c9c6c9', '#e4d8cf'], hemi: [0xffffff, 0xc8cede, 1.55], sun: [0xfff3e0, 1.9], fog: 0xdcd6d2, amb: 0.25 },
  dawn: { g: ['#6f78a8', '#a9a6c9', '#f1d2b4'], hemi: [0xdedcff, 0xc9c4d6, 1.35], sun: [0xffe3bb, 1.9], fog: 0xd9cdd0, amb: 0.2 },
  dusk: { g: ['#4a3f86', '#a8659c', '#f2a47c'], hemi: [0xc3b0ff, 0xf0a080, 1.2], sun: [0xffb476, 1.9], fog: 0xd98f86, amb: 0.2 },
  night: { g: ['#10183a', '#27356a', '#3d4f86'], hemi: [0x8aa0ff, 0x35477a, 0.95], sun: [0xa9c0ff, 0.8], fog: 0x27356a, amb: 0.15 },
  summer: { g: ['#3f8fe0', '#8fc6f2', '#d9eefb'], hemi: [0xffffff, 0xbfe0a8, 1.5], sun: [0xfff2d6, 2.2], fog: 0xcfe6f6, amb: 0.25 },
  evening: { g: ['#5a5aa8', '#e08a6a', '#ffd29a'], hemi: [0xffd9c0, 0xb89a80, 1.2], sun: [0xffb070, 2.0], fog: 0xf0b890, amb: 0.2 },
  nightroom: { g: ['#1a2040', '#1a2040', '#1a2040'], hemi: [0x8a9ad8, 0x3a3f5a, 0.9], sun: [0xb8c8ff, 0.7], fog: null, amb: 0.2 },
  room: { g: ['#e9e6d6', '#e9e6d6', '#e9e6d6'], hemi: [0xffffff, 0xdccdb6, 1.6], sun: [0xfff6e8, 1.45], fog: null, amb: 0.3 },
};
// Caption chunks from word times [[word, start, end], ...]: up to 3 words and 20 characters; a chunk ends at any , . ? !; lines wrap at 890 px.
export function chunk(W) { const cv = document.createElement('canvas').getContext('2d'); cv.font = '900 94px "Arial Black", Impact, sans-serif'; const clean = s => s.replace(/[.,?!"]/g, '').toUpperCase(), width = ws => cv.measureText(ws.join(' ')).width + (30 + ws.join('').length) * 0 + 30 * (ws.length - 1) + ws.join(' ').length * 1;
  const chunks = []; let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  W.forEach(([t], i) => { if (cur.length && (cur.length >= 3 || (cur.map(j => clean(W[j][0])).join(' ') + ' ' + clean(t)).length > 20)) flush(); cur.push(i); if (/[.,?!]$/.test(t)) flush(); }); flush();
  return chunks.map((c, n) => { const ws = c.map(i => clean(W[i][0])), lines = [[0]]; for (let k = 1; k < ws.length; k++) { if (width(lines[lines.length - 1].map(j => ws[j]).concat(ws[k])) > 890) lines.push([k]); else lines[lines.length - 1].push(k); }
    const t1 = n + 1 < chunks.length ? W[chunks[n + 1][0]][1] - 0.04 : W[c[c.length - 1]][2] + 0.5; return { t0: n ? Math.max(0, W[c[0]][1] - 0.04) : 0, t1: Math.min(t1, W[c[c.length - 1]][2] + 0.9), w: c.map((i, k) => [ws[k], W[i][1]]), lines }; }); }
export function run(shots, caps, opt = {}) {
  const canvas = document.getElementById('c'), capEl = document.getElementById('cap'), snowC = document.getElementById('snow'), sx = snowC.getContext('2d'), fadeEl = document.getElementById('fade'), vigEl = document.getElementById('vig');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const duration = opt.duration ?? 120; shots = shots.slice().sort((a, b) => a.t - b.t); shots.forEach((s, i) => { s.t1 = i + 1 < shots.length ? shots[i + 1].t : duration; s.dur = s.t1 - s.t; });
  const flakes = (() => { const r = K.rng(21); return [...Array(150)].map(() => [r(), r(), 2 + r() * 5, 0.25 + r() * 0.55, r() * 6.28, 0.35 + r() * 0.5]); })();
  function drawSnow(t, a) { sx.clearRect(0, 0, W, H); if (a <= 0) return; for (const [x, y, s, v, ph, al] of flakes) { const yy = ((y + t * v * 0.09) % 1) * (H + 40) - 20, xx = ((x + Math.sin(t * 0.6 + ph) * 0.012 + t * 0.006) % 1) * W; sx.globalAlpha = al * a; sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(xx, yy, s, 0, 7); sx.fill(); } sx.globalAlpha = 1; }
  // captions
  let capNow = null;
  function drawCap(t) { let c = null; for (const k of caps) if (t >= k.t0 && t < k.t1) { c = k; break; } if (!c) { capEl.style.display = 'none'; capNow = null; return; } capEl.style.display = '';
    let act = 0; c.w.forEach(([, wt], i) => { if (t >= wt - 0.02) act = i; }); const key = c.t0 + ':' + act;
    if (capNow !== key) { capNow = key; capEl.innerHTML = c.lines.map(l => `<div>${l.map(i => `<span class="${i === act ? 'on' : ''}">${c.w[i][0]}</span>`).join(' ')}</div>`).join(''); }
    const k = 0.86 + 0.14 * K.easeOut((t - c.t0) / 0.1); capEl.style.transform = `translateX(-50%) scale(${k})`; }
  // shot context
  let cur = null;
  function build(s) {
    if (cur) cur.scene.traverse(o => { if (o.geometry && !o.geometry.userData.keep) { } if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); });
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 2000);
    const S = { scene, cam, dur: s.dur, K, snow: 0, vig: 1, fade: 0, fadeC: '#000', t0: s.t,
      add: (...o) => { o.forEach(x => scene.add(x.root || x)); return o[0]; },
      // lights + sky. o: { sun: [x, y, z] direction the light comes from, size: half-width of the shadow area, at: [x, y, z] centre of the shadow area }
      light(name, o = {}) { const P = SKY[name], sun = o.sun || [-0.5, 1, 0.7], size = o.size || 14, c = o.at || [0, 0, 0];
        scene.add(new THREE.HemisphereLight(P.hemi[0], P.hemi[1], P.hemi[2] * (o.k ?? 1))); scene.add(new THREE.AmbientLight(0xffffff, P.amb));
        const d = new THREE.DirectionalLight(P.sun[0], P.sun[1] * (o.k ?? 1)); d.position.set(c[0] + sun[0] * 40, c[1] + sun[1] * 40, c[2] + sun[2] * 40); d.target.position.set(...c); d.castShadow = true; d.shadow.mapSize.set(2048, 2048); const sc = d.shadow.camera; sc.left = sc.bottom = -size; sc.right = sc.top = size; sc.near = 1; sc.far = 120; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.03; d.shadow.radius = 5; scene.add(d, d.target); S.sunLight = d; const fl = new THREE.DirectionalLight(0xffffff, o.fill ?? 0.75); scene.add(fl, fl.target); S.fillLight = fl;   // soft light from the camera so faces are never dark
        if (name !== 'room' && name !== 'nightroom') { const t = K.canvasTex(8, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, P.g[0]); g.addColorStop(0.42, P.g[1]); g.addColorStop(0.52, P.g[2]); g.addColorStop(1, P.g[2]); x.fillStyle = g; x.fillRect(0, 0, 8, 256); }); const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -10; scene.add(dome); S.dome = dome; if (P.fog != null && o.fog !== false) scene.fog = new THREE.Fog(P.fog, o.fogNear ?? 60, o.fogFar ?? 260); } else scene.background = new THREE.Color(o.bg ?? (name === 'nightroom' ? 0x1a2040 : 0xe9e6d6));
        return S; },
      // snowy ground. o: { size, c, road: true draws two grey tyre tracks along z }
      ground(o = {}) { const size = o.size || 400, g = K.plane(size, size, K.mat(o.c ?? 0xffffff, { map: K.tex(o.tex || 'snow', size / 24, size / 24) })); g.rotation.x = -Math.PI / 2; scene.add(g); if (o.road) for (const x of [-1.6, 1.6]) { const r = K.plane(1.5, size, new THREE.MeshBasicMaterial({ color: 0x9aa6bb, transparent: true, opacity: 0.55, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(x + (o.roadX || 0), 0.02, 0); scene.add(r); } return g; },
      // camera: position, look-at point, vertical field of view
      look(p, l, fov = 35) { cam.position.set(...p); cam.fov = fov; cam.lookAt(...l); cam.updateProjectionMatrix(); },
      // camera move between two set-ups over the shot (u = 0..1), eased
      move(u, a, b) { const e = smooth(u), m = (x, y) => x.map((v, i) => lerp(v, y[i], e)); S.look(m(a.p, b.p), m(a.l, b.l), lerp(a.fov ?? 35, b.fov ?? 35, e)); },
    };
    S.update = s.build(S) || (() => { }); cur = S; return S;
  }
  let curShot = null;
  function frame(t) {
    let s = shots[0]; for (const k of shots) if (t >= k.t - 1e-6) s = k;
    if (s !== curShot) { curShot = s; build(s); }
    const S = cur, lt = t - s.t; S.snow = S.snow; S.update(lt, lt / s.dur, t);
    drawSnow(t, S.snow); vigEl.style.opacity = S.vig; drawCap(t);
    const end = clamp((t - (duration - 1.6)) / 1.5); const f = Math.max(S.fade, end); fadeEl.style.opacity = f; fadeEl.style.background = S.fadeC;
    if (S.fillLight) { S.fillLight.position.copy(S.cam.position); S.cam.getWorldDirection(S.fillLight.target.position).multiplyScalar(10).add(S.cam.position); }
    renderer.render(S.scene, S.cam);
  }
  window.VIDEO = { duration, frame, shots }; frame(0); window.READY = true;
}
```


## `kit.js` (people, faces, props, flowers, flashbacks)

```js
// Kit: blocky toy people with soft rounded edges, faces drawn on a canvas, props, a town, and helpers for flashbacks.
// Units: an adult is about 5.3 tall (legs 2, torso 2, head 1.2). A character stands at its origin (feet on y = 0) and faces +z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
export const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); }, easeOut = u => 1 - Math.pow(1 - clamp(u), 3), easeIn = u => Math.pow(clamp(u), 3);
export const ramp = (t, a, b) => clamp((t - a) / (b - a));           // 0 before a, 1 after b
export const rng = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D = Math.PI / 180;

// ---------- materials and basic shapes ----------
export const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0, ...o });
const gcache = {};
export function rbox(w, h, d, r = 0.12, m, seg = 3) { const k = [w, h, d, r, seg].join(); const g = gcache[k] ||= new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; }
export function box(w, h, d, m) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.castShadow = o.receiveShadow = true; return o; }
export function at(o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx * D, ry * D, rz * D); return o; }
export function grp(...kids) { const g = new THREE.Group(); kids.forEach(k => g.add(k)); return g; }
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
export function plane(w, h, m) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.receiveShadow = true; return o; }

// ---------- faces ----------
// face spec: { eyes: 'dot' | 'wide' | 'happy' | 'shut', brows: '' | 'sad' (inner ends up, the sad look) | 'angry' | 'up', mouth: 'smile' | 'grin' | 'open' | 'laugh' | 'frown' | 'flat' | 'wavy' | 'o' | 'small', tears: 0 | 1 | 2 | 3 (3 = streams), glasses: bool, ink: colour }
const fcache = {};
export function faceTex(f) {
  const k = JSON.stringify(f); if (fcache[k]) return fcache[k];
  return fcache[k] = canvasTex(256, 256, (c, W) => {
    const ink = f.ink || '#17110e'; c.lineCap = c.lineJoin = 'round'; c.strokeStyle = ink; c.fillStyle = ink;
    const ex = 46, ey = 108, eyes = f.eyes || 'dot';
    for (const s of [-1, 1]) { const x = 128 + s * ex;
      if (eyes === 'dot') { c.beginPath(); c.ellipse(x, ey, 12, 16, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 4, ey - 6, 4, 0, 7); c.fill(); c.fillStyle = ink; }
      if (eyes === 'wide') { c.fillStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.arc(x, ey, 21, 0, 7); c.fill(); c.stroke(); c.fillStyle = ink; c.beginPath(); c.arc(x, ey, 8, 0, 7); c.fill(); }
      if (eyes === 'happy') { c.lineWidth = 9; c.beginPath(); c.arc(x, ey + 8, 16, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
      if (eyes === 'shut') { c.lineWidth = 9; c.beginPath(); c.arc(x, ey - 8, 16, Math.PI * 0.12, Math.PI * 0.88); c.stroke(); }
      const b = f.brows; c.lineWidth = 9;
      if (b === 'worry' || b === 'sad') { c.beginPath(); c.moveTo(x + s * 22, ey - 30); c.quadraticCurveTo(x, ey - 40, x - s * 18, ey - 46); c.stroke(); }
      if (b === 'angry') { c.beginPath(); c.moveTo(x - s * 22, ey - 24); c.lineTo(x + s * 20, ey - 40); c.stroke(); }
      if (b === 'up') { c.beginPath(); c.arc(x, ey - 28, 22, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); }
      const tr = f.tears || 0;
      if (tr && (tr >= 2 || s === 1)) { c.fillStyle = '#7fc4ee'; c.strokeStyle = '#3d8fc4'; c.lineWidth = 3;
        if (tr === 3) { c.beginPath(); c.roundRect(x - 7, ey + 14, 14, 92, 7); c.fill(); c.stroke(); }
        else { c.beginPath(); c.moveTo(x + 2, ey + 16); c.quadraticCurveTo(x + 13, ey + 44, x + 2, ey + 52); c.quadraticCurveTo(x - 9, ey + 44, x + 2, ey + 16); c.fill(); c.stroke(); }
        c.fillStyle = ink; c.strokeStyle = ink; }
    }
    if (f.glasses) { c.lineWidth = 8; for (const s of [-1, 1]) { c.beginPath(); c.roundRect(128 + s * ex - 30, ey - 24, 60, 46, 6); c.stroke(); } c.beginPath(); c.moveTo(128 - 16, ey - 4); c.lineTo(128 + 16, ey - 4); c.stroke(); }
    const m = f.mouth || 'smile', my = 168; c.lineWidth = 10;
    if (m === 'smile') { c.beginPath(); c.arc(128, my - 26, 42, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
    if (m === 'small') { c.beginPath(); c.arc(128, my - 18, 26, Math.PI * 0.25, Math.PI * 0.75); c.stroke(); }
    if (m === 'frown') { c.beginPath(); c.arc(128, my + 34, 34, Math.PI * 1.22, Math.PI * 1.78); c.stroke(); }
    if (m === 'flat') { c.beginPath(); c.moveTo(104, my); c.lineTo(152, my); c.stroke(); }
    if (m === 'wavy') { c.lineWidth = 8; c.beginPath(); c.moveTo(98, my + 4); c.quadraticCurveTo(108, my - 12, 118, my); c.quadraticCurveTo(128, my + 12, 138, my); c.quadraticCurveTo(148, my - 12, 158, my + 4); c.stroke(); }
    if (m === 'o') { c.beginPath(); c.ellipse(128, my + 2, 13, 18, 0, 0, 7); c.fill(); c.fillStyle = '#b3423a'; c.beginPath(); c.ellipse(128, my + 8, 7, 9, 0, 0, 7); c.fill(); }
    if (m === 'grin' || m === 'open' || m === 'laugh') { const w = m === 'laugh' ? 46 : 40, h = m === 'grin' ? 26 : m === 'laugh' ? 44 : 36; c.beginPath(); c.moveTo(128 - w, my - 14); c.lineTo(128 + w, my - 14); c.quadraticCurveTo(128 + w, my - 14 + h, 128, my - 14 + h); c.quadraticCurveTo(128 - w, my - 14 + h, 128 - w, my - 14); c.closePath(); c.fill(); c.save(); c.clip();
      if (m === 'grin') { c.fillStyle = '#fff'; c.fillRect(0, my - 14, 256, h); } else { c.fillStyle = '#fff'; c.fillRect(0, my - 14, 256, 9); c.fillStyle = '#e8707a'; c.beginPath(); c.ellipse(128, my - 14 + h, w * 0.6, h * 0.42, 0, 0, 7); c.fill(); } c.restore(); c.lineWidth = 7; c.stroke(); }
  });
}

// ---------- character ----------
// o: { skin, shirt, pants, shoes, cuff (colour of the lower end of the arms; default skin), hands, scale, hat: {kind:'beanie', c, brim} , hair: {kind:'top'|'sides'|'flat'|'bun'|'pig'|'under', c}, scarf: colour, stripe: colour (shirt strip), band: colour (dark band on the shirt), face: {...} }
export function char(o = {}) {
  const root = new THREE.Group(), mats = [], M = c => { const m = mat(c); mats.push(m); return m; };
  const skin = M(o.skin ?? 0xf0d3a8), shirt = M(o.shirt ?? 0x4fae6b), pants = M(o.pants ?? 0x2f3e55), shoes = M(o.shoes ?? o.pants ?? 0x2f3e55), cuff = M(o.cuff ?? o.skin ?? 0xf0d3a8);
  const body = new THREE.Group(); root.add(body);                                    // moves and leans the whole upper body
  const torso = rbox(2, 2, 1, 0.14, shirt); torso.position.y = 3; body.add(torso);
  if (o.stripe != null) body.add(at(rbox(0.62, 1.96, 0.1, 0.04, M(o.stripe)), 0, 3, 0.47));
  if (o.band != null) body.add(at(rbox(2.02, 0.42, 1.02, 0.1, M(o.band)), 0, 2.75, 0));
  const neck = new THREE.Group(); neck.position.y = 4; body.add(neck);
  const head = rbox(1.3, 1.22, 1.3, 0.2, skin); head.position.y = 0.61; neck.add(head);
  const faceM = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }); mats.push(faceM);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.26), faceM); face.position.set(0, 0.61, 0.656); neck.add(face);
  const limb = (x, y, up, low, end, endH) => { const p = new THREE.Group(); p.position.set(x, y, 0); const u = rbox(1, 1, 1, 0.14, up); u.position.y = -0.5 + (y === 2 ? 0 : 0.5); p.add(u);
    const j = new THREE.Group(); j.position.y = u.position.y - 0.5; p.add(j); const l = rbox(1, 1, 1, 0.14, low); l.position.y = -0.5; j.add(l); if (end) { const e = rbox(1.03, endH, 1.03, 0.14, end); e.position.y = -1 + endH / 2 - 0.012; j.add(e); } return { p, j }; };
  const sleeve = o.sleeve != null ? M(o.sleeve) : shirt, hand = o.cuff != null || o.hands != null ? M(o.hands ?? o.cuff) : skin;
  const aL = limb(1.5, 3.5, sleeve, o.bare ? skin : sleeve, hand, 0.34), aR = limb(-1.5, 3.5, sleeve, o.bare ? skin : sleeve, hand, 0.34);   // L = the character's left (+x)
  const lL = limb(0.5, 2, pants, pants, shoes, 0.3), lR = limb(-0.5, 2, pants, pants, shoes, 0.3);
  body.add(aL.p, aR.p); root.add(lL.p, lR.p);
  // hair, hats, scarf
  const hc = o.hair && M(o.hair.c);
  if (o.hair?.kind === 'top') { neck.add(at(rbox(1.38, 0.42, 1.38, 0.14, hc), 0, 1.16, 0), at(rbox(1.38, 0.5, 0.5, 0.12, hc), 0, 0.85, -0.45)); for (const s of [-1, 1]) neck.add(at(rbox(0.16, 0.5, 0.7, 0.06, hc), s * 0.68, 0.86, -0.1)); }
  if (o.hair?.kind === 'flat') neck.add(at(rbox(1.36, 0.46, 1.36, 0.1, hc), 0, 1.24, 0));
  if (o.hair?.kind === 'sides') for (const s of [-1, 1]) neck.add(at(rbox(0.2, 0.62, 0.9, 0.08, hc), s * 0.7, 0.72, -0.12));
  if (o.hair?.kind === 'bun') { neck.add(at(rbox(1.4, 0.5, 1.4, 0.16, hc), 0, 1.12, -0.02), at(rbox(1.4, 0.7, 0.4, 0.12, hc), 0, 0.72, -0.52)); const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 14), hc); b.castShadow = true; neck.add(at(b, 0, 1.55, -0.2)); }
  if (o.hair?.kind === 'under' || o.hair?.kind === 'pig') { neck.add(at(rbox(1.36, 0.5, 1.2, 0.1, hc), 0, 0.86, -0.12)); }
  if (o.hair?.kind === 'pig') for (const s of [-1, 1]) neck.add(at(rbox(0.42, 0.95, 0.5, 0.16, hc), s * 0.88, 0.48, -0.05, 0, 0, s * 24));
  if (o.hat) { const hm = M(o.hat.c), bm = M(o.hat.brim ?? 0xf4f2ee); neck.add(at(rbox(1.46, 0.4, 1.46, 0.18, bm), 0, 1.16, 0), at(rbox(1.34, 0.62, 1.34, 0.28, hm), 0, 1.56, 0)); const pm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), M(o.hat.pom ?? 0xf4f2ee)); pm.castShadow = true; neck.add(at(pm, 0, 2.0, 0)); }
  if (o.scarf != null) { const sm = M(o.scarf); body.add(at(rbox(1.62, 0.44, 1.42, 0.2, sm), 0, 4.02, 0), at(rbox(0.42, 1.25, 0.2, 0.1, sm), 0.42, 3.4, 0.56, -4)); }
  const s = o.scale ?? 1; root.scale.setScalar(s);
  const C = { root, body, neck, head, aL, aR, lL, lR, mats, scale: s, o,
    face(f) { C._f = { ...(o.face || {}), ...f }; faceM.map = faceTex(C._f); faceM.needsUpdate = true; return C; },
    // pose: aL / aR: [forward, out, elbow] degrees; lL / lR: [forward, knee]; head: [yaw, pitch, roll]; lean: [forward, side]; turn: body yaw
    pose(p = {}) { const A = (a, v, sgn) => { if (!v) return; a.p.rotation.set(-(v[0] || 0) * D, 0, sgn * (v[1] || 0) * D); a.j.rotation.x = -(v[2] || 0) * D; };
      A(aL, p.aL, 1); A(aR, p.aR, -1); const L = (l, v) => { if (!v) return; l.p.rotation.x = -(v[0] || 0) * D; l.j.rotation.x = (v[1] || 0) * D; }; L(lL, p.lL); L(lR, p.lR);
      if (p.head) neck.rotation.set((p.head[1] || 0) * D, (p.head[0] || 0) * D, (p.head[2] || 0) * D, 'YXZ'); if (p.lean) { body.rotation.x = (p.lean[0] || 0) * D; body.rotation.z = (p.lean[1] || 0) * D; const v = new THREE.Vector3(0, 2, 0).applyEuler(body.rotation); body.position.set(-v.x, 2 - v.y, -v.z); } if (p.turn != null) body.rotation.y = p.turn * D; return C; },
    // walk / run cycle: ph in turns (1 = one full stride pair), amp in degrees
    walk(ph, amp = 32, run = 0) { const a = Math.sin(ph * 6.2832) * amp, k = x => Math.max(0, -x) * (0.6 + run * 0.9); C.pose({ lL: [a, k(Math.sin(ph * 6.2832 + 0.6) * amp)], lR: [-a, k(Math.sin(ph * 6.2832 + 3.74) * amp)], aL: [-a * (0.9 + run * 0.3), 4, 8 + run * 60], aR: [a * (0.9 + run * 0.3), 4, 8 + run * 60] }); body.position.y = Math.abs(Math.cos(ph * 6.2832)) * (0.06 + run * 0.14); return C; },
    // twist the arms inward so they can cross the body or hold something in front (degrees); sit: thighs forward, shins down (then lower the root so the hips, y = 2 x scale, sit on the seat)
    twist(l, r = l) { aL.p.rotation.y = -l * D; aR.p.rotation.y = r * D; return C; },
    sit() { return C.pose({ lL: [90, 90], lR: [90, 90] }); },
    stand() { aL.p.rotation.y = aR.p.rotation.y = 0; body.position.set(0, 0, 0); return C.pose({ aL: [0, 3, 4], aR: [0, 3, 4], lL: [0, 0], lR: [0, 0], head: [0, 0, 0], lean: [0, 0], turn: 0 }); },
    place(x, y, z, ry = 0) { root.position.set(x, y, z); root.rotation.y = ry * D; return C; },
    // ghost fade: a = 1 solid, 0 gone; tint pulls the colours toward a pale colour
    alpha(a, tint) { for (const m of mats) { m.transparent = a < 1 || m === faceM; m.opacity = a; m.depthWrite = a > 0.98 && m !== faceM; if (tint != null && m.color && m !== faceM) { m.userData.c ||= m.color.clone(); m.color.copy(m.userData.c).lerp(new THREE.Color(tint[0]), tint[1]); } } root.visible = a > 0.005; root.traverse(x => { if (x.isMesh) x.castShadow = a > 0.6; }); return C; },
  };
  C.face(o.face || {}); C.stand(); return C;
}
// The cast. Colours measured from the reference frames.
export const CAST = {
  oldman: { skin: 0xecc9a4, shirt: 0x6b7b8f, stripe: 0x9aa39f, pants: 0x2a2623, shoes: 0x1c1a19, hair: { kind: 'sides', c: 0xf1f1f1 }, face: { glasses: true, mouth: 'smile' } },
  boy: { skin: 0xd79a5e, shirt: 0x58dcb0, pants: 0x2c3f55, shoes: 0x1e2a3a, hair: { kind: 'flat', c: 0x1d1b1b }, scale: 0.74, face: { mouth: 'smile' } },
  woman: { skin: 0xc98a4a, shirt: 0xf2a23c, pants: 0x3a4a63, shoes: 0x222a36, hair: { kind: 'bun', c: 0x4a2f24 }, face: { mouth: 'grin' } },
  me: { skin: 0xf3dcae, shirt: 0x55bf6d, pants: 0x2d4763, shoes: 0x6b3f2a, cuff: 0xe0453e, hair: { kind: 'under', c: 0x6b3d28 }, hat: { c: 0xe9524b }, scarf: 0xf2d84a, scale: 0.9, face: { mouth: 'smile' } },
  lily: { skin: 0xf3dcc0, shirt: 0xf0d05a, pants: 0x6a63c4, shoes: 0xa03a78, cuff: 0xf06aa8, hair: { kind: 'pig', c: 0xa5673a }, hat: { c: 0xf582b8 }, scale: 0.68, face: { mouth: 'open' } },
  dad: { skin: 0xf3dcae, shirt: 0x3f7fb5, band: 0x2f5f8f, pants: 0x3a3a3c, shoes: 0x2a2a2c, hair: { kind: 'top', c: 0x5a4030 }, face: { mouth: 'small' } },
  mom: { skin: 0x8a5a3c, shirt: 0xb060c8, pants: 0x232126, shoes: 0x1a181c, hair: { kind: 'bun', c: 0x3a2620 }, face: { mouth: 'frown', tears: 1 } },
};
export const cast = (name, extra = {}) => char({ ...CAST[name], ...extra });

// ---------- textures ----------
export const TEX = {
  siding: c => canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(0,0,0,0.13)'; for (let y = 0; y < H; y += 32) x.fillRect(0, y, W, 4); }),
  dots: () => canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#e9e6d6'; x.fillRect(0, 0, W, H); x.fillStyle = '#d8d4c2'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + (j % 2 ? 48 : 16), j * 64 + 32, 7, 0, 7); x.fill(); } }),
  wood: () => canvasTex(512, 512, (x, W, H) => { x.fillStyle = '#b9834c'; x.fillRect(0, 0, W, H); const r = rng(7); for (let y = 0; y < H; y += 64) { x.fillStyle = `rgba(${r() > 0.5 ? '255,220,170' : '80,40,10'},${0.06 + r() * 0.08})`; x.fillRect(0, y, W, 64); x.fillStyle = 'rgba(70,35,10,0.5)'; x.fillRect(0, y, W, 4); } }),
  snow: () => canvasTex(512, 512, (x, W, H) => { x.fillStyle = '#eceef3'; x.fillRect(0, 0, W, H); const r = rng(3); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '150,165,195'},${r() * 0.18})`; x.beginPath(); x.arc(r() * W, r() * H, 2 + r() * 9, 0, 7); x.fill(); } }),
};
const rep = (t, a, b) => { t = t.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); t.needsUpdate = true; return t; };
let _t = {}; export const tex = (n, a = 1, b = 1) => rep(_t[n] ||= TEX[n](), a, b);

// ---------- town props ----------
export function house(o = {}) { const { w = 9, h = 7, d = 8, c = 0xd8bd97, roof = 0x9a5546, door = 0x6a3f24, porch = true } = o, g = new THREE.Group();
  const wall = box(w, h, d, mat(c, { map: tex('siding', 1, h / 1.1) })); wall.position.y = h / 2; g.add(wall);
  const rh = w * 0.42, sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.5, 0); sh.lineTo(w / 2 + 0.5, 0); sh.lineTo(0, rh); sh.closePath();
  const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d + 0.8, bevelEnabled: false }), mat(roof)); gable.position.set(0, h, -d / 2 - 0.4); gable.castShadow = gable.receiveShadow = true; g.add(gable);
  const gw = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, rh - 0.45); s.closePath(); return s; })(), { depth: d - 0.1, bevelEnabled: false }), mat(c)); gw.position.set(0, h - 0.02, -d / 2 + 0.05); g.add(gw);
  g.add(at(box(0.9, 2.2, 0.9, mat(0x8a3a2a)), w * 0.22, h + rh * 0.62, 0), at(box(1.1, 0.25, 1.1, mat(roof)), w * 0.22, h + rh * 0.62 + 1.2, 0));
  const win = mat(0xf7ecc8, { emissive: 0xf7e2a8, emissiveIntensity: 0.55 }), frame = mat(0xf4f4f4);
  for (const [x, y] of [[-w * 0.27, h * 0.68], [w * 0.27, h * 0.68], [-w * 0.27, h * 0.3], [w * 0.27, h * 0.3]]) { g.add(at(box(1.5, 1.5, 0.1, frame), x, y, d / 2 + 0.02), at(box(1.2, 1.2, 0.12, win), x, y, d / 2 + 0.04)); }
  g.add(at(box(1.3, 2.4, 0.14, mat(door)), 0, 1.5, d / 2 + 0.05));
  if (porch) { g.add(at(box(w * 0.5, 0.3, 2.2, mat(0x8a4a30)), 0, 0.45, d / 2 + 1.1), at(box(w * 0.54, 0.22, 2.5, mat(roof)), 0, 3.3, d / 2 + 1.2), at(box(w * 0.5, 0.2, 2.3, mat(0x7a3528)), 0, 3.12, d / 2 + 1.15)); for (const s of [-1, 1]) g.add(at(box(0.22, 2.7, 0.22, mat(0xf0f0f0)), s * w * 0.23, 1.8, d / 2 + 2.05)); for (let i = 0; i < 2; i++) g.add(at(box(w * 0.3, 0.2, 0.5, mat(0x8a4a30)), 0, 0.12 + i * 0.16, d / 2 + 2.5 - i * 0.3)); }
  return g; }
export function pine(h = 6, snow = true) { const g = new THREE.Group(), gm = mat(0x1f4a2d), sm = mat(0xf2f4f8), n = 3; g.add(at(box(0.5, h * 0.3, 0.5, mat(0x5a3422)), 0, h * 0.15, 0));
  for (let i = 0; i < n; i++) { const r = h * 0.34 * (1 - i * 0.24), y = h * (0.26 + i * 0.22), c = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.36, 7), gm); c.position.y = y + h * 0.1; c.castShadow = true; g.add(c); if (snow) { const s = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, h * 0.14, 7), sm); s.position.y = y + h * 0.215; g.add(s); } } return g; }
export function lamp(h = 7) { const g = new THREE.Group(), m = mat(0x1c1f25); g.add(at(box(0.22, h, 0.22, m), 0, h / 2, 0), at(box(1.4, 0.16, 0.2, m), 0.6, h, 0), at(box(0.7, 0.2, 0.36, m), 1.2, h - 0.12, 0), at(box(0.5, 0.08, 0.28, mat(0xfff3c0, { emissive: 0xffe9a0, emissiveIntensity: 1.2 })), 1.2, h - 0.26, 0)); return g; }
export function table(w = 6, d = 3, c = 0xf4f3ee) { const g = new THREE.Group(), wm = mat(0x9a6238); g.add(at(rbox(w, 0.22, d, 0.06, mat(c)), 0, 2.3, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.26, 2.2, 0.26, wm), sx * (w / 2 - 0.3), 1.1, sz * (d / 2 - 0.3))); return g; }
export function chair(c = 0xc48a50) { const g = new THREE.Group(), m = mat(c); g.add(at(rbox(1.5, 0.2, 1.5, 0.05, m), 0, 1.5, 0), at(rbox(1.5, 2.4, 0.2, 0.05, m), 0, 2.7, -0.65)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.18, 1.5, 0.18, m), sx * 0.6, 0.75, sz * 0.6)); return g; }
export function plate(food = 0xd9382c) { const g = new THREE.Group(), p = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.08, 24), mat(0xf4f4f4)); p.receiveShadow = true; g.add(p); if (food != null) g.add(at(rbox(0.9, 0.28, 0.55, 0.12, mat(food)), 0, 0.18, 0)); return g; }
export function pancakes(n = 5, r = 1.1) { const g = new THREE.Group(), top = canvasTex(256, 256, (x, W) => { x.fillStyle = '#e7c489'; x.fillRect(0, 0, W, W); x.fillStyle = '#5a3320'; const q = rng(11); for (let i = 0; i < 16; i++) { const a = q() * 6.28, d = q() * 100; x.beginPath(); x.ellipse(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, 7 + q() * 4, 5 + q() * 3, q() * 3, 0, 7); x.fill(); } });
  const side = mat(0xdcb878), tm = mat(0xffffff, { map: top }); for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.2, 28), [side, tm, side]); c.position.y = 0.1 + i * 0.215; c.castShadow = c.receiveShadow = true; g.add(c); const e = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 4, 40), new THREE.MeshBasicMaterial({ color: 0x3a2a1a })); e.rotation.x = Math.PI / 2; e.position.y = c.position.y + 0.1; g.add(e); }
  g.add(at(rbox(0.5, 0.2, 0.4, 0.05, mat(0xfbf6dc)), 0, n * 0.215 + 0.12, 0)); return g; }
export function clock(r = 1, hour = 8, minute = 0) { const t = canvasTex(512, 512, (x, W) => { x.fillStyle = '#1b1b1d'; x.beginPath(); x.arc(256, 256, 252, 0, 7); x.fill(); x.fillStyle = '#fbfbf7'; x.beginPath(); x.arc(256, 256, 226, 0, 7); x.fill(); x.fillStyle = '#1b1b1d'; x.font = '800 62px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * 6.2832; x.fillText(i, 256 + Math.sin(a) * 178, 256 - Math.cos(a) * 178); }
    x.strokeStyle = '#1b1b1d'; x.lineCap = 'round'; const hand = (a, l, w) => { x.lineWidth = w; x.beginPath(); x.moveTo(256, 256); x.lineTo(256 + Math.sin(a) * l, 256 - Math.cos(a) * l); x.stroke(); }; hand((hour + minute / 60) / 12 * 6.2832, 110, 16); hand(minute / 60 * 6.2832, 165, 10); x.beginPath(); x.arc(256, 256, 14, 0, 7); x.fill(); });
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); return m; }
export function mirror(w = 3.4, h = 4.6) { const g = new THREE.Group(); g.add(at(rbox(w + 0.5, h + 0.5, 0.22, 0.06, mat(0x7a4a34)), 0, 0, 0)); const glass = plane(w, h, new THREE.MeshBasicMaterial({ color: 0xe9eef2 })); glass.position.z = 0.12; g.add(glass); g.userData.glass = glass; return g; }
export function sheet(w = 3.9, h = 5.2) { const m = rbox(w, h, 0.16, 0.08, mat(0xf6f4ee)); return m; }
export function tv() { const g = new THREE.Group(); g.add(at(rbox(4.2, 2.5, 0.22, 0.06, mat(0x17181c)), 0, 3.3, 0), at(plane(3.9, 2.2, new THREE.MeshBasicMaterial({ color: 0x3aa4e8 })), 0, 3.3, 0.12), at(rbox(3.6, 1.9, 1.3, 0.06, mat(0x5a3626)), 0, 0.95, 0), at(box(0.3, 0.3, 0.2, mat(0x17181c)), 0, 2.0, 0)); g.userData.screen = g.children[1]; return g; }
export function couch(c = 0xa0489a) { const g = new THREE.Group(), m = mat(c); g.add(at(rbox(5, 1.1, 2.2, 0.3, m), 0, 0.9, 0), at(rbox(5, 2.2, 0.7, 0.3, m), 0, 1.9, -0.9)); for (const s of [-1, 1]) g.add(at(rbox(0.7, 1.7, 2.2, 0.3, m), s * 2.6, 1.2, 0)); return g; }
export function newspaper() { const t = canvasTex(256, 320, (x, W, H) => { x.fillStyle = '#efece2'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2a2a'; x.fillRect(16, 18, W - 32, 34); x.fillStyle = '#8a8a86'; for (let y = 70; y < H - 16; y += 14) x.fillRect(16, y, (y % 42 ? W - 32 : W - 90), 6); x.fillStyle = '#b7b3a6'; x.fillRect(150, 70, 90, 70); }); const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 1.9), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.castShadow = true; return m; }
export function dog(c = 0xe9c178) { const g = new THREE.Group(), m = mat(c), dk = mat(0xc9973f); g.add(at(rbox(1.3, 1.2, 2.3, 0.2, m), 0, 1.35, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(rbox(0.42, 0.9, 0.42, 0.12, m), sx * 0.4, 0.45, sz * 0.8));
  const h = new THREE.Group(); h.position.set(0, 2.1, 1.1); h.add(rbox(1.3, 1.2, 1.2, 0.22, m), at(rbox(0.75, 0.6, 0.75, 0.16, mat(0xf3d9a0)), 0, -0.22, 0.75), at(rbox(0.3, 0.22, 0.2, 0.08, mat(0x1c1512)), 0, -0.02, 1.14)); for (const s of [-1, 1]) { h.add(at(rbox(0.3, 0.75, 0.6, 0.12, dk), s * 0.72, 0.1, -0.1, 0, 0, s * 12)); const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0x15100e })); h.add(at(e, s * 0.32, 0.2, 0.61)); } g.add(h); g.add(at(rbox(0.26, 0.26, 0.9, 0.1, m), 0, 1.8, -1.4, 35)); g.userData.head = h; return g; }
// brass plaque on a stone block: "THE ONE RULE / NEVER TELL A VISITOR"
export function plaque() { const g = new THREE.Group(); g.add(at(rbox(4.6, 4.2, 1.6, 0.12, mat(0x9a9896)), 0, 2.1, 0), at(rbox(5, 0.5, 2, 0.2, mat(0xf2f3f6)), 0, 4.4, 0));
  const t = canvasTex(512, 512, (x, W) => { x.fillStyle = '#6a4a22'; x.fillRect(0, 0, W, W); x.strokeStyle = '#e2c05a'; x.lineWidth = 10; x.strokeRect(26, 26, W - 52, W - 52); x.fillStyle = '#e8cd78'; x.textAlign = 'center'; x.font = '700 50px Georgia'; x.fillText('THE ONE RULE', 256, 130); x.fillRect(120, 168, 272, 6); x.font = '700 58px Georgia'; x.fillText('NEVER TELL', 256, 280); x.fillText('A VISITOR', 256, 372); });
  g.add(at(plane(3.6, 3.6, new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, metalness: 0.3 })), 0, 2.2, 0.81)); return g; }
export function sign(text = 'MILLER POND') { const g = new THREE.Group(), t = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#7a3a2c'; x.fillRect(0, 0, W, H); x.fillStyle = '#f3ead8'; x.font = '700 64px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2); }); g.add(at(box(4, 2, 0.2, new THREE.MeshStandardMaterial({ map: t })), 0, 3, 0)); for (const s of [-1, 1]) g.add(at(box(0.25, 4, 0.25, mat(0x5a3422)), s * 1.7, 2, -0.05)); return g; }
// the hole in the ice: a black disc with white cracks, lying flat (y up)
export function iceHole(r = 2.2) { const t = canvasTex(512, 512, (x, W) => { const q = rng(5); x.clearRect(0, 0, W, W); x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 3; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28 + q() * 0.3; x.beginPath(); x.moveTo(256 + Math.cos(a) * 110, 256 + Math.sin(a) * 110); let px = 256 + Math.cos(a) * 110, py = 256 + Math.sin(a) * 110; for (let k = 0; k < 4; k++) { px += Math.cos(a + (q() - 0.5)) * 34; py += Math.sin(a + (q() - 0.5)) * 34; x.lineTo(px, py); } x.stroke(); }
    x.fillStyle = '#07090c'; x.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.2832, rr = 122 + (q() - 0.5) * 22; x[i ? 'lineTo' : 'moveTo'](256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr * 0.86); } x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 4; for (let i = 0; i < 7; i++) { const a = q() * 6.28; x.beginPath(); x.moveTo(256, 256); x.lineTo(256 + Math.cos(a) * 118, 256 + Math.sin(a) * 100); x.stroke(); } });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2.1, r * 2.1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; }
// a trail of footprints on the ground: pts = [[x, z], ...] centres of steps; size = foot length
export function prints(pts, size = 0.5, c = 0x5b6f9e) { const g = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 12), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, depthWrite: false }), pts.length), o = new THREE.Object3D(); pts.forEach(([x, z, ry = 0], i) => { o.position.set(x, 0.03, z); o.rotation.set(-Math.PI / 2, 0, ry); o.scale.set(size * 0.5, size, 1); o.updateMatrix(); g.setMatrixAt(i, o.matrix); }); g.count = pts.length; g.userData.n = pts.length; g.frustumCulled = false; return g; }
export function trail(x0, z0, x1, z1, n, wob = 0.22) { const p = []; for (let i = 0; i < n; i++) { const u = i / (n - 1), dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), s = i % 2 ? 1 : -1; p.push([lerp(x0, x1, u) + -dz / L * wob * s, lerp(z0, z1, u) + dx / L * wob * s, Math.atan2(dx, dz)]); } return p; }
// white balls that burst out (ice chips, splash): returns { g, set(t) } with t in seconds since the burst
export function burst(n = 26, c = 0xf4f6fa, seed = 9, size = 0.16, speed = 5) { const q = rng(seed), g = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat(c), n), P = [...Array(n)].map(() => { const a = q() * 6.28, r = 0.3 + q() * 0.9; return [Math.cos(a) * r, 0.9 + q() * 1.6, Math.sin(a) * r, size * (0.6 + q())]; }), o = new THREE.Object3D();
  return { g, set(t) { P.forEach((p, i) => { const y = p[1] * speed * t - 9 * t * t; o.position.set(p[0] * speed * t, Math.max(0.05, y), p[2] * speed * t); o.scale.setScalar(t < 0 ? 0 : p[3]); o.updateMatrix(); g.setMatrixAt(i, o.matrix); }); g.instanceMatrix.needsUpdate = true; } }; }
// a glowing sun disc that always faces the camera
export function sunDisc(r = 3, c = '255,236,170') { const t = canvasTex(256, 256, x => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.32, `rgba(${c},0.95)`); g.addColorStop(0.42, `rgba(${c},0.45)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, fog: false, toneMapped: false })); s.scale.setScalar(r * 2.6); return s; }
// a row of houses along x (for streets). colours cycle.
export const HOUSE_COLS = [0xd8bd97, 0xc9b3dc, 0xa9c6a8, 0xd9c3a0, 0xb9c4d8];
export function street(n = 6, gap = 13, z = -14, seed = 2) { const g = new THREE.Group(), q = rng(seed); for (let i = 0; i < n; i++) { const hh = 6 + q() * 2, h = house({ c: HOUSE_COLS[i % HOUSE_COLS.length], h: hh, w: 8 + q() * 2 }); h.position.set((i - (n - 1) / 2) * gap, 0, z); g.add(h); const p = pine(5 + q() * 3); p.position.set((i - (n - 1) / 2) * gap + gap * 0.5, 0, z + 5 + q() * 3); g.add(p); } return g; }
// room: floor + back wall (+ optional side wall). width w, depth d, height h. Back wall at z = -d/2.
export function room(o = {}) { const { w = 16, d = 12, h = 10, wall = 'dots', wallC = 0xffffff, floor = 'wood' } = o, g = new THREE.Group(); const f = plane(w, d, mat(0xffffff, { map: tex(floor, w / 8, d / 8) })); f.rotation.x = -Math.PI / 2; g.add(f);
  const mk = () => mat(wallC, { map: tex(wall, w / 3, h / 3) }); g.add(at(plane(w, h, mk()), 0, h / 2, -d / 2)); g.add(at(plane(d, h, mk()), -w / 2, h / 2, 0, 0, 90)); g.add(at(plane(d, h, mk()), w / 2, h / 2, 0, 0, -90)); g.add(at(box(w, 0.5, 0.12, mat(0x9a6238)), 0, 0.25, -d / 2 + 0.06)); return g; }
// the town street: a road along z (x = 0), a row of houses on each side facing the road, pines and lamps between them. Returns a Group.
export function town(o = {}) { const { n = 7, gap = 13, off = 12, seed = 4 } = o, g = new THREE.Group(), q = rng(seed);
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) { const z = (i - (n - 1) / 2) * gap + (s > 0 ? gap * 0.4 : 0), h = house({ c: HOUSE_COLS[(i * 2 + (s > 0 ? 1 : 0) + seed) % HOUSE_COLS.length], h: 6 + q() * 1.6, w: 8.5 + q() * 1.5 }); h.position.set(s * off, 0, z); h.rotation.y = -s * Math.PI / 2; g.add(h);
    const p = pine(4.5 + q() * 3); p.position.set(s * (off - 5.5 - q() * 1.5), 0, z + gap * 0.5); g.add(p); if (i % 2 === 0) { const l = lamp(); l.position.set(s * 4.2, 0, z + gap * 0.25); l.rotation.y = s > 0 ? Math.PI : 0; g.add(l); } }
  return g; }
// a ring of pines around a point (the pond): returns a Group
export function pines(n = 14, r0 = 14, r1 = 30, seed = 6, arc = [0, 6.2832]) { const g = new THREE.Group(), q = rng(seed); for (let i = 0; i < n; i++) { const a = arc[0] + (arc[1] - arc[0]) * (i + q() * 0.6) / n, r = r0 + q() * (r1 - r0), p = pine(6 + q() * 4); p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.add(p); } return g; }

// ================= summer cast, home props, and one example of a story's special thing (flowers that grow) =================
Object.assign(CAST, {
  kid: { skin: 0xf3dcae, shirt: 0x55bf6d, pants: 0x2d4763, shoes: 0x6b3f2a, bare: true, hair: { kind: 'top', c: 0x6b3d28 }, scale: 0.9, face: { mouth: 'small' } },                 // the narrator, 12 (summer: no hat, short sleeves)
  mama: { skin: 0xf0d6b0, shirt: 0x9db3c9, pants: 0x4a5568, shoes: 0x3a3a40, hair: { kind: 'bun', c: 0x7a5236 }, face: { mouth: 'small' } },                                          // Mom: thin pale-blue sweater, tired
  school1: { skin: 0xd79a5e, shirt: 0xe9524b, pants: 0x2c3f55, shoes: 0x1e2a3a, bare: true, hair: { kind: 'flat', c: 0x1d1b1b }, scale: 0.88, face: { mouth: 'grin' } },
  school2: { skin: 0xf3dcc0, shirt: 0xf2a23c, pants: 0x3a4a63, shoes: 0x222a36, bare: true, hair: { kind: 'pig', c: 0xd9b24a }, scale: 0.86, face: { mouth: 'grin' } },
  school3: { skin: 0x8a5a3c, shirt: 0x58a4dc, pants: 0x30343c, shoes: 0x1a181c, bare: true, hair: { kind: 'top', c: 0x1d1b1b }, scale: 0.9, face: { mouth: 'grin' } },
  neighbor1: { skin: 0xecc9a4, shirt: 0x8a6fb0, pants: 0x3a3a3c, shoes: 0x2a2a2c, hair: { kind: 'bun', c: 0xc9c9c9 }, face: { mouth: 'frown' } },
  neighbor2: { skin: 0xc98a4a, shirt: 0x6b7b8f, stripe: 0x9aa39f, pants: 0x2a2623, shoes: 0x1c1a19, hair: { kind: 'sides', c: 0x3a2a20 }, face: { mouth: 'frown', glasses: true } },
});
TEX.grass = () => canvasTex(512, 512, (x, W, H) => { x.fillStyle = '#7fbf5a'; x.fillRect(0, 0, W, H); const r = rng(8); for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '170,220,110' : '70,140,60'},${0.1 + r() * 0.2})`; x.beginPath(); x.ellipse(r() * W, r() * H, 3 + r() * 8, 2 + r() * 4, r() * 3, 0, 7); x.fill(); } });
TEX.dirt = () => canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#8a6a4a'; x.fillRect(0, 0, W, H); const r = rng(9); for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '60,40,25' : '170,140,100'},${0.1 + r() * 0.25})`; x.beginPath(); x.arc(r() * W, r() * H, 2 + r() * 7, 0, 7); x.fill(); } });
TEX.tile = () => canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#e6e0d2'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c9c1ae'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, H); x.moveTo(0, i * 64); x.lineTo(W, i * 64); x.stroke(); } });
// One flower. kind 'daisy' (white petals, yellow middle) or 'rose' (red, layered) or a petal colour number. Stands on y = 0, about 1.6 tall at scale 1.
// Returns a Group with .grow(u): u = 0 nothing, 1 full (stem rises first, then the head opens with a small bounce).
export function flower(kind = 'daisy', s = 1) { const g = new THREE.Group(), stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1, 8), mat(0x3f9a45)); stem.castShadow = true; g.add(stem);
  const leaf = rbox(0.34, 0.06, 0.16, 0.03, mat(0x4fb04f)); g.add(leaf); const head = new THREE.Group(); g.add(head);
  if (kind === 'rose') { const m1 = mat(0xd92b3a), m2 = mat(0xb81f30); head.add(at(rbox(0.5, 0.36, 0.5, 0.14, m1), 0, 0.1, 0), at(rbox(0.36, 0.3, 0.36, 0.1, m2), 0, 0.3, 0, 0, 45), at(rbox(0.2, 0.2, 0.2, 0.06, m1), 0, 0.46, 0)); for (let i = 0; i < 4; i++) head.add(at(rbox(0.3, 0.08, 0.18, 0.04, mat(0x3f9a45)), Math.cos(i * 1.571) * 0.24, -0.06, Math.sin(i * 1.571) * 0.24, 0, -i * 90, 0)); }
  else { const pc = kind === 'daisy' ? 0xffffff : kind, pm = mat(pc), n = 8; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, p = rbox(0.34, 0.07, 0.18, 0.035, pm); p.position.set(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26); p.rotation.y = -a; head.add(p); } const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 14), mat(0xf4c93a)); c.position.y = 0.03; c.castShadow = true; head.add(c); head.rotation.x = 0.5; }
  g.scale.setScalar(s);
  g.grow = u => { const a = clamp(u / 0.6), b = clamp((u - 0.45) / 0.55), h = 1.5 * easeOut(a); g.visible = u > 0.001; stem.scale.y = Math.max(0.001, h); stem.position.y = h / 2; leaf.position.set(0.18, h * 0.45, 0); leaf.scale.setScalar(Math.max(0.001, a)); head.position.y = h; const k = b <= 0 ? 0.001 : 1 + 0.25 * Math.sin(b * Math.PI) * (1 - b) + (b - 1) * 0; head.scale.setScalar(Math.max(0.001, easeOut(b) * k)); return g; };
  g.grow(1); return g; }
// A whole patch of flowers (cheap: instanced). area = [x0, z0, x1, z1]. Returns a Group with .grow(u) (all rise together) and .userData.pts.
// keep(x, z) can cut holes (a path, a doorstep). Colours: mostly white daisies and red roses, some yellow and pink.
export function flowerField(n = 400, area = [-10, -10, 10, 10], seed = 3, o = {}) { const q = rng(seed), g = new THREE.Group(), pts = []; let guard = 0;
  while (pts.length < n && guard++ < n * 20) { const x = lerp(area[0], area[2], q()), z = lerp(area[1], area[3], q()); if (o.keep && !o.keep(x, z)) continue; pts.push([x, z, 0.7 + q() * 0.7, q()]); }
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 1, 6), mat(0x3f9a45), pts.length), heads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ roughness: 0.8, flatShading: true }), pts.length), mids = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), mat(0xf4c93a), pts.length);
  const C = [0xffffff, 0xffffff, 0xd92b3a, 0xd92b3a, 0xf4c93a, 0xf582b8, 0xb86be0], col = new THREE.Color(), d = new THREE.Object3D(); pts.forEach((p, i) => { heads.setColorAt(i, col.set(C[Math.floor(p[3] * C.length)])); });
  g.add(stems, heads, mids); stems.castShadow = heads.castShadow = true; g.userData.pts = pts; const base = o.y || 0;
  g.grow = u => { pts.forEach(([x, z, s, r], i) => { const uu = clamp((u - r * 0.3) / 0.7), h = 1.4 * s * easeOut(clamp(uu / 0.6)), k = easeOut(clamp((uu - 0.4) / 0.6)) * s; d.rotation.set(0, 0, 0); d.position.set(x, base + h / 2, z); d.scale.set(s, Math.max(0.001, h), s); d.updateMatrix(); stems.setMatrixAt(i, d.matrix); d.position.set(x, base + h, z); d.scale.set(Math.max(0.001, k), Math.max(0.001, k * 0.55), Math.max(0.001, k)); d.updateMatrix(); heads.setMatrixAt(i, d.matrix); d.position.y = base + h + 0.12 * k; d.scale.setScalar(Math.max(0.001, k)); d.updateMatrix(); mids.setMatrixAt(i, d.matrix); }); stems.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = mids.instanceMatrix.needsUpdate = true; return g; };
  g.grow(1); stems.frustumCulled = heads.frustumCulled = mids.frustumCulled = false; return g; }
// home props
export function stove() { const g = new THREE.Group(); g.add(at(rbox(3, 3, 2.2, 0.08, mat(0xe9e9ea)), 0, 1.5, 0), at(rbox(2.6, 1.6, 0.1, 0.05, mat(0x2a2c30)), 0, 1.3, 1.12), at(rbox(3, 0.12, 2.2, 0.04, mat(0x2a2c30)), 0, 3.06, 0)); for (const x of [-0.7, 0.7]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20), mat(0x55585e)); b.position.set(x, 3.15, 0.2); g.add(b); } return g; }
export function pan(egg = true) { const g = new THREE.Group(), p = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.16, 24), mat(0x2a2c30)); p.castShadow = true; g.add(p, at(rbox(1.1, 0.1, 0.16, 0.04, mat(0x2a2c30)), 1.1, 0.02, 0)); if (egg) g.add(friedEgg().translateY(0.1)); return g; }
export function friedEgg(s = 1) { const g = new THREE.Group(), w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.06, 18), mat(0xfbfbf6)); w.scale.set(1.15, 1, 0.95); const y = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), mat(0xf7b928)); y.scale.y = 0.6; y.position.set(0.04, 0.05, 0); g.add(w, y); g.scale.setScalar(s); return g; }
export function bed(c = 0x5a86c9) { const g = new THREE.Group(), wood = mat(0x9a6238); g.add(at(rbox(4, 0.7, 7.4, 0.1, wood), 0, 0.7, 0), at(rbox(3.8, 0.6, 7.1, 0.2, mat(0xf4f1ea)), 0, 1.3, 0), at(rbox(4.2, 2.4, 0.3, 0.1, wood), 0, 1.6, -3.7), at(rbox(2.4, 0.4, 1.2, 0.18, mat(0xffffff)), 0, 1.75, -2.8)); const b = rbox(3.9, 0.3, 4.6, 0.14, mat(c)); b.position.set(0, 1.7, 1.1); g.add(b); g.userData.blanket = b; return g; }
export function blanket(c = 0xc9a45a, w = 3.6, d = 2.4) { return rbox(w, 0.22, d, 0.1, mat(c)); }
export function stairs(n = 8, w = 3.4) { const g = new THREE.Group(), m = mat(0x9a6238); for (let i = 0; i < n; i++) g.add(at(box(w, 0.5, 1, m), 0, 0.25 + i * 0.5, -i * 1)); for (let i = 0; i < n; i += 1) g.add(at(box(0.14, 2.2, 0.14, mat(0xf0f0f0)), w / 2 - 0.1, 1.4 + i * 0.5, -i * 1)); g.add(at(box(0.2, 0.2, n * 1.12, mat(0x7a4a30)), w / 2 - 0.1, 2.5 + (n - 1) * 0.25, -(n - 1) / 2, 26.5)); return g; }
export function door(c = 0x6a3f24) { const g = new THREE.Group(); g.add(at(rbox(2.6, 5.4, 0.3, 0.05, mat(0xf0f0f0)), 0, 2.7, 0), at(rbox(2.2, 5, 0.2, 0.05, mat(c)), 0, 2.6, 0.1)); const k = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat(0xe2c05a)); k.position.set(0.8, 2.5, 0.26); g.add(k); return g; }
export function coat(c = 0x8a5a3a) { return rbox(2.3, 2.4, 1.3, 0.2, mat(c)); }   // a coat as a soft block: put it around a torso (y = 3) or carry it
export function schoolhouse() { const g = house({ c: 0xc2533f, w: 16, h: 8, d: 10, porch: false }); g.add(at(box(4.4, 1.1, 0.2, mat(0xf4f1ea)), 0, 6.3, 5.1)); return g; }

// ---------- flashbacks ----------
// Make everything already in the scene pale and greyish (a memory). Call it at the end of build(), BEFORE adding the one thing that should keep its colour.
export function paleScene(S, o = {}) { const seen = new Set(), k = o.k ?? 0.45, SEP = new THREE.Color(0xd9cfba);
  S.scene.traverse(x => { if (!x.isMesh) return; for (const m of [].concat(x.material)) { if (seen.has(m) || !m.color) continue; seen.add(m); if (m.isMeshBasicMaterial && m.map && m.transparent) continue;
      const c = m.color, g = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; c.lerp(new THREE.Color(g, g, g), k).lerp(SEP, o.sep ?? 0.2); if (m.emissive) m.emissiveIntensity *= 0.4; } });
  if (S.scene.background) S.scene.background.lerp(SEP, o.bg ?? 0.35); }
// A milky sheet in front of the lens with darker edges (use with paleScene). fov = the shot's field of view.
export function wash(S, fov = 35, c0 = 'rgba(236,226,204,0.16)', c1 = 'rgba(70,58,40,0.5)') { const t = canvasTex(256, 256, x => { const g = x.createRadialGradient(128, 128, 10, 128, 128, 182); g.addColorStop(0, c0); g.addColorStop(0.5, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); const h = 2 * 0.5 * Math.tan(fov * Math.PI / 360) * 1.04; m.scale.set(h * 0.5625, h, 1); m.position.z = -0.5; m.renderOrder = 999; S.cam.add(m); S.scene.add(S.cam); return m; }
// Dim a set for night (k < 1).
export function dim(S, k = 0.62) { S.scene.traverse(l => { if (l.isHemisphereLight || l.isAmbientLight) l.intensity *= k; }); if (S.sunLight) S.sunLight.intensity *= k; if (S.fillLight) S.fillLight.intensity *= 0.8; }
```


## `sets.js` (the shared places)

```js
// Shared sets, so every part of a story draws the same places. Add your story's own places here in the same way. Each takes S (the shot context), sets light and ground, adds the set, and returns handles.
// All sets are centred near the origin. Units as in kit.js (an adult is 5.3 tall).
import * as K from './kit.js';
const { THREE, at, mat, box, rbox, plane } = K;

// THE YARD: our pale-yellow house at z = -8 facing +z (front door at x = 0, z = -4), grass, a dirt path from the door to z = 14, a street beyond z = 16.
// flowers: 0..1 = how full the garden is (0 = a plain lawn; 1 = thousands, up to the windows and on the roof). time: 'summer' | 'evening' | 'night'.
// Returns { house, field (flowerField with .grow), roof (flowers on the roof), path }.
export function yard(S, o = {}) { const { flowers = 0, time = 'summer', n = 2600 } = o; S.light(time === 'night' ? 'night' : time, { sun: o.sun || [-0.5, 1, 0.8], size: o.size || 26, fogNear: 70, fogFar: 260 }); S.ground({ tex: 'grass' });
  const house = K.house({ c: 0xe8d9a0, w: 12, h: 7.5, d: 8, door: 0x3f6e8a }); house.position.set(0, 0, -8); S.add(house);
  const path = plane(2.6, 20, mat(0xffffff, { map: K.tex('dirt', 1, 6) })); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.02, 5); S.add(path);
  const road = plane(200, 7, mat(0x8f9399)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, 20); S.add(road);
  for (const [x, z, h] of [[-15, -10, 8], [16, -12, 9], [-19, 6, 7], [20, 4, 8]]) { const t = tree(h); t.position.set(x, 0, z); S.add(t); }
  for (const [x, c] of [[-30, 0xc9b3dc], [30, 0xa9c6a8]]) { const h = K.house({ c }); h.position.set(x, 0, -8); S.add(h); }
  let field = null, roof = null;
  if (flowers > 0) { field = K.flowerField(Math.round(n * flowers), [-13, -3.6, 13, 14], 5, { keep: (x, z) => Math.abs(x) > 1.6 }); S.add(field);
    const wall = K.flowerField(Math.round(120 * flowers), [-6, -3.9, 6, -3.7], 7, { keep: (x) => Math.abs(x) > 1.2 }); wall.scale.y = 2.6; S.add(wall);       // tall ones, up to the windows
    roof = K.flowerField(Math.round(90 * flowers), [-5.5, -11, 5.5, -5], 9, { y: 9.2 }); S.add(roof); }
  return { house, field, roof, path }; }
// a round green tree
export function tree(h = 8) { const g = new THREE.Group(); g.add(at(box(0.7, h * 0.45, 0.7, mat(0x6a4428)), 0, h * 0.22, 0)); for (const [x, y, z, r] of [[0, 0.7, 0, 0.3], [0.2, 0.86, 0.1, 0.22], [-0.22, 0.6, -0.1, 0.22]]) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(h * r, 1), new THREE.MeshStandardMaterial({ color: 0x4f9a48, roughness: 0.9, flatShading: true })); m.position.set(x * h, y * h, z * h); m.castShadow = true; g.add(m); } return g; }
// THE STREET of the town (for the rule part): grass, a grey road along x at z = 0, houses behind (z = -12), trees. time as above.
export function street(S, o = {}) { S.light(o.time || 'summer', { sun: o.sun || [-0.5, 1, 0.8], size: o.size || 24, fogNear: 70, fogFar: 260 }); S.ground({ tex: 'grass' });
  const road = plane(300, 8, mat(0x8f9399)); road.rotation.x = -Math.PI / 2; road.position.y = 0.02; S.add(road); const walk = plane(300, 3, mat(0xd9d4c8)); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.03, -5.5); S.add(walk);
  const cols = [0xd8bd97, 0xc9b3dc, 0xa9c6a8, 0xe8d9a0, 0xb9c4d8]; for (let i = -3; i <= 3; i++) { const h = K.house({ c: cols[(i + 5) % 5] }); h.position.set(i * 15, 0, -14); S.add(h); const t = tree(7 + (i & 1)); t.position.set(i * 15 + 7.5, 0, -10); S.add(t); } }
// THE KITCHEN: dotted wallpaper, tile floor. Table at the centre (top at y = 2.4) with two chairs; stove against the back wall at x = -5; window at x = 4 on the back wall; clock above the stove.
// night: true = dark blue room with one warm lamp over the table. floorFlowers: 0..1 = flowers around the table.
// Returns { table, stove, lamp, field }.
export function kitchen(S, o = {}) { const night = !!o.night; S.light(night ? 'nightroom' : 'room', { sun: [0.2, 1, 0.9], size: 14, fill: night ? 0.45 : 0.75 });
  S.add(K.room({ w: 20, d: 14, h: 11, floor: 'tile' })); const table = at(K.table(6, 3.4, 0xf4f1ea), 0, 0, 0); S.add(table); S.add(at(K.chair(), -2.2, 0, -2.4), at(K.chair(), 2.2, 0, 2.6, 0, 180));
  const stove = at(K.stove(), -5.5, 0, -5.8); S.add(stove); S.add(at(K.clock(0.9, o.hour ?? 3, 0), -5.5, 7.6, -6.9));
  S.add(at(rbox(3.4, 3.4, 0.2, 0.05, mat(0xf4f4f4)), 4, 6, -6.95), at(plane(3, 3, new THREE.MeshBasicMaterial({ color: night ? 0x1c2a55 : 0xbfe3ff })), 4, 6, -6.82));
  let lamp = null; if (night) { lamp = new THREE.PointLight(0xffd9a0, 60, 16, 1.6); lamp.position.set(0, 7.5, 0.5); S.add(lamp); S.add(at(rbox(1.2, 0.5, 1.2, 0.2, mat(0xffe9b8, { emissive: 0xffd080, emissiveIntensity: 1 })), 0, 8.4, 0.5), at(box(0.06, 2.6, 0.06, mat(0x333333)), 0, 9.9, 0.5)); }
  let field = null; if (o.floorFlowers) { field = K.flowerField(Math.round(70 * o.floorFlowers), [-5, -3.5, 5, 4.5], 11, { keep: (x, z) => Math.abs(x) > 3.3 || Math.abs(z) > 2.2 }); field.scale.setScalar(1); S.add(field); }
  return { table, stove, lamp, field }; }
// MY BEDROOM at night: blue wallpaper, wood floor, my bed against the back wall (head at z = -3.7, the sleeper lies along z with the head at z = -2.8), a small window with the moon, a night light.
// Returns { bed, field }. A sleeper: place a character lying down with root.rotation.x = -Math.PI / 2 at about (0, 1.9, 2.4).
export function bedroom(S, o = {}) { S.light('nightroom', { sun: [-0.6, 1, 0.6], size: 14, fill: 0.5 }); S.add(K.room({ w: 16, d: 12, h: 10, wallC: 0x8fa6d6 }));
  const bed = K.bed(0x5a86c9); bed.position.set(0, 0, -1.6); S.add(bed);
  S.add(at(rbox(2.8, 2.8, 0.2, 0.05, mat(0xf4f4f4)), -4.6, 6.2, -5.95), at(plane(2.4, 2.4, new THREE.MeshBasicMaterial({ color: 0x1c2a55 })), -4.6, 6.2, -5.82)); const moon = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0xfff6cf })); moon.position.set(-4.2, 6.6, -5.8); S.add(moon);
  const nl = new THREE.PointLight(0xffd9a0, 30, 12, 1.6); nl.position.set(3.4, 2.4, -3.6); S.add(nl); S.add(at(rbox(0.5, 0.7, 0.5, 0.2, mat(0xffe9b8, { emissive: 0xffd080, emissiveIntensity: 1 })), 3.4, 2.5, -4.4), at(rbox(1.6, 2, 1.4, 0.08, mat(0x9a6238)), 3.4, 1, -4.6));
  let field = null; if (o.floorFlowers) { field = K.flowerField(Math.round(40 * o.floorFlowers), [2.3, -3, 5, 3], 13); S.add(field); }
  return { bed, field }; }
// THE HALL: the front door in the back wall (x = 0, z = -6), stairs going up on the left (x = -5), coat hooks on the right. morning: true = bright, false = night.
// Returns { door, stairs, field }.
export function hall(S, o = {}) { const morning = o.morning !== false; S.light(morning ? 'room' : 'nightroom', { sun: [0.3, 1, 0.9], size: 14, fill: morning ? 0.75 : 0.45 }); S.add(K.room({ w: 16, d: 12, h: 11 }));
  const door = at(K.door(0x3f6e8a), 0, 0, -5.9); S.add(door); const stairs = at(K.stairs(9, 3.2), -5.8, 0, 3.5); S.add(stairs);
  S.add(at(box(3, 0.2, 0.2, mat(0x7a4a30)), 4.6, 5.6, -5.9)); if (!morning) { const l = new THREE.PointLight(0xffd9a0, 40, 14, 1.6); l.position.set(2, 7, 0); S.add(l); }
  let field = null; if (o.floorFlowers) { field = K.flowerField(Math.round(50 * o.floorFlowers), [-3.5, -5, 3.5, -1], 15, { keep: (x) => Math.abs(x) > 1.3 }); S.add(field); }
  return { door, stairs, field }; }
// THE SCHOOL YARD: a red school at z = -10, grass, a fence.
export function school(S) { S.light('summer', { sun: [-0.5, 1, 0.8], size: 22 }); S.ground({ tex: 'grass' }); const s = K.schoolhouse(); s.position.set(0, 0, -11); S.add(s); for (const x of [-16, 16]) { const t = tree(8); t.position.set(x, 0, -6); S.add(t); } }
```


## `example_shots.js` (five working shots to learn from)

```js
// Example shots: copy the patterns, not the story. Run:  node rec.mjs out/ex --shots 0.5,3.7,4.5,6.5,9.5 --q "parts=test_example&nocap=1&dur=10"  (after copying this file to test_example.js)
import * as K from './kit.js'; import * as SET from './sets.js';
const { ramp, lerp, smooth } = K;
export default [
  // 1. A walk toward the camera with a push in. The face changes at a set moment (lt = seconds since the shot began).
  { t: 0, name: 'walk and react', build(S) { SET.street(S); const man = K.cast('neighbor2'); S.add(man);
      return (lt, u) => { man.place(0, 0, -4 + Math.min(lt, 1.2) * 2.5); if (lt < 1.2) man.walk(lt * 1.8, 28); else man.stand().pose({ aL: [0, 6, 6], aR: [0, 6, 6], head: [0, 14, 0] });
        man.face(lt < 1.3 ? { glasses: true, mouth: 'grin' } : { glasses: true, eyes: 'wide', mouth: 'o' }); S.move(u, { p: [1.5, 4.2, 12], l: [0, 3.4, 0], fov: 34 }, { p: [1, 4, 9.5], l: [0, 3.4, 0], fov: 34 }); }; } },
  // 2. The special thing of the story, timed to a word: here a flower that starts to rise 0.4 s into the shot and is open 1.1 s later.
  { t: 2, name: 'flower grows at the shoes', build(S) { SET.street(S); const girl = K.cast('school2'); S.add(girl); girl.place(-0.6, 0, 0).face({ mouth: 'smile' }); const f = K.flower('daisy', 0.9); f.position.set(0.9, 0, 0.6); S.add(f);
      return (lt, u) => { f.grow(ramp(lt, 0.4, 1.5)); girl.pose({ head: [-20, lt > 1.2 ? 18 : 0, 0] }).face(lt > 1.2 ? { eyes: 'wide', mouth: 'o' } : { mouth: 'smile' }); S.move(u, { p: [0.8, 3.4, 10.5], l: [0.1, 2.3, 0], fov: 32 }, { p: [0.9, 2.2, 7], l: [0.5, 1.4, 0.3], fov: 32 }); }; } },
  // 3. Two people at a table at night: sitting, a lean toward the other, a tear. Close two-shot with the faces above the caption band.
  { t: 4, name: 'kitchen talk', build(S) { SET.kitchen(S, { night: true }); const mom = K.cast('mama'), kid = K.cast('kid'); S.add(mom, kid);
      mom.sit().place(-1.7, -0.15, -1.9, 20).pose({ lean: [14, 0], aL: [40, -8, 50], aR: [40, -8, 50], head: [24, 6, 0] }).face({ brows: 'sad', mouth: 'small' });
      kid.sit().place(1.7, 0.05, -1.9, -20).pose({ aL: [38, -8, 54], aR: [38, -8, 54], head: [-18, 10, 0] }).face({ brows: 'sad', mouth: 'small', tears: 1 });
      return (lt, u) => S.move(u, { p: [0, 5.4, 12.5], l: [0, 3.7, -1.9], fov: 30 }, { p: [0, 5.2, 11], l: [0, 3.7, -1.9], fov: 30 }); } },
  // 4. A hug: one bends at the hips (lean), arms forward and twisted inward. Slow orbit seen from the side, so both faces show.
  { t: 6, name: 'hug', build(S) { SET.yard(S, { time: 'evening' }); const mom = K.cast('mama'), kid = K.cast('kid'); S.add(mom, kid);
      mom.place(0, 0, 7.2, 180).pose({ lean: [22, 0], aL: [62, 0, 30], aR: [62, 0, 30], head: [0, 18, 0] }).twist(38).face({ eyes: 'shut', mouth: 'small', tears: 1 });
      kid.place(0, 0, 5.9, 0).pose({ aL: [70, 0, 20], aR: [70, 0, 20], head: [0, -8, 14] }).twist(34).face({ eyes: 'shut', mouth: 'smile' });
      return (lt, u) => { const a = lerp(1.25, 1.75, smooth(u)); S.look([Math.sin(a) * 13, 4.4, 6.5 + Math.cos(a) * 13], [0, 3.1, 6.5], 30); }; } },
  // 5. A memory: build the scene, make it pale, then add the one thing that keeps its colour.
  { t: 8, name: 'pale flashback', build(S) { SET.bedroom(S); const kid = K.cast('kid'); S.add(kid); kid.root.rotation.x = -Math.PI / 2; kid.root.position.set(0, 2.3, 0); kid.face({ eyes: 'shut', mouth: 'small' });
      K.paleScene(S); K.wash(S, 34); const f = K.flower('rose', 1.1); f.position.set(3.2, 0, 1.2); S.add(f);
      return (lt, u) => { f.grow(ramp(lt, 0.2, 1.2)); S.move(u, { p: [6, 7, 10], l: [1, 2, 0], fov: 34 }, { p: [5.4, 6.4, 9], l: [1.4, 1.8, 0.4], fov: 34 }); }; } },
];
```


## `rec.mjs` (the recorder)

```js
// Record index.html to a silent 1080x1920 mp4, frame by frame, in a hidden Chrome (no window ever opens).
//   node rec.mjs out/silent.mp4                       the whole video
//   node rec.mjs out/stills_a --shots 0.5,3,7.2 --q "parts=a&nocap=1"     PNG stills at those video times (for checking)
//   options: --q "<query string for index.html>"   --from <sec> --to <sec>   --fps 30
// Page contract: window.VIDEO = { duration, frame(t) }, window.READY = true when loaded. frame(t) draws the state at time t.
import puppeteer from 'puppeteer'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url)), a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : a[i + 1]; };
const out = a[0], fps = +opt('fps', 30), shots = opt('shots', null), query = opt('q', '');
if (!out) { console.log('usage: node rec.mjs <out.mp4 | stills folder> [--shots t1,t2] [--q "parts=a&nocap=1"]'); process.exit(1); }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const up = rel => { let d = ROOT; for (let i = 0; i < 6; i++) { const f = path.join(d, rel); if (fs.existsSync(f)) return f; d = path.dirname(d); } return path.join(ROOT, rel); };   // node_modules may live in a parent folder
const srv = http.createServer((q, r) => { const rel = decodeURIComponent(q.url.split('?')[0]), f = rel.startsWith('/node_modules/') ? up(rel) : path.join(ROOT, rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(r); });
await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const port = srv.address().port, prof = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
const gpu = process.platform === 'darwin' ? ['--use-angle=metal'] : process.platform === 'linux' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] : [];
const browser = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 600000, args: ['--use-mock-keychain', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--force-device-scale-factor=1', '--disable-background-timer-throttling', ...gpu] });
const page = await browser.newPage(); await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warn') { const t = m.text(); if (!/favicon|404/.test(t)) console.log('[page]', t); } }); page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/index.html${query ? '?' + query : ''}`, { waitUntil: 'load' });
try { await page.waitForFunction('window.READY === true', { timeout: 120000 }); } catch (e) { console.log('The page never became ready. Fix the [pageerror] lines above.'); await browser.close(); srv.close(); process.exit(1); }
const dur = await page.evaluate(() => window.VIDEO.duration), from = +opt('from', 0), to = +opt('to', dur);
const step = t => page.evaluate(async t => { await window.VIDEO.frame(t); await new Promise(r => requestAnimationFrame(() => r())); }, t);
if (shots) { fs.mkdirSync(out, { recursive: true }); for (const t of shots.split(',').map(Number)) { await step(t); await page.screenshot({ path: path.join(out, `${t.toFixed(2).padStart(6, '0')}.png`) }); } console.log('stills in', out); }
else { fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * fps), n1 = Math.round(to * fps), t0 = Date.now();
  for (let i = n0; i < n1; i++) { await step(i / fps); const buf = await page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log(`${i}/${n1} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done:', out, `${((n1 - n0) / fps).toFixed(1)} s`); }
await browser.close(); srv.close(); fs.rmSync(prof, { recursive: true, force: true });
```


## `voice.py` (the narrator)

```python
"""The narrator. python3 voice.py  ->  snd/raw.mp3 (bought once, never again), snd/voice.wav, snd/words.json, snd/sents.json
Recipe: ElevenLabs voice "Will", model eleven_multilingual_v2, speed 1.2, stability 0.3, style 0.35 (more feeling), then raised 3 semitones and made 10% faster with ffmpeg (FAST below),
then pauses cut short (0.30 s after a sentence, 0.16 s after a comma, 0.10 s elsewhere) so it runs at about 225 words a minute with no dead air.
The key is read from the ELEVENLABS_API_KEY environment variable or from the file .env next to this script (a line ELEVENLABS_API_KEY=...).
words.json = [[word, start, end], ...] in the FINAL timing: every cut and every caption uses it. sents.json = [{n, t0, t1, text}, ...] one per sentence."""
import json, base64, subprocess, urllib.request, urllib.error, pathlib, os, sys, wave
import numpy as np
H = pathlib.Path(__file__).parent; S = H / 'snd'; S.mkdir(exist_ok=True); VOICE = 'bIHbv24MWmeRgasZH58o'; SR = 44100
text = ' '.join((H / 'script.txt').read_text().split())
def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k and (H / '.env').exists(): k = next((l.split('=', 1)[1].strip().strip('"') for l in (H / '.env').read_text().splitlines() if l.startswith('ELEVENLABS_API_KEY=')), None)
    if not k: sys.exit('No ElevenLabs key: put ELEVENLABS_API_KEY=... into the file .env next to voice.py')
    return k
if not (S / 'raw.mp3').exists():
    body = {'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': {'stability': 0.3, 'similarity_boost': 0.75, 'style': 0.35, 'speed': 1.2}}
    try: r = json.loads(urllib.request.urlopen(urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128', json.dumps(body).encode(), {'xi-api-key': key(), 'Content-Type': 'application/json'}), timeout=600).read())
    except urllib.error.HTTPError as e: sys.exit(f'ElevenLabs said {e.code}: {e.read()[:400]}')
    (S / 'raw.mp3').write_bytes(base64.b64decode(r['audio_base64'])); al = r['alignment']; words, w, s0, pe = [], '', None, 0
    for ch, st, en in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if w: words.append([w, round(s0, 3), round(pe, 3)]); w = ''
        else:
            if not w: s0 = st
            w += ch; pe = en
    if w: words.append([w, round(s0, 3), round(pe, 3)])
    (S / 'raw.json').write_text(json.dumps(words))
FAST = 1.1; W = [[w, a / FAST, b / FAST] for w, a, b in json.loads((S / 'raw.json').read_text())]; k = 2 ** (3 / 12)
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', '0', '-i', str(S / 'raw.mp3'), '-af', f'asetrate=44100*{k:.5f},aresample=44100,atempo={FAST / k:.5f}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, dtype=np.float32)
START = 0.25; out = [np.zeros(int(START * SR), dtype=np.float32)]; t = START; NW = []
for i, (w, a, b) in enumerate(W):
    if i:
        gap = a - W[i - 1][2]; cap = 0.30 if W[i - 1][0][-1] in '.?!' else 0.16 if W[i - 1][0][-1] == ',' else 0.10; keep = max(0, min(gap, cap)); p = W[i - 1][2]
        out.append(x[int(p * SR):int((p + keep / 2) * SR)]); out.append(x[int((a - keep / 2) * SR):int(a * SR)]); t += keep
    out.append(x[int(a * SR):int(b * SR)]); NW.append([w, round(t, 3), round(t + (b - a), 3)]); t += b - a
out.append(x[int(W[-1][2] * SR):int((W[-1][2] + 0.4) * SR)]); y = np.concatenate(out)
wv = wave.open(str(S / 'voice.wav'), 'wb'); wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes()); wv.close()
(S / 'words.json').write_text(json.dumps(NW)); sents, s = [], 0
for i, w in enumerate(NW):
    if w[0][-1] in '.?!' or i == len(NW) - 1: sents.append({'n': len(sents), 't0': NW[s][1], 't1': w[2], 'text': ' '.join(v[0] for v in NW[s:i + 1])}); s = i + 1
(S / 'sents.json').write_text(json.dumps(sents, indent=0))
print(f'{len(NW)} words, {len(sents)} sentences, voice {NW[-1][2]:.1f} s, {round(len(NW) / (NW[-1][2] - START) * 60)} words a minute, video about {NW[-1][2] + 2.2:.1f} s')
for q in sents: print(q['n'], q['t0'], q['text'])
```


## `mix.py` (voice + music)

```python
"""Sound. python3 mix.py [turn sentence number]  ->  out/video_voice_only.mp4 and, if there is music, out/video_with_music.mp4
There are no sound effects in this style: only the voice and music.
Music: put your own files at snd/music1.mp3 (light and calm, loops under the set-up) and snd/music2.mp3 (sad and warm, from the turn of the story to the end).
If they are missing and you run `python3 mix.py <turn> --make-music`, two instrumental tracks are made with ElevenLabs.
The narrator sits at -14.1 dB RMS, the music about 11 dB under it, the whole film at -14 LUFS."""
import subprocess, json, wave, pathlib, sys, os, urllib.request, urllib.error
import numpy as np
H = pathlib.Path(__file__).parent; S = H / 'snd'; SR = 44100; args = [a for a in sys.argv[1:] if not a.startswith('--')]
sents = json.loads((S / 'sents.json').read_text()); turn_n = int(args[0]) if args else int(len(sents) * 0.68); turn = sents[min(turn_n, len(sents) - 1)]['t0'] - 0.4
def load(p, ch=2): x = np.frombuffer(subprocess.run(['ffmpeg', '-v', '0', '-i', str(p), '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, dtype=np.float32).astype(np.float64); return x.reshape(-1, ch)
def save(p, x): x = np.clip(x, -1, 1); w = wave.open(str(p), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes()); w.close()
def rms(x): m = x.mean(1); e = np.sqrt(np.convolve(m ** 2, np.ones(SR // 10) / (SR // 10), 'same')); return float(np.sqrt((m[e > 0.25 * e.max()] ** 2).mean()))
def make_music():
    k = os.environ.get('ELEVENLABS_API_KEY') or next((l.split('=', 1)[1].strip().strip('"') for l in (H / '.env').read_text().splitlines() if l.startswith('ELEVENLABS_API_KEY=')), None)
    P = {'music1': ('Light, calm, slightly curious instrumental. Soft mallets and a mellow electric piano, gentle bass, no drums. 90 bpm. A simple loop that can repeat. Starts at once, no intro, no ending.', 30),
         'music2': ('Slow, sad but warm instrumental. Soft fingerpicked acoustic guitar and glockenspiel, a quiet pad, no drums. 76 bpm. Tender and bittersweet, like a lullaby. Starts at once, grows a little, ends gently.', 30)}
    for n, (p, sec) in P.items():
        if (S / f'{n}.mp3').exists(): continue
        try: r = urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', json.dumps({'prompt': p, 'music_length_ms': sec * 1000, 'model_id': 'music_v1', 'force_instrumental': True}).encode(), {'xi-api-key': k, 'Content-Type': 'application/json'}), timeout=900).read()
        except urllib.error.HTTPError as e: sys.exit(f'ElevenLabs music said {e.code}: {e.read()[:300]}')
        (S / f'{n}.mp3').write_bytes(r); print('made', n)
if '--make-music' in sys.argv: make_music()
silent = H / 'out/silent.mp4'; dur = float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(silent)], capture_output=True, text=True).stdout); N = int(dur * SR)
v = load(S / 'voice.wav'); v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]; v *= 10 ** (-14.1 / 20) / rms(v)
def out(name, x):
    save(S / '_mix.wav', x * min(1, 0.95 / np.abs(x).max()))
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(silent), '-i', str(S / '_mix.wav'), '-af', f'loudnorm=I=-14:TP=-1:LRA=11,afade=t=out:st={dur - 0.9:.2f}:d=0.9', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', str(H / f'out/{name}.mp4')], check=True); print('->', f'out/{name}.mp4')
out('video_voice_only', v)
if (S / 'music1.mp3').exists() and (S / 'music2.mp3').exists():
    m1, m2 = load(S / 'music1.mp3'), load(S / 'music2.mp3'); g1 = 10 ** (-25.5 / 20) / rms(m1); g2 = 10 ** (-24.5 / 20) / rms(m2); bed = np.zeros((N, 2)); XF = int(0.4 * SR); L = len(m1) / SR - 0.5; t = 0.0
    while t < turn:
        a = int(t * SR); b = min(int(min(turn, t + L) * SR) + XF, N); seg = m1[:b - a].copy() * g1
        if t: seg[:XF] *= np.linspace(0, 1, XF)[:, None]
        seg[-XF:] *= np.linspace(1, 0, XF)[:, None]; bed[a:a + len(seg)] += seg; t += L
    a = int(turn * SR); seg = m2[:N - a].copy() * g2; seg[:XF] *= np.linspace(0, 1, XF)[:, None]; bed[a:a + len(seg)] += seg
    out('video_with_music', v + bed); print(f'second track starts at {turn:.1f} s (sentence {turn_n})')
else: print('no snd/music1.mp3 + snd/music2.mp3: only the voice-only file was made (add --make-music to make them)')
```


## `BRIEF_TEMPLATE.md` (the brief for the five helpers; becomes BRIEF.md in a video folder)

````markdown
# Brief: build one part of a story video

A fast 30-second vertical cartoon in three.js: blocky toy people, soft light, one shot per sentence (a cut about every 1.5 seconds, so something must move from the first frame), the narrator's words as captions. You own ONE file with one part of the shots. Others build the other parts at the same time.

Everything is in this folder (the video folder).

## Read first

1. `script.txt` (the whole story, so you know what your part means) and `SHOTS.md` (your shots).
2. `snd/sents.json`: the exact time of every sentence. A shot starts 0.07 s before its sentence's `t0` (the very first shot of the video at 0). Paste the times you need into your file as a constant; keep them exact.
3. `kit.js`: characters (`cast(name)`, `char({...})`, `.place() .pose() .walk() .face() .twist() .sit() .stand() .alpha()`), props, flashback helpers (`paleScene`, `wash`, `dim`), and the additions made for this story at the bottom.
4. `sets.js`: the shared places. USE THESE so all parts match. Each sets the light and the ground itself; do not call `S.light` again after it (you may change `S.sunLight`, `S.fillLight`, or call `K.dim(S)`).
5. `engine.js`: what `S` gives a shot: `S.add(...)`, `S.look(pos, target, fov)`, `S.move(u, from, to)`, `S.snow` (0..1), `S.vig`, `S.fade`.
6. `example_shots.js`: five working shots that show the patterns (walk and react, the special thing timed to a word, two people at a table, a hug, a pale memory).

## How a shot looks

```js
import * as K from './kit.js'; import * as SET from './sets.js';
const SENTS = [ /* pasted from snd/sents.json: [t0, t1] per sentence */ ]; const T = n => Math.max(0, SENTS[n][0] - 0.07);
export default [
  { t: T(31), name: 'c1 mom comes home', build(S) { SET.hall(S, { morning: false }); const mom = K.cast('mama'); S.add(mom);
      return (lt, u) => { mom.place(0, 0, -5 + lt * 1.5).walk(lt * 1.6, 22); S.move(u, { p: [-4, 6, 9], l: [0, 3, -3], fov: 32 }, { p: [-3.5, 5.8, 8], l: [0, 3, -3], fov: 32 }); }; } },
];
```

- `build` runs once when the shot starts. The function it returns runs every frame and must depend only on `lt` (seconds since the shot began) and `u` (0..1 through the shot). No state kept between frames, no randomness without `K.rng(seed)`: any frame may be drawn alone.
- Never put a `//` comment at the end of a line that still has code after it on the same line. It silently cuts the code off.
- Characters face +z at `ry = 0`. An adult is 5.3 units tall. Pose angles are degrees: arms `[forward, out to the side, elbow bend]`, legs `[forward, knee bend]`, head `[yaw, pitch (+ = down), roll]`, lean `[forward, side]` (bends at the hips).
- Faces are flat pictures on the front of the head: keep a face within about 50 degrees of the camera, or it shows nothing.
- Two people side by side fill the whole width of a vertical frame. For a two-shot put one a little behind the other, or go close on the faces.
- Captions sit in the middle of the frame between 59% and 69% of its height. Keep faces and the important thing above that band (or clearly below it).
- A memory: build the scene, call `K.paleScene(S)` and `K.wash(S, fov)`, then add the one thing that should keep its colour.

## What makes a shot good

- The picture shows the exact thing the sentence says, within the first half second.
- Something moves from the first frame: a push in, a walk, the special thing happening. Never a dead frame.
- Faces carry the story: change eyes, brows, mouth and tears on the right word.
- The person or the thing is big in the frame. No empty ground, no tiny figures far away (unless the sentence is about how small or alone they are).
- The camera changes from shot to shot: close, wide, low, high.

## Your loop

```
node rec.mjs out/stills_<letter> --shots 52.1,53.0,54.2 --q "parts=<letter>&nocap=1"
```

Times are video times. It writes one PNG per time and opens no window. Tile several stills into one picture with ffmpeg (`ffmpeg -y -pattern_type glob -i 'out/stills_<letter>/*.png' -vf "scale=300:-1,tile=6x2" out/sheet_<letter>.jpg`), read it, fix, repeat, for every shot at two or three times. Then check once with captions on (drop `&nocap=1`). If the recorder prints `[pageerror]`, your file has an error: fix it first.

## Rules

- Edit only `shots_<letter>.js`. Helpers go inside your file. Do not edit `kit.js`, `sets.js`, `engine.js`, `index.html`, `SHOTS.md`. If the kit or a set is wrong or lacks something, work around it in your file and say so in your report.
- The first shot of your part starts exactly at your part's first sentence time minus 0.07 (part a at 0).
- No git. No outside services. No browser windows. No questions: decide and go on.
- Final report, short: the shots you built, the weakest ones and why, kit or set problems that other parts may share.
````
