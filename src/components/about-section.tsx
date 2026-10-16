import Image from "next/image";
import Link from "next/link";
import { RevealGroup } from "@/components/motion/reveal";

const linkClass =
  "text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white";

export function AboutSection() {
  const rows = [
    {
      icon: "boldane",
      title: "A company",
      body: (
        <>
          <Link href="https://www.boldane.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Boldane
          </Link>
          : you have the stories worth telling, we turn them into a presence your market trusts and buys from. One real conversation a week, all from what you said.
        </>
      ),
    },
    {
      icon: "ubersuggest",
      title: "A client",
      body: <>I run content marketing for Ubersuggest, working with Mike Kamo, co-founder of NP Digital.</>,
    },
    {
      icon: "youtube",
      title: "A channel",
      body: (
        <>
          I share how I build it all on{" "}
          <Link href="https://www.youtube.com/@Oleg-Melnikov" target="_blank" rel="noopener noreferrer" className={linkClass}>
            YouTube
          </Link>
          , teaching Claude Code and AI for marketing to 20K+ subscribers.
        </>
      ),
    },
  ];

  return (
    <section id="about" className="py-16 md:py-32">
      <RevealGroup stagger={0.15} className="mx-auto max-w-3xl px-6">
        <h2 className="eyebrow font-body text-[13px] text-vivid-blue">
          What I do now
        </h2>

        <p className="mt-8 font-body text-xl leading-relaxed text-silver md:text-2xl">
          Three things, all feeding the same AI.
        </p>

        <div className="mt-10 space-y-8">
          {rows.map((r) => (
            <div key={r.icon} className="flex items-start gap-5">
              <Image src={`/icons/${r.icon}.webp`} alt="" width={72} height={72} className="size-14 shrink-0 md:size-16" />
              <div className="min-w-0">
                <p className="font-display text-lg font-medium text-silver">{r.title}</p>
                <p className="mt-1 font-body text-lg leading-relaxed text-silver-muted md:text-xl">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
}
