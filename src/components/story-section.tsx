import { RevealGroup } from "@/components/motion/reveal";

// The whole story, from Oleg's own list of his biggest wins (Google Doc
// "My Major Victories", 2026-09-25). Relationship items are left out on purpose.
const chapters = [
  {
    title: "Math & code",
    wins: [
      "Top 12 mathematicians in Russia under 18",
      "Medalist of the All-Russian math olympiad",
      "Codeforces master",
      "Degree in maths and computer science from Saint Petersburg State University",
      "First grade in chess, played for 8 years",
    ],
  },
  {
    title: "AI & trading",
    wins: [
      "AI internships at Yandex and JetBrains, the two most famous Russian tech firms",
      "Built AI trading algorithms at Pinely, a hedge fund in Amsterdam",
      "Top grade, E+, on my last review there",
      "Earning $40,000 a month at 23, top 0.005% worldwide",
      "Walked away from that job at 24 to build my own company",
    ],
  },
  {
    title: "Building",
    wins: [
      "Tried 4 startups during university: Univerchick, RentAlliance, EveryFriend, Woozer",
      "Founded Boldane, personal branding for founders with real expertise",
      "Closed 20+ international B2B deals",
      "Working with Mike Kamo, co-founder of NP Digital, the $100M agency",
    ],
  },
  {
    title: "Media",
    wins: [
      "20,000+ subscribers on my YouTube channel",
      "A YouTube video with 100,000+ views",
      "Recorded 5 rap songs",
    ],
  },
  {
    title: "Life",
    wins: [
      "Lived 3+ months in 7 cities across 6 countries: Saint Petersburg, Moscow, Bishkek, Limassol, Amsterdam, Dubai, Belgrade",
      "Travelled to 30 countries",
      "Built an international circle of friends",
      "TOEFL 107 out of 120",
      "Parachute jump, shooting, night spearfishing, monofin free diving, wreck diving",
      "Bought a BMW 430i Coupe",
      "28 of 31 Oura crowns in August 2026",
    ],
  },
];

export function StorySection() {
  return (
    <section id="story" className="py-16 md:py-32">
      <RevealGroup stagger={0.1} className="mx-auto max-w-5xl px-6">
        <h2 className="eyebrow font-body text-[13px] text-vivid-blue">
          The story
        </h2>

        <p className="mt-8 max-w-3xl font-body text-xl leading-relaxed text-silver md:text-2xl">
          The short version: math olympiads, then AI, then trading, then my own company. The long version is below.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <div key={c.title} className="surface-card p-6">
              <p className="font-display text-lg font-medium text-silver">{c.title}</p>
              <ul className="mt-4 space-y-3">
                {c.wins.map((w) => (
                  <li
                    key={w}
                    className="flex gap-3 font-body text-base leading-relaxed text-silver-muted"
                  >
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-vivid-blue" />
                    <span className="min-w-0">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
}
