// /bounded-shorts: the Shorts made for Bounded (bounded.app), shown as batches, newest on top.
// Each batch lists the hypotheses it tests; each video has its video, three covers and the caption.
//
// The data is generated in the MS repo: projects/accounts/bounded/shorts_2026-11-20/tools/build_site.py
// writes ./data.ts and the media in public/bounded-shorts/. Edit there and rerun, not here.
//
// A server component with no client JavaScript.

import { BATCHES } from "./data";

export default function BoundedShortsPage() {
  const total = BATCHES.reduce((n, b) => n + b.videos.length, 0);
  return (
    <main className="pb-16">
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            {total} Shorts for Bounded
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted">
            New batch on top. Each video has three covers to pick from and the caption. Sound on.
          </p>
        </div>
      </section>

      {BATCHES.map((b) => (
        <section key={b.name} className="mx-auto mb-20 max-w-5xl px-4 sm:px-6 md:mb-28">
          <div className="border-t border-hairline pt-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{b.name}</h2>
            <p className="mt-2 font-body text-base text-silver-muted">{b.note}</p>
            {b.hypotheses.length > 0 && (
              <div className="mt-6 rounded-2xl border border-hairline bg-navy-raised p-5 sm:p-6">
                <div className="font-body text-xs uppercase tracking-widest text-silver-muted">What we test</div>
                <ol className="mt-3 flex flex-col gap-3">
                  {b.hypotheses.map((h, i) => (
                    <li key={h} className="flex gap-3 font-body text-lg leading-snug text-white">
                      <span className="font-display font-semibold text-vivid-blue">{i + 1}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <ol className="mt-10 flex flex-col gap-14 md:mt-14 md:gap-20">
            {b.videos.map((v) => (
              <li key={v.video} className="min-w-0">
                <h3 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl">
                  <span className="text-vivid-blue">#{v.pos}</span> {v.title}
                </h3>
                <p className="mt-3 flex flex-wrap items-center gap-2 font-body text-sm text-silver-muted">
                  <span className="rounded-full border border-hairline bg-navy-raised px-3 py-1 text-white">Ending: {v.ending}</span>
                  <span className="rounded-full border border-hairline bg-navy-raised px-3 py-1 text-white">Hook: {v.topic}</span>
                  <span>{v.seconds} seconds</span>
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,360px)_1fr] md:gap-8">
                  <video
                    src={v.video}
                    poster={v.covers[0]}
                    controls
                    playsInline
                    preload="metadata"
                    className="block aspect-[9/16] w-full rounded-2xl border border-hairline bg-navy-raised"
                  />
                  <div className="min-w-0">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {v.covers.map((c, i) => (
                        <a key={c} href={c} target="_blank" rel="noopener noreferrer" className="block min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c}
                            alt={`Cover ${i + 1} for video ${v.pos}`}
                            width={720}
                            height={1280}
                            loading="lazy"
                            decoding="async"
                            className="block aspect-[9/16] w-full rounded-xl border border-hairline object-cover"
                          />
                          <span className="mt-1.5 block text-center font-body text-xs text-silver-muted">
                            Cover {i + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                    <div className="mt-5 rounded-2xl border border-hairline bg-navy-raised p-4">
                      <div className="font-body text-xs uppercase tracking-widest text-silver-muted">Caption</div>
                      <p className="mt-2 whitespace-pre-line font-body text-base text-white">{v.caption}</p>
                    </div>
                    <a
                      href={v.video}
                      download
                      className="mt-4 inline-block font-body text-sm font-semibold text-vivid-blue underline underline-offset-4"
                    >
                      Download the video
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
