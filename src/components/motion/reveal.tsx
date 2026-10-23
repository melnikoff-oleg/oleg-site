"use client";

// Scroll-in entrances that never hide anything a visitor can already see.
//
// The server renders every element visible, with no reveal attribute at all, so
// the first paint is the finished page: nothing above the fold waits on a fade,
// and nothing waits on JavaScript (no-script visitors and crawlers included).
// After hydration, an IntersectionObserver's first report sorts each element:
// one that is on screen or above it is left alone for good; one still entirely
// below the viewport is "armed", hidden while nobody can see it, and plays its
// entrance when it scrolls in. Visuals live in globals.css (@keyframes
// reveal-up); a per-element stagger rides on --reveal-delay.
//
// This is the Telegram rule from reference/telegram_speed_principles.md applied
// to motion: the content a visitor is looking at is drawn in its final state
// the moment it arrives, and an animation only ever decorates content that was
// still off screen.

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

/** undefined: drawn as is. "armed": hidden off screen. "shown": entering. */
type RevealState = undefined | "armed" | "shown";

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let first = true;
    const io = new IntersectionObserver(
      (entries) => {
        // `top < 0` covers an element the page has already scrolled past (a
        // restored scroll position, an anchor jump, a fast programmatic scroll)
        // which reports isIntersecting:false but has been seen.
        const seen = entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0);
        if (first) {
          first = false;
          if (seen) {
            io.disconnect(); // on screen at hydration: never touch it
            return;
          }
          setState("armed");
          return;
        }
        if (seen) {
          setState("shown");
          io.disconnect();
        }
      },
      // A small top inset so the entrance starts once the element is a touch
      // into view. No bottom inset: a section flush with the page bottom must
      // still reveal when scrolled to.
      { rootMargin: "-40px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, state };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay before the entrance starts. */
  delay?: number;
};

/** Reveal a single element when it scrolls into view. */
export function Reveal({ children, as, className, delay = 0 }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, state } = useReveal();
  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={state}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
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
};

/**
 * Reveal direct children in sequence when the group scrolls into view. The
 * reveal props are cloned onto each child element directly (no wrapper
 * elements) so the rendered DOM and layout are unchanged.
 */
export function RevealGroup({
  children,
  as,
  className,
  stagger = 0.1,
  delayChildren = 0,
}: RevealGroupProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, state } = useReveal();
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    style?: CSSProperties;
  }>[];
  return (
    <Tag ref={ref} className={className}>
      {state
        ? items.map((child, i) =>
            cloneElement(child, {
              "data-reveal": state,
              style: {
                ...(child.props.style ?? {}),
                "--reveal-delay": `${delayChildren + i * stagger}s`,
              } as CSSProperties,
            } as Partial<{ style: CSSProperties }>),
          )
        : items}
    </Tag>
  );
}
