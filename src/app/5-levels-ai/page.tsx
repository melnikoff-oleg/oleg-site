"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Fragment, type ReactNode } from "react";
import { ResourceFooter } from "@/components/resource-footer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

type Level = {
  level: string;
  role: string;
  agents: string;
  looks: ReactNode;
  stuck: ReactNode;
  icon: ReactNode;
};

// Small line icons, one per rung of the ladder.
const icons: Record<string, ReactNode> = {
  chatter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="3" />
      <path d="M8 17l-3 4v-4" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  micromanager: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
  orchestrator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.4" />
      <path d="M10.8 7.2L5.5 15" />
      <path d="M12 7.6V15" />
      <path d="M13.2 7.2l5.3 7.8" />
      <circle cx="5" cy="17.5" r="1.9" />
      <circle cx="12" cy="17.5" r="1.9" />
      <circle cx="19" cy="17.5" r="1.9" />
    </svg>
  ),
  manager: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2.2" />
      <path d="M12 6.2V9M12 9H6.5v2.3M12 9h5.5v2.3" />
      <circle cx="6.5" cy="13" r="1.8" />
      <circle cx="17.5" cy="13" r="1.8" />
      <path d="M6.5 14.8v1.7M6.5 16.5H4v1.7M6.5 16.5H9v1.7" />
      <path d="M17.5 14.8v1.7M17.5 16.5H15v1.7M17.5 16.5H20v1.7" />
      <circle cx="4" cy="19.8" r="1.4" />
      <circle cx="9" cy="19.8" r="1.4" />
      <circle cx="15" cy="19.8" r="1.4" />
      <circle cx="20" cy="19.8" r="1.4" />
    </svg>
  ),
  ceo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21V3" />
      <path d="M6 4h11l-2.6 3.5L17 11H6" />
    </svg>
  ),
};

const levels: Level[] = [
  {
    level: "Level 0",
    role: "The Chatter",
    agents: "0",
    looks:
      "You ask, AI answers, you copy-paste into your real work. The AI never touches your files or projects.",
    stuck: (
      <>
        You think chatting <strong>is</strong> using AI. By this map, it barely
        counts.
      </>
    ),
    icon: icons.chatter,
  },
  {
    level: "Level 1",
    role: "The Micromanager",
    agents: "1",
    looks:
      "One agent works inside your projects, but you watch every move and approve everything it does.",
    stuck: (
      <>
        <strong>Trust.</strong> You read everything, so you can never look away.
      </>
    ),
    icon: icons.micromanager,
  },
  {
    level: "Level 2",
    role: "The Orchestrator",
    agents: "~10",
    looks:
      "5 to 10 agents on separate tasks at once, each checking its own work. You review results, not keystrokes.",
    stuck: "You're the reviewer of six streams of output, and steering eats your day.",
    icon: icons.orchestrator,
  },
  {
    level: "Level 3",
    role: "The Manager",
    agents: "~100",
    looks:
      'Agents launch agents; work runs while you sleep. "Did you check it?" becomes "what context was it missing?"',
    stuck: (
      <>
        Not the AI. <strong>Your clarity.</strong> A vague vision wastes an army.
      </>
    ),
    icon: icons.manager,
  },
  {
    level: "Level 4",
    role: "The CEO",
    agents: "1,000+",
    looks:
      "Events launch agents, not you. A client interview ends, and an agent turns it into content. An order comes in, and an agent handles it. You set the direction and review exceptions.",
    stuck:
      "Finding enough work worth automating, and the right guardrails for each kind.",
    icon: icons.ceo,
  },
];

// The move between two rungs, shown as a dark band under each level.
const moves: { to: string; text: ReactNode; cmds: string[] }[] = [
  {
    to: "level 1",
    text: "Install an agent (Claude Code), give it one real folder of your work, and let it work where the work lives.",
    cmds: ["npm install -g @anthropic-ai/claude-code", "claude"],
  },
  {
    to: "level 2",
    text: "Let the agent check its own work, turn on auto-accept, and start a second task while the first one runs.",
    cmds: ["claude --dangerously-skip-permissions", "/code-review"],
  },
  {
    to: "level 3",
    text: "Write the vision down. Turn repeating work into loops and routines. Let agents kick off other agents.",
    cmds: ["/goal", "/loop", "ultracode", "/schedule"],
  },
  {
    to: "level 4",
    text: "Wire agents into your systems with the Agent SDK, the same Claude Code, but launched from your own code. An event fires, an agent runs, and the work is done before you even look.",
    cmds: ["Claude Agent SDK", "CLAUDE.md + skills"],
  },
];

function MoveRow({ to, text, cmds }: { to: string; text: ReactNode; cmds: string[] }) {
  return (
    <tr>
      <td colSpan={4} className="surface-raised border-b border-hairline px-5 py-4 sm:px-6">
        <span className="eyebrow mr-2 whitespace-nowrap text-[0.68rem] font-semibold text-vivid-blue/90">
          how to get to {to}
        </span>
        <span className="font-body text-sm text-silver-muted">{text}</span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {cmds.map((c) => (
            <span
              key={c}
              className="rounded border border-vivid-blue/40 px-2.5 py-1 font-mono text-xs font-medium text-vivid-blue/90"
            >
              {c}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

export default function FiveLevelsPage() {
  return (
    <>
      {/* Minimal header */}
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            oleg melnikov
          </Link>
          <a
            href="https://youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 font-body text-sm font-medium text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path fill="black" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            youtube
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <motion.span
              variants={fadeUp}
              className="eyebrow inline-block rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90"
            >
              5 levels &middot; find your rung &middot; take the next step
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="text-metallic mt-8 font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-4xl md:text-5xl"
            >
              the builder&apos;s ladder
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 font-body text-lg text-silver-muted md:text-xl"
            >
              the 5 levels of AI adoption, from copy-pasting out of a chat window
              to a thousand agents that launch themselves.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-3 font-body text-sm text-silver-muted"
            >
              find where you are today, then take the one move that gets you to
              the next rung. every step runs on Claude Code.
            </motion.p>
          </motion.div>
        </section>

        {/* The ladder */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="pb-24 md:pb-28"
        >
          <div className="mx-auto max-w-5xl px-6">
            <div className="surface-card overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[52rem] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="eyebrow border-b border-hairline px-5 py-4 text-[0.72rem] font-semibold text-silver sm:px-6">
                      Level &amp; your role
                    </th>
                    <th className="eyebrow border-b border-hairline px-5 py-4 text-[0.72rem] font-semibold text-silver sm:px-6">
                      Agents
                    </th>
                    <th className="eyebrow border-b border-hairline px-5 py-4 text-[0.72rem] font-semibold text-silver sm:px-6">
                      What it looks like
                    </th>
                    <th className="eyebrow border-b border-hairline px-5 py-4 text-[0.72rem] font-semibold text-silver sm:px-6">
                      What keeps you stuck
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((lvl, i) => (
                    <Fragment key={lvl.level}>
                      <tr>
                        {/* Level & role */}
                        <td className="border-b border-hairline px-5 py-6 align-top sm:px-6">
                          <div className="flex items-center gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-silver/40 text-silver [&_svg]:size-6">
                              {lvl.icon}
                            </span>
                            <span>
                              <span className="eyebrow block text-[0.68rem] font-semibold text-silver-muted">
                                {lvl.level}
                              </span>
                              <span className="mt-0.5 block font-display text-lg font-semibold text-silver">
                                {lvl.role}
                              </span>
                            </span>
                          </div>
                        </td>
                        {/* Agents */}
                        <td className="border-b border-hairline px-5 py-6 align-top font-display text-2xl font-light tabular-nums whitespace-nowrap text-silver sm:px-6">
                          {lvl.agents}
                        </td>
                        {/* What it looks like */}
                        <td className="border-b border-hairline px-5 py-6 align-top font-body text-sm leading-relaxed text-silver-muted sm:px-6">
                          {lvl.looks}
                        </td>
                        {/* What keeps you stuck */}
                        <td className="border-b border-hairline px-5 py-6 align-top font-body text-sm leading-relaxed text-silver-muted shadow-[inset_3px_0_0_var(--color-vivid-blue)] sm:px-6 [&_strong]:font-semibold [&_strong]:text-silver">
                          {lvl.stuck}
                        </td>
                      </tr>
                      {i < moves.length && (
                        <MoveRow to={moves[i].to} text={moves[i].text} cmds={moves[i].cmds} />
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-center font-body text-sm text-silver-muted">
              most people stall between level 1 and level 2. the jump is not a
              smarter model, it is learning to review results instead of
              keystrokes.
            </p>
          </div>
        </motion.section>
      </main>

      <ResourceFooter currentSlug="5-levels-ai" boldaneCredit />
    </>
  );
}
