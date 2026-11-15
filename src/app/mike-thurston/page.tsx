// /mike-thurston: outlier videos picked for Mike Thurston's coaching channel, last 30 days.
// Oleg's brief (2026-11-15): super minimal. A title, then the videos the way YouTube shows them,
// each with its outlier score, views and channel. No logo, no links to Oleg's channel, no footer.
//
// The data is generated in the MS repo: projects/accounts/mike_thurston/hunt_2026-11-15/build_site.py
// writes ./data.ts and the covers in public/mike-thurston/. Edit there and rerun, not here.
//
// A server component with no client JavaScript. Speed: covers are small WebP files in two widths,
// only the first row loads at once, the rest load lazily as they come near the screen.

import { STATS, VIDEOS } from "./data";

export default function MikeThurstonPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <header className="pt-12 pb-9 md:pt-20 md:pb-12">
        <h1 className="text-metallic font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {VIDEOS.length} outlier videos for Mike Thurston
        </h1>
        <p className="mt-3 font-body text-base text-silver-muted">
          {STATS.videos.toLocaleString("en-US")} videos from {STATS.channels.toLocaleString("en-US")} channels analyzed.
          Last 30 days. Blue shows how many times a video beat its channel&apos;s normal.
        </p>
      </header>

      <ol className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEOS.map((v) => (
          <li key={v.id} className="min-w-0">
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vivid-blue"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/mike-thurston/${v.id}-640.webp`}
                srcSet={`/mike-thurston/${v.id}-320.webp 320w, /mike-thurston/${v.id}-640.webp 640w`}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 46vw, 92vw"
                alt=""
                width={640}
                height={360}
                loading={v.pos <= 3 ? "eager" : "lazy"}
                fetchPriority={v.pos === 1 ? "high" : "auto"}
                decoding="async"
                className="block aspect-video w-full rounded-2xl bg-navy-raised object-cover"
              />
              <h2 className="mt-3 line-clamp-2 font-body text-base font-semibold leading-snug text-white group-hover:underline">
                {v.title}
              </h2>
              <p className="mt-1 truncate font-body text-sm text-silver-muted">{v.channel}</p>
              <p className="mt-1.5 flex items-baseline gap-3 font-display text-lg font-semibold leading-[1.1] tracking-tight tabular-nums">
                <span className="text-vivid-blue">{v.score}</span>
                <span className="font-body text-sm font-normal text-silver">{v.views} views</span>
              </p>
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
