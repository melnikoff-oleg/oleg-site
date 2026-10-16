// Per-word / per-line entrance animation with zero animation-runtime JS.
// CSS reimplementation of the former framer-motion version, same public API and
// same rendered DOM (a container span wrapping one inline-block span per
// segment). The blur/opacity/translate visuals live in globals.css
// (@keyframes reveal-blur). It is a mount animation, so `is-visible` is rendered
// on the server: the CSS animation starts at first paint and the text never
// waits for JavaScript to hydrate (it used to stay invisible until it did).

import type { CSSProperties, ElementType } from "react";

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

  return (
    <Tag className={className}>
      <span className="inline">
        {segments.map((segment, i) => (
          <span
            key={i}
            className="inline-block is-visible"
            data-reveal="blur"
            style={{ "--reveal-delay": `${delay + i * STAGGER}s` } as CSSProperties}
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
