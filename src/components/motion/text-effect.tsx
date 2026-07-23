"use client";

// Per-word / per-line entrance animation with zero animation-runtime JS.
// CSS reimplementation of the former framer-motion version, same public API and
// same rendered DOM (a container span wrapping one inline-block span per
// segment). The blur/opacity/translate visuals live in globals.css
// (@keyframes reveal-blur); this only stamps `is-visible` + a per-segment delay.

import { useEffect, useState, type ElementType } from "react";

type TextEffectProps = {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  per?: "word" | "line";
  /**
   * Class applied to each animated segment span. Use this (not `className`)
   * for gradient-clip text like `.text-metallic`: `background-clip: text`
   * must live on the same element as the glyphs.
   */
  segmentClassName?: string;
};

const STAGGER = 0.04;

export function TextEffect({
  children,
  as: Tag = "p",
  className,
  delay = 0,
  per = "word",
  segmentClassName,
}: TextEffectProps) {
  const segments = per === "line" ? children.split("\n") : children.split(" ");
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  return (
    <Tag className={className}>
      <span className="inline">
        {segments.map((segment, i) => (
          <span
            key={i}
            className={`inline-block ${visible ? "is-visible" : ""}`}
            data-reveal="blur"
            style={{ "--reveal-delay": `${delay + i * STAGGER}s` } as React.CSSProperties}
          >
            {segmentClassName ? (
              <span className={`inline-block ${segmentClassName}`}>{segment}</span>
            ) : (
              segment
            )}
            {i < segments.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </span>
    </Tag>
  );
}
