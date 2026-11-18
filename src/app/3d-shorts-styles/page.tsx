// /3d-shorts-styles: pick a style. One outlier Short per style: its cover, views and outlier score on the left,
// three stills that show the look on the right, and one line (100 characters at most) that says what the style is.
// Oleg's brief (2026-11-17): a page to choose a style from, later fed to the video engine as a reference.
//
// The data is generated in the MS repo: projects/accounts/oleg_melnikov/videos_2026-11-16/2_3d_shorts/styles_page/build_site.py
// writes ./data.ts and the pictures in public/3d-shorts-styles/. Edit there and rerun, not here.
//
// The video of each style plays in place (./player.tsx, the only client code): nothing starts by itself; a press plays it with sound. Videos load only when reached. On phones the video sits above the three stills.

import Link from "next/link";
import { STYLES } from "./data";
import { Player, PlatformLogo } from "./player";

export default function ShortsStylesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <header className="pt-12 pb-8 md:pt-20 md:pb-12">
        <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {STYLES.length} styles of viral Shorts made with code
        </h1>
        <p className="mt-3 max-w-2xl font-body text-base text-silver-muted">
          One top video for each style, from this month. Watch it here or open the original. Blue shows how many times it beat its own account&apos;s normal.
        </p>
        <p className="mt-3 max-w-2xl font-body text-base text-silver">
          Want to make one?{" "}
          <Link
            href="/claude-3d-shorts"
            className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Get the free prompt for Claude
          </Link>
          .
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

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,3fr)] sm:gap-5">
              <div className="mx-auto w-full min-w-0 max-w-[340px] sm:max-w-none">
                <Player slug={s.slug} title={s.title} platform={s.platform} eager={s.n <= 2} />
                <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-xl font-semibold leading-[1.1] tracking-tight tabular-nums">
                  <span className="text-white">{s.views}</span>
                  {s.score && <span className="text-vivid-blue">{s.score}</span>}
                </p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-2 rounded-md font-body text-sm text-silver-muted hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vivid-blue"
                >
                  <PlatformLogo platform={s.platform} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">
                    {s.channel}: open on {s.platform}
                  </span>
                </a>
              </div>

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
