"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const HEADLINES = {
  kayla: {
    clare: "Helping brands grow through social media | Senior Social Media Manager at NP Digital | 200+ social media accounts managed | San Diego Padres fan engagement",
    lara: "I help brands grow through social media | Senior Social Media Manager at NP Digital | 200+ social accounts managed | 10 years in digital marketing",
    charlie: "Social media that helps brands grow | Senior Social Media Manager at NP Digital | 200+ social accounts managed | Current and past roles across marketing and fan engagement",
  },
  emily: {
    clare: "VP, Marketing at San Diego Padres | Bringing fans to games and concerts | Helped contribute to franchise attendance records | Former Stanford athletics marketing leader",
    lara: "VP, Marketing at San Diego Padres | Bringing fans closer to games and concerts | Helped contribute to franchise attendance records | Former Stanford athletics marketing leader",
    charlie: "VP, Marketing at San Diego Padres | Bringing fans closer to games and concerts | Previously led marketing and fan experience across 36 Stanford varsity sports",
  },
};

const STYLES = [
  { id: "clare", label: "Clare" },
  { id: "lara", label: "Lara" },
  { id: "charlie", label: "Charlie" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

function Comparison({ person, name }: { person: "kayla" | "emily"; name: string }) {
  const [style, setStyle] = useState<StyleId>("clare");
  const direction = STYLES.find((entry) => entry.id === style)!;
  return (
    <section aria-labelledby={`${person}-title`} data-testid={`${person}-comparison`} className="mt-10 first:mt-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 id={`${person}-title`} className="font-display text-2xl font-semibold tracking-tight text-silver">{name}</h3>
        <div>
          <p id={`${person}-preview-label`} className="mb-2 text-sm text-silver-muted">Preview styles</p>
          <div role="group" aria-labelledby={`${person}-title ${person}-preview-label`} className="flex flex-wrap gap-2">
          {STYLES.map((entry) => <Button key={entry.id} variant={style === entry.id ? "primary" : "outline"} size="sm" className="min-h-11" aria-pressed={style === entry.id} aria-controls={`${person}-after`} onClick={() => setStyle(entry.id)}>{entry.label}</Button>)}
          </div>
        </div>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-2" data-testid="comparison-pair">
        <figure className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-navy-raised">
          <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span className="font-semibold text-silver">Before</span></figcaption>
          <a href={`/linkedin-packaging/${person}-before.webp`} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open ${name}'s before profile at full size`}>
            <Image src={`/linkedin-packaging/${person}-before.webp`} alt={`${name}'s previous profile: original portrait and headline${person === "emily" ? ', neutral cover because no original banner was saved' : ', with original banner'}`} width={792} height={person === "emily" ? 454 : 476} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" className="h-auto w-full" />
          </a>
        </figure>
        <figure id={`${person}-after`} className="min-w-0 overflow-hidden rounded-2xl border border-vivid-blue/40 bg-navy-raised">
          <figcaption className="px-4 py-3 text-sm font-semibold text-silver">After · {direction.label}</figcaption>
          <a href={`/linkedin-packaging/${person}-after-${style}.webp`} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open ${name}'s ${direction.label} style at full size`}>
            <Image src={`/linkedin-packaging/${person}-after-${style}.webp`} alt={`${name}'s proposed ${direction.label} style: redesigned banner, AI-edited portrait and revised headline`} width={792} height={476} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" className="h-auto w-full" />
          </a>
        </figure>
      </div>
      {person === "emily" && <p className="mt-2 text-sm text-silver-muted">Before: neutral cover; original banner unavailable.</p>}
      <details data-testid={`${person}-details`} className="group mt-3 border-b border-hairline pb-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-silver [&::-webkit-details-marker]:hidden">Headline &amp; full-size preview<ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" /></summary>
        <div className="pb-2" aria-live="polite">
          <p data-testid={`${person}-headline`} className="mt-2 text-base leading-relaxed text-silver">{HEADLINES[person][style]}</p>
          <a href={`/linkedin-packaging/${person}-after-${style}.webp`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver">Open full-size preview ↗</a>
        </div>
      </details>
    </section>
  );
}

export function ProfileExamples() {
  return (
    <section id="before-after" aria-labelledby="examples-title" className="pb-16 md:pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 id="examples-title" className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">Before &amp; after</h2>
          <p data-testid="example-scope" className="mt-3 text-sm text-silver-muted">AI-edited examples, tailored to each person’s branding.</p>
          <a href="#setup-guide" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver">Skip to setup ↓</a>
        </div>
        <Comparison person="kayla" name="Kayla Bautista" />
        <Comparison person="emily" name="Emily Wittig" />

      </div>
    </section>
  );
}
