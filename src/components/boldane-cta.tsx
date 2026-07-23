import { Reveal } from "@/components/motion/reveal";

export function BoldaneLink() {
  return (
    <a
      href="https://www.boldane.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
    >
      Boldane
    </a>
  );
}

export function BoldaneCta({ children }: { children: React.ReactNode }) {
  return (
    <Reveal as="section" className="pb-24 md:pb-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="surface-card rounded-2xl p-6 text-center sm:p-8">
          <p className="font-body text-sm leading-relaxed text-silver-muted">
            {children}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
