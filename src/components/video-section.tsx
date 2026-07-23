"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const YOUTUBE_URL = "https://youtu.be/AKtT6NLZGoM";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function VideoSection() {
  return (
    <section id="watch" className="py-16 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="mx-auto max-w-4xl px-6"
      >
        <motion.h2
          variants={fadeUp}
          className="eyebrow font-body text-[13px] text-vivid-blue"
        >
          watch
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-8 font-body text-xl text-silver md:text-2xl"
        >
          i share my journey building with ai on youtube.
        </motion.p>

        {/* Looping video preview */}
        <motion.div variants={fadeUp} className="mt-10">
          <Link
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card glow-blue group relative block overflow-hidden p-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full transition-all duration-500 group-hover:scale-105 group-hover:blur-md"
            >
              <source src="/preview.mp4" type="video/mp4" />
            </video>

            {/* Subtle darkening + hover overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/20 transition-all duration-500 group-hover:bg-navy/50">
              <span className="font-display text-xl font-medium tracking-tight text-silver opacity-0 transition-all duration-500 group-hover:opacity-100 md:text-2xl">
                watch on youtube
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-center font-body text-silver-muted"
        >
          new claude code and ai-for-marketing tutorials every week.
        </motion.p>
      </motion.div>
    </section>
  );
}
