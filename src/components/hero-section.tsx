import Image from "next/image";
import { SectionLink } from "@/components/section-link";
import { Button } from "@/components/ui/button";
// Static import so Next inlines a ~300-byte blurred preview (the Telegram
// "stripped thumbnail" idea): the frame is never an empty box while the photo loads.
import hero from "../../public/hero.jpg";

const HEADLINE = "I'm building the best AI for marketing.";

// The hero has no entrance animation, on purpose. The first frame the browser
// paints is the finished hero: a fade or a staggered word reveal kept the
// headline unreadable for up to 0.7 s after it had arrived (measured
// 2026-10-23, scripts/perf-pages.mjs), which is exactly the wait Telegram never
// makes you sit through. Motion is kept for content that scrolls in later.
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Dot-grid texture */}
      <div aria-hidden className="bg-dotgrid pointer-events-none absolute inset-0" />

      {/* Ambient blue glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 isolate bg-[radial-gradient(ellipse_55%_45%_at_50%_18%,rgba(40,99,240,0.16),transparent)]"
      />

      <div className="relative pt-32 md:pt-44">
        <div className="mx-auto max-w-4xl px-6 text-center">
          {/* Top label. align-top so its line is exactly the pill's height: on
              the text baseline, the line took its height from the font, which
              shrank 18px when Wix Madefor replaced the fallback and pulled
              the whole hero up (CLS 0.07 on a slow phone, 2026-10-23). The
              other hero pills on the site carry it for the same reason. */}
          <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
            Building media superintelligence
          </span>

          {/* Main heading. One inline-block span per word, because the metallic
              gradient is painted per word (background-clip: text has to sit on
              the element holding the glyphs). */}
          <h1 className="mx-auto mt-8 max-w-3xl text-balance font-display text-2xl font-semibold leading-[1.1] tracking-tight text-silver sm:text-3xl md:text-4xl lg:text-5xl">
            {HEADLINE.split(" ").map((word, i, words) => (
              <span key={i} className="inline-block">
                <span className="text-metallic inline-block">{word}</span>
                {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-balance font-body text-lg text-silver-muted md:text-xl">
            Marketing is data. I collect it at scale, every piece of content that won and why, and teach an AI to make the next one win. A mathematician going after marketing the way science goes after anything.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="primary">
              <SectionLink href="#vision">
                see the vision
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4"
                >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06z"
                  clipRule="evenodd"
                />
                </svg>
              </SectionLink>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <SectionLink href="#connect">let&apos;s connect</SectionLink>
            </Button>
          </div>
        </div>

        {/* Hero image. No entrance animation on purpose: it is the largest
            thing on screen, so it shows the moment it arrives, and the inline
            blurred preview underneath is the transition (a fade-in held the
            browser's LCP back to the end of the animation, ~1.8s on a phone). */}
        <div className="mt-16 px-4 sm:px-6">
          <div className="surface-card glow-blue relative mx-auto max-w-4xl overflow-hidden p-2">
            <Image
              src={hero}
              alt="Oleg Melnikov"
              placeholder="blur"
              quality={90}
              className="rounded-xl"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />

            {/* Soft scrim: a short, gentle band at the very bottom only, so the
                glass panel blends in without darkening Oleg's face above it.
                Overlay layout only (sm and up); on a phone the quote sits below. */}
            <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden h-1/3 sm:block rounded-b-xl bg-gradient-to-t from-navy/80 to-transparent" />

            {/* Quote: a glass panel over the photo from sm up. On a phone the photo
                is too small to carry it, the panel covered the face at 390px, so
                there it sits in the card under the photo instead. */}
            <figure className="mt-2 sm:absolute sm:inset-x-2 sm:bottom-[12%] sm:mt-0 sm:px-4">
              <div className="mx-auto max-w-3xl rounded-xl border border-hairline bg-navy/70 px-4 py-3.5 backdrop-blur-md sm:px-7 sm:py-4">
                <blockquote className="text-balance font-display text-base font-semibold leading-snug tracking-tight text-silver sm:text-xl md:text-2xl">
                  <span className="text-silver-muted">&ldquo;</span>made{" "}
                  <span className="text-metallic">$700k by the age 24</span> by
                  applying AI for trading, then went all-in on{" "}
                  <span className="text-metallic">AI for marketing</span>
                  .<span className="text-silver-muted">&rdquo;</span>
                </blockquote>
              </div>
            </figure>

            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-hairline" />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none relative -mt-32 hidden h-32 bg-gradient-to-t from-navy to-transparent sm:block" />
      </div>
    </section>
  );
}
