// /gleb-creatives: the 12 strongest outlier videos for Bounded (bounded.app) from Instagram and
// TikTok, last 30 days, plus 20 accounts to study. The public cut of Oleg's review artifact.
//
// The data is generated in the MS repo: projects/accounts/bounded/hunt_2026-11-12/build_site.py
// writes ./data.ts and the covers in public/gleb-creatives/. Edit there and rerun, not here.
//
// A server component with no client JavaScript. Order of importance on each card (Oleg's):
// cover, views, outlier score, date, niche. Hook and why are folded away.

import Link from "next/link";
import { ACCOUNTS, STATS, VIDEOS } from "./data";

const n = (v: number) => v.toLocaleString("en-US");

const FACTS: { value: string; label: string }[] = [
  { value: n(STATS.videos), label: "videos analyzed" },
  { value: n(STATS.ads), label: "Bounded ads analyzed" },
  { value: n(STATS.accounts), label: "accounts" },
  { value: n(STATS.watched), label: "watched frame by frame" },
];

export default function GlebCreativesPage() {
  return (
    <>
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
        </div>
      </header>

      <main className="pb-16 md:pb-24">
        <section className="pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <span className="eyebrow inline-block rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              For Bounded
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Top {VIDEOS.length} outlier videos for Bounded
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted">
              Instagram and TikTok, last 30 days. White is views, blue is how many times the video
              beat its account&apos;s normal. Tap a cover to watch.
            </p>

            <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {FACTS.map((f) => (
                <div key={f.label} className="flex flex-col-reverse gap-1">
                  <dt className="font-body text-sm text-silver-muted">{f.label}</dt>
                  <dd className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-label="Outlier videos" className="mx-auto max-w-6xl px-4 sm:px-6">
          <ol className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {VIDEOS.map((v) => (
              <li key={v.url} className="min-w-0">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block overflow-hidden rounded-2xl border border-hairline bg-navy-raised"
                  aria-label={`Watch video ${v.pos}: ${v.niche}, ${v.views} views`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.cover}
                    alt=""
                    width={540}
                    height={960}
                    loading={v.pos <= 4 ? "eager" : "lazy"}
                    decoding="async"
                    className="block aspect-[9/16] w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-navy/80 px-2.5 py-0.5 font-body text-sm font-semibold text-white">
                    {v.pos}
                  </span>
                </a>
                <div className="mt-3 flex items-baseline justify-between gap-2 font-display text-xl font-semibold leading-[1.1] tracking-tight tabular-nums sm:text-2xl">
                  <span className="text-white">{v.views}</span>
                  <span className="text-vivid-blue">{v.score}</span>
                </div>
                <div className="mt-1.5 flex flex-col gap-0.5 font-body text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span className="whitespace-nowrap text-silver-muted">{v.date}</span>
                  <span className="font-semibold text-silver sm:text-right">{v.niche}</span>
                </div>
                <details className="mt-1.5 font-body text-xs text-silver-muted">
                  <summary className="cursor-pointer truncate">
                    @{v.handle} · {v.platform}
                  </summary>
                  <p className="mt-1.5 leading-normal">{v.hook}</p>
                  <p className="mt-1.5 leading-normal">{v.why}</p>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6">
          <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-white md:text-3xl">
            Top {ACCOUNTS.length} accounts to study
          </h2>
          <ol className="mt-6">
            {ACCOUNTS.map((a) => (
              <li key={a.url} className="flex gap-4 border-t border-hairline py-4">
                <span className="w-7 shrink-0 font-display text-xl font-semibold tracking-tight text-silver-muted tabular-nums">
                  {a.pos}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-base font-semibold text-white underline-offset-4 hover:underline"
                    >
                      @{a.handle}
                    </a>
                    <span className="font-body text-sm text-silver-muted">
                      {a.platform} · {a.followers} followers
                    </span>
                  </div>
                  <p className="mt-1 font-body text-base text-silver">{a.what}</p>
                  <p className="mt-1 font-body text-sm text-silver-muted">
                    {a.fitting} fitting videos in 30 days · best:{" "}
                    {a.best.map((b, i) => (
                      <span key={b.url}>
                        {i > 0 ? " " : ""}
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-vivid-blue underline-offset-4 hover:underline"
                        >
                          {b.views}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="mx-auto mt-12 max-w-3xl px-6 font-body text-sm text-silver-muted">
          English only. Videos with likes under 1% of views are left out, because they look like
          paid reach. The outlier score is views against the account&apos;s own usual views, or
          against followers when there is no history.
        </p>
      </main>
    </>
  );
}
