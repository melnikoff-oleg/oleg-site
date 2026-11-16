import Link from "next/link";
import type { ReactNode } from "react";
import { ResourcePageShell } from "@/components/resource-page-shell";
import { CopyButton } from "@/components/copy-button";
import { LazyVideo } from "@/components/lazy-video";
import { Answer, Block, Callout, Guide, GuideSection, GuideSteps, KeyFacts, Out, Stats } from "@/components/guide";
import { PLANS, usd } from "@/lib/pricing";
import { COFFEE, DOG, ELEVEN, FIX_FRAME, INSTALL_SKILLS, START, TEMPLATE, TOWN } from "./prompts";

// The free guide behind Oleg's video about 3D Shorts made by Claude from one prompt.
// The three videos are the first results of three clean runs on 2026-11-16: an empty
// folder, the prompt in ./prompts.ts, nothing else. Nothing was fixed by hand after.
// Source, reports and full-size files: MS repo, projects/accounts/oleg_melnikov/
// videos_2026-11-16/2_3d_shorts/one_prompt.

const HYPERFRAMES = "https://github.com/heygen-com/hyperframes";
const OPENVERSE = "https://openverse.org";
const ELEVENLABS = "https://elevenlabs.io/pricing";

function K({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-vivid-blue/15 px-1.5 py-0.5 font-mono text-sm text-silver [overflow-wrap:anywhere]">
      {children}
    </code>
  );
}

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

/** One test: the vertical video next to the exact prompt that made it. */
function Test({ file, prompt, facts }: { file: string; prompt: string; facts: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-[240px_1fr] md:items-start">
      <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-hairline bg-navy-raised">
        <LazyVideo
          src={`/3d-shorts/${file}.mp4`}
          poster={`/3d-shorts/${file}-poster.webp`}
          aspectRatio="9 / 16"
          controls
          className="block h-auto w-full"
        />
      </div>
      <div className="min-w-0">
        <Paste label="The prompt" text={prompt} />
        <p className="mt-3 font-body text-sm leading-relaxed text-silver-muted">{facts} Unmute it for the sound.</p>
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Check what you need",
    content: (
      <Do>
        <Step>
          A Claude plan that includes Claude Code. Pro, {usd(PLANS.pro.monthly)} a month, is the cheapest one
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
          Node.js 22 or newer. Type <K>node -v</K> in a terminal to check; get it from{" "}
          <Out href="https://nodejs.org">nodejs.org</Out>
        </Step>
        <Step>ffmpeg and Python 3. If one is missing, Claude Code installs it when you ask</Step>
      </Do>
    ),
  },
  {
    title: "Install the HyperFrames skills (one line, once)",
    content: (
      <div>
        <Do>
          <Step>Open a terminal and paste this line</Step>
        </Do>
        <Paste label="Install" text={INSTALL_SKILLS} copy="copy" />
        <p className="mt-4 text-sm leading-relaxed text-silver-muted">
          HyperFrames is a free, open source tool that turns a web page into a video file. The skills teach
          Claude Code how to use it. My three tests ran with them installed.
        </p>
      </div>
    ),
  },
  {
    title: "Open Claude Code in an empty folder",
    content: (
      <div>
        <Do>
          <Step>Paste this line. It makes a folder, goes into it and starts Claude Code</Step>
        </Do>
        <Paste label="Start" text={START} copy="copy" />
      </div>
    ),
  },
  {
    title: "Paste one prompt and wait",
    content: (
      <Do>
        <Step>Copy one of the three prompts below, or the template with your own story</Step>
        <Step>Paste it into Claude Code and press Enter</Step>
        <Step>Say yes when Claude asks to run a command. It installs the free voice by itself</Step>
        <Step>
          Wait 20 to 25 minutes. Claude opens <K>video.mp4</K> when it is done
        </Step>
      </Do>
    ),
  },
];

const tests = [
  {
    title: "What if your dog doubled in size every 10 seconds?",
    body: (
      <Test
        file="dog"
        prompt={DOG}
        facts="Done in 26 minutes. One narrator, one music track and 35 sound effects. The counter uses the real doubling maths: the dog passes the Eiffel Tower at 1:30."
      />
    ),
  },
  {
    title: "Two helpers fix a coffee machine",
    body: (
      <Test
        file="coffee"
        prompt={COFFEE}
        facts="Done in 19 minutes. Two voices, one music track and 33 sound effects, 12 camera shots."
      />
    ),
  },
  {
    title: "In this town, everyone must walk backwards",
    body: (
      <Test
        file="town"
        prompt={TOWN}
        facts="Done in 23 minutes. Eight scenes of 2.6 seconds each and a twist ending. Claude wrote every joke."
      />
    ),
  },
];

const faq = [
  {
    q: "Is it really free",
    a: `The tools are free: three.js draws the picture, HyperFrames turns it into a video, the voice is Kokoro (a free model that runs on your computer), and the music and sound effects are CC0 files from Openverse. No API keys. What you pay for is Claude Code itself: it needs a paid Claude plan, and Pro at ${usd(PLANS.pro.monthly)} a month is the cheapest one.`,
  },
  {
    q: "Do I need an MCP, Blender or a video model",
    a: "No. Claude writes the whole cartoon as code in one web page, and HyperFrames records that page frame by frame. Nothing is connected to Claude and no video model is used.",
  },
  {
    q: "How long does one video take",
    a: "19, 23 and 26 minutes in my three tests, from pasting the prompt to the finished 30-second file. You do not have to do anything while it runs except say yes to commands.",
  },
  {
    q: "How much of my Claude plan does one video use",
    a: "A lot. Each test used between $7 and $9 of tokens at API prices on Claude Fable 5.2. On a plan you do not pay that, but it comes out of your usage limit, so on Pro expect only a few videos before you hit it.",
  },
  {
    q: "Can I use a better voice",
    a: "Yes. The free voice is clear but a bit flat. ElevenLabs sounds more alive. One 30-second cartoon has about 600 characters of speech, which is about 600 credits, or about $0.12 on the $6 Starter plan (30,000 credits a month). Voices, music and sound effects all from ElevenLabs took about 2,000 credits a cartoon in my own series, about $0.40.",
  },
  {
    q: "Can I post these videos",
    a: "The picture is your own code. The music and sounds are CC0, which means no credit is needed. Claude lists every sound it used in a file inside the project, so you can check each one. Use your own characters, not ones from a film or a game.",
  },
];

export default function Claude3dShortsPage() {
  return (
    <ResourcePageShell
      slug="claude-3d-shorts"
      eyebrow="Free guide"
      title="Make 3D cartoon Shorts with Claude from one prompt"
      subhead="One short prompt, and Claude Code makes a 30-second 3D cartoon with voices, music and sound effects. Only free tools. No MCP, no Blender, no API keys. Here is the exact prompt and the three videos it made on the first try."
      steps={steps}
      troubleshooting={["claudeNotFound", "costs"]}
      breadcrumb={[
        { name: "Claude Code", path: "/claude-code-tutorial" },
        { name: "3D Shorts with Claude", path: "/claude-3d-shorts" },
      ]}
      howTo={{
        name: "Make a 3D cartoon Short with Claude Code from one prompt",
        description:
          "Install Claude Code, Node.js, ffmpeg and the free HyperFrames skills, open Claude Code in an empty folder, paste one prompt and wait about 20 minutes for a 30-second vertical video with sound.",
        steps: steps.map((s) => ({ name: s.title, text: s.title })),
      }}
      faq={faq}
      guide={
        <Guide>
          <GuideSection title="What you get">
            <Answer>
              A 30-second vertical video, 1080 by 1920, with a story, voices, captions, music and a sound on
              every action. Claude makes all of it from one message.
            </Answer>
            <Stats
              items={[
                { value: "1", label: "Prompt, about 110 words" },
                { value: "$0", label: "For tools. No API keys" },
                { value: "~20 min", label: "From prompt to video" },
                { value: "0", label: "MCPs, plugins or 3D apps" },
              ]}
            />
            <p>
              The three videos below are first results. Each one came from an empty folder and the prompt next
              to it. I did not fix anything by hand.
            </p>
          </GuideSection>

          <GuideSection title="The three tests">
            <Answer>Same recipe, three different stories. Copy any of them as it is.</Answer>
            <GuideSteps steps={tests} />
          </GuideSection>

          <GuideSection title="The prompt, line by line">
            <Answer>
              Keep every line and change only the story. This is the template.
            </Answer>
            <Paste label="Template" text={TEMPLATE} />
            <KeyFacts
              rows={[
                { label: "30-second vertical 3D cartoon", value: "Sets the length and the 9:16 shape for Shorts, Reels and TikTok" },
                { label: "Your story", value: "Two or three sentences: who, what goes wrong, how it ends. Name the style (low-poly, blocky toys) and who talks" },
                { label: "three.js as a HyperFrames project", value: "three.js draws 3D in a web page. HyperFrames records that page frame by frame into video.mp4. Both are free" },
                { label: "Only free tools, no API keys", value: "Stops Claude from reaching for paid voice or music services" },
                { label: "Voice: npx hyperframes tts", value: "A free voice model (Kokoro) that runs on your computer. Claude installs it the first time" },
                { label: "Music and a sound on every action", value: "Claude searches Openverse for CC0 sounds, cuts them and sets the volume. Silence is what makes code cartoons feel cheap" },
                { label: "Big captions, something new every 2 seconds", value: "The two things that keep people watching a Short" },
                { label: "Look at the frames yourself and fix", value: "The most important line. Claude takes pictures of its own video, finds what looks bad and repairs it before you see it" },
              ]}
            />
            <Callout title="Make it your own">
              <p>
                For a series, add one line that names your heroes and how they look, and use the same line in
                every prompt. For another language, write the story in that language.
              </p>
            </Callout>
          </GuideSection>

          <GuideSection title="Make a result better">
            <Answer>
              Send a second message in the same chat. Say what is wrong in plain words and ask for a new
              render.
            </Answer>
            <p>
              In all three tests the heroes sat in the upper part of the frame and the bottom third was mostly
              empty. This fixes it:
            </p>
            <Paste label="Fill the frame" text={FIX_FRAME} />
            <p>
              Claude cannot hear. It measures how loud the sound is, but it does not know if a joke lands or
              if the music fits. Listen once and tell it what to change.
            </p>
          </GuideSection>

          <GuideSection title="What it costs">
            <Answer>
              The tools cost nothing. You need a Claude plan, and each video uses a good part of its limit.
            </Answer>
            <ul>
              <li>
                <strong>Picture and render:</strong> three.js and <Out href={HYPERFRAMES}>HyperFrames</Out>,
                both open source.
              </li>
              <li>
                <strong>Voice:</strong> Kokoro, free, runs on your computer.
              </li>
              <li>
                <strong>Music and sound effects:</strong> CC0 files found through{" "}
                <Out href={OPENVERSE}>Openverse</Out>. No account.
              </li>
              <li>
                <strong>Claude:</strong> each test used $7 to $9 of tokens at API prices on Claude Fable 5.2.
                On a plan that comes out of your limit instead of your card.{" "}
                <Link href="/claude-code-pricing">What the plans cost</Link>.
              </li>
            </ul>
            <p>
              Want a livelier voice? Get a key from <Out href={ELEVENLABS}>ElevenLabs</Out>, put it in a file
              named <K>.env</K> in the folder, and send this. A 30-second cartoon has about 600 characters of
              speech: about $0.12 on the $6 Starter plan.
            </p>
            <Paste label="Better voice (optional, paid)" text={ELEVEN} />
          </GuideSection>
        </Guide>
      }
      jsonLd={{
        title: "Make 3D Cartoon Shorts with Claude From One Prompt (Free)",
        description:
          "One short prompt and Claude Code makes a 30-second 3D cartoon with voices, music and sound effects, using only free tools. The exact prompt and three test videos.",
        url: "https://www.oleg.ae/claude-3d-shorts",
        datePublished: "2026-11-16",
        dateModified: "2026-11-16",
      }}
      boldaneCredit
    />
  );
}
