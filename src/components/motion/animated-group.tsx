// Staggered entrance for a group of children, with zero animation-runtime JS.
// CSS reimplementation of the former framer-motion version: same rendered DOM
// (a container div wrapping each child in an item div) and same `variants` prop
// shape, but the stagger/delay are read off the variants and applied as CSS
// animation delays (visuals in globals.css @keyframes reveal-blur). Runs on
// mount, like the original initial/animate behavior, and `is-visible` is
// rendered on the server so the animation starts at first paint, not after
// hydration.

import { Children, type CSSProperties, type ReactNode } from "react";

type Transition = { staggerChildren?: number; delayChildren?: number };
type Variant = {
  hidden?: unknown;
  visible?: { transition?: Transition } & Record<string, unknown>;
};

type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variant;
    item?: unknown;
  };
};

const DEFAULT_STAGGER = 0.08;
const DEFAULT_DELAY = 0.6;

export function AnimatedGroup({
  children,
  className,
  variants,
}: AnimatedGroupProps) {
  const t = variants?.container?.visible?.transition;
  const stagger = t?.staggerChildren ?? DEFAULT_STAGGER;
  const delayChildren = t?.delayChildren ?? DEFAULT_DELAY;

  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <div
          className="is-visible"
          data-reveal="blur"
          style={{ "--reveal-delay": `${delayChildren + i * stagger}s` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
