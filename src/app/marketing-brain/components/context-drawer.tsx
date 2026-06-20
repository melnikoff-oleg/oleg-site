"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { useMemory } from "../use-memory";

type Memory = ReturnType<typeof useMemory>;

export function ContextDrawer({
  open,
  onClose,
  memory,
  autoCapture,
  setAutoCapture,
}: {
  open: boolean;
  onClose: () => void;
  memory: Memory;
  autoCapture: boolean;
  setAutoCapture: (v: boolean) => void;
}) {
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onScrape = async () => {
    if (!url.trim() || memory.working) return;
    const ok = await memory.scrape(url.trim());
    if (ok) setUrl("");
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || memory.working) return;
    for (const f of Array.from(files)) {
      await memory.upload(f);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-zinc-950"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="font-[family-name:var(--font-unbounded)] text-lg tracking-tight">
                your business context
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-zinc-400">
                tell the brain about your business so its advice is personalized to
                you: your offers, audience, and goals. add a website, upload files,
                or just write it below.
              </p>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  scrape a website
                </label>
                <div className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onScrape()}
                    placeholder="yourbusiness.com"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={onScrape}
                    disabled={!url.trim() || !!memory.working}
                    className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:bg-zinc-200 disabled:opacity-40"
                  >
                    {memory.working === "scrape" ? "reading…" : "scrape"}
                  </button>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  upload files (pdf, txt, md)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                  onChange={(e) => onFiles(e.target.files)}
                  disabled={!!memory.working}
                  className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/20"
                />
                {memory.working === "upload" && (
                  <p className="text-xs text-zinc-500">reading file…</p>
                )}
              </div>

              {memory.error && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  {memory.error}
                </p>
              )}

              {/* Editor */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  what the brain knows
                </label>
                <textarea
                  value={memory.text}
                  onChange={(e) => memory.setText(e.target.value)}
                  placeholder="e.g. I run Authority AI, done-for-you LinkedIn content for B2B founders, $900/mo…"
                  rows={12}
                  className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
                />
              </div>

              {/* Auto-capture toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
                <span className="text-sm text-zinc-300">
                  auto-capture facts from chat
                  <span className="mt-0.5 block text-xs text-zinc-600">
                    save new business details you mention while chatting
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCapture}
                  onClick={() => setAutoCapture(!autoCapture)}
                  className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                    autoCapture ? "bg-white" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full transition-all ${
                      autoCapture ? "left-[1.125rem] bg-black" : "left-0.5 bg-zinc-400"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => memory.save(memory.text)}
                disabled={!!memory.working}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:bg-zinc-200 disabled:opacity-40"
              >
                {memory.working === "save" ? "saving…" : "save context"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
