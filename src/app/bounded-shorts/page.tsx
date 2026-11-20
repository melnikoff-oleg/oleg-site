// /bounded-shorts: four test Shorts for Bounded (bounded.app), each with its video, three covers and the caption.
// Nothing else: the page ends after the fourth video.
//
// The data is generated in the MS repo: projects/accounts/bounded/shorts_2026-11-20/tools/build_site.py
// writes ./data.ts and the media in public/bounded-shorts/. Edit there and rerun, not here.
//
// A server component with no client JavaScript.

import { VIDEOS } from "./data";

export default function BoundedShortsPage() {
  return (
    <main className="pb-16">
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            {VIDEOS.length} test Shorts for Bounded
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted">
            Each one has the video, three covers to pick from and the caption. Sound on.
          </p>
        </div>
      </section>

      <ol className="mx-auto flex max-w-5xl flex-col gap-14 px-4 sm:px-6 md:gap-20">
        {VIDEOS.map((v) => (
          <li key={v.video} className="min-w-0">
            <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl">
              <span className="text-vivid-blue">#{v.pos}</span> {v.title}
            </h2>
            <p className="mt-2 font-body text-sm text-silver-muted">{v.seconds} seconds</p>

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
    </main>
  );
}
