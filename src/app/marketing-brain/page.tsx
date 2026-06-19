"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBrainChat } from "./use-brain-chat";
import { ChatMessage } from "./components/chat-message";

const STARTERS = [
  "how do I make an irresistible offer?",
  "should I focus on outbound or content?",
  "how do I get my first 5 customers?",
  "what makes a youtube thumbnail get clicks?",
];

export default function MarketingBrainPage() {
  const { messages, isStreaming, send } = useBrainChat();
  const [input, setInput] = useState("");
  const autoFollow = useRef(true);
  const lastY = useRef(0);
  const started = messages.length > 0;

  // Follow the stream to the bottom — but the moment the user scrolls UP,
  // disengage and leave them be. Re-engage only when they return to the bottom.
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const distance =
        document.documentElement.scrollHeight - y - window.innerHeight;
      if (y < lastY.current - 2) {
        autoFollow.current = false; // user scrolled up
      } else if (distance < 80) {
        autoFollow.current = true; // back at the bottom
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (autoFollow.current) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim() || isStreaming) return;
    autoFollow.current = true; // a new question always scrolls into view
    send(text);
    setInput("");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-[family-name:var(--font-unbounded)] tracking-tight"
          >
            oleg melnikov
          </Link>
          <Link
            href="/marketing-brain-knowledge"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
          >
            browse the sources
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.18),transparent)]"
        />

        {!started ? (
          // Empty state / hero
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center"
          >
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400">
              ask the marketing greats
            </span>
            <h1 className="mt-8 font-[family-name:var(--font-unbounded)] text-4xl tracking-tight sm:text-5xl">
              the marketing brain
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
              ask anything about offers, content, persuasion, or growth. every
              answer is grounded in the best marketing books and talks — with the
              exact page or timecode it came from.
            </p>
            <div className="mt-10 flex w-full flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          // Conversation
          <div className="mx-auto w-full max-w-3xl flex-1 px-6 pt-8 pb-40">
            <div className="space-y-8">
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="sticky bottom-0 border-t border-white/[0.06] bg-black/70 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 focus-within:border-white/25"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                rows={1}
                placeholder="ask the brain…"
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-opacity hover:bg-zinc-200 disabled:opacity-30"
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-zinc-600">
              grounded in 8 books &amp; 75 talks · answers can be imperfect — verify the cited source
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
