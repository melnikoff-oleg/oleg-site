import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ResourcePageShell } from "@/components/resource-page-shell";
import {
  Answer,
  Callout,
  Code,
  CompareTable,
  Guide,
  GuideSection,
  GuideToc,
  KeyFacts,
  Out,
  Stats,
} from "@/components/guide";
import { PLANS, usd } from "@/lib/pricing";

const REPO = "https://github.com/melnikoff-oleg/instagram-viral-pages";

/**
 * One paste-able sentence that does the whole install. By the time it is pasted
 * the reader has the folder open in VS Code and Claude Code started inside it
 * (steps 4 and 6), so the prompt installs and starts rather than downloads.
 */
const SETUP_PROMPT = `Set up Viral Page Studio for me. You are inside its folder (a copy of ${REPO}). Read its README, install anything I am missing (Python 3 with pillow, ffmpeg, Node 22, yt-dlp, the Higgsfield CLI), check that the Higgsfield MCP is connected, start the studio, and tell me which link to open.`;

/** An outbound link in the house style. */
function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
    >
      {children}
    </a>
  );
}

/** A command or a prompt you paste, exactly as written. */
function Cmd({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg surface-raised border border-hairline p-4 font-mono text-sm leading-relaxed text-silver">
      {children}
    </div>
  );
}

/** Something you type literally, or a line the machine prints back. */
function K({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-vivid-blue/15 px-1.5 py-0.5 font-mono text-sm text-silver">
      {children}
    </code>
  );
}

/** The name of a button or a menu item, as it appears on screen. */
function UI({ children }: { children: ReactNode }) {
  return <span className="text-silver">{children}</span>;
}

/** The numbered actions of a step. Short lines, one thing each. */
function Do({ children }: { children: ReactNode }) {
  return <ol className="list-none space-y-2.5 text-silver">{children}</ol>;
}

function Step({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-vivid-blue/70" />
      <span className="flex-1">{children}</span>
    </li>
  );
}

/** Collapsed-by-default aside: the instruction is the step, the reason lives in here, shut. */
function Why({ label = "What is this?", children }: { label?: string; children: ReactNode }) {
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
 * The guide's walkthrough, folded. GuideSteps renders every body open, which on
 * this page made a wall; here each step is a native <details> with the title
 * as its summary, so a reader skims seven lines and opens the one they want.
 * Each keeps id="step-N", which is what the HowTo schema points at.
 */
function FoldedSteps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="mt-6 space-y-3">
      {steps.map((s, i) => (
        <li key={s.title} id={`step-${i + 1}`} className="scroll-mt-24">
          <details className="group surface-card overflow-hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-vivid-blue/[0.06] [&::-webkit-details-marker]:hidden">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-sm font-semibold text-vivid-blue">
                {i + 1}
              </span>
              <span className="flex-1 font-display text-lg font-semibold text-silver">{s.title}</span>
              <ChevronDown className="size-5 shrink-0 text-silver-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="space-y-4 border-t border-hairline px-5 pb-5 pt-4 md:px-6">{s.body}</div>
          </details>
        </li>
      ))}
    </ol>
  );
}

/** A folded block with a one-line summary, for the parts a skimmer can skip. */
function Fold({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group surface-card mt-4 overflow-hidden">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-4 font-display text-lg font-semibold text-silver transition-colors hover:bg-vivid-blue/[0.06] [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{summary}</span>
        <ChevronDown className="size-5 shrink-0 text-silver-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-hairline px-5 pb-5 pt-4 md:px-6">{children}</div>
    </details>
  );
}

const steps = [
  {
    title: "Install Visual Studio Code",
    content: (
      <div>
        <Do>
          <Step>
            Open <A href="https://code.visualstudio.com">code.visualstudio.com</A>
          </Step>
          <Step>Press the big blue download button</Step>
          <Step>Open the file it downloads and install it</Step>
          <Step>Open VS Code and leave it open</Step>
        </Do>
        <Why>
          <p>
            A free editor from Microsoft. You will not write code in it. It is the
            window everything else happens inside, and the two parts you will use are
            the folder it has open and the terminal: the menu is <UI>Terminal</UI>,
            then <UI>New Terminal</UI>, and a black panel opens at the bottom.
          </p>
          <p>
            On a Mac, drag <UI>Visual Studio Code</UI> into <UI>Applications</UI>{" "}
            first, then open it from there.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Get a Claude plan",
    content: (
      <div>
        <Do>
          <Step>
            Open <A href="https://claude.ai">claude.ai</A> and make an account
          </Step>
          <Step>
            Pick <UI>Pro</UI>, $20 a month. Already have a free account? Upgrade at{" "}
            <A href="https://claude.ai/settings/billing">claude.ai/settings/billing</A>
          </Step>
        </Do>
        <Why label="Do I really have to pay?">
          <p>
            Yes, this is the one part that costs money every month. The free plan does
            not include Claude Code at all.
          </p>
          <p>
            Pro runs everything on this page. Making a reel is a long session, so on a
            heavy day Pro can ask you to wait a few hours; one reel a day is fine. Max
            ($100 a month) is for people making several a day.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Install Claude Code",
    content: (
      <div>
        <Do>
          <Step>
            In VS Code, open <UI>Terminal</UI>, then <UI>New Terminal</UI>
          </Step>
          <Step>Paste this line and press Enter</Step>
        </Do>
        <div className="mt-3 space-y-3">
          <Cmd>curl -fsSL https://claude.ai/install.sh | bash</Cmd>
          <p className="text-sm text-silver-muted">
            On Windows: switch the terminal to <UI>PowerShell</UI> first, then paste{" "}
            <K>irm https://claude.ai/install.ps1 | iex</K> instead.
          </p>
        </div>
        <Do>
          <Step>Quit VS Code and open it again</Step>
          <Step>
            In a new terminal, type <K>claude</K> and press Enter
          </Step>
          <Step>
            Pick <UI>Claude account with subscription</UI>, sign in in the browser,
            approve it
          </Step>
          <Step>
            Type <K>/exit</K> and press Enter. That leaves Claude Code and puts you
            back in the terminal
          </Step>
        </Do>
        <Why label="The terminal and Claude Code are two different places">
          <p>
            The <strong>terminal</strong> is the black panel: a prompt line that ends
            in <K>$</K> or <K>%</K>, waiting for a command. <strong>Claude Code</strong>{" "}
            is a program you start inside it by typing <K>claude</K>: a box with a{" "}
            <K>&gt;</K> prompt, waiting for you to talk. Commands on this page go in
            the terminal; sentences go in Claude Code. <K>/exit</K> gets you from the
            box back to the terminal. If a step says &ldquo;in the terminal&rdquo; and
            you see the box, leave it first.
          </p>
          <p>
            <K>command not found: claude</K> after the install means you did not quit
            and reopen VS Code. A terminal that was already open cannot see something
            installed after it started.
          </p>
          <p>
            No browser opened? Press <K>c</K> in the terminal to copy the sign-in link
            and paste it into your browser yourself.
          </p>
          <p>
            Using Codex instead? The folder works there too: open it and it reads the
            same instructions. Everything on this page assumes Claude Code, which is
            what the studio runs.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Download the folder and open it in VS Code",
    content: (
      <div>
        <p className="mb-4 text-silver">
          Everything lives in one folder. Claude Code works on the folder it is
          started in and nothing else, so this is the step that tells it where to
          work.
        </p>
        <Do>
          <Step>
            Open <A href={REPO}>{REPO.replace("https://", "")}</A>, press the green{" "}
            <UI>Code</UI> button, then <UI>Download ZIP</UI>
          </Step>
          <Step>
            Open the downloaded file. It unpacks into a folder called{" "}
            <K>instagram-viral-pages-main</K>. Move that folder into{" "}
            <UI>Documents</UI>
          </Step>
          <Step>
            In VS Code: <UI>File</UI>, then <UI>Open Folder</UI> (on a Mac,{" "}
            <UI>Open</UI>), pick the folder, press <UI>Open</UI>. Asked whether you
            trust the authors: <UI>Yes</UI>
          </Step>
          <Step>
            <UI>Terminal</UI>, then <UI>New Terminal</UI>. The prompt now ends with
            the folder name: this terminal is inside the folder, and so is every
            terminal you open from now on
          </Step>
        </Do>
        <Why label="Why the folder comes first">
          <p>
            Claude Code reads the instructions inside the folder it is started in,
            writes your concept, your packaging and your reels into it, and the
            studio serves from it. Started somewhere else, it knows nothing about any
            of this. So the order is always the same three moves: open the folder in
            VS Code, open a terminal (it lands inside the folder), start Claude Code
            in that terminal. The same three moves bring you back tomorrow.
          </p>
          <p>
            The folder is a copy of mine with the content taken out: the studio, the
            scripts, the rules, and one complete example reel. You can rename it to
            anything; nothing inside depends on the name.
          </p>
          <p>
            Have git? <K>git clone {REPO}.git</K> in a terminal does the same, and the
            folder lands wherever that terminal was. Then open it in VS Code just the
            same.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Connect Higgsfield to Claude Code",
    content: (
      <div>
        <p className="mb-4 text-silver">
          Higgsfield makes the images and the video. Claude Code talks to it through
          an MCP server, which you connect once, in two parts: tell Claude Code the
          server exists, then sign in to it.
        </p>
        <Do>
          <Step>
            Make an account at <A href="https://higgsfield.ai">higgsfield.ai</A> and
            pick a plan with credits. A reel is about 85 credits, so three reels for
            the launch is about 250
          </Step>
          <Step>
            In the VS Code terminal (the one inside the folder, not the Claude Code
            box), paste this line and press Enter. It prints{" "}
            <K>Added HTTP MCP server higgsfield</K>
          </Step>
        </Do>
        <div className="mt-3">
          <Cmd>claude mcp add --scope user --transport http higgsfield https://mcp.higgsfield.ai/mcp</Cmd>
        </div>
        <Do>
          <Step>
            Type <K>claude</K> and press Enter to start Claude Code, then type{" "}
            <K>/mcp</K> and press Enter. A list of servers appears with{" "}
            <UI>higgsfield</UI> in it, marked as needing authentication
          </Step>
          <Step>
            Use the arrow keys to put the cursor on <UI>higgsfield</UI>, press Enter,
            then pick <UI>Authenticate</UI>. Your browser opens on higgsfield.ai
          </Step>
          <Step>
            Sign in there and approve the connection. Back in the terminal the line
            now says <UI>connected</UI>. Press <K>Esc</K> to close the list
          </Step>
          <Step>
            Type <K>/exit</K> to get back to the terminal, then check: paste{" "}
            <K>claude mcp list</K> and press Enter. The higgsfield line must end in{" "}
            <K>✔ Connected</K>
          </Step>
        </Do>
        <Why label="What is an MCP, and what if it says something else?">
          <p>
            An <strong>MCP server</strong> is how Claude Code gets to press the
            buttons of another product. Once Higgsfield is connected, Claude Code has
            tools called things like <K>generate_image</K> and <K>generate_video</K>,
            and the studio uses them for every frame and clip. The studio shows your
            credit balance at the top at all times, because Higgsfield is the one
            thing here that spends real money: about 1.5 credits per frame and about
            15 per five-second clip.
          </p>
          <p>
            <K>--scope user</K> connects it for every folder on this machine. Without
            it, Claude Code would only see Higgsfield in the folder the line was run
            in, and lose it the moment you worked anywhere else.
          </p>
          <p>
            <K>! Needs authentication</K> in the list means part two did not happen:
            start <K>claude</K>, type <K>/mcp</K> and authenticate. <K>✘ Failed to
            connect</K> is usually the internet or a typo in the address; run the{" "}
            <K>claude mcp add</K> line again (it replaces the old entry). No browser
            opened? The terminal shows the sign-in link; copy it into your browser.
            The studio shows <UI>Higgsfield MCP missing</UI> at the top when Claude
            Code cannot see the server, and says so in the chat until it can.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Make the .env file with your keys",
    content: (
      <div>
        <p className="mb-4 text-silver">
          The scripts in the folder (username checks, Pinterest references, music
          research) run on Apify, and they read your Apify key from one small file
          called <K>.env</K> in the folder. The folder does not come with it; you
          create it.
        </p>
        <Do>
          <Step>
            Make an account at <A href="https://console.apify.com">console.apify.com</A>{" "}
            (the free tier is enough). Open <UI>Settings</UI>, then{" "}
            <UI>API &amp; Integrations</UI>, and copy your <UI>Personal API token</UI>.
            It starts with <K>apify_api_</K>
          </Step>
          <Step>
            In VS Code, right-click the empty space under the file list on the left
            (the <UI>Explorer</UI>) and pick <UI>New File</UI>. Name it exactly{" "}
            <K>.env</K>: a dot, then <K>env</K>, nothing else. Press Enter
          </Step>
          <Step>Paste this into the file, with your own key after the equals sign</Step>
        </Do>
        <div className="mt-3">
          <Cmd>
            APIFY_API_KEY=apify_api_xxxxxxxxxxxxxxxxxxxxxxxx
          </Cmd>
        </div>
        <Do>
          <Step>
            Save it (<K>Cmd+S</K> on a Mac, <K>Ctrl+S</K> on Windows). It sits next to{" "}
            <K>README.md</K> in the file list
          </Step>
        </Do>
        <Why label="The rules of this file, and the optional second key">
          <p>
            One key per line, written as <K>NAME=value</K>: no spaces around the
            equals sign, no quotes, nothing else on the line. The name must be
            exactly <K>APIFY_API_KEY</K>, in capitals, because that is the name the
            scripts look for. The file must be at the top level of the folder, next
            to <K>README.md</K>, not inside a subfolder.
          </p>
          <p>
            The studio can write this file for you: the <UI>Keys</UI> button at the
            top right shows what is set and takes a key you paste. Either way the
            result is the same file. It is listed in the folder&rsquo;s{" "}
            <K>.gitignore</K>, so it never leaves your machine, and Claude Code is
            told never to print a key back.
          </p>
          <p>
            An optional second line, <K>GEMINI_API_KEY=...</K>, is only for the
            clip-by-clip motion analysis in the autopilot stage, months from now.
            There is a free tier at{" "}
            <A href="https://aistudio.google.com/apikey">aistudio.google.com</A>.
            Skip it today.
          </p>
          <p>
            Not needed, ever: an Anthropic API key. Nothing in the folder calls the
            Claude API; Claude Code runs on your plan.
          </p>
          <p>
            Can&rsquo;t see the file after saving? Files whose name starts with a dot
            are hidden by Finder and by Windows Explorer; VS Code shows them. On
            Windows, if the file was named <K>.env.txt</K> by mistake, rename it in
            VS Code to <K>.env</K>.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Start Claude Code in the folder and let it set everything up",
    content: (
      <div>
        <Do>
          <Step>
            In the VS Code terminal, inside the folder, type <K>claude</K> and press
            Enter. The welcome box shows the folder&rsquo;s path: that is Claude Code
            confirming where it is working
          </Step>
          <Step>Paste this into the box and press Enter</Step>
        </Do>
        <div className="mt-3">
          <Cmd>{SETUP_PROMPT}</Cmd>
        </div>
        <Do>
          <Step>It will ask permission a few times. Say yes</Step>
          <Step>When it hands you a link, open it. That is the studio</Step>
          <Step>
            Press <UI>Keys</UI> at the top right: Apify should show as set and
            Higgsfield as connected. If either is not, that box says what to do
          </Step>
        </Do>
        <Why label="What is it actually doing, and how do I come back tomorrow?">
          <p>
            Reading the folder&rsquo;s README, installing the free tools the reel
            pipeline needs (Python with pillow, ffmpeg, Node, yt-dlp, the Higgsfield
            CLI), checking that Higgsfield is connected, and starting the studio on
            your machine at <K>http://localhost:8788</K>. It takes a few minutes the
            first time.
          </p>
          <p>
            Leave that terminal alone once it is running. It is the engine, and
            closing it stops the studio. The studio page in your browser and the
            terminal in VS Code are the same thing from two sides; you talk in the
            browser.
          </p>
          <p>
            Coming back: open VS Code (it reopens the folder on its own; if not,{" "}
            <UI>File</UI>, <UI>Open Recent</UI>), <UI>Terminal</UI>, <UI>New
            Terminal</UI>, type <K>claude</K>, and say &ldquo;start the
            studio&rdquo;. On a Mac the shortcut is double-clicking{" "}
            <K>start.command</K> inside the folder, which does all of that in one
            click.
          </p>
          <p>
            If anything at all goes wrong here, say so in the same box. It can read its
            own error and fix it, which is the reason this page is eight steps instead
            of twenty.
          </p>
        </Why>
      </div>
    ),
  },
  {
    title: "Follow the studio",
    content: (
      <div>
        <p className="mb-4 text-silver">
          The seven steps are on the left, your page is on the right, and the chat in
          the middle is Claude Code working inside the folder. Every step has buttons
          under the chat. Press the first one.
        </p>
        <Do>
          <Step>
            <UI>Help me find my idea</UI>: answer a few questions, pick one of five
            concepts. The Concept card fills
          </Step>
          <Step>
            Drop your headshot on the References card, then <UI>Do the whole
            packaging</UI>: a free username, a profile picture in the same world as
            the content, a bio. The Packaging card shows the live profile preview
          </Step>
          <Step>
            <UI>Make reel 1</UI>, then 2, then 3. Each takes about 40 minutes and 85
            credits; the studio shows what it is doing and how long it usually takes
          </Step>
          <Step>
            Create the account with the packaging and start posting, through the
            Edits app at first, one reel a day
          </Step>
        </Do>
        <Why label="Tips, and what to do if it misbehaves">
          <p>
            Say what you think in plain words: &ldquo;the car looks fake&rdquo;,
            &ldquo;too slow&rdquo;, &ldquo;I hate the username&rdquo;. It changes the
            prompts, not just the one result, so the next reel starts from what you
            learned.
          </p>
          <p>
            The balance pill at the top goes amber under 300 credits and red under
            100. Claude says what a step will cost before spending anything and stops
            under 100.
          </p>
          <p>
            Everything it makes is a file in the folder, so nothing is lost if you
            close the studio. The chat remembers where you were when you come back.
          </p>
        </Why>
      </div>
    ),
  },
];

const SECTIONS = [
  "What it actually is",
  "The seven steps of a viral page",
  "What it costs",
  "The rules that make the reels work",
  "What it is not",
];

const guideSteps = [
  {
    title: "Choose the idea",
    schema:
      "Pick a page concept that is recognised in under a second, repeats as a series, and has one look; the studio interviews you and writes the concept document.",
    body: (
      <>
        <p>
          One document that says what the page is, who it is for and how it looks.
          Everything else is generated from it, so this is the step to spend an hour on.
        </p>
        <p>
          The test for a concept: the subject and the place are recognised in under a
          second, it repeats as a series without getting boring, and it has one look you
          can describe in five lines. Mine is iconic cars in iconic places, shot like
          stills from a film that was never made. It ships in the folder as the worked
          example and the shape to copy.
        </p>
      </>
    ),
  },
  {
    title: "Pick the vibe (optional)",
    schema:
      "Keep the default style references or drop your own stills; the look is described in words so every prompt can match it.",
    body: (
      <p>
        A handful of stills that look the way the page should look. The default set is
        the one this system was built on; drop your own on the References card if you
        want a different world. Claude writes the look down in ten lines so every image
        prompt can match it.
      </p>
    ),
  },
  {
    title: "Build the packaging",
    schema:
      "Find a free username checked against Instagram's signup form, make a profile picture in the same world as the content, write a bio with no hype, and judge it in the live profile preview.",
    body: (
      <>
        <p>
          Three things, and all three matter more than people think. A{" "}
          <strong>username</strong> that is actually free: the studio proposes sixty
          and checks them against Instagram&rsquo;s own signup form, because a
          profile scraper calls held handles &ldquo;available&rdquo; and you find out
          at signup. A <strong>profile picture</strong> made from your headshot in the
          same look as the content, so the avatar and the grid read as one world. A{" "}
          <strong>bio</strong> in lowercase, one idea per line, no hype.
        </p>
        <p>
          The Packaging card shows a pixel-level clone of the Instagram profile page
          with your draft in it, so you judge the packaging before anything exists on
          Instagram.
        </p>
      </>
    ),
  },
  {
    title: "Make the first three reels, improving the prompts after each",
    schema:
      "Run the full pipeline three times: plan four frames, pick a reference, generate 16 candidate frames, pick 4, make 4 clips of 5 seconds, add music, stitch, cover. Judge each reel and fix the prompts before the next.",
    body: (
      <>
        <p>
          A reel is four frames and four clips of five seconds: an opener, a play, a
          peak, a funny ending. For each one the studio plans the frames, finds a
          reference photo, makes sixteen candidate frames and shows you the contact
          sheet, you pick four, it makes the clips, finds three tracks, stitches the
          reel to the beat and cuts a cover.
        </p>
        <p>
          The point of doing three before posting is not the three reels. It is that
          after each one you say what is wrong and the prompts change. The first reel
          is never the good one.
        </p>
      </>
    ),
  },
  {
    title: "Create the account and start posting",
    schema:
      "Create the account with the packaging, post one reel a day through the Edits app at first, and keep improving the prompts from what you see.",
    body: (
      <>
        <p>
          Create the account with the handle, picture and bio from the card. Post
          through the <strong>Edits app</strong>, Instagram&rsquo;s own editing app,
          for the first weeks: a new account posting from Instagram&rsquo;s own tool
          seems to get a kinder start, and it costs nothing to do it that way. One
          reel a day at the same hour. Music is added at upload, never baked into the
          file.
        </p>
        <p>
          Then keep going. Paste what you see (views, saves, what people say) into the
          chat and it tells you what to change in the next series.
        </p>
      </>
    ),
  },
  {
    title: "After 100k views: put it on autopilot",
    schema:
      "Once the account has traction, schedule publishing through Blotato and add an Apify + Gemini loop that reads performance and tunes the prompts.",
    body: (
      <p>
        With some reputation on the account, publishing goes on a schedule through{" "}
        <Out href="https://blotato.com">Blotato</Out>, and an improvement loop takes
        over the judging: Apify scrapes your own reels&rsquo; numbers, Gemini watches
        the best and the worst clip by clip, and the report says exactly what to change
        in the prompts. The studio builds both with you when you get there; they are
        not worth having before the account has earned them.
      </p>
    ),
  },
  {
    title: "After 1M views: monetize",
    schema:
      "Add referral links, a digital product or a service once the audience is there; a bio that sells on day one costs the reach.",
    body: (
      <p>
        Referral links that fit the audience, a digital product that fits the concept,
        or a service. Not before: a bio that sells on day one costs the reach that
        would have made the selling worth anything.
      </p>
    ),
  },
];

const faq = [
  {
    q: "What does a viral Instagram page cost to build this way",
    a: "A Claude Pro plan at $20 a month, Higgsfield credits (about 85 per reel, so roughly 250 for the three launch reels), and cents on Apify for username checks, references and music. No Anthropic API key: Claude Code runs on the subscription.",
  },
  {
    q: "Do I need to know how to code",
    a: "No. You install VS Code and Claude Code, open one folder, make one small file with your Apify key in it, paste one sentence, and from then on you talk to a chat and press buttons. Everything technical is done by Claude Code inside the folder. If something breaks, you paste the error at it and it fixes its own setup.",
  },
  {
    q: "How long does one reel take",
    a: "About 40 minutes, most of it waiting for Higgsfield. The studio shows what it is doing, how long it has been working, and how long the step usually takes. You are needed twice: to pick four frames from the contact sheet and to say what you think at the end.",
  },
  {
    q: "Why post through the Edits app",
    a: "Edits is Instagram's own editing app. A brand new account posting from Instagram's own tool seems to get a kinder start than one uploading finished files, and it costs nothing to do it that way for the first weeks. Once the account has traction, publishing moves to Blotato on a schedule.",
  },
  {
    q: "Can I use my own idea instead of cars",
    a: "That is the point. Step one is choosing your idea; the cars-in-places concept ships as the worked example and the shape to copy. The rules that make the reels work (recognition in the first second, one look, the subject always moving, the four-clip structure) carry over to any subject.",
  },
  {
    q: "Is the AI content labelled",
    a: "Yes. Every post carries Instagram's AI content label in the packaging, and the account is positioned as stills from films that were never made, not as photography. Hiding it would not survive the first comment anyway.",
  },
  {
    q: "Does it work with Codex",
    a: "The folder's instructions are agent-agnostic, so Codex can work in it from the same files. The studio itself runs Claude Code headlessly, which is why this page leads with Claude Code.",
  },
];

export default function InstagramViralPagesPage() {
  return (
    <ResourcePageShell
      slug="instagram-viral-pages"
      repoCta={{ href: REPO }}
      title="Build a viral Instagram page with Claude Code"
      subhead="Download one folder, open it in VS Code, start Claude Code inside it, and a local studio walks you through the seven steps: the idea, the packaging, the first reels, posting, autopilot. Claude Code does the work; you press the buttons."
      steps={steps}
      troubleshooting={["claudeNotFound", "costs", "costsScraping", "skipPermissions"]}
      breadcrumb={[
        { name: "Claude Code", path: "/claude-code-tutorial" },
        { name: "Viral Instagram pages", path: "/instagram-viral-pages" },
      ]}
      howTo={{
        name: "Build a viral Instagram theme page with Claude Code and Viral Page Studio",
        description:
          "Set up the studio with one prompt, choose a concept, build the packaging, make the first three reels, post through the Edits app, then automate and monetize once the account has traction.",
        totalTime: "PT4H",
        steps: guideSteps.map((s) => ({ name: s.title, text: s.schema })),
      }}
      faq={faq}
      guide={
        <Guide>
          <GuideSection title="What it actually is">
            <Answer>
              A local app that runs Claude Code inside one folder and fills in your Instagram page as you talk to it: the concept, the username, the profile picture, the bio, the reels.
            </Answer>
            <Stats
              items={[
                { value: "7", label: "Steps, from idea to monetization" },
                { value: "~85", label: "Higgsfield credits per reel" },
                { value: "0", label: "Anthropic API keys" },
              ]}
            />
            <p>
              <strong>Left: the seven steps.</strong> <strong>Middle: a chat</strong>,
              which is Claude Code working inside the folder, with a button for every
              action. <strong>Right: your page</strong>, as cards that fill themselves
              from the files Claude writes. Your Higgsfield balance sits at the top,
              because that is the one thing here that spends money.
            </p>
            <p>
              Every rule I learned building my own page is in the folder, and Claude
              Code reads them on every turn. You never have to.
            </p>
            <GuideToc sections={SECTIONS} />
          </GuideSection>

          <GuideSection title="The seven steps of a viral page">
            <p>
              Four of these happen in the studio. The last three happen on
              Instagram, once the account has earned them. Open the ones you want.
            </p>
            <FoldedSteps steps={guideSteps} />
          </GuideSection>

          <GuideSection title="What it costs">
            <KeyFacts
              rows={[
                { label: "Claude", value: `Pro, ${usd(PLANS.pro.monthly)} a month. The studio runs on your plan, no API key` },
                { label: "Higgsfield", value: "About 85 credits per reel: 16 frames at 1.5, 4 draft clips at about 15" },
                { label: "Apify", value: "Cents: a cent per username check, a few cents per reference or music run" },
                { label: "Gemini", value: "Optional, free tier, for the motion analysis in the autopilot" },
              ]}
            />
            <CompareTable
              columns={["what", "credits", "time"]}
              rows={[
                { label: "Profile picture (3 variants)", cells: ["about 5", "5 min"] },
                { label: "One reel", cells: ["about 85", "40 min"] },
                { label: "The three launch reels", cells: ["about 250", "an afternoon"] },
              ]}
              caption="Draft-quality clips. Finalising a clip to 1080p is a separate Higgsfield call and costs more; do it only for the reels you post."
            />
          </GuideSection>

          <GuideSection title="The rules that make the reels work">
            <p>
              These are in the folder, so you do not have to remember them. They are the
              difference between a reel that looks like a film still and one that looks
              like AI.
            </p>
            <Fold summary="The six rules">
            <ol className="guide-list">
              <li>
                <strong>Recognition in the first second.</strong> The subject and the
                place readable in frame one of clip one. The landmark is never revealed
                later.
              </li>
              <li>
                <strong>One look.</strong> A twilight sky, dark warm ground, one hot
                light that belongs to the subject, coarse grain, nothing tack sharp.
                Crisp detail is what makes AI images look fake.
              </li>
              <li>
                <strong>The subject is always moving.</strong> Fast and straight, or
                sliding. Never standing. The wheels visibly spinning in every clip; a
                moving car with frozen rims is rejected on sight.
              </li>
              <li>
                <strong>One camera behaviour per clip.</strong> Locked, tracking
                alongside, following, or one pan. No orbits, no jumps, nothing
                airborne. Real-time speed with a number in the prompt.
              </li>
              <li>
                <strong>Something near the lens and something near the subject</strong>{" "}
                in every frame, so the clip has layers that move. A distant landmark
                alone gives no motion.
              </li>
              <li>
                <strong>Four clips, cut on the beat.</strong> Opener, play, peak, funny
                ending. The music&rsquo;s drop lands on the cut into the play.
              </li>
            </ol>
            </Fold>
            <Callout title="The honest quality line">
              <p>
                The first reel is not the good one. The system is built around that:
                you judge each reel in plain words and the prompts change, so the third
                reel is made with everything the first two taught you. Expect to throw
                the first one away.
              </p>
            </Callout>
          </GuideSection>

          <GuideSection title="What it is not">
            <ul>
              <li>
                <strong>Not free.</strong> A Claude plan and Higgsfield credits. The
                credits are the real cost, and the studio keeps them in front of you.
              </li>
              <li>
                <strong>Not instant.</strong> Forty minutes a reel, most of it waiting
                for the generator. Press the button and go and do something else.
              </li>
              <li>
                <strong>Not a guarantee of views.</strong> It makes the page that gives
                you the best shot: recognisable in a second, one look, consistent
                posting. Whether people watch is still the idea.
              </li>
              <li>
                <strong>Not a video editor.</strong> It generates and stitches. For
                cutting your own footage,{" "}
                <Link href="/claude-code-instagram">Reel Studio</Link> is the one.
              </li>
            </ul>
            <p>
              Never used <Code>claude code</Code>?{" "}
              <Link href="/claude-code-tutorial">Start here</Link>, and{" "}
              <Link href="/claude-code-pricing">this is what the plans cost</Link>. The
              research half, deciding what the next series should be from what already
              went viral, is <Link href="/claude-reels">the reels system</Link>.
            </p>
          </GuideSection>
        </Guide>
      }
      jsonLd={{
        title: "Build a Viral Instagram Page with Claude Code: Free Setup Guide",
        description:
          "Set up Viral Page Studio in eight setup steps and let it walk you through the seven stages of a viral Instagram theme page: the idea, the packaging, the first reels, posting, autopilot, monetization.",
        url: "https://www.oleg.ae/instagram-viral-pages",
        datePublished: "2026-10-29",
        dateModified: "2026-10-29",
      }}
      boldaneCredit
    />
  );
}
