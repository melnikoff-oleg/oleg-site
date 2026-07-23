"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.15 } },
        }}
        className="mx-auto max-w-3xl px-6"
      >
        <motion.h2 variants={fadeUp} className="eyebrow font-body text-[13px] text-vivid-blue">
          what i do
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-8 font-body text-xl leading-relaxed text-silver md:text-2xl"
        >
          my whole thing is bridging media and software: the storytelling that makes people care, and the code and AI that gives it real leverage. that intersection is the most exciting place to be right now.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-6 font-body text-xl leading-relaxed text-silver md:text-2xl"
        >
          <Link
            href="https://www.boldane.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            boldane
          </Link>{" "}
          is that idea as a company: you have the stories worth telling, we turn them into a presence your market trusts and buys from. one real conversation a week, all from what you said.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-6 font-body text-xl leading-relaxed text-silver md:text-2xl"
        >
          i share how i build there on youtube, teaching claude code and AI for marketing.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-6 font-body text-xl leading-relaxed text-silver md:text-2xl"
        >
          before this, i used AI to build trading algorithms at a hedge fund in amsterdam. then i left to build my own company.
        </motion.p>
      </motion.div>
    </section>
  );
}
