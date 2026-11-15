// /claude-use-cases: the free project behind the video "27 Genius Ways to Use Claude".
// One page, all 27 cases, counting down 27 to 1 in the order of the video. Each case is
// someone else's build, linked to their post on X, with what you need, the steps and a
// starter prompt. The data and its honesty rules live in ./cases.ts.
//
// A feed, not a guide (the /viral-tweets shell): header, hero, list, ResourceFooter.
// A server component; the only client leaf is the shared CopyButton. Nothing animates
// in and there is no media, so the first screen is finished on arrival (it is
// screen-recorded on desktop for the video).

import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { CopyButton } from "@/components/copy-button";
import { ResourceFooter } from "@/components/resource-footer";
import { CASES, type UseCase } from "./cases";

const LABEL = "eyebrow font-body text-xs text-silver-muted";
const OUT =
  "font-semibold text-silver underline decoration-vivid-blue/60 underline-offset-4 transition-colors hover:text-white";

function Dots({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className="mt-3 list-none space-y-2 font-body text-base text-silver">
      {items.map((item, i) => (
        <li key={item} className="flex gap-3">
          {ordered ? (
            <span aria-hidden className="w-4 shrink-0 font-semibold text-vivid-blue">
              {i + 1}
            </span>
          ) : (
            <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-vivid-blue/70" />
          )}
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </List>
  );
}

function Case({ c }: { c: UseCase }) {
  return (
    <article
      id={`case-${c.n}`}
      aria-labelledby={`case-${c.n}-title`}
      className="scroll-mt-6 rounded-2xl border border-hairline bg-navy-raised p-6 md:grid md:grid-cols-[88px_minmax(0,1fr)] md:gap-x-8 md:p-10"
    >
      <p aria-hidden className="text-metallic font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
        {c.n}
      </p>
      <div className="mt-4 min-w-0 md:mt-0">
        <h2
          id={`case-${c.n}-title`}
          className="font-display text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl"
        >
          <span className="sr-only">Number {c.n}: </span>
          {c.title}
        </h2>
        <p className="mt-3 font-body text-base leading-relaxed text-silver md:text-lg">{c.what}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-body text-base text-silver-muted">
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`${OUT} inline-flex min-h-11 items-center`}
          >
            @{c.handle} on X ↗
          </a>
          {c.links?.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`${OUT} inline-flex min-h-11 items-center`}
            >
              {l.label} ↗
            </a>
          ))}
          <span>Made with {c.tool}</span>
        </p>

        <div className="mt-6 grid gap-6 border-t border-hairline pt-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <h3 className={LABEL}>What you need</h3>
            <Dots items={c.need} />
          </div>
          <div>
            <h3 className={LABEL}>Steps</h3>
            <Dots items={c.steps} ordered />
          </div>
        </div>

        {c.safety ? (
          <p className="mt-6 rounded-lg border border-hairline px-4 py-3 font-body text-base text-silver">
            <span className="font-semibold text-white">Be careful. </span>
            {c.safety}
          </p>
        ) : null}

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={LABEL}>{c.verbatim ? "The author's prompt, word for word" : "Starter prompt"}</h3>
            <CopyButton text={c.prompt} />
          </div>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-hairline bg-navy p-4 font-mono text-sm leading-relaxed text-silver [overflow-wrap:anywhere]">
            {c.prompt}
          </pre>
        </div>
      </div>
    </article>
  );
}

export default function ClaudeUseCasesPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "27 genius ways to use Claude", path: "/claude-use-cases" }]} />
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <Link
            href="https://www.youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </Link>
        </div>
      </header>

      <main className="pb-16 md:pb-24">
        <section className="pt-10 pb-8 md:pt-14 md:pb-12">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              Free project
            </span>
            <h1 className="text-metallic mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              {CASES.length} genius ways to use Claude
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-silver md:text-2xl">
              Real things people built in the last weeks. Each one has the steps and a prompt, so you can try it
              yourself.
            </p>
            <p className="mx-auto mt-4 max-w-2xl font-body text-base text-silver-muted">
              Other people built these, and each case links to their post. The prompts are starter prompts written
              for this page. They are not the authors&rsquo; prompts, except number 22.
            </p>
          </div>
        </section>

        <ol className="mx-auto max-w-4xl list-none space-y-6 px-4 sm:px-6 md:space-y-8">
          {CASES.map((c) => (
            <li key={c.n}>
              <Case c={c} />
            </li>
          ))}
        </ol>
      </main>

      <ResourceFooter currentSlug="claude-use-cases" boldaneCredit />
    </>
  );
}
