import Image from "next/image";
import { RevealGroup } from "@/components/motion/reveal";

// The bigger vision, told before anything else on the page. Numbers are the
// databases as counted live in Supabase on 2026-10-16 (creator_reel 43,711,
// ms_linkedin_post 32,127, ms_linkedin_account 1,772); update them when they grow.
const steps = [
  {
    n: "01",
    icon: "collect",
    title: "Collect",
    body: "Every piece of content worth learning from: organic posts, reels, videos and ads, across every platform. What was made, who made it, and how far it went. The goal is billions.",
  },
  {
    n: "02",
    icon: "score",
    title: "Score",
    body: "One fixed method for every piece: views measured against the size of the audience that saw it. A small account that beat its own reach counts more than a big one coasting.",
  },
  {
    n: "03",
    icon: "understand",
    title: "Understand",
    body: "Every winner read end to end: the idea, the hook in the first 300 milliseconds, what holds attention, what pays it off.",
  },
  {
    n: "04",
    icon: "create",
    title: "Create",
    body: "An AI that knows from the data, not from opinion, how to make the next piece of content popular, for any person and any market.",
  },
];

const proof = [
  { value: "43,000+", label: "Instagram reels in the viral library" },
  { value: "32,000+", label: "LinkedIn posts scored" },
  { value: "1,700+", label: "LinkedIn creators read" },
];

export function VisionSection() {
  return (
    <section id="vision" className="py-16 md:py-32">
      <RevealGroup stagger={0.12} className="mx-auto max-w-5xl px-6">
        <h2 className="eyebrow font-body text-[13px] text-vivid-blue">
          The vision
        </h2>

        <p className="mt-8 max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight text-silver md:text-4xl">
          Media and software are the two biggest industries on the planet. I&apos;m merging them.
        </p>

        <p className="mt-6 max-w-3xl font-body text-xl leading-relaxed text-silver-muted md:text-2xl">
          Marketing is still run on taste and guesswork. I&apos;m going after it the way a mathematician would: collect the data, find the patterns, and build media superintelligence, an AI that understands what makes people stop, watch and care.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="surface-card p-6">
              <div className="flex items-start justify-between">
                <Image src={`/icons/${s.icon}.webp`} alt="" width={64} height={64} className="size-16" />
                <p className="font-display text-sm text-vivid-blue">{s.n}</p>
              </div>
              <p className="mt-4 font-display text-lg font-medium text-silver">{s.title}</p>
              <p className="mt-3 font-body text-base leading-relaxed text-silver-muted">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {proof.map((p) => (
            <div key={p.label}>
              <p className="text-metallic font-display text-3xl font-medium tracking-tight md:text-4xl">
                {p.value}
              </p>
              <p className="mt-2 font-body text-sm text-silver-muted">{p.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl font-body text-lg leading-relaxed text-silver-muted">
          It&apos;s already in use: the LinkedIn database was built out into the niches of Boldane&apos;s paying clients.
        </p>
      </RevealGroup>
    </section>
  );
}
