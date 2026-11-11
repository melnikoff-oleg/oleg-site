// /linkedin-swipe-file: 30 LinkedIn profiles with the best banner, photo and
// headline, the resource behind Oleg's LinkedIn post of 2026-11-11 ("comment
// SWIPE"). Each card is the profile's real banner and photo, its headline, one
// line on what to take from it, and a link to the live profile.
//
// The data is generated: scripts/build-linkedin-swipe-file.py reads the list
// in the MS repo and writes ./profiles.ts plus the images in
// public/linkedin-swipe-file/. Edit there and re-run, not here.
//
// A server component with no client JavaScript of its own.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ResourceFooter } from "@/components/resource-footer";
import { PROFILES } from "./profiles";

const STEPS = [
  "Pick the 2 or 3 profiles closest to your taste.",
  "Take the banner layout: where the face sits and where the one line goes.",
  "Write your own line in the same shape.",
  "Redo your photo the same way. Most of them use a plain bright background.",
];

export default function LinkedInSwipeFilePage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "LinkedIn profile swipe file", path: "/linkedin-swipe-file" }]} />
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <Link
            href="https://www.linkedin.com/in/olegdoes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
            LinkedIn
          </Link>
        </div>
      </header>

      <main className="pb-16 md:pb-24">
        <section className="pt-10 pb-8 md:pt-16 md:pb-10">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              Swipe file
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              {PROFILES.length} LinkedIn profiles with the best banners, photos and headlines
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted md:text-xl">
              I went through 136 big LinkedIn creators and kept these {PROFILES.length}. Under each one is what to take from it. Tap a card to open the live profile.
            </p>
          </div>
        </section>

        <section aria-labelledby="how-to-use" className="mx-auto max-w-3xl px-6 pb-10 md:pb-14">
          <div className="rounded-2xl border border-hairline bg-navy-raised px-5 py-5 md:px-7 md:py-6">
            <h2 id="how-to-use" className="font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
              How to use it
            </h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 font-body text-base leading-relaxed text-silver-muted marker:text-silver-muted">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <ol className="mx-auto grid max-w-6xl list-none gap-6 px-6 md:grid-cols-2 xl:grid-cols-3" data-testid="swipe-profiles">
          {PROFILES.map((p, index) => (
            <li key={p.id} className="min-w-0">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-navy-raised" data-testid="swipe-card">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.name}'s LinkedIn profile`}
                  className="block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vivid-blue"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/linkedin-swipe-file/${p.id}-banner.webp`}
                    width={p.bannerWidth}
                    height={p.bannerHeight}
                    alt={`${p.name}'s LinkedIn banner`}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="block aspect-[4/1] w-full object-cover"
                  />
                </a>
                <div className="flex flex-1 flex-col px-4 pb-4 md:px-5 md:pb-5">
                  <div className="flex items-end gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/linkedin-swipe-file/${p.id}-photo.webp`}
                      width={72}
                      height={72}
                      alt={`${p.name}'s profile picture`}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="-mt-7 size-[72px] shrink-0 rounded-full border-[3px] border-navy-raised object-cover"
                    />
                    <div className="min-w-0 pb-0.5">
                      <h2 className="font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
                        <span className="font-body text-sm font-normal tabular-nums text-silver-muted">{String(index + 1).padStart(2, "0")} </span>
                        {p.name}
                      </h2>
                      <p className="font-body text-sm tabular-nums text-silver-muted">{p.followers} followers</p>
                    </div>
                  </div>
                  <p className="mt-3 font-body text-sm leading-relaxed text-silver-muted">{p.headline}</p>
                  <p className="mt-3 rounded-xl border border-hairline bg-vivid-blue/10 px-3.5 py-2.5 font-body text-[15px] leading-relaxed text-silver">
                    {p.take}
                  </p>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex min-h-11 items-center gap-1 pt-2 font-body text-sm text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver"
                  >
                    Open on LinkedIn
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-6 max-w-6xl px-6 font-body text-sm leading-relaxed text-silver-muted">
          Banners, photos, headlines and follower counts were saved on 11 November 2026. Live profiles may have changed.
        </p>
      </main>

      <ResourceFooter currentSlug="linkedin-swipe-file" boldaneCredit />
    </>
  );
}
