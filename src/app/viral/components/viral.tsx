"use client";

// /viral: describe your brand, see the reels to copy, adapt one.
//
// One screen, three states. The brand box is always at the top. Under it, the
// wall of reels for that brand. Clicking a tile opens the reel's write-up in a
// panel with one button, "Adapt for my brand", which turns into the concept
// plus a feedback box that regenerates it. The brand text is kept in
// localStorage so a return visit does not start from nothing; there is no
// account yet.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Eye, Flame, Heart, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { compactNumber, formatRelative, formatScore } from "@/lib/reels/format";
import { ReelPlayButton, ReelVideoProvider } from "@/components/reel-video";
import type { ReelRow } from "@/lib/reels/types";

type Reel = Pick<
  ReelRow,
  | "shortcode"
  | "url"
  | "account"
  | "creator"
  | "posted_on"
  | "score"
  | "views"
  | "likes"
  | "comments"
  | "followers"
  | "duration_sec"
  | "shots"
  | "music"
  | "idea"
  | "hook_summary"
  | "hook_points"
  | "retain_summary"
  | "retain_points"
  | "reward_summary"
  | "reward_points"
  | "tags"
  | "caption"
  | "thumb_url"
> & { similarity: number; rank: number };

type Concept = { name: string; idea: string; hook: string; retain: string; reward: string; script: string };

const BRAND_MIN = 10;
const BRAND_MAX = 600;
const STORAGE_KEY = "viral.brand";

const EXAMPLES = [
  "I run a mobile app development agency in Dubai and build my own apps. I talk about what makes apps good.",
  "Fitness coach for busy dads over 35. Online coaching, home workouts, no gym.",
  "I sell handmade ceramic mugs and bowls from my studio. Small batches, slow craft.",
  "Real estate broker in Dubai helping expats buy their first apartment.",
];

function loadBrand(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
function saveBrand(v: string) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Private window, blocked storage: the page still works without it.
  }
}

export function Viral({ configured, adaptConfigured }: { configured: boolean; adaptConfigured: boolean }) {
  const [brand, setBrand] = useState("");
  const [searched, setSearched] = useState("");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Reel | null>(null);
  const inflight = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = loadBrand();
    if (saved) setBrand(saved);
  }, []);

  const search = useCallback(
    async (text: string) => {
      const q = text.replace(/\s+/g, " ").trim();
      if (q.length < BRAND_MIN) {
        setError(`Tell us a bit more. At least ${BRAND_MIN} characters.`);
        return;
      }
      inflight.current?.abort();
      const ctl = new AbortController();
      inflight.current = ctl;
      setLoading(true);
      setError(null);
      saveBrand(q);
      try {
        const res = await fetch("/api/viral-reels/viral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: q }),
          signal: ctl.signal,
        });
        if (!res.ok) {
          setError(
            res.status === 429
              ? "That is a lot of searches for one day. Come back tomorrow."
              : "The search did not answer. Try again in a moment.",
          );
          return;
        }
        const data = (await res.json()) as { reels: Reel[] };
        setReels(data.reels);
        setSearched(q);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("The search did not answer. Try again in a moment.");
      } finally {
        if (inflight.current === ctl) setLoading(false);
      }
    },
    [],
  );

  const codes = useMemo(() => reels.map((r) => r.shortcode), [reels]);

  return (
    <div>
      <section className="mx-auto max-w-3xl">
        <p className="font-display text-2xl font-semibold leading-tight text-white sm:text-4xl">
          Your next reel should be one that already went viral.
        </p>
        <p className="mt-3 font-body text-sm text-silver-muted sm:text-base">
          Say what you do. We show the reels in your niche that blew up from small accounts recently. Pick one, and get it rewritten for you, script included.
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void search(brand);
          }}
        >
          <label htmlFor="brand" className="sr-only">
            What is your brand about
          </label>
          <textarea
            id="brand"
            value={brand}
            maxLength={BRAND_MAX}
            rows={3}
            onChange={(e) => setBrand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void search(brand);
              }
            }}
            placeholder="What do you do, who is it for, what do you sell? The more you write, the better the matches."
            className="w-full resize-none rounded-2xl border border-hairline bg-navy-raised px-4 py-3 font-body text-base text-white placeholder:text-silver-muted/60 focus:border-vivid-blue/60 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !configured}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-vivid-blue px-5 font-body text-sm font-medium text-white transition-colors hover:bg-vivid-blue/85 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
              Show me what went viral
            </button>
            <span className="font-body text-xs text-silver-muted">
              {brand.trim().length < BRAND_MIN ? `At least ${BRAND_MIN} characters` : `${brand.length} / ${BRAND_MAX}`}
            </span>
          </div>
        </form>

        {!searched && !loading && (
          <div className="mt-5 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setBrand(ex);
                  void search(ex);
                }}
                className="rounded-full border border-hairline px-3 py-1.5 text-left font-body text-xs text-silver-muted transition-colors hover:border-vivid-blue/50 hover:text-white"
              >
                {ex.length > 60 ? `${ex.slice(0, 57)}...` : ex}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-4 font-body text-sm text-amber-300">{error}</p>}
        {!configured && <p className="mt-4 font-body text-sm text-amber-300">Search is not configured on this deployment.</p>}
      </section>

      <section className="mt-10" aria-live="polite">
        {searched && (
          <p className="mb-4 font-body text-xs text-silver-muted">
            {reels.length === 0
              ? "Nothing in the library is close to that yet. Try describing it differently."
              : `${reels.length} reels to copy. Newest and smallest accounts first. Click one.`}
          </p>
        )}
        <ReelVideoProvider codes={codes}>
          <div className={`grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 ${loading ? "opacity-50" : ""}`}>
            {reels.map((reel, i) => (
              <Tile key={reel.shortcode} reel={reel} index={i} onOpen={() => setOpen(reel)} />
            ))}
          </div>
          {open && (
            <Panel reel={open} brand={searched} adaptConfigured={adaptConfigured} onClose={() => setOpen(null)} />
          )}
        </ReelVideoProvider>
      </section>
    </div>
  );
}

function Tile({ reel, index, onOpen }: { reel: Reel; index: number; onOpen: () => void }) {
  const posted = formatRelative(reel.posted_on);
  const score = formatScore(reel.score);
  return (
    <article className="group relative overflow-hidden rounded-lg border border-hairline bg-navy-raised">
      <div className="aspect-[9/16] w-full">
        {reel.thumb_url ? (
          <img
            src={reel.thumb_url}
            alt=""
            width={360}
            height={640}
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="size-full" />
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy/70 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy/75 via-navy/25 to-transparent" aria-hidden />

      <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer">
        <span className="sr-only">{`Open: ${compactNumber(reel.views)} views, ${score}x outlier, posted ${posted}`}</span>
      </button>

      <span className="pointer-events-none absolute left-2 top-2 z-20 max-w-[calc(100%-1rem)] truncate rounded-full bg-navy/55 px-2 py-1 font-body text-[11px] font-medium text-white/85 backdrop-blur-md sm:text-xs">
        @{reel.account} · {compactNumber(reel.followers)}
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-1.5 sm:p-2">
        <div className="rounded-xl border border-white/10 bg-navy/50 px-2.5 py-2 backdrop-blur-md sm:px-3 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Eye className="size-4 shrink-0 text-white/80" aria-hidden />
              <span className="truncate font-display text-lg font-semibold leading-none tabular-nums text-white sm:text-xl">
                {compactNumber(reel.views)}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-amber-300">
              <Flame className="size-3.5 shrink-0" aria-hidden />
              <span className="font-display text-sm font-semibold leading-none tabular-nums sm:text-base">{score}x</span>
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="truncate font-body text-[11px] font-medium tabular-nums text-white/75 sm:text-xs">{posted}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-white/60">
              <Heart className="size-3 shrink-0" aria-hidden />
              <span className="font-body text-[11px] font-medium tabular-nums sm:text-xs">{compactNumber(reel.likes)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Field({ label, summary, points }: { label: string; summary: string | null; points?: string[] | null }) {
  if (!summary && !points?.length) return null;
  return (
    <div>
      <p className="font-body text-[11px] font-medium uppercase tracking-wider text-silver-muted">{label}</p>
      {summary && <p className="mt-1 font-body text-sm text-silver">{summary}</p>}
      {points && points.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {points.map((p) => (
            <li key={p} className="font-body text-sm text-silver-muted">
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Panel({
  reel,
  brand,
  adaptConfigured,
  onClose,
}: {
  reel: Reel;
  brand: string;
  adaptConfigured: boolean;
  onClose: () => void;
}) {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const adapt = async (withFeedback: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/viral-reels/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortcode: reel.shortcode,
          brand,
          previous: withFeedback ? concept : null,
          feedback: withFeedback ? feedback : "",
        }),
      });
      if (!res.ok) {
        setError(
          res.status === 429
            ? "You have used today's adaptations. Come back tomorrow."
            : "Could not write the concept. Try again.",
        );
        return;
      }
      const data = (await res.json()) as { concept: Concept };
      setConcept(data.concept);
      if (withFeedback) setFeedback("");
    } catch {
      setError("Could not write the concept. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!concept) return;
    const text = `${concept.name}\n\nIDEA\n${concept.idea}\n\nHOOK\n${concept.hook}\n\nRETAIN\n${concept.retain}\n\nREWARD\n${concept.reward}\n\nSCRIPT\n${concept.script}\n\nBased on ${reel.url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No clipboard: the text is on screen to select.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reel by @${reel.account}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-hairline bg-navy-raised sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
          <div className="min-w-0 font-body text-sm text-silver-muted">
            <a href={reel.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white hover:underline">
              @{reel.account} <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <span className="mx-2">·</span>
            {compactNumber(reel.followers)} followers
            <span className="mx-2">·</span>
            <span className="text-white">{compactNumber(reel.views)}</span> views
            <span className="mx-2">·</span>
            <span className="text-amber-300">{formatScore(reel.score)}x</span>
            <span className="mx-2">·</span>
            {formatRelative(reel.posted_on)}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-silver-muted hover:bg-silver/10 hover:text-white">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="border-b border-hairline p-4 sm:p-5 md:border-b-0 md:border-r">
            <div className="flex gap-4">
              {reel.thumb_url && (
                // The play button, when we hold the file, covers this picture.
                // It lives here and not on the tile, because on the tile it
                // would sit on top of the click that opens this panel.
                <div className="relative h-[213px] w-[120px] shrink-0 overflow-hidden rounded-lg">
                  <img src={reel.thumb_url} alt="" width={120} height={213} className="size-full object-cover" />
                  <ReelPlayButton
                    shortcode={reel.shortcode}
                    url={reel.url}
                    poster={reel.thumb_url}
                    label={`Play this reel: ${compactNumber(reel.views)} views`}
                  />
                </div>
              )}
              <div className="min-w-0 space-y-3">
                <Field label="The idea" summary={reel.idea} />
                <p className="font-body text-xs text-silver-muted">
                  {reel.duration_sec ? `${Math.round(reel.duration_sec)}s` : ""}
                  {reel.shots ? ` · ${reel.shots} shots` : ""}
                  {reel.music ? ` · ${reel.music}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Hook" summary={reel.hook_summary} points={reel.hook_points} />
              <Field label="Why people keep watching" summary={reel.retain_summary} points={reel.retain_points} />
              <Field label="What they get" summary={reel.reward_summary} points={reel.reward_points} />
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {!concept ? (
              <div className="flex h-full flex-col items-start justify-center gap-3">
                <p className="font-display text-xl font-semibold text-white">Make this one yours</p>
                <p className="font-body text-sm text-silver-muted">
                  Same hook, same shape, same payoff. Your subject, your words. Written for: <span className="text-silver">{brand}</span>
                </p>
                <button
                  type="button"
                  disabled={busy || !adaptConfigured}
                  onClick={() => void adapt(false)}
                  className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-vivid-blue px-5 font-body text-sm font-medium text-white transition-colors hover:bg-vivid-blue/85 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
                  {busy ? "Writing, about 15 seconds" : "Adapt for my brand"}
                </button>
                {error && <p className="font-body text-sm text-amber-300">{error}</p>}
                {!adaptConfigured && <p className="font-body text-sm text-amber-300">Adapting is not configured on this deployment.</p>}
              </div>
            ) : (
              <div className={busy ? "opacity-50" : ""}>
                <p className="font-display text-xl font-semibold leading-tight text-white">{concept.name}</p>
                <div className="mt-4 space-y-4">
                  <Field label="Idea" summary={concept.idea} />
                  <Field label="Hook" summary={concept.hook} />
                  <Field label="Why people keep watching" summary={concept.retain} />
                  <Field label="What they get" summary={concept.reward} />
                  <div>
                    <p className="font-body text-[11px] font-medium uppercase tracking-wider text-silver-muted">Script</p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-xl border border-hairline bg-navy p-3 font-body text-sm leading-relaxed text-silver">
                      {concept.script}
                    </pre>
                  </div>
                </div>

                <div className="mt-5 border-t border-hairline pt-4">
                  <label htmlFor="feedback" className="font-body text-xs text-silver-muted">
                    Not quite? Say what to change.
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="feedback"
                      value={feedback}
                      maxLength={400}
                      onChange={(e) => setFeedback(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && feedback.trim()) {
                          e.preventDefault();
                          void adapt(true);
                        }
                      }}
                      placeholder="Shorter. Funnier. Talk about my pricing. Make the hook a question."
                      className="min-h-11 flex-1 rounded-full border border-hairline bg-navy px-4 font-body text-sm text-white placeholder:text-silver-muted/60 focus:border-vivid-blue/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy || !feedback.trim()}
                      onClick={() => void adapt(true)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-vivid-blue/60 px-4 font-body text-sm font-medium text-white transition-colors hover:bg-vivid-blue/15 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => void copy()}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline px-4 font-body text-sm text-silver-muted transition-colors hover:text-white"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  {error && <p className="mt-2 font-body text-sm text-amber-300">{error}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
