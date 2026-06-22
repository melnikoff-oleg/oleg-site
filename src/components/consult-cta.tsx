"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function ConsultCta() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="pb-16 md:pb-20"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="surface-card px-6 py-5 text-center">
          <p className="font-body text-sm text-silver-muted">
            stuck on something?{" "}
            <a
              href="https://calendly.com/boldane/ai-consult"
              target="_blank"
              rel="noopener noreferrer"
              className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              book a 1:1 consult
            </a>
            {". "}
            bring a specific problem, leave with a clear next step.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
