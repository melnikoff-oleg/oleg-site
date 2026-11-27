// /bounded-highlights: the pinned Instagram highlights for @boundedo (Bounded, bounded.app):
// the row as it looks on the profile, then each highlight with its name and stories.
//
// The data is generated in the MS repo: projects/accounts/bounded/boundedo/highlights_2026-11-27/build_site.py
// writes ./data.ts and the images in public/bounded-highlights/. Edit there and rerun, not here.
//
// A server component with no client JavaScript. Tap a story to open the full 1440 x 2560 file.

import { HIGHLIGHTS } from "./data";

export default function BoundedHighlightsPage() {
  const total = HIGHLIGHTS.reduce((n, h) => n + h.stories.length, 0);
  return (
    <main className="pb-16">
      <section className="pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            {HIGHLIGHTS.length} highlights for Bounded
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted">
            {total} stories. Tap a story to open the full-size file.
          </p>
          <div className="mt-10 flex justify-center gap-4 sm:gap-7">
            {HIGHLIGHTS.map((h) => (
              <div key={h.name} className="w-16 text-center sm:w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.cover} alt="" className="aspect-square w-full rounded-full border border-hairline object-cover" />
                <div className="mt-2 font-body text-xs text-white">{h.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {HIGHLIGHTS.map((h, i) => (
        <section key={h.name} className="mx-auto mb-14 max-w-6xl px-4 sm:px-6">
          <div className="border-t border-hairline pt-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="text-vivid-blue">{i + 1}</span> {h.name}
            </h2>
            <p className="mt-1 font-body text-sm text-silver-muted">{h.stories.length} stories</p>
          </div>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-3 sm:gap-4">
            {h.stories.map((s) => (
              <a key={s} href={s} className="block w-[62vw] max-w-[270px] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-2xl border border-hairline object-cover" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
