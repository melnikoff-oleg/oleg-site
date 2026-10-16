import { Reveal, RevealGroup } from "@/components/motion/reveal";

// Every number here was checked on 2026-10-16: YouTube from the Data API, the
// 80K from the call with Mike where it was reported.
const stats = [
  { value: "80K", label: "Views for Mike Kamo in his first 2 months" },
  { value: "20.7K", label: "YouTube subscribers" },
  { value: "665K+", label: "YouTube views" },
  { value: "146K", label: "Views on my top YouTube video" },
];

const highlights = [
  {
    title: "Mike Kamo",
    description:
      "Co-founder of NP Digital ($100M+ agency). 80,000 views in his first 2 months with Boldane, time cut from 3+ hours a week to 1. Now I run content marketing for Ubersuggest with him.",
  },
  {
    title: "Math & cs background",
    description:
      "Top 12 mathematicians in Russia under 18. All-Russian math olympiad medalist (2017, 2018). Codeforces master. BS in math and CS from Saint Petersburg State University.",
  },
  {
    title: "AI for trading",
    description:
      "AI internships at Yandex and JetBrains, then AI trading algorithms at Pinely, a hedge fund in Amsterdam. $40,000 a month at 23. Left at 24 to build my own company.",
  },
];

export function ResultsSection() {
  return (
    <section id="results" className="offscreen-lazy py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal as="h2" className="eyebrow font-body text-[13px] text-vivid-blue">
          Results
        </Reveal>

        {/* Stats grid */}
        <RevealGroup
          stagger={0.1}
          className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-metallic font-display text-3xl font-medium tracking-tight md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 font-body text-sm text-silver-muted">{stat.label}</p>
            </div>
          ))}
        </RevealGroup>

        {/* Highlight cards */}
        <RevealGroup
          stagger={0.12}
          delayChildren={0.2}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {highlights.map((h) => (
            <div key={h.title} className="surface-card p-6">
              <p className="font-display text-lg font-medium text-silver">{h.title}</p>
              <p className="mt-3 font-body text-base leading-relaxed text-silver-muted">
                {h.description}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
