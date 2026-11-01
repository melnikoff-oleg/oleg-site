import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ResourcePageShell } from "@/components/resource-page-shell";
import { CopyButton } from "@/components/copy-button";
import { LazyVideo } from "@/components/lazy-video";
import {
  Answer,
  Block,
  Callout,
  Code,
  Guide,
  GuideSection,
  GuideSteps,
  GuideToc,
  KeyFacts,
  Out,
  Stats,
} from "@/components/guide";
import { PLANS, usd } from "@/lib/pricing";
import {
  BUILD_CONSOLE,
  BUILD_MACHINE,
  CHECK_CRITIC,
  GIVE_LOOK,
  INSTALL_DEPS,
  INSTALL_SKILL,
  LET_THEM_BREAK,
  PAGE_YOU_DRIVE,
  PUT_ONLINE,
  RECORD,
  SCORE,
} from "./prompts";

// The page behind Oleg's LinkedIn post of 2026-11-01 about Fokki's robot
// octopus. Everything it hands over is someone else's work, credited on the
// page: the teardown skill and the prompts are Elvar's (his X article, below),
// the octopus video is Fokki's. The prompts live in ./prompts.ts, generated
// from the scrape of Elvar's article so they stay word for word; the prose
// around them is written here.

const REPO = "https://github.com/elvarofficial/teardown";
const SIMS = "https://visual-learning.app";
const ELVAR_ARTICLE = "https://x.com/elvar_official/status/2116174609355571402";
const ELVAR = "https://x.com/elvar_official";
const FOKKI_POST = "https://x.com/0x_fokki/status/2116289885870981296";
const FOKKI = "https://x.com/0x_fokki";
const CLAUDE_MOTION = "https://github.com/whaleyxbt/claude-motion";

// python3 scripts/stripped-thumb.py public/opus-3d/octopus-poster.webp
const POSTER_THUMB = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDs4re1tkO1VRclid3/ANeqt3fKJEWO5jEcmAo6MG5PHrnGKsXRLW0waMsB0A6mmPbx3UJM5kl3A43DGPoO1SrLRFO7d2Rxai0qqzPDHscJIuc5PGcHjpn86vo6uMoysOxHNULW1+zQK9smxto3RsMjjqB6GrUL/ud6Jw2CBjb9eKBMf14PIpcnHWiigbIizeRncc49adGSUUk9qKKAP//Z";

/** Something you type literally. */
function K({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-vivid-blue/15 px-1.5 py-0.5 font-mono text-sm text-silver [overflow-wrap:anywhere]">
      {children}
    </code>
  );
}

/** The numbered actions of a setup step. Short lines, one thing each. */
function Do({ children }: { children: ReactNode }) {
  return <ol className="list-none space-y-2.5 text-silver">{children}</ol>;
}

function Step({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-vivid-blue/70" />
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}

/** Collapsed-by-default aside: the instruction is the step, the reason lives in here, shut. */
function Why({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group mt-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-silver-muted transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-3 border-l border-hairline pl-4 text-sm leading-relaxed text-silver-muted">
        {children}
      </div>
    </details>
  );
}

/**
 * A command or prompt to paste, with one-tap copy (the /claude-reels pattern:
 * a label row with the shared CopyButton, then the text in a wrapping Block).
 */
function Paste({ label, text, copy = "copy prompt" }: { label: string; text: string; copy?: string }) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-silver">{label}</p>
        <CopyButton text={text} label={copy} />
      </div>
      <Block>{text}</Block>
    </div>
  );
}

const steps = [
  {
    title: "Check what you need",
    content: (
      <div>
        <Do>
          <Step>
            A Claude plan that includes Claude Code. Pro, {usd(PLANS.pro.monthly)} a month, is
            the cheapest one
          </Step>
          <Step>
            Claude Code installed and signed in. New to it?{" "}
            <Link
              href="/claude-code-tutorial"
              className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Install it first
            </Link>
          </Step>
          <Step>
            Node.js 20 or newer. Type <K>node -v</K> in a terminal to check; if it is missing or
            older, get it from <Out href="https://nodejs.org">nodejs.org</Out>
          </Step>
          <Step>
            ffmpeg and Python 3, only for turning the result into a video with sound. Claude Code
            installs both if you ask it to
          </Step>
        </Do>
        <Why label="Which model should I pick?">
          <p>
            Claude Opus 5.5. Elvar built every one of his simulators with it, and Fokki&rsquo;s
            octopus came out of it too. Inside Claude Code, type <K>/model</K> to see the models
            your plan has and switch.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Install the skill",
    content: (
      <div>
        <Do>
          <Step>Open a terminal (the plain one, not the Claude Code chat) and paste this line</Step>
        </Do>
        <Paste label="Install" text={INSTALL_SKILL} copy="copy" />
        <div className="mt-5">
          <Do>
            <Step>Then, once, paste this one. It goes into the skill&rsquo;s folder and sets it up</Step>
          </Do>
        </div>
        <Paste label="Set it up" text={INSTALL_DEPS} copy="copy" />
        <Why label="What do these two lines do?">
          <p>
            The first downloads teardown from GitHub and installs it for Claude Code in your home
            folder: <K>-g</K> means for every project on this computer, <K>-a claude-code</K> means
            for Claude Code.
          </p>
          <p>
            The second installs the skill&rsquo;s own tools, including a hidden copy of Chrome
            that it uses to look at its own work and to record the video. It takes a minute or two.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Open it in Claude Code",
    content: (
      <div>
        <Do>
          <Step>
            In a terminal, type <K>claude</K> and press Enter
          </Step>
          <Step>
            Type <K>/teardown</K>. It shows up in the list of commands as you type: the skill is
            ready
          </Step>
        </Do>
        <Why label="Want to see a finished one first?">
          <p>
            Open <Out href={SIMS}>visual-learning.app</Out>. Elvar&rsquo;s simulators run there in
            the browser, free, so you know what you are building before you start.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Pick a machine and find one picture",
    content: (
      <div>
        <Do>
          <Step>
            Pick a machine that one thing drives (a crank, a piston, a lever) and that has real
            measurements you can look up
          </Step>
          <Step>
            Find one picture of it: a cutaway drawing, a page from a manual, a photo or a short
            clip
          </Step>
          <Step>Keep it handy. You drag it into Claude Code with the first prompt</Step>
        </Do>
        <Why label="Why one picture matters so much">
          <p>
            The picture decides the result more than any prompt does. With nothing to copy from,
            Elvar&rsquo;s pangolin, armadillo and scorpion all came out as generic toys. Given one
            clip of a real V8 simulator, the same model rebuilt the engine panel by panel.
          </p>
          <p>
            Ideas he has not built yet: a bicycle derailleur moving across 11 sprockets, a watch
            escapement ticking four times a second, a car differential in a turn, a sewing machine
            making one stitch, an excavator arm digging one bucket.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Paste the prompts, one at a time",
    content: (
      <div>
        <Do>
          <Step>
            Start with{" "}
            <a
              href="#step-1"
              className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              the first prompt below
            </a>{" "}
            and attach your picture to it
          </Step>
          <Step>Change everything in [square brackets] to your machine</Step>
          <Step>Look at what comes back before you paste the next one</Step>
        </Do>
      </div>
    ),
  },
];

const SECTIONS = ["What you get", "The prompts, step by step", "See them running", "Who made this"];

const guideSteps = [
  {
    title: "Build the machine and its model",
    schema:
      "Ask Claude Code, with the teardown skill and one reference picture, to build the machine from code in real units and to write the mechanism first as pure functions of one input, using real numbers checked by hand.",
    body: (
      <>
        <p>
          The most important prompt. Before Claude draws a single part, it writes the machine as
          math: one input that runs everything (here, how far the actuator has pushed, from 0 to 1)
          and the real measurements, with the check done where you can see it. Every part, panel
          and label is then computed from that math. Nothing is animated by hand, so nothing can
          fall out of step.
        </p>
        <Paste label="Prompt" text={BUILD_MACHINE} />
        <p>
          Elvar&rsquo;s numbers for the Cessna gear show what the check is for: a 32-tooth gear
          at module 4 mm is 128 mm across, half of its circumference is 201 mm, and that is
          exactly how far the rack travels to swing the legs 180°. His V8 and Strandbeest came
          out of this same prompt with different brackets.
        </p>
      </>
    ),
  },
  {
    title: "Build the console around it",
    schema:
      "Lay out a 1600×900 console around the machine: the main live number, live charts, a 2D schematic redrawn from the same model, one button per subsystem, camera view buttons and labelled callouts, all redrawn from the frame's state.",
    body: (
      <>
        <p>
          Now the screen around the machine: a big live number in the corner, charts that move
          with it, a flat 2D drawing of the mechanism, a button for each subsystem, buttons for
          the camera views, and labels with thin lines pointing into the parts. Swap the bracketed
          number, charts and views for ones that fit your machine.
        </p>
        <Paste label="Prompt" text={BUILD_CONSOLE} />
        <p>
          The charts are what hold people. On the V8, the pressure chart draws a closed loop once
          every two turns of the crank, and you sit there watching it close.
        </p>
      </>
    ),
  },
  {
    title: "Give it the look",
    schema:
      "Style it as a clean study model on a pale studio background with one accent colour for the working part, glossy dark parts, glass liners, outlined near-white parts and a camera angle chosen for the mechanism.",
    body: (
      <>
        <p>
          A clean study model in a pale studio, with one accent colour on whatever part is working
          right now.
        </p>
        <Paste label="Prompt" text={GIVE_LOOK} />
        <p>
          Every line in it fixes something that once went wrong: white tubes that vanished into a
          cream background until they got a thin dark outline, metal that flashed white, and a
          front-on camera that flattened twenty legs into what looked like a fence.
        </p>
      </>
    ),
  },
  {
    title: "Make it check its own work",
    schema:
      "Before showing anything, have Claude render a still at every beat of the tour, look for collisions, floating parts, covered labels and wrong numbers, scrub every transition, and fix collisions with numbers rather than camera moves.",
    body: (
      <>
        <p>
          Claude looks at the result before you do. It renders a still at every moment of the
          tour and checks each one for parts passing through each other, parts floating off their
          mounts, labels covering what they name, and numbers that disagree with the picture. Then
          it steps through every transition looking for jumps.
        </p>
        <Paste label="Prompt" text={CHECK_CRITIC} />
        <p>
          The rule worth keeping is the third line: a collision gets fixed with a number, never
          hidden by moving the camera. Ask for the stills and look at them yourself too.
        </p>
      </>
    ),
  },
  {
    title: "Turn it into a page people drive",
    schema:
      "Make the simulator drivable: a self-playing tour with a cursor, control handed to the visitor on any input and back after 25 seconds of quiet, orbit and zoom, shaders warmed before the first frame, and quality steps for integrated GPUs.",
    body: (
      <>
        <p>
          This makes the tour that runs itself: a cursor walks to each button and presses it, any
          click or key hands control to the visitor, and after 25 quiet seconds the tour takes
          over again. The last two lines are about speed. The graphics are prepared before the
          first frame, so the page never freezes, and there are lower settings for laptops
          without a separate graphics card.
        </p>
        <Paste label="Prompt" text={PAGE_YOU_DRIVE} />
        <p>
          That laptop test is the one people skip and the one visitors feel. One of Elvar&rsquo;s
          walking robots ran at 15 frames a second on built-in laptop graphics, and at 75 after
          the quality steps.
        </p>
      </>
    ),
  },
  {
    title: "Record it as a video with sound",
    schema:
      "Render the tour frame by frame at 60 fps and 1920×1080 in headless Chrome, encode it with ffmpeg, then score it in code on the same timeline and master the sound before muxing it in.",
    body: (
      <>
        <p>
          Two prompts. The first draws every frame from the clock alone, 60 a second at 1920×1080,
          in a hidden Chrome window, and has ffmpeg turn them into an mp4. A screen recorder skips
          frames when the graphics get heavy. This cannot.
        </p>
        <Paste label="Record it" text={RECORD} />
        <p>
          The second writes the soundtrack in code on the same timeline, so each sound lands on
          the motion that makes it, and sets the loudness to what streaming sites expect. Change
          the bracketed music and sounds to suit your machine.
        </p>
        <Paste label="Score it" text={SCORE} />
        <p>
          This is the step that needs ffmpeg and Python 3. If you do not have them, ask Claude Code
          to install them first.
        </p>
      </>
    ),
  },
  {
    title: "Put it online",
    schema:
      "Publish the simulator as a page under 1 MB, with large models moved into separate files, a 1200×630 preview card made from the best frame, and deploy it to Vercel.",
    body: (
      <>
        <p>
          Publishes the page with a 1200×630 preview image made from its best frame, and deploys
          it to Vercel.
        </p>
        <Paste label="Prompt" text={PUT_ONLINE} />
        <p>
          Keep the 1 MB line. One of Elvar&rsquo;s pages weighed 15.9 MB with its 3D models inside,
          and X never showed a link preview for it. With the models moved into their own files it
          came in under 1 MB and the preview appeared.
        </p>
      </>
    ),
  },
  {
    title: "Bonus: let people push it too far",
    schema:
      "Add one slider that pushes the machine past normal, such as wind speed, and run the model live on the same panels as it moves.",
    body: (
      <>
        <p>
          One slider that drives the machine past normal (wind on the Strandbeest, in his
          example) while the model keeps running live and the panels keep reading it.
        </p>
        <Paste label="Prompt" text={LET_THEM_BREAK} />
        <p>
          Pushing a machine until it fails is the quickest way to learn what each number does.
        </p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Is the teardown skill free",
    a: `Yes. It is open source under the MIT licence, on GitHub at elvarofficial/teardown. What you pay for is Claude Code itself, which needs a paid Claude plan: Pro, at ${usd(PLANS.pro.monthly)} a month, is the cheapest one that includes it.`,
  },
  {
    q: "Do I need to know how to code",
    a: "No. You install it with two commands and then talk to Claude Code in the prompts on this page. Claude writes all of the 3D code. Your part is picking the machine, finding the picture, and looking hard at each result before the next prompt.",
  },
  {
    q: "Which Claude model should I use",
    a: "Claude Opus 5.5. Elvar built his simulators with it and Fokki's robot octopus was made with it too. Inside Claude Code, type /model to see which models your plan has and switch.",
  },
  {
    q: "Does the finished page need a server",
    a: "No. The result is one HTML file of about 800 KB that opens in any browser and works offline. Step 7 of the prompts puts it online when you want to share it, and step 6 turns it into a video.",
  },
  {
    q: "Why does it need a reference picture",
    a: "Because without one the model guesses, and the guesses look like toys. In Elvar's tests, animals built from a name alone came out generic, while one clip of a real V8 simulator was enough to rebuild the engine panel by panel. A cutaway drawing, a photo or a short clip all work.",
  },
  {
    q: "Will it run on an ordinary laptop",
    a: "Yes, if you ask for it, and step 5 does. It tells Claude to add lower quality settings for laptops without a separate graphics card. On a phone or a basic laptop the first load still takes a few seconds while the graphics compile.",
  },
];

export default function ClaudeOpus3dPage() {
  return (
    <ResourcePageShell
      slug="claude-opus-5.5-3d"
      eyebrow="Claude Code skill"
      repoCta={{ href: REPO, label: "Get the free skill on GitHub" }}
      title="Build a 3D model of any machine you can take apart, with Claude Opus 5.5"
      subhead="One free Claude Code skill, teardown by Elvar, turns a single picture into one offline HTML page: the machine in 3D, the live model that drives it, panels, buttons, camera views and a tour that runs itself. Here is the setup and every prompt, ready to copy."
      steps={steps}
      troubleshooting={["claudeNotFound", "costs"]}
      breadcrumb={[
        { name: "Claude Code", path: "/claude-code-tutorial" },
        { name: "3D models with Claude Opus 5.5", path: "/claude-opus-5.5-3d" },
      ]}
      howTo={{
        name: "Build a 3D model of any machine you can take apart with Claude Code and the teardown skill",
        description:
          "Install the free teardown skill, pick a machine and one reference picture, then paste the prompts in order: the machine and its model, the console, the look, a self-check, a page you drive, a video with sound, and publishing.",
        steps: guideSteps.map((s) => ({ name: s.title, text: s.schema })),
      }}
      faq={faq}
      guide={
        <Guide>
          <GuideSection title="What you get">
            <Answer>
              One HTML file of about 800 KB that opens in any browser, works offline, and holds
              the whole machine.
            </Answer>
            <figure className="mt-7">
              <div className="overflow-hidden rounded-xl border border-hairline bg-navy-raised">
                <LazyVideo
                  src="/opus-3d/octopus.mp4"
                  poster="/opus-3d/octopus-poster.webp"
                  placeholder={POSTER_THUMB}
                  controls
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-2.5 font-body text-sm leading-relaxed text-silver-muted">
                A robot octopus Claude Opus 5.5 built from one picture: 8 arms, 202 links and 480
                wheels, taken apart and put back together in 25 seconds. Video by{" "}
                <Out href={FOKKI_POST}>Fokki, from his post on X</Out>. Unmute it for the sound.
              </figcaption>
            </figure>
            <p>Every simulator the skill makes has the same six parts:</p>
            <KeyFacts
              rows={[
                {
                  label: "The machine",
                  value: "Every part drawn in code at real sizes, shaped after your one picture",
                },
                {
                  label: "The model",
                  value:
                    "One set of formulas driven by one input. The parts, the panels and the labels all read from it, so nothing drifts",
                },
                {
                  label: "The panels",
                  value:
                    "Live charts and gauges that move with the machine: speed, load, pressure, temperature, whatever your machine has",
                },
                {
                  label: "The buttons",
                  value:
                    "One per subsystem to isolate it, cut it open or show it alone, plus modes and sliders",
                },
                {
                  label: "The camera view",
                  value: "Drag to orbit, scroll to zoom, or jump to set views like front, side, top and inside",
                },
                {
                  label: "The tour",
                  value:
                    "Left alone, a cursor drives the page by itself. Touch anything and you take over; 25 quiet seconds and it starts again",
                },
              ]}
            />
            <Stats
              items={[
                { value: "1", label: "Picture to start from" },
                { value: "9", label: "Prompts, pasted in order" },
                { value: "~800 KB", label: "One file, works offline" },
                { value: "Free", label: "MIT licence, on GitHub" },
              ]}
            />
            <GuideToc sections={SECTIONS} />
          </GuideSection>

          <GuideSection title="The prompts, step by step">
            <Answer>
              Paste them one at a time into the same Claude Code chat, change what is in [square
              brackets] to your machine, and look at each result before the next.
            </Answer>
            <Callout title="About the brackets">
              <p>
                Everything inside [square brackets] is Elvar&rsquo;s own example, mostly the Cessna
                337 landing gear and the V8. Replace it with your machine&rsquo;s parts and numbers
                and keep every other word as it is.
              </p>
            </Callout>
            <GuideSteps steps={guideSteps} />
          </GuideSection>

          <GuideSection title="See them running">
            <Answer>
              Elvar&rsquo;s finished simulators run free in the browser at{" "}
              <Out href={SIMS}>visual-learning.app</Out>, and the three that ship with the skill
              are open source on <Out href={REPO}>GitHub</Out>.
            </Answer>
            <p>
              On the site: a robotic jellyfish, a six-legged walking robot, a sandworm boring
              machine 1.3 km long, the Strandbeest, the V8, the Cessna landing gear and a robotic
              bee, plus a long list of everyday machines opened up step by step. Press the buttons,
              isolate a part, cut it open.
            </p>
            <p>
              In the repo: the V8, the Cessna landing gear and the Strandbeest, each as the
              machine, the page you drive and the recorded film. Open one before you build your
              own and you will know exactly what the prompts are aiming at.
            </p>
            <p>
              On a phone or a laptop with built-in graphics, the first load takes a few seconds
              while the graphics compile. After that the page turns its own quality down to keep
              moving smoothly.
            </p>
          </GuideSection>

          <GuideSection title="Who made this">
            <Answer>
              Not me. The skill and the prompts are Elvar&rsquo;s, the octopus video is
              Fokki&rsquo;s, and this page only puts them in one place, ready to copy.
            </Answer>
            <ul>
              <li>
                <strong>The teardown skill and every prompt on this page:</strong>{" "}
                <Out href={ELVAR}>Elvar (@elvar_official)</Out>. He published them in his article
                on X,{" "}
                <Out href={ELVAR_ARTICLE}>
                  &ldquo;How I Turn Any Machine Into a 3D Simulator You Can Take Apart&rdquo;
                </Out>
                , which has his notes and a video of each machine.
              </li>
              <li>
                <strong>What the skill is built on:</strong>{" "}
                <Out href={CLAUDE_MOTION}>claude-motion by whaleyxbt</Out>, which gave it frame
                capture and the sound engine. Also MIT.
              </li>
              <li>
                <strong>The robot octopus video:</strong>{" "}
                <Out href={FOKKI}>Fokki (@0x_fokki)</Out>, from{" "}
                <Out href={FOKKI_POST}>his post on X</Out>.
              </li>
            </ul>
            <p>
              Never used Claude Code? <Link href="/claude-code-tutorial">Start here</Link>, and{" "}
              <Link href="/claude-code-pricing">this is what the plans cost</Link>.
            </p>
          </GuideSection>
        </Guide>
      }
      jsonLd={{
        title: "Build a 3D Model of Any Machine with Claude Opus 5.5",
        description:
          "The free teardown skill for Claude Code and nine prompts that turn one picture of a machine into a 3D model you can take apart, with live panels, buttons and a self-driving tour.",
        url: "https://www.oleg.ae/claude-opus-5.5-3d",
        datePublished: "2026-11-01",
        dateModified: "2026-11-01",
      }}
      boldaneCredit
    />
  );
}
