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

function Command({ text, label }: { text: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-navy" data-testid={label}>
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
        <span className="text-sm text-silver-muted">{label}</span>
        <CopyButton key={text} text={text} label={`Copy ${label.toLowerCase()}`} className="px-3" />
      </div>
      <pre className="whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-silver [overflow-wrap:anywhere]"><code>{text}</code></pre>
    </div>
  );
}

export function SetupSteps() {
  const [os, setOs] = useState<"mac" | "windows">("mac");
  const [style, setStyle] = useState("clarekitching");
  const commands = COMMANDS[os];
  const createCommand = `${commands.run} --style ${style}`;
  return (
    <div className="space-y-7 font-body text-base leading-relaxed text-silver-muted">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-silver md:text-3xl">Three steps. About three minutes of setup.</h3>
        <p className="mt-3">Once Python and your provider accounts are ready. Downloads and image generation take extra time.</p>

      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Your operating system">
        {([['mac', 'Mac / Linux'], ['windows', 'Windows']] as const).map(([value, label]) => (
          <Button key={value} variant={os === value ? "primary" : "outline"} size="sm" className="min-h-11" aria-pressed={os === value} onClick={() => setOs(value)}>{label}</Button>
        ))}
      </div>

      <section aria-labelledby="prerequisites-title" className="rounded-xl border border-hairline bg-navy-raised p-5" data-testid="prerequisites">
        <h4 id="prerequisites-title" className="font-display text-lg font-semibold text-silver">Before you start</h4>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed">
          <li><strong className="font-semibold text-silver">Python.</strong> <Out href="https://www.python.org/downloads/">Install Python 3.10 or newer</Out>. {os === "windows" ? <>Tick “Add Python to PATH” during installation, then open a new PowerShell window and run <Code>py --version</Code>.</> : <>Open Terminal and run <Code>python3 --version</Code>.</>} The version should be 3.10 or higher.</li>
          <li><strong className="font-semibold text-silver">Kie.ai.</strong> <Out href="https://kie.ai/api-key">Sign up or log in</Out>, open API Keys, create an API key if you do not have one, then copy it. Add credits if your balance is empty; <Out href="https://kie.ai/pricing">check current pricing</Out> for the AI requests.</li>
          <li><strong className="font-semibold text-silver">Apify.</strong> <Out href="https://console.apify.com/settings/integrations">Sign up or log in</Out>, open Settings → API &amp; integrations, then copy your API token. Check your available usage balance for reading the LinkedIn profile.</li>
        </ul>
        <p className="mt-4 text-sm">Keep the two keys handy for step 3. The project is free; provider usage may cost money. No Claude or Codex subscription is needed.</p>
      </section>

      <ol className="space-y-5">
        <li id="step-1" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={1}>Download and unzip</StepTitle>
          <div className="mt-4 space-y-4">
            <p><Out href={DOWNLOAD}>Download the project ZIP</Out>. Open the downloaded file{os === "windows" ? ', choose “Extract all,”' : ''} and open the folder called <Code>linkedin-packaging-main</Code>.</p>
            {os === "mac" ? (
              <p>On Mac, right-click that folder in Finder, then choose <strong className="font-semibold text-silver">Services → New Terminal at Folder</strong>. On Linux, right-click inside the folder and choose <strong className="font-semibold text-silver">Open in Terminal</strong>.</p>
            ) : (
              <p>Inside the extracted folder, right-click an empty area and choose <strong className="font-semibold text-silver">Open in Terminal</strong>. Use a PowerShell tab.</p>
            )}
            <p className="text-sm">The terminal is the window where you paste the commands below and press Enter.</p>
          </div>
        </li>
        <li id="step-2" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={2}>Run setup</StepTitle>
          <div className="mt-4 space-y-4">
            <p>Paste this into that terminal and press Enter. Wait for “Setup complete.” It installs what the project needs and creates your settings file.</p>
            <Command text={commands.setup} label="Setup command" />
          </div>
        </li>
        <li id="step-3" className="surface-card scroll-mt-8 p-5 md:p-6">
          <StepTitle number={3}>Add your keys. Paste your LinkedIn link.</StepTitle>
          <div className="mt-4 space-y-4">
            <p>Open the settings file with this command{os === "mac" ? ' (on Linux, open .env in any text editor)' : ''}:</p>
            <Command text={commands.edit} label="Open settings" />
            <p>In <Code>.env</Code>, replace the placeholders after <Code>KIE_AI_API_KEY=</Code> and <Code>APIFY_API_KEY=</Code> with your own keys. Save the file. Keep this file private; it is excluded from Git.</p>
            <div className="space-y-2">
              <label htmlFor="package-style" className="block font-semibold text-silver">Choose your package style</label>
              <select id="package-style" value={style} onChange={(event) => setStyle(event.target.value)} aria-describedby="package-style-help" className="min-h-11 w-full min-w-0 rounded-lg border border-hairline bg-navy px-3 py-2 font-body text-sm text-silver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vivid-blue/60">
                {STYLE_OPTIONS.map(([id, name]) => <option key={id} value={id}>{name} · {id}</option>)}
              </select>
              <p id="package-style-help" className="text-sm">This selection updates the command below. The preview buttons above only change the examples. Your draft uses this reference’s colors and fonts.</p>
            </div>
            <p>Back in the terminal, replace <Code>your-handle</Code> below with your LinkedIn username, then press Enter:</p>
            <Command text={createCommand} label="Create command" />
            <p>When it finishes, open <Code>output/your-handle/</Code> inside the project folder. Start with <Code>preview.png</Code> and <Code>preview-mobile.png</Code>, then check the headline and images before uploading them yourself.</p>
          </div>
        </li>
      </ol>
      <details className="group border-b border-hairline pb-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-silver [&::-webkit-details-marker]:hidden">Want to add your website or company branding?<ChevronDown className="size-4 shrink-0 group-open:rotate-180" /></summary>
        <div className="mt-3 space-y-3 text-sm">

          <p>For extra business context, add <Code>--website https://your-company.com</Code> and fill in <Code>FIRECRAWL_API_KEY</Code> from <Out href="https://www.firecrawl.dev/app">Firecrawl</Out>. Leave it blank if you are not using a website.</p>
          <p>The standard command uses the selected reference’s colors and fonts. The company-branded examples above use a curated workflow with verified company assets, described in the <Out href={`${REPO}/blob/main/docs/company-branded-variants.md`}>company-brand guide</Out>.</p>
        </div>
      </details>
    </div>
  );
}

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return <h4 className="flex items-start gap-3 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-vivid-blue/15 font-body text-sm text-vivid-blue">{number}</span><span>{children}</span></h4>;
}
