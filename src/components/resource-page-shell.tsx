// Shared shell for the video resource pages (claude-*). Renders the exact same
// DOM the pages used to hand-inline (minimal header + hero + setup guide + video
// embed + optional Boldane CTA + footer), driven by props, so each page.tsx is
// reduced to its unique data. This is a server component; the only client leaves
// are Reveal (entrance animation) and Accordion (interactive), so the resource
// pages ship no animation-runtime JS.

import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion } from "@/components/accordion";
import { ResourceFooter } from "@/components/resource-footer";
import { ArticleJsonLd } from "@/components/json-ld";
import { BoldaneCta } from "@/components/boldane-cta";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

type Step = { title: string; content: ReactNode };

type ResourcePageShellProps = {
  slug: string;
  videoId: string;
  videoTitle: string;
  eyebrow?: string;
  title: string;
  subhead: ReactNode;
  steps: Step[];
  jsonLd: {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified: string;
  };
  /** Inner content of a BoldaneCta card, rendered after the video (optional). */
  boldaneCta?: ReactNode;
  /** Show the "founder of Boldane" footer credit (only on pages with no other Boldane mention). */
  boldaneCredit?: boolean;
};

export function ResourcePageShell({
  slug,
  videoId,
  videoTitle,
  eyebrow = "free resource",
  title,
  subhead,
  steps,
  jsonLd,
  boldaneCta,
  boldaneCredit,
}: ResourcePageShellProps) {
  return (
    <>
      <ArticleJsonLd
        title={jsonLd.title}
        description={jsonLd.description}
        url={jsonLd.url}
        datePublished={jsonLd.datePublished}
        dateModified={jsonLd.dateModified}
        videoId={videoId}
        videoTitle={videoTitle}
      />
      {/* Minimal header */}
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="brand-wordmark font-display text-lg tracking-tight"
          >
            oleg melnikov
          </Link>
          <Link
            href="https://www.youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 font-body text-sm font-medium text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            youtube
          </Link>
        </div>
      </header>

      <main>
        {/* Hero / title */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <RevealGroup
            immediate
            stagger={0.15}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <span className="eyebrow inline-block rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              {eyebrow}
            </span>

            <h1 className="text-metallic mt-8 font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 font-body text-lg text-silver-muted md:text-xl">
              {subhead}
            </p>
          </RevealGroup>
        </section>

        {/* Setup guide */}
        <section className="pb-16 md:pb-20">
          <RevealGroup stagger={0.12} className="mx-auto max-w-3xl px-6">
            <h2 className="eyebrow font-body text-xs text-vivid-blue/80">
              setup guide
            </h2>

            <div className="mt-8">
              <Accordion items={steps} />
            </div>
          </RevealGroup>
        </section>

        {/* YouTube video */}
        <Reveal as="section" className="pb-24 md:pb-32">
          <div className="mx-auto max-w-3xl px-6">
            <div className="glow-blue overflow-hidden rounded-2xl border border-hairline">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {boldaneCta ? <BoldaneCta>{boldaneCta}</BoldaneCta> : null}
      </main>

      <ResourceFooter currentSlug={slug} boldaneCredit={boldaneCredit} />
    </>
  );
}
