"use client";

import { CopyButton } from "@/components/copy-button";
import { Out } from "@/components/guide";

export const STARTER_PROMPT = `Use this project to create my LinkedIn packaging.

LinkedIn: [profile URL]
Website: [URL, if any]
Branding: [logo, colors, fonts, or use my website]
About me: [what I do, who I help, and real results]
Photo: [attach a clear photo]

Handle setup and generate all 10 styles using my branding. Show all 10 together in a localhost preview, alongside my original profile when available, so I can pick my favorite. Refine my choice from my feedback, then give me the banner, portrait, headline, and editable source files.`;

export function SetupSteps() {
  return (
    <div className="space-y-5 font-body text-base leading-relaxed text-silver-muted">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-silver md:text-3xl">Download. Ask. Review.</h3>
      <ol className="space-y-4">
        <li id="step-1" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={1}>Open the folder in your agent</StepTitle>
          <p className="mt-3">Unzip the download. Open the folder as a local project in <Out href="https://developers.openai.com/codex/app">Codex</Out> or <Out href="https://code.claude.com/docs/en/desktop">Claude Code</Out>.</p>
        </li>
        <li id="step-2" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={2}>Paste your brief</StepTitle>
          <p className="mt-3">Replace the brackets with your details and attach your photo.</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-navy" data-testid="starter-prompt">
            <div className="flex justify-end border-b border-hairline px-4 py-2">
              <CopyButton text={STARTER_PROMPT} label="Copy prompt" />
            </div>
            <pre className="whitespace-pre-wrap p-4 font-body text-sm leading-relaxed text-silver [overflow-wrap:anywhere]">{STARTER_PROMPT}</pre>
          </div>
        </li>
        <li id="step-3" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={3}>Pick your favorite, then refine</StepTitle>
          <p className="mt-3">Compare all 10 styles at your localhost link. Pick your favorite and request changes in the same chat. Download your upload files and editable sources from the preview.</p>
        </li>
      </ol>
      <p className="text-sm">Your agent handles setup. If a paid service is needed, it will help you add your own key privately.</p>
    </div>
  );
}

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return <h4 className="flex items-start gap-3 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-sm text-vivid-blue">{number}</span><span>{children}</span></h4>;
}
