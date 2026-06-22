"use client";

import { motion, type Variants } from "framer-motion";
import React from "react";

type TextEffectProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  delay?: number;
  per?: "word" | "line";
  /**
   * Class applied to each animated segment span. Use this (not `className`)
   * for gradient-clip text like `.text-metallic`: `background-clip: text`
   * must live on the same element as the glyphs, and segments render as
   * inline-block children, so a gradient on the parent would clip to nothing.
   */
  segmentClassName?: string;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 8 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { type: "spring", bounce: 0.3, duration: 1.2 },
  },
};

export function TextEffect({
  children,
  as: Tag = "p",
  className,
  delay = 0,
  per = "word",
  segmentClassName,
}: TextEffectProps) {
  const segments =
    per === "line" ? children.split("\n") : children.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.04,
              delayChildren: delay,
            },
          },
        }}
        className="inline"
      >
        {segments.map((segment, i) => (
          <motion.span key={i} variants={itemVariants} className="inline-block">
            {/* The gradient-clip (e.g. .text-metallic) must live on a static
                span: Chromium breaks `background-clip: text` when the same
                element also carries a `filter` (framer-motion sets blur here). */}
            {segmentClassName ? (
              <span className={`inline-block ${segmentClassName}`}>{segment}</span>
            ) : (
              segment
            )}
            {i < segments.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
