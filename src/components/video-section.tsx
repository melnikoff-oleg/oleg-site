import Link from "next/link";
import { RevealGroup } from "@/components/motion/reveal";
import { LazyVideo } from "@/components/lazy-video";

const YOUTUBE_URL = "https://youtu.be/AKtT6NLZGoM";

export function VideoSection() {
  return (
    <section id="watch" className="py-16 md:py-32">
      <RevealGroup stagger={0.15} className="mx-auto max-w-4xl px-6">
        <h2 className="eyebrow font-body text-[13px] text-vivid-blue">
          watch
        </h2>

        <p className="mt-8 font-body text-xl text-silver md:text-2xl">
          i share my journey building with ai on youtube.
        </p>

        {/* Looping video preview */}
        <div className="mt-10">
          <Link
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card glow-blue group relative block overflow-hidden p-0"
          >
            <LazyVideo
              src="/preview.mp4"
              poster="/preview-poster.jpg"
              className="w-full transition-all duration-500 group-hover:scale-105 group-hover:blur-md"
            />

            {/* Subtle darkening + hover overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/20 transition-all duration-500 group-hover:bg-navy/50">
              <span className="font-display text-xl font-medium tracking-tight text-silver opacity-0 transition-all duration-500 group-hover:opacity-100 md:text-2xl">
                watch on youtube
              </span>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center font-body text-silver-muted">
          new claude code and ai-for-marketing tutorials every week.
        </p>
      </RevealGroup>
    </section>
  );
}
