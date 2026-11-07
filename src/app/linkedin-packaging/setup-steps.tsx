"use client";

import { CopyButton } from "@/components/copy-button";
import { Out } from "@/components/guide";

export const ENV_SETUP_PROMPT = "Create .env from .env.example in this project's root folder if it doesn't exist, and open it for me. Preserve existing values. I'll paste my API keys there. Don't display keys in chat or logs.";

export const ENV_TEMPLATE = `KIE_AI_API_KEY=your_key
APIFY_API_KEY=your_token
FIRECRAWL_API_KEY=your_key`;

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
      <h3 className="font-display text-2xl font-semibold tracking-tight text-silver md:text-3xl">From download to your new profile.</h3>
      <ol className="space-y-4">
        <li id="step-1" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={1}>Open the folder in your agent</StepTitle>
          <p className="mt-3">Unzip the download. Open the folder as a local project in <Out href="https://developers.openai.com/codex/app">Codex</Out> or <Out href="https://code.claude.com/docs/en/desktop">Claude Code</Out>.</p>
        </li>
        <li id="step-2" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={2}>Connect your three API keys</StepTitle>
          <p className="mt-3">First, paste this into your agent:</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-navy" data-testid="env-setup-prompt">
            <div className="flex justify-end border-b border-hairline px-4 py-2">
              <CopyButton text={ENV_SETUP_PROMPT} label="Copy setup prompt" />
            </div>
            <p className="p-4 text-sm leading-relaxed text-silver">{ENV_SETUP_PROMPT}</p>
          </div>
          <p className="mt-5">Sign up or log in to each service, then get your key:</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-3" data-testid="api-providers">
            <Provider name="Kie AI" href="https://kie.ai/api-key" purpose="Image and copy generation">
              In API Key Management, create a key and copy it.
            </Provider>
            <Provider name="Apify" href="https://console.apify.com/settings/integrations" purpose="LinkedIn profile research">
              In API &amp; Integrations → Personal API tokens, click <strong className="font-semibold text-silver">+ Create a new token</strong>, then copy it.
            </Provider>
            <Provider name="Firecrawl" href="https://www.firecrawl.dev/app/api-keys" purpose="Website and branding research">
              In API Keys, create a new key and copy it.
            </Provider>
          </ul>
          <p className="mt-5">In the local <code className="text-silver">.env</code> file beside <code>README.md</code>, replace each placeholder after <code>=</code> with its matching key:</p>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-hairline bg-navy p-4 text-sm leading-relaxed text-silver [overflow-wrap:anywhere]" data-testid="env-template">{ENV_TEMPLATE}</pre>
          <p className="mt-3 text-sm">Save as <code className="text-silver">.env</code> (not <code>.env.txt</code>). Paste keys only in that local file, never on this page or in chat. Provider usage may cost extra.</p>
        </li>
        <li id="step-3" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={3}>Paste your brief</StepTitle>
          <p className="mt-3">Replace the brackets with your details and attach your photo.</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-navy" data-testid="starter-prompt">
            <div className="flex justify-end border-b border-hairline px-4 py-2">
              <CopyButton text={STARTER_PROMPT} label="Copy prompt" />
            </div>
            <pre className="whitespace-pre-wrap p-4 font-body text-sm leading-relaxed text-silver [overflow-wrap:anywhere]">{STARTER_PROMPT}</pre>
          </div>
        </li>
        <li id="step-4" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={4}>Pick your favorite, then refine</StepTitle>
          <p className="mt-3">Open the preview link your agent gives you (localhost). Compare all 10 styles, pick your favorite and request changes in the same chat. Download your upload files and editable sources from the preview.</p>
        </li>
      </ol>
    </div>
  );
}

function Provider({ name, href, purpose, children }: { name: string; href: string; purpose: string; children: React.ReactNode }) {
  return <li className="rounded-xl border border-hairline px-4 pb-4 pt-2 text-sm">
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-silver underline decoration-vivid-blue/60 underline-offset-4 transition-colors hover:text-white">{name}<span aria-hidden="true" className="text-vivid-blue">↗</span></a>
    <p className="mb-3 text-silver">{purpose}</p>
    <p>{children}</p>
  </li>;
}

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return <h4 className="flex items-start gap-3 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-sm text-vivid-blue">{number}</span><span>{children}</span></h4>;
}
