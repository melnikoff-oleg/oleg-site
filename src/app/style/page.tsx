import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Oleg Melnikov's brand style guide, as a page. One font family (Wix Madefor,
// since 2026-10-23), seven sizes, two weights, three text colors, the Boldane
// core palette (since 2026-10-22), and the high-contrast rules for YouTube and
// social media. The source documents live in the MS repo,
// projects/accounts/oleg_melnikov/style/ (STYLE.md, TYPOGRAPHY.md); this page
// is the readable version for Oleg, his editors and clients. Static server
// component, no client JavaScript.

const TOC = [
  { href: "#fonts", label: "Fonts" },
  { href: "#display", label: "Display font" },
  { href: "#scale", label: "Sizes and spacing" },
  { href: "#colors", label: "Colors" },
  { href: "#dark-light", label: "Dark and light cards" },
  { href: "#youtube", label: "YouTube and social" },
  { href: "#canva", label: "Canva" },
  { href: "#checklist", label: "Checklist" },
];

type Spec = {
  px: number;
  role: string;
  face: "Display" | "Text";
  weight: 400 | 600;
  tracking: string;
  leading: string;
  sample: string;
};

// The seven sizes, from the typography course Oleg picked (12 to 40), with
// the spacing rule applied: tighter as the size goes up, looser as it goes
// down. Websites scale these with rem; a 1080px card multiplies by about 2.
const SCALE: Spec[] = [
  {
    px: 40,
    role: "Hero title, the one big number",
    face: "Display",
    weight: 600,
    tracking: "-0.03em",
    leading: "1.05",
    sample: "Bots now outnumber humans online",
  },
  {
    px: 32,
    role: "Page and card titles",
    face: "Display",
    weight: 600,
    tracking: "-0.02em",
    leading: "1.1",
    sample: "One font, five colors, two weights",
  },
  {
    px: 24,
    role: "Section titles",
    face: "Display",
    weight: 600,
    tracking: "-0.02em",
    leading: "1.15",
    sample: "How the Display cut is used",
  },
  {
    px: 20,
    role: "Lead paragraph, subtitle",
    face: "Text",
    weight: 400,
    tracking: "+0.01em",
    leading: "1.5",
    sample: "A stranger who sees three posts should know they are his.",
  },
  {
    px: 16,
    role: "Body text (never smaller on the web)",
    face: "Text",
    weight: 400,
    tracking: "+0.01em",
    leading: "1.6",
    sample: "Most of a design is text, so the type decides whether it looks premium or cheap.",
  },
  {
    px: 14,
    role: "Buttons, small bold labels, list meta",
    face: "Text",
    weight: 600,
    tracking: "+0.02em",
    leading: "1.5",
    sample: "Get the guide",
  },
  {
    px: 12,
    role: "Captions, faint labels, eyebrows in caps",
    face: "Text",
    weight: 400,
    tracking: "+0.02em (caps +0.2em)",
    leading: "1.5",
    sample: "SINCE 2026-10-23",
  },
];

type Color = {
  name: string;
  hex: string;
  use: string;
  /** Text color for the hex label inside the chip. */
  ink?: string;
};

// "Boldane core", option 1 of the palette page, chosen by Oleg 2026-10-22.
const CORE: Color[] = [
  { name: "Navy", hex: "#001041", use: "Titles and main text on light. Background of dark cards." },
  { name: "Boldane blue", hex: "#2863f0", use: "The one focus color: a highlighted word, the winning bar, the key line." },
  { name: "Deep blue", hex: "#1b50d8", use: "Drawn lines, icons, links on white." },
  { name: "Silver", hex: "#d0d6e0", use: "Borders, hairlines, quiet bars. Body text on navy." },
  { name: "Paper", hex: "#f6f8fb", use: "Background of light cards. Text on navy." },
  { name: "Yellow marker", hex: "#ffe36e", use: "Behind one title line. The winning number on a dark card." },
];

const SUPPORT: Color[] = [
  { name: "Body text", hex: "#2a3556", use: "Paragraphs on paper, a step softer than navy." },
  { name: "Grey text", hex: "#606872", use: "Muted text on paper. Minimum for small labels." },
  { name: "Dark silver", hex: "#a8aeb8", use: "Second bars and quiet marks on dark cards." },
  { name: "Blue soft", hex: "#e6edfd", use: "Tinted panels on light. Light blue overlay text on dark." },
  { name: "White", hex: "#ffffff", use: "Panels inside a paper card." },
  { name: "Red", hex: "#e0523b", use: "The bad side, crosses. Soft version #fbe5df." },
  { name: "Green", hex: "#1f8a5b", use: "Checks, the good side. Soft version #e2f2e9." },
];

// The websites run a darker navy so the metallic text and the blue glow read.
const WEB: Color[] = [
  { name: "Page navy", hex: "#020b18", use: "Page background on oleg.ae and boldane.com." },
  { name: "Navy raised", hex: "#07142a", use: "Raised sections and cards." },
  { name: "Navy light", hex: "#051c3e", use: "Section tints." },
  { name: "Silver muted", hex: "#8a93a3", use: "Secondary text and labels on the dark pages." },
  { name: "Hairline", hex: "rgba(208,214,224,0.1)", use: "Every border and divider.", ink: "#d0d6e0" },
];

type Tile = {
  bg: string;
  fg: string;
  text: string;
  ratio: string;
  verdict: "yes" | "no";
  note: string;
};

// Measured WCAG contrast ratios for the pairs below (computed 2026-10-29).
const TILES_DARK: Tile[] = [
  { bg: "#001041", fg: "#f6f8fb", text: "Paper on navy", ratio: "17:1", verdict: "yes", note: "The default overlay." },
  { bg: "#001041", fg: "#cfe0ff", text: "Light blue on navy", ratio: "14:1", verdict: "yes", note: "Blue mood, still readable." },
  { bg: "#001041", fg: "#ffe36e", text: "Yellow on navy", ratio: "14:1", verdict: "yes", note: "The one accent word or number." },
  { bg: "#001041", fg: "#2863f0", text: "Blue on navy", ratio: "3.6:1", verdict: "no", note: "Brand blue is too dark for text on navy." },
];

const TILES_LIGHT: Tile[] = [
  { bg: "#f6f8fb", fg: "#001041", text: "Navy on paper", ratio: "17:1", verdict: "yes", note: "The default on light." },
  { bg: "#ffe36e", fg: "#001041", text: "Navy on yellow", ratio: "14:1", verdict: "yes", note: "The highlighter band." },
  { bg: "#2863f0", fg: "#f6f8fb", text: "Paper on blue", ratio: "4.8:1", verdict: "yes", note: "Big words only, 40px and up." },
  { bg: "#f6f8fb", fg: "#d0d6e0", text: "Silver on paper", ratio: "1.4:1", verdict: "no", note: "Silver is for lines, never for words." },
];

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-14 md:pb-20">
      <p className="eyebrow font-body text-xs text-vivid-blue/80">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-prose font-body text-lg text-silver-muted">{lead}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="prose-guide max-w-prose space-y-4">{children}</div>;
}

function Rule({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 font-body text-base leading-[1.6] text-silver">
      <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-vivid-blue" />
      <span>{children}</span>
    </li>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="sg-code">{children}</code>;
}

function Swatch({ c }: { c: Color }) {
  const ink = c.ink ?? (isLight(c.hex) ? "#001041" : "#f6f8fb");
  return (
    <li className="flex flex-col gap-2">
      <div className="sg-swatch-chip flex items-end p-3" style={{ background: c.hex }}>
        <span className="font-body text-xs font-semibold" style={{ color: ink }}>
          {c.hex}
        </span>
      </div>
      <p className="font-body text-sm font-semibold text-silver">{c.name}</p>
      <p className="font-body text-sm text-silver-muted">{c.use}</p>
    </li>
  );
}

function isLight(hex: string): boolean {
  if (!hex.startsWith("#") || hex.length !== 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

function ContrastTile({ t }: { t: Tile }) {
  return (
    <li className="flex flex-col gap-2">
      <div className="sg-tile" data-verdict={t.verdict} style={{ background: t.bg }}>
        <span className="sg-tile-text" style={{ color: t.fg }}>
          {t.text}
        </span>
      </div>
      <p className="font-body text-sm text-silver">
        <span className={t.verdict === "yes" ? "font-semibold text-silver" : "font-semibold text-[#ff8a73]"}>
          {t.verdict === "yes" ? "Yes" : "No"}
        </span>
        <span className="text-silver-muted">
          {" "}
          · {t.ratio} · {t.note}
        </span>
      </p>
    </li>
  );
}

function SpecRow({ s }: { s: Spec }) {
  const style: CSSProperties = {
    fontFamily: s.face === "Display" ? "var(--font-display)" : "var(--font-body)",
    fontWeight: s.weight,
    fontSize: `${s.px / 16}rem`,
    letterSpacing: s.tracking.split(" ")[0],
    lineHeight: Number(s.leading),
    color: s.px <= 12 ? "var(--color-silver-muted)" : "var(--color-silver)",
    textTransform: s.px === 12 ? "uppercase" : undefined,
  };
  if (s.px === 12) style.letterSpacing = "0.2em";
  return (
    <tr>
      <td className="sg-td-lead w-16 font-body text-sm text-silver-muted">{s.px}px</td>
      <td className="sg-td-lead sg-td-specimen">
        <span className="sg-specimen block" data-size={s.px} style={style}>
          {s.sample}
        </span>
      </td>
      <td data-label="Use" className="font-body text-sm text-silver-muted">
        {s.role}
      </td>
      <td data-label="Font" className="whitespace-nowrap font-body text-sm text-silver-muted">
        {s.face} {s.weight}
      </td>
      <td data-label="Spacing" className="whitespace-nowrap font-body text-sm text-silver-muted">
        {s.tracking} · {s.leading}
      </td>
    </tr>
  );
}

export default function StylePage() {
  return (
    <>
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <span className="font-body text-sm text-silver-muted">style guide</span>
        </div>
      </header>

      <main>
        <section className="pt-8 pb-10 md:pt-14 md:pb-14">
          <div className="mx-auto max-w-3xl px-6">
            <span className="eyebrow inline-block rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              brand system · v2 · October 2026
            </span>
            <h1 className="text-metallic mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
              One font. Five colors. Two weights.
            </h1>
            <p className="mt-6 max-w-prose font-body text-lg text-silver-muted">
              This is the look of Oleg Melnikov and Boldane: the websites, the LinkedIn posts, the
              charts, the YouTube videos. If three posts land in a feed, a stranger should know they
              are his. Use this page when you make anything for the brand.
            </p>
          </div>
        </section>

        <nav aria-label="Sections" className="mx-auto flex max-w-3xl flex-wrap gap-2 px-6 pb-14">
          {TOC.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
            >
              {t.label}
            </a>
          ))}
        </nav>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="fonts"
          eyebrow="Fonts"
          title="Wix Madefor, and nothing next to it"
          lead="One family in two cuts. Display for titles, Text for everything else. Free on Google Fonts."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-card p-6">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-silver-muted">
                Wix Madefor Display · 600
              </p>
              <p className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-silver">
                Titles, headlines, big numbers
              </p>
              <p className="mt-4 font-body text-sm text-silver-muted">
                Semibold only. Tight letters, tight lines. From about 24px on a screen, 40px on a
                1080px card.
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-silver-muted">
                Wix Madefor Text · 400 and 600
              </p>
              <p className="mt-4 font-body text-lg text-silver">
                Body text, captions, labels, buttons, chart axes. Regular for reading. Semibold for a
                bold word, a button, a small label.
              </p>
              <p className="mt-4 font-body text-sm text-silver-muted">
                Loose letters, loose lines. Tall x-height, so it reads small on a phone.
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-3">
            <Rule>
              Two weights only: <strong className="text-silver">400</strong> for text,{" "}
              <strong className="text-silver">600</strong> for titles, buttons and emphasis. No 500,
              no 700, no light.
            </Rule>
            <Rule>
              Never fake the bold. In Canva pick the SemiBold font, do not press the B button. In CSS
              use the 600 face, not <Code>font-weight: bold</Code> on a 400 file.
            </Rule>
            <Rule>
              No second font. The one exception is a mono for code or raw data. Never a second sans.
              Never three fonts.
            </Rule>
            <Rule>
              Platform replicas keep the platform&apos;s font: a YouTube card in Roboto, an X card in
              the system font, a LinkedIn screenshot as it is.
            </Rule>
            <Rule>
              Backups, if Wix Madefor is ever impossible: Figtree, Albert Sans, Plus Jakarta Sans.
              One family, same rules.
            </Rule>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://fonts.google.com/specimen/Wix+Madefor+Display"
              className="inline-flex min-h-11 items-center rounded-full bg-vivid-blue px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#1b50d8]"
            >
              Get Wix Madefor Display
            </a>
            <a
              href="https://fonts.google.com/specimen/Wix+Madefor+Text"
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
            >
              Get Wix Madefor Text
            </a>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="display"
          eyebrow="Display font"
          title="How the Display cut is used"
          lead="Display is for the few words people see first. It is never for a paragraph."
        >
          <ul className="space-y-3">
            <Rule>
              Use it for: the title, a headline, the one big number, the column names of a
              comparison, the acronym of a framework. Hero text on a website. Text overlays in a
              video.
            </Rule>
            <Rule>Weight 600, always. The Display cut has no job at 400.</Rule>
            <Rule>
              Letters tighter as the size goes up: <Code>-0.02em</Code> from 24px,{" "}
              <Code>-0.03em</Code> at 40px and above. Canva: letter spacing -20.
            </Rule>
            <Rule>
              Lines tight: <Code>1.05</Code> for a hero, <Code>1.1</Code> for a title,{" "}
              <Code>1.15</Code> for a section title. Canva: line spacing 1.1.
            </Rule>
            <Rule>
              All caps are never tightened. Capitals get cramped. A caps label is set in the Text
              cut at <Code>+0.2em</Code>, small and quiet.
            </Rule>
            <Rule>
              One title block per visual, two lines at most. Merge the subtitle into the title. No
              eyebrow line above it, no caption box repeating it below.
            </Rule>
            <Rule>
              Highlight one surprising phrase, not the scary number: blue on light, yellow on dark,
              or the yellow marker band behind one line.
            </Rule>
            <Rule>
              Gradient titles on the web (<Code>.text-metallic</Code>) need a small bottom pad, or
              tight lines cut the descenders of g, y and p.
            </Rule>
          </ul>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl p-6" style={{ background: "#001041" }}>
              <p
                className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em]"
                style={{ color: "#f6f8fb" }}
              >
                Bots now{" "}
                <span style={{ color: "#ffe36e" }}>outnumber humans</span> online
              </p>
              <p className="mt-3 font-body text-sm" style={{ color: "#8a93a3" }}>
                Dark card: paper title, yellow on the surprising part.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "#f6f8fb" }}>
              <p
                className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em]"
                style={{ color: "#001041" }}
              >
                Bots now{" "}
                <span style={{ color: "#2863f0" }}>outnumber humans</span> online
              </p>
              <p className="mt-3 font-body text-sm" style={{ color: "#606872" }}>
                Light card: navy title, Boldane blue on the surprising part.
              </p>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="scale"
          eyebrow="Sizes and spacing"
          title="Seven sizes. Spacing goes the opposite way to size."
          lead="Big text gets tighter letters and tighter lines. Small text gets looser letters and looser lines. Browser defaults are wrong both ways."
        >
          <div className="overflow-hidden">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Specimen</th>
                  <th>Use</th>
                  <th>Font</th>
                  <th>Letters · lines</th>
                </tr>
              </thead>
              <tbody>
                {SCALE.map((s) => (
                  <SpecRow key={s.px} s={s} />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3">
            <Rule>
              Pick from these seven. If a size is not here, you probably do not need it. On a 1080px
              card, multiply by about 2 (title 80, body 32, caption 24).
            </Rule>
            <Rule>
              Titles: letters <Code>-0.02em</Code> to <Code>-0.03em</Code>, lines{" "}
              <Code>1.05</Code> to <Code>1.15</Code>.
            </Rule>
            <Rule>
              Body: letters <Code>+0.01em</Code>, lines <Code>1.5</Code> to <Code>1.6</Code>.
              Buttons and small bold labels <Code>+0.02em</Code>. Caps labels <Code>+0.2em</Code>.
            </Rule>
            <Rule>
              Three text colors and no more: ink, muted, faint. On the dark pages that is silver,
              silver muted, and silver at 60%. On paper it is navy, grey text, and silver for lines
              only.
            </Rule>
            <Rule>
              Lines of text stay short: 60 to 75 characters. A paragraph never stretches across a
              wide screen.
            </Rule>
            <Rule>
              Web sizes in <Code>rem</Code> so people can zoom. Body text never under 16px, or iOS
              zooms the page when a field is tapped. Spacing on a 4px scale.
            </Rule>
            <Rule>
              Four kinds of text: headings (2 or 3 levels), paragraphs, buttons, labels. Each step
              down is smaller, lighter and more spaced out.
            </Rule>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="colors"
          eyebrow="Colors"
          title="Boldane core"
          lead="Navy, Boldane blue, silver, paper and the yellow marker. Taken from boldane.com and the LinkedIn banner. High contrast for the phone feed."
        >
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {CORE.map((c) => (
              <Swatch key={c.hex} c={c} />
            ))}
          </ul>

          <h3 className="mt-12 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            Support colors
          </h3>
          <p className="mt-2 max-w-prose font-body text-base text-silver-muted">
            For text steps, tinted panels, and the good and bad sides of a chart.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {SUPPORT.map((c) => (
              <Swatch key={c.hex} c={c} />
            ))}
          </ul>

          <h3 className="mt-12 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            Website tokens
          </h3>
          <p className="mt-2 max-w-prose font-body text-base text-silver-muted">
            oleg.ae and boldane.com sit on a darker navy, so the metallic silver titles and the blue
            glow have room. Same blue, same silver.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {WEB.map((c) => (
              <Swatch key={c.hex} c={c} />
            ))}
          </ul>

          <ul className="mt-10 space-y-3">
            <Rule>
              Blue is the one focus color. One highlighted word, one winning bar, one key line. If
              everything is blue, nothing is.
            </Rule>
            <Rule>
              Yellow marks the win: the one number that matters on a dark card, or a band behind one
              title line on a light card. Never yellow text on paper (1.3:1, invisible).
            </Rule>
            <Rule>
              Silver is for lines, borders and quiet bars. On paper it is never text. On navy it is
              body text.
            </Rule>
            <Rule>
              Red and green only when there is a bad side and a good side. Their soft versions are
              backgrounds, never text.
            </Rule>
            <Rule>
              No pure black, no zinc greys, no white at 50%. Every grey on the brand is a navy or
              silver step from this page.
            </Rule>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="dark-light"
          eyebrow="Dark and light cards"
          title="Two recipes, one brand"
          lead="Every LinkedIn visual, chart and slide is one of these two."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl p-6" style={{ background: "#001041" }}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#8a93a3" }}>
                Dark card
              </p>
              <p className="mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-[-0.02em]" style={{ color: "#f6f8fb" }}>
                Title in paper
              </p>
              <p className="mt-3 font-body text-base" style={{ color: "#d0d6e0" }}>
                Body in silver. Labels in #8a93a3. Bar tracks in #1d2c63.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-3 flex-[3] rounded-full" style={{ background: "#ffe36e" }} />
                <div className="h-3 flex-[2] rounded-full" style={{ background: "#a8aeb8" }} />
                <div className="h-3 flex-[1] rounded-full" style={{ background: "#1d2c63" }} />
              </div>
              <p className="mt-3 font-body text-sm" style={{ color: "#8a93a3" }}>
                Winning bar yellow, second bar dark silver, track navy.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "#f6f8fb", border: "1px solid #d0d6e0" }}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#606872" }}>
                Light card
              </p>
              <p className="mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-[-0.02em]" style={{ color: "#001041" }}>
                Title in navy
              </p>
              <p className="mt-3 font-body text-base" style={{ color: "#2a3556" }}>
                Body in #2a3556. Muted in #606872. Panels white, tinted panels blue soft.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-3 flex-[3] rounded-full" style={{ background: "#2863f0" }} />
                <div className="h-3 flex-[2] rounded-full" style={{ background: "#d0d6e0" }} />
                <div className="h-3 flex-[1] rounded-full" style={{ background: "#e6edfd" }} />
              </div>
              <p className="mt-3 font-body text-sm" style={{ color: "#606872" }}>
                Winning bar blue, second bar silver, track blue soft.
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-3">
            <Rule>
              Canvas 1080×1350 (4:5) for images and chart videos. Square only when the content is
              short. Margins 72px.
            </Rule>
            <Rule>
              The chart or the list is 70% of the frame or more. One title block, then the content.
              Nothing else.
            </Rule>
            <Rule>No source lines in the image. No eyebrow. No caption box. No big empty center.</Rule>
            <Rule>
              Frame 0 of a video already shows the finished picture. Autoplay starts at zero, and the
              feed gives you 300 ms.
            </Rule>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="youtube"
          eyebrow="YouTube and social media"
          title="Always high contrast. The text must be easy to read."
          lead="A video is watched on a phone, outside, half-listening, in one second. Text on the screen either reads at once or it is gone. So the rules here are stricter than on the websites: contrast first, mood second."
        >
          <div className="surface-card glow-blue p-6">
            <p className="font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
              The one rule
            </p>
            <p className="mt-3 font-body text-base leading-[1.6] text-silver">
              Every text overlay is at least <strong>7:1</strong> against what is behind it. Not 4.5,
              which is the legal minimum for a website. Seven. If it is lower, change the text color,
              darken the background, or put a solid block behind the words. Never ship the mid-tone.
            </p>
          </div>

          <h3 className="mt-10 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            On a dark background
          </h3>
          <p className="mt-2 max-w-prose font-body text-base text-silver-muted">
            Navy, black footage, a dark room. Text goes light: paper, a very light blue, or yellow
            for the accent.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
            {TILES_DARK.map((t) => (
              <ContrastTile key={t.text} t={t} />
            ))}
          </ul>

          <h3 className="mt-10 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            On a light background
          </h3>
          <p className="mt-2 max-w-prose font-body text-base text-silver-muted">
            Paper, a white screen recording, daylight footage. Text goes navy. The accent is blue or
            a yellow band behind navy words.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
            {TILES_LIGHT.map((t) => (
              <ContrastTile key={t.text} t={t} />
            ))}
          </ul>

          <h3 className="mt-10 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            Vary the colors to win contrast
          </h3>
          <p className="mt-2 max-w-prose font-body text-base leading-[1.6] text-silver">
            The brand colors are a starting point, not a cage. In a video the picture behind the
            words changes every second, so the exact hex matters less than the punch. These moves are
            allowed, and expected:
          </p>
          <ul className="mt-6 space-y-3">
            <Rule>
              <strong>Lighten the blue on dark.</strong> Boldane blue (#2863f0) is a fill, not a text
              color, on navy. For blue words on a dark frame use a very light blue:{" "}
              <Code>#cfe0ff</Code> (14:1) or blue soft <Code>#e6edfd</Code> (16:1). Big words at 40px
              and up can go as deep as <Code>#8fb0ff</Code> (8.5:1). Never deeper.
            </Rule>
            <Rule>
              <strong>Darken the navy under text.</strong> Drop a navy or black block (#001041,
              #020b18) or a 60 to 80% dark scrim behind the words when the footage is busy. The
              words sit on the block, not on the picture.
            </Rule>
            <Rule>
              <strong>Push the saturation.</strong> A punchier yellow, a brighter blue block with
              paper text, a deeper navy. On a phone screen in the sun, more is more. Keep the hue,
              turn up the volume.
            </Rule>
            <Rule>
              <strong>Use the yellow for the one word.</strong> Yellow on navy is 14:1 and it pops.
              One number, one word per screen. Yellow everywhere is noise.
            </Rule>
            <Rule>
              <strong>Never mid-tones on mid-tones.</strong> Silver on paper, grey on grey, blue on
              navy, red on green. If you squint and the words fade, it fails.
            </Rule>
            <Rule>
              <strong>Red and green are signals, not text.</strong> White on red is 3.9:1. Use them
              for a cross, a check, a bar. Put the words in paper or navy next to them.
            </Rule>
          </ul>

          <h3 className="mt-10 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">
            Overlay text rules
          </h3>
          <ul className="mt-6 space-y-3">
            <Rule>
              Font: Wix Madefor Display 600, tight letters (-0.02em), tight lines (1.1). Same as a
              title. Captions and subtitles in Wix Madefor Text 600.
            </Rule>
            <Rule>
              Big. A word on a 1080×1920 Short is 80 to 120px. Two lines at most. If it needs three,
              cut words.
            </Rule>
            <Rule>
              Fifth-grade words. No jargon, no decimals. One idea per screen, one surprising phrase
              highlighted.
            </Rule>
            <Rule>
              Thumbnails: the same contrast rule, harder. Paper or yellow on navy, navy on paper.
              Three words or fewer. A face with the hair visible, not a tight crop.
            </Rule>
            <Rule>
              Charts in a video move from frame 1 and stop big on the names people know. The final
              numbers land on the beat.
            </Rule>
            <Rule>
              Check on a phone at arm&apos;s length before it ships. If you cannot read it in one
              second, nobody will.
            </Rule>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="canva"
          eyebrow="Canva"
          title="Canva settings"
          lead="Upload the fixed-weight files to the Brand Kit (Canva Pro). Then set six text styles and delete the rest."
        >
          <div className="overflow-hidden">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Style</th>
                  <th>Font</th>
                  <th>Letter spacing</th>
                  <th>Line spacing</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Title", "Wix Madefor Display SemiBold", "-20", "1.1"],
                  ["Heading", "Wix Madefor Display SemiBold", "-20", "1.15"],
                  ["Subtitle", "Wix Madefor Text Regular", "10", "1.4"],
                  ["Subheading", "Wix Madefor Text SemiBold", "10", "1.3"],
                  ["Body", "Wix Madefor Text Regular", "10", "1.5"],
                  ["Caption", "Wix Madefor Text Regular, muted color", "20", "1.4"],
                ].map(([style, font, ls, lh]) => (
                  <tr key={style}>
                    <td className="sg-td-lead font-body text-sm font-semibold text-silver">{style}</td>
                    <td data-label="Font" className="font-body text-sm text-silver-muted">
                      {font}
                    </td>
                    <td data-label="Letter spacing" className="font-body text-sm text-silver-muted">
                      {ls}
                    </td>
                    <td data-label="Line spacing" className="font-body text-sm text-silver-muted">
                      {lh}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-8 space-y-3">
            <Rule>Buttons and a bold word: Text SemiBold, letter spacing 20.</Rule>
            <Rule>ALL CAPS never below 0. Add space, never take it away.</Rule>
            <Rule>Never the B button. It fakes the bold. Pick the SemiBold font instead.</Rule>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="checklist"
          eyebrow="Checklist"
          title="Before anything ships"
        >
          <ol className="space-y-3">
            {[
              "One family: Wix Madefor. Display 600 for titles, Text 400/600 for the rest.",
              "Only the seven sizes. Titles tight, body loose, caps never tightened.",
              "Three text colors. Blue on one thing. Yellow on one thing.",
              "Text overlays 7:1 or better. Squint test passed.",
              "Title two lines max, fifth-grade words, one surprising phrase highlighted.",
              "No source lines, no eyebrow, no caption box, no empty center.",
              "Checked on a phone at arm's length.",
            ].map((item, i) => (
              <li key={item} className="flex gap-4 font-body text-base leading-[1.6] text-silver">
                <span className="font-display text-base font-semibold text-vivid-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-10 font-body text-sm text-silver-muted">
            Sources: the typography course Oleg picked (2026-10-23), the DesignSpo typography guide,
            and the Boldane palette page (2026-10-22). The working copies are STYLE.md and
            TYPOGRAPHY.md in the MS repo.
          </p>
        </Section>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-16">
        <div className="border-t border-hairline pt-6">
          <Link href="/" className="font-body text-sm text-silver-muted hover:text-silver">
            oleg.ae
          </Link>
        </div>
      </footer>
    </>
  );
}
