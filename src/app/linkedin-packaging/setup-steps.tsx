"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Code, Out } from "@/components/guide";
import { Button } from "@/components/ui/button";

import { REPO, DOWNLOAD } from "./project";
const PROFILE = "https://www.linkedin.com/in/your-handle/";
const STYLE_OPTIONS = [
  ["clarekitching", "Clare Kitching"],
  ["diandraescobar", "Diandra Escobar"],
  ["laraacostar", "Lara Acosta"],
  ["mattgray1", "Matt Gray"],
  ["adrian-kul", "Adrian Kul"],
  ["donnellychris", "Chris Donnelly"],
  ["rob-hoffman-ceo", "Rob Hoffman"],
  ["jakezward", "Jake Ward"],
  ["charlie-hills", "Charlie Hills"],
  ["liamkarlsson", "Liam Karlsson"],
] as const;
const COMMANDS = {
  mac: { setup: "bash setup.sh", edit: "open -e .env", run: `./package.sh --linkedin ${PROFILE}` },
  windows: { setup: "powershell -NoProfile -ExecutionPolicy Bypass -File .\\setup.ps1", edit: "notepad .env", run: `.\\.venv\\Scripts\\python.exe -m linkedin_pack create --linkedin ${PROFILE}` },
};

function Command({ text, label, title }: { text: string; label: string; title: string }) {
  return (
    <div role="group" aria-label={label} className="overflow-hidden rounded-xl border border-hairline bg-navy" data-testid={label}>
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
        <span className="text-sm text-silver-muted">{title}</span>
        <CopyButton key={text} text={text} label="Copy" className="px-3" />
      </div>
      <pre className="whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-silver [overflow-wrap:anywhere]"><code>{text}</code></pre>
    </div>
  );
}

function Help({ title, children, testId }: { title: string; children: React.ReactNode; testId?: string }) {
  return <details className="group border-b border-hairline pb-2" data-testid={testId}>
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-silver [&::-webkit-details-marker]:hidden">{title}<ChevronDown className="size-4 shrink-0 group-open:rotate-180" /></summary>
    <div className="space-y-3 pb-3 pt-2 text-sm leading-relaxed text-silver-muted">{children}</div>
  </details>;
}

export function SetupSteps() {
  const [os, setOs] = useState<"mac" | "windows">("mac");
  const [style, setStyle] = useState("clarekitching");
  const commands = COMMANDS[os];
  const createCommand = `${commands.run} --style ${style}`;
  return (
    <div className="space-y-5 font-body text-base leading-relaxed text-silver-muted">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-silver md:text-3xl">Three steps to get started</h3>
        <p className="mt-3 text-sm">~3 minutes with Python and keys ready. Downloads and generation take longer.</p>
        <p className="mt-3 text-sm">Needs <Out href="https://www.python.org/downloads/">Python 3.10+</Out>, <Out href="https://kie.ai/api-key">Kie.ai</Out> and <Out href="https://console.apify.com/settings/integrations">Apify</Out> keys. Provider usage costs extra.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Your operating system">
        {([['mac', 'Mac / Linux'], ['windows', 'Windows']] as const).map(([value, label]) => (
          <Button key={value} variant={os === value ? "primary" : "outline"} size="sm" className="min-h-11" aria-pressed={os === value} onClick={() => setOs(value)}>{label}</Button>
        ))}
      </div>
      <Help title="First time? Get Python & API keys" testId="prerequisites">
        <p><strong className="font-semibold text-silver">Python:</strong> install it, reopen your terminal, then check <Code>{os === "windows" ? 'py --version' : 'python3 --version'}</Code>. {os === "windows" && 'Choose “Add Python to PATH” during installation.'}</p>
        <p><strong className="font-semibold text-silver">Kie.ai:</strong> sign up, create a key under API Keys, and add credits. <Out href="https://kie.ai/pricing">Pricing</Out>.</p>
        <p><strong className="font-semibold text-silver">Apify:</strong> sign up, copy your token from Settings → API &amp; integrations, and check your balance.</p>
      </Help>
      <ol className="space-y-4">
        <li id="step-1" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={1}>Download & install</StepTitle>
          <div className="mt-4 space-y-3">
            <p><Out href={DOWNLOAD}>Download ZIP</Out>, unzip, and open a terminal in that folder.</p>
            <Help title="How to open the terminal">
              {os === "mac" ? <p>Mac: right-click the extracted folder → Services → New Terminal at Folder. Linux: right-click inside it → Open in Terminal.</p> : <p>Choose “Extract all” first. Inside the extracted folder, right-click → Open in Terminal → PowerShell.</p>}
            </Help>
            <Command text={commands.setup} label="Setup command" title="Install" />
            <p className="text-sm">Wait for “Setup complete.”</p>
          </div>
        </li>
        <li id="step-2" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={2}>Add your keys</StepTitle>
          <div className="mt-4 space-y-3">
            <Command text={commands.edit} label="Open settings" title="Open .env" />
            <p>Fill <Code>KIE_AI_API_KEY</Code> and <Code>APIFY_API_KEY</Code> in <Code>.env</Code>, then save. This file stays private and git-ignored.</p>
            {os === "mac" && <Help title="On Linux?"><p>Use <Code>nano .env</Code> instead. Save with Ctrl+O, Enter; exit with Ctrl+X.</p></Help>}
          </div>
        </li>
        <li id="step-3" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={3}>Create your package</StepTitle>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label htmlFor="package-style" className="block text-sm font-semibold text-silver">Style</label>
              <select id="package-style" value={style} onChange={(event) => setStyle(event.target.value)} className="min-h-11 w-full min-w-0 rounded-lg border border-hairline bg-navy px-3 py-2 font-body text-sm text-silver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vivid-blue/60">
                {STYLE_OPTIONS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
            <p>Replace <Code>your-handle</Code> with your LinkedIn username. Run:</p>
            <Command text={createCommand} label="Create command" title="Generate" />
            <p className="text-sm">Find your files in <Code>output/your-handle/</Code>. Review the previews before uploading.</p>
          </div>
        </li>
      </ol>
      <Help title="Files, customization & troubleshooting">
        <p>Upload <Code>banner.png</Code>, <Code>portrait.png</Code> and <Code>headline.txt</Code>. Check <Code>preview.png</Code> and <Code>preview-mobile.png</Code> first. Nothing posts automatically.</p>
        <p>Add <Code>--website https://your-company.com</Code> with your own <Code>FIRECRAWL_API_KEY</Code> for website context.</p>
        <p><Out href={`${REPO}/blob/main/docs/company-branded-variants.md`}>Custom company branding</Out> · <Out href={`${REPO}#start-with-a-photo-instead-of-a-linkedin-url`}>Use a photo instead of LinkedIn</Out> · <Out href={`${REPO}#troubleshooting`}>Troubleshooting</Out></p>
      </Help>
    </div>
  );
}

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return <h4 className="flex items-start gap-3 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-sm text-vivid-blue">{number}</span><span>{children}</span></h4>;
}
