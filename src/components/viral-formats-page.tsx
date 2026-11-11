// The shared page behind the three "30 viral LinkedIn formats" resources
// (/cybersecurity-linkedin-formats, /founder-linkedin-formats,
// /design-linkedin-formats), each sent to people who comment on one of Oleg's
// LinkedIn posts of November 2026. A card is one format: the post that proves
// it, drawn like a LinkedIn feed card (author, folded text with a CSS-only
// "see more", first picture, likes and comments), and a template for
// the picture and the text.
//
// The lists are generated: scripts/build-viral-formats.py reads the MS repo
// and writes src/lib/viral-formats/<niche>.ts plus public/viral-formats/.
//
// A server component with no client JavaScript of its own.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ResourceFooter } from "@/components/resource-footer";
import type { ViralFormat } from "@/lib/viral-formats/types";

export const VIRAL_FORMAT_PAGES = [
  { slug: "cybersecurity-linkedin-formats", label: "Cybersecurity" },
  { slug: "founder-linkedin-formats", label: "Founders" },
  { slug: "design-linkedin-formats", label: "Designers" },
] as const;

const STEPS = [
  "Pick 3 formats that fit what you already know.",
  "Open the original post. Look at the picture and the first two lines.",
  "Fill the template with your own topic. Keep the shape, change the content.",
  "Post each format at least 3 times before you judge it.",
];

export function ViralFormatsPage({
  slug,
  breadcrumb,
  title,
  intro,
  formats,
}: {
  slug: (typeof VIRAL_FORMAT_PAGES)[number]["slug"];
  breadcrumb: string;
  title: string;
  intro: string;
  formats: ViralFormat[];
}) {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: breadcrumb, path: `/${slug}` }]} />
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
              Viral formats
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted md:text-xl">{intro}</p>
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

        <ol className="mx-auto grid max-w-6xl list-none items-start gap-6 px-6 md:grid-cols-2 xl:grid-cols-3" data-testid="viral-formats">
          {formats.map((f, index) => (
            <li key={f.id} className="min-w-0">
              <article className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-navy-raised" data-testid="format-card">
                {/* The post, drawn like a LinkedIn feed card (white, whatever the site theme): author, folded text, picture, reactions. */}
                <div className="m-3 mb-0 overflow-hidden rounded-xl bg-white text-[#191919]" data-testid="post-preview">
                  <div className="flex items-center gap-2.5 px-4 pt-3.5">
                    {f.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/viral-formats/av/${f.avatar}`} width={48} height={48} alt="" loading="lazy" decoding="async" className="size-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dfe6ee] font-body text-base font-semibold text-[#56687a]">
                        {f.author.slice(0, 1)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-body text-[15px] font-semibold leading-tight">{f.author}</p>
                      {f.headline && <p className="truncate font-body text-xs leading-snug text-[#666]">{f.headline}</p>}
                      <p className="font-body text-xs leading-snug text-[#666]">{f.date}</p>
                    </div>
                  </div>
                  {f.post && (
                    <div className="px-4 pt-3 pb-2.5 font-body text-sm leading-[1.45]">
                      <input type="checkbox" id={`more-${f.id}`} className="peer sr-only" aria-label={`Show the full text of ${f.author}'s post`} />
                      <p className="line-clamp-3 whitespace-pre-line break-words peer-checked:line-clamp-none">{f.post}</p>
                      <label
                        htmlFor={`more-${f.id}`}
                        className="block cursor-pointer text-right text-[#666] hover:text-[#0a66c2] hover:underline peer-checked:hidden peer-focus-visible:underline"
                      >
                        …see more
                      </label>
                    </div>
                  )}
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${f.author}'s post on LinkedIn`}
                    className={`block bg-[#f3f2ef] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vivid-blue ${f.post ? "" : "mt-3"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/viral-formats/${f.id}.webp`}
                      width={f.width}
                      height={f.height}
                      alt={`${f.name}: ${f.kind === "video" ? "cover of the video" : "first picture"} of ${f.author}'s LinkedIn post`}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="mx-auto block h-auto max-h-[460px] w-auto max-w-full"
                    />
                  </a>
                  <div className="flex items-center gap-1.5 px-4 py-2.5 font-body text-[13px] text-[#666]">
                    <svg viewBox="0 0 60 24" aria-hidden className="h-[18px] w-[45px] shrink-0">
                      <circle cx="12" cy="12" r="11" fill="#378FE9" stroke="#fff" strokeWidth="2" />
                      <path fill="#fff" d="M17.6 11.1c.5.2.8.7.8 1.2 0 .4-.2.8-.5 1 .2.2.3.5.3.8 0 .5-.3.9-.7 1.1.1.2.1.3.1.5 0 .7-.6 1.2-1.3 1.2h-3.9c-.9 0-1.7-.2-2.5-.6l-.4-.2H7.6v-5h1.3c.3 0 .6-.2.8-.5l1.9-3.3c.2-.4.3-.8.3-1.2v-.6c0-.3.2-.5.5-.5.9 0 1.7.8 1.7 1.7 0 .6-.1 1.1-.4 1.6l-.5 1h3c.8 0 1.4.6 1.4 1.3z" />
                      <circle cx="30" cy="12" r="11" fill="#DF704D" stroke="#fff" strokeWidth="2" />
                      <path fill="#fff" d="M30 17.6l-4.3-4.2a2.9 2.9 0 0 1 4.1-4.1l.2.2.2-.2a2.9 2.9 0 0 1 4.1 4.1z" />
                      <circle cx="48" cy="12" r="11" fill="#F5BB5C" stroke="#fff" strokeWidth="2" />
                      <path fill="#fff" d="M48 6a4.2 4.2 0 0 0-2.4 7.7c.3.2.5.6.5 1v.5h3.8v-.5c0-.4.2-.8.5-1A4.2 4.2 0 0 0 48 6zm-1.7 10.2h3.4v1.3h-3.4z" />
                    </svg>
                    <span className="tabular-nums">{f.likes}</span>
                    <span className="ml-auto tabular-nums">{f.comments} comments</span>
                  </div>
                </div>
                <div className="flex flex-col px-4 pt-4 pb-4 md:px-5 md:pb-5">
                  <h2 className="font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
                    <span className="font-body text-sm font-normal tabular-nums text-silver-muted">{String(index + 1).padStart(2, "0")} </span>
                    {f.name}
                  </h2>
                  <p className="mt-1.5 font-body text-sm tabular-nums text-silver-muted">
                    {f.score} their usual post
                  </p>
                  <p className="mt-3 font-body text-[15px] leading-relaxed text-silver">{f.why}</p>
                  <div className="mt-3 rounded-xl border border-hairline bg-vivid-blue/10 px-3.5 py-3">
                    <h3 className="eyebrow font-body text-xs text-vivid-blue/90">The picture</h3>
                    <p className="mt-1 font-body text-[15px] leading-relaxed text-silver">{f.picture}</p>
                    <h3 className="eyebrow mt-3 font-body text-xs text-vivid-blue/90">The text</h3>
                    <p className="mt-1 font-body text-[15px] leading-relaxed text-silver">{f.text}</p>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 pt-2 font-body text-sm text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver"
                  >
                    Open the post on LinkedIn
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 max-w-6xl px-6">
          <p className="font-body text-sm leading-relaxed text-silver-muted">
            &ldquo;5x their usual post&rdquo; means the post got 5 times more likes than the author&apos;s 20 posts before it usually got. Likes and
            scores were saved in October and November 2026. Live posts may have changed.
          </p>
          <nav aria-label="The same for other niches" className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="font-body text-sm text-silver-muted">The same for other niches:</span>
            {VIRAL_FORMAT_PAGES.filter((p) => p.slug !== slug).map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 py-2 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <ResourceFooter currentSlug={slug} boldaneCredit />
    </>
  );
}
