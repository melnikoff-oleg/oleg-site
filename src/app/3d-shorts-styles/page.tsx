// /3d-shorts-styles: pick a style. One outlier Short per style: its cover, views and outlier score on the left,
// three stills that show the look on the right, and one line (100 characters at most) that says what the style is.
// Oleg's brief (2026-11-17): a page to choose a style from, later fed to the video engine as a reference.
//
// The data is generated in the MS repo: projects/accounts/oleg_melnikov/videos_2026-11-16/2_3d_shorts/styles_page/build_site.py
// writes ./data.ts and the pictures in public/3d-shorts-styles/. Edit there and rerun, not here.
//
// A server component with no client JavaScript. Pictures are small WebP files; only the first two styles load at once.

import { STYLES } from "./data";

export default function ShortsStylesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <header className="pt-12 pb-8 md:pt-20 md:pb-12">
        <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {STYLES.length} styles of viral Shorts made with code
        </h1>
        <p className="mt-3 max-w-2xl font-body text-base text-silver-muted">
          One top video for each style, from this month. Blue shows how many times it beat its own account&apos;s normal.
        </p>
      </header>

      <ol className="flex flex-col gap-12 md:gap-16">
        {STYLES.map((s) => (
          <li key={s.slug} id={s.slug} className="min-w-0 scroll-mt-6">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-semibold leading-[1.1] tracking-tight tabular-nums text-silver-muted md:text-3xl">
                {s.n}
              </span>
              <h2 className="font-display text-2xl font-semibold leading-[1.1] tracking-tight text-white md:text-3xl">{s.name}</h2>
            </div>
            <p className="mt-2 max-w-2xl font-body text-base text-silver">{s.line}</p>

            <div className="mt-5 grid grid-cols-[minmax(0,1.25fr)_minmax(0,3fr)] gap-3 sm:gap-5">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vivid-blue"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/3d-shorts-styles/${s.slug}-cover.webp`}
                  alt={`Cover of the video: ${s.title}`}
                  width={480}
                  height={853}
                  loading={s.n <= 2 ? "eager" : "lazy"}
                  fetchPriority={s.n === 1 ? "high" : "auto"}
                  decoding="async"
                  className="block aspect-[9/16] w-full rounded-2xl bg-navy-raised object-cover"
                />
                <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-xl font-semibold leading-[1.1] tracking-tight tabular-nums">
                  <span className="text-white">{s.views}</span>
                  {s.score && <span className="text-vivid-blue">{s.score}</span>}
                </p>
                <p className="mt-1 break-words font-body text-sm text-silver-muted group-hover:underline">
                  {s.channel} on {s.platform}
                </p>
              </a>

              <ul className="grid min-w-0 grid-cols-3 gap-2 self-start sm:gap-3">
                {[1, 2, 3].map((k) => (
                  <li key={k} className="min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/3d-shorts-styles/${s.slug}-${k}.webp`}
                      alt={`Still ${k} from the video`}
                      width={360}
                      height={640}
                      loading={s.n <= 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="block aspect-[9/16] w-full rounded-xl bg-navy-raised object-cover"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
