"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// The minds the corpus is distilled from. Images live in /public/marketing-brain/experts,
// pre-cropped to square (face-centered). The premium "blend into the dark" look is all CSS:
// grayscale + dimmed by default so the differing photo styles unify and melt into the black
// page, with a bottom gradient fading each portrait into the background. color and light
// return on hover.
const EXPERTS = [
  { slug: "hormozi", name: "Alex Hormozi", note: "offers & money models" },
  { slug: "brunson", name: "Russell Brunson", note: "funnels" },
  { slug: "cialdini", name: "Robert Cialdini", note: "persuasion" },
  { slug: "godin", name: "Seth Godin", note: "remarkable marketing" },
];

export function ExpertStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="mt-10 w-full"
    >
      <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-600">
        the minds behind every answer
      </p>

      <div className="relative mt-5 flex items-start justify-center gap-3 sm:gap-5">
        {/* soft spotlight so the row feels lit from within, not pasted on */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -top-6 bottom-0 -z-10 bg-[radial-gradient(ellipse_55%_70%_at_50%_30%,rgba(120,119,198,0.12),transparent_70%)]"
        />

        {EXPERTS.map((e, i) => (
          <motion.div
            key={e.slug}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.25 + i * 0.09,
            }}
            className="group flex flex-col items-center"
          >
            <div className="relative aspect-square w-[68px] overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:ring-white/25 sm:w-24">
              <Image
                src={`/marketing-brain/experts/${e.slug}.webp`}
                alt={e.name}
                fill
                sizes="96px"
                className="object-cover object-top brightness-[0.8] grayscale contrast-[1.05] transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:brightness-100 group-hover:grayscale-0"
              />
              {/* gradient that melts the portrait into the page's black background */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5 transition-opacity duration-500 group-hover:opacity-60"
              />
              {/* faint top sheen for a glassy, premium edge */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.08] to-transparent"
              />
            </div>

            <span className="mt-3 text-[11px] font-medium leading-tight text-zinc-400 transition-colors duration-300 group-hover:text-white sm:text-xs">
              {e.name}
            </span>
            <span className="mt-0.5 hidden text-[10px] leading-tight text-zinc-700 transition-colors duration-300 group-hover:text-zinc-500 sm:block">
              {e.note}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        + 5 more, across 8 books &amp; 75 talks
      </p>
    </motion.div>
  );
}
