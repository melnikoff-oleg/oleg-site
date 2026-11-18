import Link from "next/link";
import type { ReactNode } from "react";
import { ResourcePageShell } from "@/components/resource-page-shell";
import { CopyButton } from "@/components/copy-button";
import { LazyVideo } from "@/components/lazy-video";
import { Answer, Block, Callout, Guide, GuideSection, Out, Stats } from "@/components/guide";
import { FIRST_MESSAGE, FIX, PROMPT, PROMPT_CHARS, PROMPT_HEAD, RESTYLE, TEN_IDEAS } from "./prompts";

// The free page behind Oleg's video "How to Make Viral Roblox-Style 3D Shorts in One Prompt"
// (2026-11-18). One prompt turns a Claude Code chat into a cartoon studio: blocky toy people, a
// short sad story, a narrator, captions and music. The voice and music come from ElevenLabs
// (free plan works). The prompt itself lives in the MS repo, see ./prompts.ts.
// The two videos are the ones Claude made in the video, nothing fixed by hand.

const ELEVENLABS = "https://elevenlabs.io";
const LINK =
  "text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white";

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

function Paste({ label, text, copy = "copy" }: { label: string; text: string; copy?: string }) {
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

/** The whole prompt: one button copies all of it, the box shows only how it starts. */
function ThePrompt() {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-silver">
          The prompt, {PROMPT_CHARS.toLocaleString("en-US")} characters
        </p>
        <CopyButton text={PROMPT} label="copy the whole prompt" />
      </div>
      <Block>{PROMPT_HEAD + "\n\n..."}</Block>
      <p className="mt-3 font-body text-sm leading-relaxed text-silver-muted">
        The button copies all of it. The box shows only the start.{" "}
        <a href="/3d-shorts/prompt.md" download className={LINK}>
          Or download it as a file
        </a>
        .
      </p>
    </div>
  );
}

function Short({ file, caption }: { file: string; caption: string }) {
  return (
    <figure className="w-full max-w-[260px]">
      <div className="overflow-hidden rounded-xl border border-hairline bg-navy-raised">
        <LazyVideo
          src={`/3d-shorts/${file}.mp4`}
          poster={`/3d-shorts/${file}-poster.webp`}
          aspectRatio="9 / 16"
          controls
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-2 font-body text-sm leading-relaxed text-silver-muted">{caption}</figcaption>
    </figure>
  );
}

const steps = [
  {
    title: "Copy the prompt",
    content: (
      <div>
        <ThePrompt />
      </div>
    ),
  },
  {
    title: "Open Claude Code or Codex",
    content: (
      <Do>
        <Step>
          Open the Claude app and pick <K>Code</K> on the left. In ChatGPT the same thing is called Codex
        </Step>
        <Step>Start a new, empty chat</Step>
        <Step>Pick the best model you have. I use Claude Fable 5.2 on Medium</Step>
        <Step>
          New to it?{" "}
          <Link href="/claude-code-tutorial" className={LINK}>
            Set up Claude Code first
          </Link>
        </Step>
      </Do>
    ),
  },
  {
    title: "Get a free ElevenLabs key",
    content: (
      <div>
        <Do>
          <Step>
            Go to <Out href={ELEVENLABS}>elevenlabs.io</Out> and sign up. The free plan is enough to start
          </Step>
          <Step>
            Open <K>Developers</K>, then <K>API Keys</K>, and press <K>Create key</K>
          </Step>
          <Step>Copy the key. It is one long line of letters and numbers</Step>
        </Do>
        <p className="mt-4 text-sm leading-relaxed text-silver-muted">
          ElevenLabs makes the narrator&apos;s voice and the music. It is the only outside service the prompt
          uses.
        </p>
      </div>
    ),
  },
  {
    title: "Paste it with your key and ask for a video",
    content: (
      <div>
        <Do>
          <Step>Paste the prompt into the empty chat</Step>
          <Step>
            In the very first line, put your key in place of <K>PASTE_YOUR_KEY_HERE</K>
          </Step>
          <Step>Press Enter. Claude reads it and answers that it understood</Step>
          <Step>Now ask for a video with one of these two messages</Step>
        </Do>
        <Paste label="Let Claude pick the idea" text={FIRST_MESSAGE} />
        <Paste label="Or choose from ten ideas" text={TEN_IDEAS} />
        <Do>
          <Step>Say yes when Claude asks to run a command</Step>
          <Step>Wait. My first video took about 40 minutes, the next ones are faster</Step>
          <Step>Claude shows the finished video in the chat, with music and voice</Step>
        </Do>
      </div>
    ),
  },
];

const faq = [
  {
    q: "Is it really free",
    a: "The prompt is free. ElevenLabs has a free plan with 10,000 credits a month, and the voice of one 30-second video uses about 600 of them. You still need a Claude plan with Claude Code, or a ChatGPT plan with Codex. Every video uses part of that plan's limit.",
  },
  {
    q: "Do I need an AI video generator, Roblox or a video editor",
    a: "No. Claude writes the whole cartoon as code in one web page, records that page frame by frame, and mixes in the voice and the music. No video model, no game and no editing app.",
  },
  {
    q: "How long does one video take",
    a: "My first one took about 40 minutes from the message to the finished file, because Claude also sets up its tools. The next videos in the same chat are faster. You only say yes to commands while it runs.",
  },
  {
    q: "Can I post videos made on the free ElevenLabs plan",
    a: "The free ElevenLabs plan is for non-commercial use and asks you to credit ElevenLabs. If you want to earn money with the videos, their Starter plan is $6 a month and removes both limits.",
  },
  {
    q: "What if the music does not work on my plan",
    a: "The prompt tells Claude to always finish the video. If the music cannot be made, you still get the video with the voice and captions, and you can add a track later.",
  },
  {
    q: "Can I make another style, not the blocky one",
    a: "Yes. Pick a style on the styles page, download its video, drop the file into the same chat and ask Claude to study it frame by frame and change its own instructions. The next videos come out in that style.",
  },
];

export default function Claude3dShortsPage() {
  return (
    <ResourcePageShell
      slug="claude-3d-shorts"
      eyebrow="Free prompt"
      title="Make viral Roblox-style 3D Shorts with Claude from one prompt"
      subhead="Paste one prompt into Claude Code and it becomes a cartoon studio: blocky toy people, a short story with a twist, a narrator, captions and music. No AI video generator, no Roblox, no video editor. Here is the prompt and the 5-minute setup."
      steps={steps}
      troubleshooting={["claudeNotFound", "costs"]}
      breadcrumb={[
        { name: "Claude Code", path: "/claude-code-tutorial" },
        { name: "3D Shorts with Claude", path: "/claude-3d-shorts" },
      ]}
      howTo={{
        name: "Make a Roblox-style 3D Short with Claude Code from one prompt",
        description:
          "Open Claude Code or Codex, get a free ElevenLabs API key, paste one prompt with the key in its first line, and ask for a video. Claude writes, draws, voices and renders a 30-second vertical cartoon.",
        steps: steps.map((s) => ({ name: s.title, text: s.title })),
      }}
      faq={faq}
      guide={
        <Guide>
          <GuideSection title="What you get">
            <Answer>
              A 30-second vertical cartoon, 1080 by 1920, in the &quot;In this town&quot; style: one strange rule, a
              kid who tells the story, and a twist at the end. Claude makes all of it from one message.
            </Answer>
            <Stats
              items={[
                { value: "1", label: "Prompt to paste" },
                { value: "5 min", label: "Setup" },
                { value: "$0", label: "To start: free ElevenLabs plan" },
                { value: "0", label: "Video generators or editors" },
              ]}
            />
            <p>These two are the videos Claude made while I filmed. Nothing was fixed by hand.</p>
            <div className="mt-5 flex flex-wrap gap-5">
              <Short file="goose" caption="The Goose Man. Claude picked the idea by itself." />
              <Short file="snow" caption="The Snowman. Same prompt, a new chat." />
            </div>
          </GuideSection>

          <GuideSection title="See what goes viral first">
            <Answer>
              Videos like these get millions of views. I put 15 styles on one page, each with a real video you
              can watch and open on its own platform.
            </Answer>
            <p>
              <Link href="/3d-shorts-styles" className={LINK}>
                Open the 15 viral styles
              </Link>
            </p>
          </GuideSection>

          <GuideSection title="Fix a video">
            <Answer>Send a new message in the same chat and say what to change, in plain words.</Answer>
            <Paste label="An example" text={FIX} />
            <Callout title="One fix at a time">
              <p>
                Ask for one change, look at the result, then ask for the next. Ten changes in one message are
                hard to check, and one of them usually breaks something. A small fix is also fast: Claude keeps
                the characters, the voice and the music, and redraws only the shots that change.
              </p>
            </Callout>
          </GuideSection>

          <GuideSection title="Change the style">
            <Answer>Show Claude a video in the style you want. It rewrites its own instructions.</Answer>
            <Do>
              <Step>
                Pick a style on the{" "}
                <Link href="/3d-shorts-styles" className={LINK}>
                  styles page
                </Link>{" "}
                and download its video. Your own pictures or videos work too
              </Step>
              <Step>Drop the file into the same Claude chat</Step>
              <Step>Send this message</Step>
            </Do>
            <Paste label="New style" text={RESTYLE} />
          </GuideSection>

          <GuideSection title="What it costs">
            <Answer>The prompt is free. You need a Claude or ChatGPT plan, and ElevenLabs is free to start.</Answer>
            <ul>
              <li>
                <strong>Claude:</strong> a plan that includes Claude Code. Each video uses part of its limit.{" "}
                <Link href="/claude-code-pricing">What the plans cost</Link>.
              </li>
              <li>
                <strong>ElevenLabs:</strong> the free plan gives 10,000 credits a month. The voice of one
                30-second video uses about 600.
              </li>
              <li>
                <strong>To earn money with the videos:</strong> the free ElevenLabs plan is for non-commercial
                use and asks for a credit. Starter is $6 a month and removes both.
              </li>
              <li>
                <strong>Picture:</strong> three.js, free and open source. Claude installs what it needs.
              </li>
            </ul>
          </GuideSection>
        </Guide>
      }
      jsonLd={{
        title: "Make Viral Roblox-Style 3D Shorts with Claude From One Prompt (Free)",
        description:
          "One prompt turns Claude Code into a cartoon studio that writes, draws, voices and renders 30-second 3D Shorts. The free prompt, the 5-minute setup with a free ElevenLabs key, and how to fix and restyle videos.",
        url: "https://www.oleg.ae/claude-3d-shorts",
        datePublished: "2026-11-16",
        dateModified: "2026-11-18",
      }}
      boldaneCredit
    />
  );
}
