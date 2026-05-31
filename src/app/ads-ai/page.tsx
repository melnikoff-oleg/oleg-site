"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Accordion } from "@/components/accordion";
import { ResourceFooter } from "@/components/resource-footer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const howItWorks = [
  {
    step: "1",
    title: "collect brand",
    description:
      "scrape your website and Instagram, extract products, and build a complete brand profile with AI visual analysis.",
  },
  {
    step: "2",
    title: "find competitors",
    description:
      "search the Meta Ad Library by keywords, find advertisers spending real money, and rank them by performance signals.",
  },
  {
    step: "3",
    title: "analyze patterns",
    description:
      "AI analyzes top competitor ads and extracts winning hooks, copy structures, emotional angles, and visual approaches.",
  },
  {
    step: "4",
    title: "create ads",
    description:
      "generate ad concepts with AI-written copy and AI-generated visuals, each one replicating a proven competitor strategy.",
  },
];

const steps = [
  {
    title: "install prerequisites",
    content: (
      <div className="space-y-3">
        <p>you need three things installed:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <a
              href="https://nodejs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
            >
              Node.js 18+
            </a>{" "}
            — the runtime for the web app
          </li>
          <li>
            <a
              href="https://code.visualstudio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
            >
              VS Code
            </a>{" "}
            — recommended editor for the best experience with Claude Code
          </li>
          <li>
            <span className="text-white">Claude Code</span> — install the{" "}
            <a
              href="https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
            >
              VS Code extension
            </a>{" "}
            from the marketplace, or use the CLI (
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">
              npm install -g @anthropic-ai/claude-code
            </code>
            ). requires a $19/mo subscription.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "clone the repo and set up API keys",
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <p>clone the repository and create your environment file:</p>
          <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-zinc-300">
            <code>{`git clone https://github.com/melnikoff-oleg/ads-ai.git
cd ads-ai
cp .env.example .env`}</code>
          </pre>
        </div>
        <p>
          open{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">
            .env
          </code>{" "}
          and fill in your API keys:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-zinc-500">
                <th className="pb-2 pr-4 font-medium">variable</th>
                <th className="pb-2 pr-4 font-medium">purpose</th>
                <th className="pb-2 font-medium">where to get it</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                  ANTHROPIC_API_KEY
                </td>
                <td className="py-2 pr-4">ad copy, analysis, QC</td>
                <td className="py-2">
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    console.anthropic.com
                  </a>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                  GEMINI_API_KEY
                </td>
                <td className="py-2 pr-4">brand image analysis</td>
                <td className="py-2">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    aistudio.google.com
                  </a>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                  FIRECRAWL_API_KEY
                </td>
                <td className="py-2 pr-4">website scraping</td>
                <td className="py-2">
                  <a
                    href="https://firecrawl.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    firecrawl.dev
                  </a>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                  APIFY_API_TOKEN
                </td>
                <td className="py-2 pr-4">Instagram + Meta Ad Library</td>
                <td className="py-2">
                  <a
                    href="https://console.apify.com/account/integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    console.apify.com
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                  KIE_AI_API_KEY
                </td>
                <td className="py-2 pr-4">AI image generation</td>
                <td className="py-2">
                  <a
                    href="https://kie.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    kie.ai
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "install and run",
    content: (
      <div className="space-y-3">
        <p>install dependencies and start the dev server:</p>
        <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-zinc-300">
          <code>{`cd app
npm install
npm run dev`}</code>
        </pre>
        <p>
          open{" "}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-white"
          >
            localhost:3000
          </a>{" "}
          — you should see the brand context page.
        </p>
      </div>
    ),
  },
  {
    title: "collect your brand context",
    content: (
      <div className="space-y-4">
        <p>two ways to do this:</p>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-white">
              option A — web form{" "}
              <span className="font-normal text-zinc-500">(quick)</span>
            </p>
            <p className="mt-1">
              go to /brand in the app, enter your website URL and optional
              Instagram handle, and click &quot;Scrape Brand.&quot; the tool
              crawls your site, extracts products, downloads visuals, and builds
              your brand profile automatically.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">
              option B — Claude Code{" "}
              <span className="font-normal text-zinc-500">(flexible)</span>
            </p>
            <p className="mt-1">
              open Claude Code in the project folder and run{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">
                /collect-brand
              </code>
              . this guided flow accepts any combination of website URL,
              Instagram handle, keywords, or files. it uses Gemini AI to analyze
              your images and videos too.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "find competitors and analyze",
    content: (
      <div className="space-y-3">
        <p>
          go to /competitors in the app. the tool searches the{" "}
          <span className="text-white">Meta Ad Library</span> by keywords
          related to your brand — keywords are auto-suggested from your brand
          context.
        </p>
        <p>
          it finds advertisers actually spending money and ranks them by days
          running (longer = more profitable), ad count, and creative diversity.
        </p>
        <p>
          then go to /analysis — Claude analyzes the top 25 competitor ads and
          extracts deep hook analysis (exact opening text, technique, and
          psychology) and winning patterns across copy structure, emotional
          angle, and visual approach.
        </p>
      </div>
    ),
  },
  {
    title: "generate your ads",
    content: (
      <div className="space-y-3">
        <p>
          go to /create — set how many concepts you want (1-30), pick which
          products to feature, and hit generate.
        </p>
        <p>
          concepts are generated in parallel batches of 3, roughly 2 minutes per
          batch. each concept includes:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>AI-written ad copy — headline, primary text, description, CTA</li>
          <li>
            AI-generated image matching the competitor&apos;s visual approach
          </li>
          <li>
            side-by-side comparison with the reference ad so you can see exactly
            what strategy was replicated
          </li>
          <li>
            video concepts for video reference ads — scene-by-scene script + key
            frame
          </li>
        </ul>
        <p>
          every concept goes through automatic quality control — only passing
          concepts are shown.
        </p>
      </div>
    ),
  },
  {
    title: "using Claude Code in your project",
    content: (
      <div className="space-y-3">
        <p>
          open the ads-ai folder in VS Code, then open Claude Code (click the
          sidebar icon or press{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">
            Cmd+Shift+P
          </code>{" "}
          and search &quot;Claude Code&quot;).
        </p>
        <p>Claude Code gives you superpowers in this project:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">
              /collect-brand
            </code>{" "}
            for guided brand context collection via chat
          </li>
          <li>
            ask it to customize the tool — add new features, change the UI,
            tweak the prompts
          </li>
          <li>
            debug issues — paste an error and Claude Code will fix it in context
          </li>
          <li>
            the project has a detailed CLAUDE.md that gives Claude Code full
            understanding of the codebase
          </li>
        </ul>
      </div>
    ),
  },
];

export default function AdsAiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "AI Ads Creator — Free Open Source Tool",
    description:
      "Clone winning Meta ads with AI. Study competitors' proven ads and generate new ad concepts — copy, visuals, and video scripts.",
    url: "https://oleg.ae/ads-ai",
    datePublished: "2026-05-31",
    dateModified: "2026-05-31",
    author: {
      "@type": "Person",
      name: "Oleg Melnikov",
      url: "https://oleg.ae",
      sameAs: [
        "https://www.youtube.com/@Oleg-Melnikov",
        "https://www.linkedin.com/in/olegai",
        "https://www.instagram.com/melnikoff_oleg",
      ],
    },
    publisher: {
      "@type": "Person",
      name: "Oleg Melnikov",
      url: "https://oleg.ae",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://oleg.ae/ads-ai",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Minimal header */}
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-[family-name:var(--font-unbounded)] tracking-tight"
          >
            oleg melnikov
          </Link>
          <Link
            href="https://www.youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            youtube
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400"
            >
              free open source tool
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-8 text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl"
            >
              AI ads creator
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg text-zinc-400 md:text-xl"
            >
              study your competitors&apos; proven Meta ads, analyze what&apos;s
              working, and generate new ad concepts for your brand — AI-written
              copy, AI-generated visuals, and video scripts.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a
                href="https://github.com/melnikoff-oleg/ads-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                download on github
              </a>
              <a
                href="#setup"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
              >
                setup guide
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* How it works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="pb-16 md:pb-20"
        >
          <div className="mx-auto max-w-3xl px-6">
            <motion.h2
              variants={fadeUp}
              className="text-sm uppercase tracking-widest text-zinc-500"
            >
              how it works
            </motion.h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {howItWorks.map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <span className="text-xs font-medium text-zinc-600">
                    step {item.step}
                  </span>
                  <h3 className="mt-1 text-sm font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Setup guide */}
        <motion.section
          id="setup"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="scroll-mt-8 pb-24 md:pb-32"
        >
          <div className="mx-auto max-w-3xl px-6">
            <motion.h2
              variants={fadeUp}
              className="text-sm uppercase tracking-widest text-zinc-500"
            >
              setup guide
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-8">
              <Accordion items={steps} />
            </motion.div>
          </div>
        </motion.section>
      </main>

      <ResourceFooter currentSlug="ads-ai" />
    </>
  );
}
