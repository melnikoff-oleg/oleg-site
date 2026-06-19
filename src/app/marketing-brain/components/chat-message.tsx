"use client";

import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GroupedSource, Source } from "@/lib/marketing-brain/types";
import type { UiMessage } from "../use-brain-chat";
import { SourceCard } from "./source-card";

// Collapse multiple citations of the same book/video into one card.
function groupSources(sources: Source[]): GroupedSource[] {
  const map = new Map<string, GroupedSource>();
  const order: string[] = [];
  for (const s of sources) {
    const key = s.type === "video" ? `v:${s.videoId}` : `b:${s.cover}`;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        type: s.type,
        title: s.title,
        attribution: s.attribution,
        cover: s.cover,
        thumb: s.thumb,
        videoId: s.videoId,
        ns: [],
        items: [],
      };
      map.set(key, g);
      order.push(key);
    }
    g.ns.push(s.n);
    g.items.push({
      n: s.n,
      quote: s.quote,
      page: s.page,
      timecode: s.timecode,
      seconds: s.seconds,
      url: s.url,
    });
  }
  return order.map((k) => map.get(k)!);
}

function linkifyCitations(children: ReactNode, onCite: (n: number) => void): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string") return child;
    const parts = child.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const m = part.match(/^\[(\d+)\]$/);
      if (!m) return part;
      const n = Number(m[1]);
      return (
        <button
          key={i}
          type="button"
          onClick={() => onCite(n)}
          className="mx-0.5 inline-flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded bg-white/10 px-1 align-text-top text-[10px] font-semibold text-zinc-300 transition-colors hover:bg-white/25 hover:text-white"
        >
          {n}
        </button>
      );
    });
  });
}

const dots = (
  <span className="inline-flex gap-0.5">
    <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
    <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
    <span className="size-1 animate-bounce rounded-full bg-zinc-500" />
  </span>
);

const reveal = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export function ChatMessage({ message }: { message: UiMessage }) {
  const [highlight, setHighlight] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const grouped = useMemo(() => groupSources(message.sources ?? []), [message.sources]);
  const citeToCard = useMemo(() => {
    const m = new Map<number, number>();
    grouped.forEach((g, i) => g.ns.forEach((n) => m.set(n, i)));
    return m;
  }, [grouped]);

  // Hold the "searching" beat briefly before revealing sources, so they don't
  // pop in instantly (retrieval is ~milliseconds). Feels intentional, not jittery.
  useEffect(() => {
    if (grouped.length > 0 && !revealed) {
      const t = window.setTimeout(() => setRevealed(true), 700);
      return () => window.clearTimeout(t);
    }
  }, [grouped.length, revealed]);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-2.5 text-sm leading-relaxed text-zinc-100">
          {message.content}
        </div>
      </div>
    );
  }

  const onCite = (n: number) => {
    const idx = citeToCard.get(n);
    if (idx === undefined) return;
    setHighlight(n);
    cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => setHighlight((h) => (h === n ? null : h)), 1600);
  };

  const showSearching = message.streaming && !revealed;
  const showThinking = revealed && message.streaming && !message.content;

  return (
    <div className="space-y-5">
      {showSearching && (
        <p className="flex items-center gap-1.5 text-sm text-zinc-500">
          searching the brain
          {dots}
        </p>
      )}

      {revealed && grouped.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
          <motion.p
            variants={reveal}
            className="text-xs uppercase tracking-widest text-zinc-500"
          >
            foundational sources
          </motion.p>
          <div className="grid gap-3 sm:grid-cols-2">
            {grouped.map((g, i) => (
              <motion.div key={g.key} variants={reveal}>
                <SourceCard
                  source={g}
                  highlight={highlight !== null && g.ns.includes(highlight)}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {showThinking ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-sm text-zinc-500"
        >
          thinking it through
          {dots}
        </motion.p>
      ) : (
        message.content && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`prose-brain text-[15px] leading-relaxed ${
              message.error ? "text-amber-200/90" : "text-zinc-200"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{linkifyCitations(children, onCite)}</p>,
                li: ({ children }) => <li className="mb-1">{linkifyCitations(children, onCite)}</li>,
                ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-zinc-600 underline-offset-2 hover:decoration-white">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-zinc-500 align-text-bottom" />
            )}
          </motion.div>
        )
      )}
    </div>
  );
}
