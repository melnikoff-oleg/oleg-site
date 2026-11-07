"use client";

import { useState } from "react";
import Image from "next/image";
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
  { id: "clare", label: "Clare", note: "A clear promise, with room to breathe." },
  { id: "lara", label: "Lara", note: "A wider photograph and a clear visual hierarchy." },
  { id: "charlie", label: "Charlie", note: "A bold headline with focused supporting detail." },
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
          <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span className="font-semibold text-silver">Before</span><span className="text-silver-muted">Rebuilt from saved profile</span></figcaption>
          <a href={`/linkedin-packaging/${person}-before.webp`} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open ${name}'s before profile at full size`}>
            <Image src={`/linkedin-packaging/${person}-before.webp`} alt={`${name}'s previous profile: original portrait and headline${person === "emily" ? ', neutral cover because no original banner was saved' : ', with original banner'}`} width={792} height={person === "emily" ? 454 : 476} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" className="h-auto w-full" />
          </a>
        </figure>
        <figure id={`${person}-after`} className="min-w-0 overflow-hidden rounded-2xl border border-vivid-blue/40 bg-navy-raised">
          <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span className="font-semibold text-silver">After · {direction.label} style</span><span className="text-silver-muted">Proposed design</span></figcaption>
          <a href={`/linkedin-packaging/${person}-after-${style}.webp`} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open ${name}'s ${direction.label} style at full size`}>
            <Image src={`/linkedin-packaging/${person}-after-${style}.webp`} alt={`${name}'s proposed ${direction.label} style: redesigned banner, AI-edited portrait and revised headline`} width={792} height={476} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" className="h-auto w-full" />
          </a>
        </figure>
      </div>
      <div className="mt-4 rounded-xl border border-hairline bg-navy-raised px-5 py-4" aria-live="polite">
        <p className="text-sm font-semibold text-silver-muted">After headline · {direction.label} style</p>
        <p data-testid={`${person}-headline`} className="mt-2 text-base leading-relaxed text-silver">{HEADLINES[person][style]}</p>
        <a href={`/linkedin-packaging/${person}-after-${style}.webp`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver">Open full-size preview ↗</a>
      </div>
      <p className="mt-3 text-sm text-silver-muted">{direction.note}</p>
      {person === "emily" && <p className="mt-2 text-sm text-silver-muted">No original banner was available in Emily’s saved profile source; the before view shows a neutral cover.</p>}
    </section>
  );
}

export function ProfileExamples() {
  return (
    <section id="before-after" aria-labelledby="examples-title" className="pb-16 md:pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="eyebrow text-[13px] text-vivid-blue">See the difference</p>
          <h2 id="examples-title" className="mt-3 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">Same person. A clearer first impression.</h2>
          <p className="mt-4 text-base text-silver-muted">Kayla and Emily’s saved profiles beside three proposed directions each. The after images include AI-edited photography. These are local previews; nothing was published to LinkedIn.</p>
          <p data-testid="example-scope" className="mt-4 rounded-xl border border-hairline bg-navy-raised px-5 py-4 text-left text-sm leading-relaxed text-silver"><strong className="font-semibold">These company-branded examples include curated customization.</strong> The quickstart creates a reviewable draft in your chosen reference’s colors and fonts. Reproducing the exact company-branded treatment is an advanced workflow.</p>
          <a href="#setup-guide" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver">Skip to the three setup steps ↓</a>
        </div>
        <Comparison person="kayla" name="Kayla Bautista" />
        <Comparison person="emily" name="Emily Wittig" />
        <section aria-labelledby="reference-example-title" data-testid="reference-example" className="surface-card mt-10 grid items-center gap-6 p-5 md:grid-cols-2 md:p-6">
          <div>
            <p className="eyebrow text-xs text-vivid-blue">Reference colors + fonts</p>
            <h3 id="reference-example-title" className="mt-3 font-display text-xl font-semibold tracking-tight text-silver">The starting style, before company customization</h3>
            <p className="mt-3 text-sm leading-relaxed text-silver-muted">This Kayla worked example uses the default Clare reference palette and fonts. It shows the starting visual treatment, with an AI-edited portrait and a simulated LinkedIn profile. Your generated draft will need its own review.</p>
            <a href="/linkedin-packaging/kayla-reference-clare.webp" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver">Open full-size reference example ↗</a>
          </div>
          <a href="/linkedin-packaging/kayla-reference-clare.webp" target="_blank" rel="noopener noreferrer" aria-label="Open Kayla's Clare reference-palette worked example at full size" className="block min-w-0 overflow-hidden rounded-xl border border-hairline">
            <Image src="/linkedin-packaging/kayla-reference-clare.webp" alt="Kayla worked example with Clare’s default teal and pink palette, reference fonts and AI-edited portrait" width={792} height={476} sizes="(min-width: 1152px) 500px, (min-width: 768px) 42vw, 100vw" className="h-auto w-full" />
          </a>
        </section>
      </div>
    </section>
  );
}
