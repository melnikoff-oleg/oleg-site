// What Semrush's leaders say they do to win agency customers, for Ubersuggest.
// Built 2026-11-06 from 27 interviews (YouTube captions, read in the vault,
// tmp/2026-11-06/semrush_cmo). Every point is something a Semrush person said
// on the record; the link opens the video at that moment. Nothing here is
// Oleg's or Claude's opinion, and the closing note says what the sources do
// not tell us. Static server component, no client JavaScript.
//
// Each point carries one illustration (public/ubs-agencies/NN.webp, 1600 x 900),
// generated with Kie.ai gpt-image-2 in one shared style: silver clay miniatures
// on navy with a single glowing blue accent, and no text inside any picture.
// scripts/ubs-agencies/generate.py holds the prompts and regenerates them,
// optimize.py converts them. `alt` says what the picture shows.

import Image from "next/image";

type Source = { label: string; href: string };

type Move = {
  title: string;
  alt: string;
  body: string[];
  who: string;
  sources: Source[];
};

const yt = (id: string, seconds: number) => `https://www.youtube.com/watch?v=${id}&t=${seconds}s`;

const MOVES: Move[] = [
  {
    title: "Teach agencies how to run their business, not how to use the tool",
    alt: "A small figure climbs a staircase that rises out of an open book toward a glowing blue flag.",
    body: [
      "Semrush Academy has lessons for agencies that are not about the product. They cover the right way to sell services, how to manage client expectations, how not to oversell and how to look credible.",
      "Their reason: clients get disappointed when an agency promises too much, and that hurts the whole market.",
    ],
    who: "Eugene Levin, Chief Strategy Officer, on the Digital Agency Hacker podcast",
    sources: [{ label: "Watch from 8:20", href: yt("i8BhXWg4S7E", 500) }],
  },
  {
    title: "Train the agency's new hires for them",
    alt: "A new team member runs along a glowing blue moving walkway from a door to a team working at desks.",
    body: [
      "Agencies told Semrush that staff turnover is one of their biggest problems. A new person often leaves within a year or a year and a half and has to be replaced.",
      "So the Academy is built to get a new marketer working fast: how to use the tools and how to serve a client well.",
    ],
    who: "Eugene Levin, Chief Strategy Officer",
    sources: [{ label: "Watch from 9:24", href: yt("i8BhXWg4S7E", 564) }],
  },
  {
    title: "Send clients to agencies",
    alt: "A crowd of people crosses a glowing blue bridge toward a small office building.",
    body: [
      "Semrush runs a partner directory. When one of its regular customers needs help beyond the product, they find a certified agency there.",
      "Levin says the Agency Growth Kit was made to help agencies get more customers, and not only to give them features.",
    ],
    who: "Eugene Levin, Chief Strategy Officer",
    sources: [{ label: "Watch from 22:25", href: yt("i8BhXWg4S7E", 1345) }],
  },
  {
    title: "Certify agencies",
    alt: "An office building with a large glowing blue seal and check mark on its front, among plain buildings.",
    body: [
      "Only certified agencies appear in the directory. Certification is the way in, and the directory is the reward.",
      "Customers who cannot build an SEO strategy on their own are sent to these agencies.",
    ],
    who: "Eugene Levin, on the Global Tech Leaders podcast",
    sources: [{ label: "Watch from 22:40", href: yt("CxOrfB1xjh8", 1360) }],
  },
  {
    title: "Put everything an agency needs in one package",
    alt: "An open toolbox with a door, a checklist and a glowing blue bar chart, each in its own slot.",
    body: [
      "The Agency Growth Kit bundles every agency feature in one place: a client portal, task management for the team, and client reports.",
      "The idea in his words: manage the whole relationship with a client from one window.",
    ],
    who: "Eugene Levin, Chief Strategy Officer",
    sources: [{ label: "Watch from 23:29", href: yt("i8BhXWg4S7E", 1409) }],
  },
  {
    title: "Never sell services yourself",
    alt: "A hand offers a glowing blue hammer to small figures who are building a house.",
    body: [
      "Semrush does not write content or build strategies for customers. It connects them with freelancers and agencies through a marketplace.",
      "The reason he gives: a lot of their customers are agencies, and they would not like to see Semrush doing their job.",
    ],
    who: "Eugene Levin, on the Global Tech Leaders podcast",
    sources: [{ label: "Watch from 25:25", href: yt("CxOrfB1xjh8", 1525) }],
  },
  {
    title: "Work with influencers who own agencies",
    alt: "A figure on the roof of an office building speaks into a megaphone to a crowd, with blue sound rings spreading out.",
    body: [
      "The SEO influencers Semrush works with typically run their own consulting agencies. They rate and review the product.",
      "It is not always paid. The CMO says the brand has a following close to a cult among SEO people, and these voices are part of it.",
    ],
    who: "Andrew Warden, CMO, on Semrush Live",
    sources: [{ label: "Watch from 7:09", href: yt("SPyZ9l_WQ5I", 429) }],
  },
  {
    title: "Interview users every month and reward the best ones",
    alt: "Two people talk in armchairs with a microphone between them, and a glowing blue ticket floats above the guest.",
    body: [
      "Semrush interviews its users every month. Its power users give feedback and get invited to private events.",
      "One example: a three hour workshop for only 40 people with Avinash Kaushik. Users also vote on features, and the voters become the beta testers.",
    ],
    who: "Fernando Angulo, Semrush, on the WebMechanix podcast",
    sources: [{ label: "Watch from 13:16", href: yt("QwmrcxVnIbw", 796) }],
  },
  {
    title: "Run a regular show where agency owners explain how they grew",
    alt: "A speaker at a microphone on a stage in front of a glowing blue rising chart, with an audience watching.",
    body: [
      "Semrush hosts a webinar every couple of weeks with agency owners who have built successful businesses.",
      "The topics are about the agency's business, not about SEO or the product: how to go from 10 to 50 clients, how to build an agency on referrals alone, how to build an agency that scales.",
    ],
    who: "Semrush's own YouTube channel",
    sources: [
      { label: "The host explains the series, 0:33", href: yt("3DzRmSDR0r8", 33) },
      { label: "From 10 to 50 clients", href: yt("P7s6vJpkfA0", 0) },
      { label: "A scalable agency", href: yt("j7vcqqNsO84", 0) },
    ],
  },
  {
    title: "Put a real customer in the ad",
    alt: "A rooftop billboard with a glowing blue frame shows a person at a laptop, and people on the street look up at it.",
    body: [
      "Semrush's best campaign ever was Be like Gabby: a real SEO who uses the product, shown with her life in and out of work.",
      "Their most expensive failure was a polished funny ad with children playing bosses. People loved it and it sold nothing.",
    ],
    who: "Andrew Warden, CMO, on Content and Conversation",
    sources: [
      { label: "Be like Gabby, 14:45", href: yt("heSzVLIP__c", 885) },
      { label: "The ad that failed, 17:58", href: yt("heSzVLIP__c", 1078) },
    ],
  },
];

export default function UbsAgenciesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
      <header>
        <p className="eyebrow text-xs text-vivid-blue/80">Ubersuggest · Agencies</p>
        <h1 className="text-metallic mt-5 font-display text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl">
          Ten things Semrush does to win agency customers
        </h1>
        <p className="mt-6 text-lg leading-[1.55] text-silver sm:text-xl">
          Taken from 27 interviews with Semrush leaders. Every point is something they said they do. Each link opens
          the video at the exact moment.
        </p>
      </header>

      <ol className="mt-12 space-y-4 sm:mt-16 sm:space-y-5">
        {MOVES.map((move, i) => (
          <li key={move.title} className="surface-card overflow-hidden rounded-2xl">
            <Image
              src={`/ubs-agencies/${String(i + 1).padStart(2, "0")}.webp`}
              alt={move.alt}
              width={1600}
              height={900}
              sizes="(min-width: 768px) 704px, calc(100vw - 2.5rem)"
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-video w-full border-b border-hairline bg-navy object-cover"
            />
            <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
              <span
                aria-hidden="true"
                className="shrink-0 font-display text-2xl leading-[1.15] font-semibold text-vivid-blue tabular-nums sm:w-10 sm:text-3xl"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl leading-[1.15] font-semibold tracking-tight text-white sm:text-2xl">
                  {move.title}
                </h2>
                {move.body.map((p) => (
                  <p key={p} className="mt-3 text-base leading-[1.6] text-silver">
                    {p}
                  </p>
                ))}
                <p className="mt-5 text-sm leading-[1.5] text-silver-muted">{move.who}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {move.sources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-vivid-blue/40 px-4 text-sm font-semibold tracking-[0.02em] text-white transition-colors hover:border-vivid-blue hover:bg-vivid-blue/15"
                      >
                        {s.label}
                        <span aria-hidden="true" className="text-vivid-blue">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-12 border-t border-hairline pt-8 sm:mt-16">
        <h2 className="font-display text-xl leading-[1.15] font-semibold tracking-tight text-white">
          What the sources do not say
        </h2>
        <p className="mt-3 text-base leading-[1.6] text-silver">
          They say that Semrush does these ten things. None of them says how many agencies each one brought in, so the
          order here is not a ranking.
        </p>
        <p className="mt-8 text-sm text-silver-muted">Oleg Melnikov, November 2026</p>
      </section>
    </main>
  );
}
