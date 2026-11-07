"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REFERENCE_PROFILES } from "./reference-profiles";

const imagePath = (id: string) => `/linkedin-packaging/references/${id}.png`;

export function ReferenceGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const current = REFERENCE_PROFILES[selected ?? 0];

  useEffect(() => {
    if (selected !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);

  useEffect(() => {
    if (selected === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function open(index: number, button: HTMLButtonElement) {
    trigger.current = button;
    setSelected(index);
  }

  function move(direction: number) {
    setSelected((index) => ((index ?? 0) + direction + REFERENCE_PROFILES.length) % REFERENCE_PROFILES.length);
  }

  return (
    <section id="original-references" aria-labelledby="references-title" className="scroll-mt-8 pb-16 md:pb-24" data-testid="reference-gallery">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-vivid-blue">The inspiration</p>
            <h2 id="references-title" className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-silver md:text-4xl">10 profiles behind the styles</h2>
            <p className="mt-3 text-base leading-relaxed text-silver-muted">These are the references. The project adapts their styles to your profile and branding.</p>
          </div>
          <Button size="md" variant="outline" className="min-h-11 shrink-0 self-start" onClick={(event) => open(0, event.currentTarget)}>
            <Expand aria-hidden="true" className="size-4" /> Present all 10
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {REFERENCE_PROFILES.map((profile, index) => (
            <article key={profile.id} className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-navy-raised" data-testid="reference-card" data-reference={profile.id}>
              <div className="flex items-center gap-3 px-4 py-4 md:px-5">
                <span className="font-body text-sm tabular-nums text-silver-muted">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="min-w-0 font-display text-xl font-semibold tracking-tight text-silver">{profile.name}</h3>
              </div>
              <button type="button" className="group block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vivid-blue" aria-label={`Preview ${profile.name}'s original profile`} onClick={(event) => open(index, event.currentTarget)}>
                <Image src={imagePath(profile.id)} alt={`${profile.name}'s saved original banner, portrait and headline`} width={profile.width} height={profile.height} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" className="block h-auto w-full" />
                <span className="flex min-h-11 items-center justify-between px-4 py-2 text-sm font-semibold text-silver-muted transition-colors group-hover:text-silver md:px-5">View full preview<Expand aria-hidden="true" className="size-4" /></span>
              </button>
              <a href={profile.url} target="_blank" rel="noopener noreferrer" className="mx-4 mb-2 inline-flex min-h-11 items-center gap-1 text-sm text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 hover:text-silver md:mx-5" aria-label={`View ${profile.name} on LinkedIn`}>Original profile<ArrowUpRight aria-hidden="true" className="size-4" /></a>
            </article>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-silver-muted">Previews reconstructed from saved original banners, portraits and headlines. Live profiles may have changed.</p>
      </div>

      <dialog ref={dialog} aria-labelledby="reference-view-title" onClose={() => { setSelected(null); trigger.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-navy/95 p-4 text-silver backdrop:bg-navy/95 md:p-8" data-testid="reference-presentation">
        <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm tabular-nums text-silver-muted">Original reference · {(selected ?? 0) + 1} / 10</p>
              <h2 id="reference-view-title" className="mt-1 font-display text-2xl font-semibold leading-[1.15] tracking-tight md:text-3xl">{current.name}</h2>
            </div>
            <Button size="sm" variant="outline" className="min-h-11 min-w-11 shrink-0 px-3" aria-label="Close reference preview" onClick={() => dialog.current?.close()}><X aria-hidden="true" className="size-5" /></Button>
          </div>
          <div className="flex min-h-0 items-center justify-center">
            {/* Native image preserves the full original raster in presentation view. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePath(current.id)} alt={`${current.name}'s original reference profile`} width={current.width} height={current.height} className="block h-auto max-h-[calc(100dvh-15rem)] w-auto max-w-full rounded-xl object-contain" data-testid="presented-reference" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a href={current.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm text-silver-muted underline decoration-hairline underline-offset-4 hover:text-silver">Original LinkedIn profile<ArrowUpRight aria-hidden="true" className="size-4" /></a>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="min-h-11 min-w-11" aria-label="Previous reference" onClick={() => move(-1)}><ArrowLeft aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Previous</span></Button>
              <Button size="sm" variant="primary" className="min-h-11 min-w-11" aria-label="Next reference" onClick={() => move(1)}><span className="hidden sm:inline">Next</span><ArrowRight aria-hidden="true" className="size-4" /></Button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
