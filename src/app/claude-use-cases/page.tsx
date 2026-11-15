// /claude-use-cases: the page behind the video "27 Genius Ways to Use Claude".
// One title, then the 27 cases counting down 27 to 1 in the order of the video. Each case is
// someone else's build and stays simple: number, title, description, how to do it, the link to
// the original post and one screenshot from its video. Data and its honesty rules: ./cases.ts.
// A server component with no client code.

import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ResourceFooter } from "@/components/resource-footer";
import { CASES, type UseCase } from "./cases";
import { SHOTS } from "./shots";

function Case({ c, eager }: { c: UseCase; eager: boolean }) {
  const [w, h] = SHOTS[c.n];
  return (
    <article
      id={`case-${c.n}`}
      aria-labelledby={`case-${c.n}-title`}
      className="scroll-mt-6 rounded-2xl border border-hairline bg-navy-raised p-6 md:p-10"
    >
      <div className="flex items-baseline gap-4 md:gap-6">
        <p aria-hidden className="text-metallic font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
          {c.n}
        </p>
        <h2
          id={`case-${c.n}-title`}
          className="font-display text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl"
        >
          <span className="sr-only">Number {c.n}: </span>
          {c.title}
        </h2>
      </div>
      <p className="mt-4 font-body text-base leading-relaxed text-silver md:text-lg">{c.what}</p>

      <h3 className="eyebrow mt-6 font-body text-xs text-silver-muted">How to do it</h3>
      <ol className="mt-3 list-none space-y-2 font-body text-base text-silver">
        {c.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span aria-hidden className="w-4 shrink-0 font-semibold text-vivid-blue">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">{step}</span>
          </li>
        ))}
      </ol>

      <a
        href={c.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-4 inline-flex min-h-11 items-center font-body text-base font-semibold text-silver underline decoration-vivid-blue/60 underline-offset-4 transition-colors hover:text-white"
      >
        Original post by @{c.handle} on X ↗
      </a>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/claude-use-cases/${String(c.n).padStart(2, "0")}.jpg`}
        alt={`${c.title}: a frame from the video in the original post`}
        width={w}
        height={h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="mx-auto mt-4 h-auto max-h-[70vh] w-auto max-w-full rounded-xl border border-hairline"
      />
    </article>
  );
}

export default function ClaudeUseCasesPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "27 genius ways to use Claude", path: "/claude-use-cases" }]} />
      <main className="pb-16 md:pb-24">
        <h1 className="text-metallic mx-auto max-w-4xl px-6 pt-12 pb-10 text-center font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:pt-16 md:pb-14 md:text-7xl">
          {CASES.length} Genius Ways to Use Claude
        </h1>
        <ol className="mx-auto max-w-4xl list-none space-y-6 px-4 sm:px-6 md:space-y-8">
          {CASES.map((c, i) => (
            <li key={c.n}>
              <Case c={c} eager={i < 2} />
            </li>
          ))}
        </ol>
      </main>
      <ResourceFooter currentSlug="claude-use-cases" boldaneCredit />
    </>
  );
}
