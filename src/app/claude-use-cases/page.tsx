// /claude-use-cases: the page behind the video "27 Genius Ways to Use Claude".
// One title, then the 27 cases counting down 27 to 1 in the order of the video. Each case is
// someone else's build, shown as one split card: a frame from the original video on one side
// (the case number sits on it as a blue badge), the text on the other: title, description,
// how to do it, link to the original post. Data and its honesty rules: ./cases.ts.
// A server component with no client code.

import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ResourceFooter } from "@/components/resource-footer";
import { CASES, type UseCase } from "./cases";
import { SHOTS } from "./shots";

function Case({ c, eager }: { c: UseCase; eager: boolean }) {
  const [w, h] = SHOTS[c.n];
  const src = `/claude-use-cases/${String(c.n).padStart(2, "0")}.jpg`;
  return (
    <article
      id={`case-${c.n}`}
      aria-labelledby={`case-${c.n}-title`}
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-hairline bg-navy-raised shadow-[0_30px_80px_-40px_rgba(40,99,240,0.35)] md:grid md:grid-cols-[minmax(0,13fr)_minmax(0,10fr)]"
    >
      {/* The picture side. Any frame shape fits whole; a blurred copy of it fills the rest. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-navy md:aspect-auto md:min-h-[400px]">
        <div
          aria-hidden
          className="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-2xl"
          style={{ backgroundImage: `url(${src})` }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${c.title}: a frame from the video in the original post`}
          width={w}
          height={h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 size-full object-contain"
        />
        <p
          aria-hidden
          className="absolute left-4 top-4 flex h-12 min-w-12 items-center justify-center rounded-2xl bg-vivid-blue px-3 font-body text-xl font-semibold tabular-nums tracking-[0.02em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:left-5 md:top-5"
        >
          {c.n}
        </p>
      </div>

      {/* The text side. */}
      <div className="flex flex-col p-6 md:p-10">
        <h2
          id={`case-${c.n}-title`}
          className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-white md:text-[2rem]"
        >
          <span className="sr-only">Number {c.n}: </span>
          {c.title}
        </h2>
        <p className="mt-3 font-body text-base leading-relaxed text-silver">{c.what}</p>

        <h3 className="eyebrow mt-7 font-body text-xs text-silver-muted">How to do it</h3>
        <ol className="mt-3 list-none space-y-2.5 font-body text-base text-silver">
          {c.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-xs font-semibold text-white"
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-7">
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-5 font-body text-sm font-semibold tracking-[0.02em] text-silver transition-colors hover:border-vivid-blue/60 hover:text-white"
          >
            Original post by @{c.handle}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ClaudeUseCasesPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "27 genius ways to use Claude", path: "/claude-use-cases" }]} />
      <main className="pb-16 md:pb-24">
        <h1 className="text-metallic mx-auto max-w-6xl px-6 pt-12 pb-10 text-center font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:pt-20 md:pb-16 md:text-7xl">
          {CASES.length} Genius Ways to Use Claude
        </h1>
        <ol className="mx-auto max-w-6xl list-none space-y-6 px-4 sm:px-6 md:space-y-10">
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
