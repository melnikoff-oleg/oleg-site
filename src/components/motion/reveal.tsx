"use client";

// Lightweight entrance animations with zero animation-runtime JS.
// The visuals live in globals.css (@keyframes reveal-up / reveal-blur); this
// only toggles the `is-visible` class (on mount for above-the-fold content, or
// when the element scrolls into view) and sets a per-element stagger delay.
// This is the framer-motion replacement for the marketing pages.

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

type Variant = "up" | "blur";

function useReveal(immediate: boolean) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-100px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return { ref, visible };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay before the animation starts. */
  delay?: number;
  variant?: Variant;
  /** Play on mount instead of waiting for the element to scroll into view. */
  immediate?: boolean;
};

/** Reveal a single element when it enters the viewport (or immediately). */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  variant = "up",
  immediate = false,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, visible } = useReveal(immediate);
  return (
    <Tag
      ref={ref}
      className={`${visible ? "is-visible" : ""} ${className ?? ""}`.trim()}
      data-reveal={variant === "blur" ? "blur" : ""}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds between each child's start. */
  stagger?: number;
  /** Delay before the first child. */
  delayChildren?: number;
  variant?: Variant;
  immediate?: boolean;
};

/**
 * Reveal direct children in sequence when the group enters view (or on mount).
 * The reveal props are cloned onto each child element directly (no wrapper
 * elements) so the rendered DOM/layout is unchanged.
 */
export function RevealGroup({
  children,
  as,
  className,
  stagger = 0.1,
  delayChildren = 0,
  variant = "up",
  immediate = false,
}: RevealGroupProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, visible } = useReveal(immediate);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    className?: string;
    style?: CSSProperties;
  }>[];
  return (
    <Tag ref={ref} className={className}>
      {items.map((child, i) =>
        cloneElement(child, {
          className: `${child.props.className ?? ""} ${visible ? "is-visible" : ""}`.trim(),
          "data-reveal": variant === "blur" ? "blur" : "",
          style: {
            ...(child.props.style ?? {}),
            "--reveal-delay": `${delayChildren + i * stagger}s`,
          } as CSSProperties,
        } as Partial<{ className: string; style: CSSProperties }>),
      )}
    </Tag>
  );
}
