"use client";

import { Children, useMemo, useRef, useState, type ReactNode } from "react";
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

export function ChatMessage({ message }: { message: UiMessage }) {
  const [highlight, setHighlight] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const grouped = useMemo(() => groupSources(message.sources ?? []), [message.sources]);
  const citeToCard = useMemo(() => {
    const m = new Map<number, number>();
    grouped.forEach((g, i) => g.ns.forEach((n) => m.set(n, i)));
    return m;
  }, [grouped]);

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

  const showThinking = message.streaming && !message.content;
  const thinkingLabel =
    (message.sources?.length ?? 0) === 0 ? "searching the brain" : "thinking";

  return (
    <div className="space-y-4">
      {showThinking ? (
        <p className="text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            {thinkingLabel}
            <span className="inline-flex gap-0.5">
              <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
              <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
              <span className="size-1 animate-bounce rounded-full bg-zinc-500" />
            </span>
          </span>
        </p>
      ) : (
        <div
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
        </div>
      )}

      {grouped.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {grouped.map((g, i) => (
            <SourceCard
              key={g.key}
              source={g}
              highlight={highlight !== null && g.ns.includes(highlight)}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
