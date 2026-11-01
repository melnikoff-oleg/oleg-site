// /viral-tweets: the fourteen AI posts from X that Oleg saved on 2026-11-01,
// as an X-style feed, highest outlier score first. The same page as his
// claude.ai artifact "Saved tweets for LinkedIn", minus his private notes.
//
// The data is generated: scripts/build-viral-tweets.py ports the artifact's
// generator (build_feed.py in the MS repo) and writes ./tweets.ts plus the
// media in public/viral-tweets/. Edit there and re-run, not here.
//
// A server component. The client leaves are LazyVideo (poster one screen
// ahead, mp4 on approach, controls on) and the one-listener PhotoZoom.

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { LazyVideo } from "@/components/lazy-video";
import { ResourceFooter } from "@/components/resource-footer";
import { PhotoZoom } from "./photo-zoom";
import { POSTED, TWEETS, type Media, type Segment, type Stat, type Verified } from "./tweets";

const BADGE =
  "M20.4 11c0-1.4-.8-2.6-1.9-3.2.4-1.2.1-2.7-.8-3.6s-2.4-1.2-3.6-.8C13.6 2.3 12.4 1.5 11 1.5s-2.6.8-3.2 1.9c-1.2-.4-2.7-.1-3.6.8s-1.2 2.4-.8 3.6C2.3 8.4 1.5 9.6 1.5 11s.8 2.6 1.9 3.2c-.4 1.2-.1 2.7.8 3.6s2.4 1.2 3.6.8c.6 1.1 1.8 1.9 3.2 1.9s2.6-.8 3.2-1.9c1.2.4 2.7.1 3.6-.8s1.2-2.4.8-3.6c1.1-.6 1.8-1.8 1.8-3.2z";

/** X's verified check: blue, or gold for a business account (a16z). */
function Check({ kind }: { kind: Verified }) {
  if (!kind) return null;
  return (
    <svg className="vt-ck" viewBox="0 0 22 22" role="img" aria-label="Verified account">
      <path fill={kind === "gold" ? "#e2b719" : "#1d9bf0"} d={BADGE} />
      <path fill="#fff" d="M9.6 15.2 6 11.6l1.3-1.3 2.3 2.3 5-5.1 1.4 1.3z" />
    </svg>
  );
}

const ICON: Record<Stat["kind"], string> = {
  reply:
    "M1.75 10c0-4.42 3.58-8 8-8h4.37c4.42 0 8.13 3.58 8.13 8s-3.58 8-8 8H14v3.5l-1.6-.93C9.35 18.79 1.75 15.57 1.75 10zm8-6c-3.31 0-6 2.69-6 6 0 3.36 4.08 5.88 7.25 7.47V16h3.12c3.31 0 6.13-2.69 6.13-6s-2.69-6-6-6H9.75z",
  rt: "M4.5 3.88l4.43 4.14-1.36 1.46L5.5 7.55V16c0 1.1.9 2 2 2H13v2H7.5c-2.21 0-4-1.79-4-4V7.55L1.43 9.48.07 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.21 0 4 1.79 4 4v8.45l2.07-1.93 1.36 1.46-4.43 4.14-4.43-4.14 1.36-1.46 2.07 1.93V8c0-1.1-.9-2-2-2z",
  like: "M16.7 5.5c-1.11-.04-2.37.52-3.82 2.13L12 8.6l-.88-.97c-1.46-1.6-2.72-2.17-3.83-2.13-1.13.03-2.13.66-2.93 1.48-.84.88-1.36 2.06-1.36 3.31 0 2.85 2.29 5.26 4.73 7.38 1.24 1.07 2.5 2.02 3.6 2.83l.67.48.67-.48c1.1-.81 2.36-1.76 3.6-2.83 2.44-2.12 4.73-4.53 4.73-7.38 0-1.25-.52-2.43-1.36-3.31-.8-.82-1.8-1.45-2.93-1.48z",
  view: "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z",
};

const STAT_NAME: Record<Stat["kind"], string> = {
  reply: "replies",
  rt: "reposts",
  like: "likes",
  view: "views",
};

function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="vt-sts">
      {stats.map((s) => (
        <span key={s.kind} className="vt-st">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d={ICON[s.kind]} />
          </svg>
          {s.label}
          <span className="sr-only"> {STAT_NAME[s.kind]}</span>
        </span>
      ))}
    </div>
  );
}

/** Name, check, @handle and date, the way X lays out a post's first line. */
function Head({
  name,
  handle,
  verified,
  date,
  url,
}: {
  name: string;
  handle: string;
  verified: Verified;
  date: { label: string; iso: string };
  url?: string;
}) {
  const time = <time dateTime={date.iso}>{date.label}</time>;
  return (
    <div className="vt-hd">
      <span className="vt-nm">{name}</span>
      <Check kind={verified} />
      <span className="vt-hn">
        @{handle} ·{" "}
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {time}
          </a>
        ) : (
          time
        )}
      </span>
    </div>
  );
}

function Text({ segments, before }: { segments: Segment[]; before?: ReactNode }) {
  if (!segments.length && !before) return null;
  return (
    <div className="vt-tx">
      {before}
      {segments.map((s, i) =>
        "t" in s ? (
          <Fragment key={i}>{s.t}</Fragment>
        ) : "at" in s ? (
          <span key={i} className="vt-at">
            {s.at}
          </span>
        ) : (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer nofollow">
            {s.label}
          </a>
        ),
      )}
    </div>
  );
}

function MediaList({ items, name, url }: { items: Media[]; name: string; url: string }) {
  if (!items.length) return null;
  return (
    <div className="vt-md">
      {items.map((m) =>
        m.kind === "photo" ? (
          <a key={m.src} className="vt-ph" href={m.src} data-zoom target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.src}
              width={m.w}
              height={m.h}
              loading="lazy"
              decoding="async"
              alt={`Image from ${name}'s post`}
            />
          </a>
        ) : (
          <Fragment key={m.src}>
            <div className="vt-vid">
              <LazyVideo
                src={m.src}
                poster={m.poster}
                placeholder={m.placeholder}
                aspectRatio={m.ratio}
                controls
                className="vt-video"
              />
            </div>
            {m.clip ? (
              <p className="vt-clip">
                first {m.clip.kept} s of {m.clip.full} ·{" "}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  full video on X
                </a>
              </p>
            ) : null}
          </Fragment>
        ),
      )}
    </div>
  );
}

export default function ViralTweetsPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Viral AI tweets", path: "/viral-tweets" }]} />
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <Link
            href="https://www.youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </Link>
        </div>
      </header>

      <main className="pb-16 md:pb-24">
        <section className="pt-10 pb-8 md:pt-16 md:pb-12">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              Viral on X
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              {TWEETS.length} viral AI tweets, ranked by outlier score
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-silver-muted md:text-xl">
              The outlier score is how far a post beat what an account of its size usually gets.
              Highest first, all posted {POSTED.range}, {POSTED.year}.
            </p>
          </div>
        </section>

        <ol className="vt-feed">
          {TWEETS.map((t) => (
            <li key={t.url}>
              <article className="vt-card" aria-labelledby={`tweet-${t.pos}`}>
                <div className="vt-num">
                  <h2 id={`tweet-${t.pos}`} className="vt-pos">
                    <span className="sr-only">Tweet </span>#{t.pos}
                  </h2>
                  <span className="vt-score">outlier {t.outlier}</span>
                  <a className="vt-open" href={t.url} target="_blank" rel="noopener noreferrer">
                    Open on X ↗
                  </a>
                </div>
                <div className="vt-tw">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="vt-av" src={t.avatar} width={40} height={40} alt="" loading="lazy" decoding="async" />
                  <div className="vt-col">
                    <Head name={t.name} handle={t.handle} verified={t.verified} date={t.date} url={t.url} />
                    <Text segments={t.text} />
                    <MediaList items={t.media} name={t.name} url={t.url} />
                    {t.quote ? (
                      <div className="vt-qt">
                        <div className="vt-qhd">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="vt-qav" src={t.quote.avatar} width={20} height={20} alt="" loading="lazy" decoding="async" />
                          <Head
                            name={t.quote.name}
                            handle={t.quote.handle}
                            verified={t.quote.verified}
                            date={t.quote.date}
                          />
                        </div>
                        <Text
                          segments={t.quote.text}
                          before={t.quote.article ? <span className="vt-art">X Article </span> : null}
                        />
                        <MediaList items={t.quote.media} name={t.quote.name} url={t.url} />
                      </div>
                    ) : null}
                    <Stats stats={t.stats} />
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </main>

      <PhotoZoom />
      <ResourceFooter currentSlug="viral-tweets" boldaneCredit />
    </>
  );
}
