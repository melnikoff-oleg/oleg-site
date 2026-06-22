"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// The minds behind the corpus. Images are square, face-centered webp crops in
// /public/marketing-brain/experts. Kept bright and punchy (it shows up in a
// YouTube thumbnail). the differing photo styles are tied together with a
// consistent rounded frame, ring, and a soft drop shadow that grounds each
// portrait on the dark page. Light and lift increase on hover.
const EXPERTS = [
  { slug: "hormozi", name: "Alex Hormozi" },
  { slug: "brunson", name: "Russell Brunson" },
  { slug: "cialdini", name: "Robert Cialdini" },
  { slug: "godin", name: "Seth Godin" },
];

export function ExpertStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="mt-9 flex items-start justify-center gap-3 sm:gap-5"
    >
      {EXPERTS.map((e, i) => (
        <motion.div
          key={e.slug}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 + i * 0.09 }}
          className="group flex flex-col items-center"
        >
          <div className="relative aspect-square w-[74px] overflow-hidden rounded-2xl ring-1 ring-hairline shadow-[0_14px_40px_-12px_rgba(2,11,24,0.9)] transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_60px_-18px_rgba(40,99,240,0.55)] group-hover:ring-vivid-blue/40 sm:w-[104px]">
            <Image
              src={`/marketing-brain/experts/${e.slug}.webp`}
              alt={e.name}
              fill
              sizes="104px"
              className="object-cover object-top saturate-[1.12] transition-transform duration-500 ease-out group-hover:scale-[1.07]"
            />
            {/* light bottom gradient so the bright photos sit on the dark page */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/45 to-transparent"
            />
          </div>
          <span className="mt-2.5 font-body text-[11px] font-medium leading-tight text-silver-muted transition-colors duration-300 group-hover:text-white sm:text-xs">
            {e.name}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
