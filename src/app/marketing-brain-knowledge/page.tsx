"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ResourceFooter } from "@/components/resource-footer";
import { books, experts, stats, type Video } from "./data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

// subtle per-expert accent for the monogram chips
const accents: Record<string, string> = {
  hormozi: "from-amber-500/30 to-orange-500/10 text-amber-200",
  brunson: "from-sky-500/30 to-blue-500/10 text-sky-200",
  cialdini: "from-violet-500/30 to-purple-500/10 text-violet-200",
  vaynerchuk: "from-rose-500/30 to-red-500/10 text-rose-200",
  ogilvy: "from-emerald-500/30 to-teal-500/10 text-emerald-200",
  godin: "from-fuchsia-500/30 to-pink-500/10 text-fuchsia-200",
  ralston: "from-cyan-500/30 to-sky-500/10 text-cyan-200",
  patel: "from-lime-500/30 to-green-500/10 text-lime-200",
  mrbeast: "from-indigo-500/30 to-blue-500/10 text-indigo-200",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

function formatDuration(d: string) {
  const parts = d.split(":").map(Number);
  let h = 0,
    m = 0,
    s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function VideoCard({ v }: { v: Video }) {
  return (
    <motion.a
      variants={fadeUp}
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.thumb}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.01] object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-200 backdrop-blur-sm">
          {formatDuration(v.duration)}
        </span>
        {/* play glyph on hover */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-5 text-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
          {v.title}
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500">
          {v.channel} · {formatViews(v.views)} views
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {v.summary}
        </p>
      </div>
    </motion.a>
  );
}

export default function MarketingBrainKnowledgePage() {
  return (
    <>
      {/* Minimal header */}
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-[family-name:var(--font-unbounded)] tracking-tight"
          >
            oleg melnikov
          </Link>
          <Link
            href="/marketing-brain"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            ask the brain →
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.18),transparent)]"
        />

        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400"
            >
              curated knowledge base
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-8 font-[family-name:var(--font-unbounded)] text-4xl tracking-tight sm:text-5xl md:text-6xl"
            >
              the marketing brain
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl"
            >
              the greatest marketing minds, distilled into one searchable brain —
              every book and every talk that shapes how i think about growth,
              offers, and building an audience.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-zinc-500"
            >
              {[
                `${stats.experts} legendary experts`,
                `${stats.books} books`,
                `${stats.videos} talks`,
                `${formatViews(stats.totalViews)}+ views distilled`,
              ].map((s, i) => (
                <span key={s} className="flex items-center gap-3">
                  {i > 0 && <span className="text-zinc-700">·</span>}
                  <span className="font-medium text-zinc-300">{s}</span>
                </span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Books */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="pb-20 md:pb-28"
        >
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              className="text-sm uppercase tracking-widest text-zinc-500"
            >
              the bookshelf
            </motion.h2>
            <motion.div
              variants={stagger}
              className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
            >
              {books.map((b) => (
                <motion.div key={b.slug} variants={fadeUp} className="group">
                  <div className="relative aspect-2/3 overflow-hidden rounded-lg shadow-lg shadow-black/40 ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-white/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.cover}
                      alt={b.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium leading-snug text-zinc-200">
                    {b.title}
                  </p>
                  <p className="text-xs text-zinc-500">{b.author}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Expert quick-nav */}
        <div className="sticky top-0 z-20 border-y border-white/[0.06] bg-black/70 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6">
            <nav className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {experts.map((e) => (
                <a
                  key={e.slug}
                  href={`#${e.slug}`}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-100"
                >
                  {e.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Experts + videos */}
        <div className="mx-auto max-w-6xl px-6 pt-16">
          {experts.map((e) => {
            const totalViews = e.videos.reduce((a, v) => a + v.views, 0);
            return (
              <motion.section
                key={e.slug}
                id={e.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={stagger}
                className="scroll-mt-20 pb-20 md:pb-28"
              >
                {/* expert header */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-6"
                >
                  <span
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                      accents[e.slug] ?? "from-white/20 to-white/5 text-white"
                    } text-lg font-semibold ring-1 ring-white/10`}
                  >
                    {initials(e.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-[family-name:var(--font-unbounded)] text-2xl tracking-tight md:text-3xl">
                      {e.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {e.books.length > 0 && (
                        <span className="text-zinc-400">
                          {e.books.join(" · ")}
                          {"  —  "}
                        </span>
                      )}
                      {e.videos.length} talks · {formatViews(totalViews)} views
                    </p>
                  </div>
                </motion.div>

                {/* videos grid */}
                <motion.div
                  variants={stagger}
                  className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {e.videos.map((v) => (
                    <VideoCard key={v.id} v={v} />
                  ))}
                </motion.div>
              </motion.section>
            );
          })}
        </div>

        {/* Footer CTA */}
        <section className="border-t border-white/10 py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-unbounded)] text-2xl tracking-tight md:text-3xl">
              this is the brain behind the content
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              i built an AI system that turns these minds into answers i can
              query — every claim cited to the exact page or timecode. ask it
              anything, or follow along as i build AI systems for marketing in
              public.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/marketing-brain"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                ask the brain
              </Link>
              <a
                href="https://www.youtube.com/@Oleg-Melnikov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5"
              >
                watch on youtube
              </a>
            </div>
          </div>
        </section>

        <ResourceFooter currentSlug="marketing-brain" />
      </main>
    </>
  );
}
