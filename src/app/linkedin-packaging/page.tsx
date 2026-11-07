import { ResourcePageShell } from "@/components/resource-page-shell";
import { Code, Guide, GuideSection, KeyFacts, Out } from "@/components/guide";
import { DOWNLOAD_ICON } from "@/components/repo-cta";
import { ProfileExamples } from "./profile-examples";
import { SetupSteps } from "./setup-steps";
import { DOWNLOAD, REPO } from "./project";

const faq = [
  { q: "Do I need Claude, Codex or an OpenAI subscription?", a: "No. This is a standalone Python project. It uses your Kie.ai API key for AI work, an Apify key for a LinkedIn URL, and optionally Firecrawl for website context. You can run every step without an AI coding assistant." },
  { q: "Is it free?", a: "The project download is free. Kie.ai, Apify and optional Firecrawl requests can incur usage charges on your own accounts. Check your provider balances and current pricing before generating. An AI coding subscription does not cover those API charges." },
  { q: "Does the whole process take three minutes?", a: "Allow about three minutes of hands-on setup once Python and your provider accounts are ready. Account signup, installing dependencies and Chromium, profile fetching, and AI image generation take additional time that depends on your connection and the providers." },
  { q: "Will it change my LinkedIn account?", a: "No. It writes files and simulated profile previews on your computer. You review the banner, portrait, headline and final crop, then upload the files to LinkedIn yourself." },
  { q: "Can I use it without a LinkedIn URL?", a: "Yes. The README includes a command using your name, factual context and a real portrait instead. That path skips Apify. Supplying a website is optional in either workflow." },
];

export default function LinkedInPackagingPage() {
  return (
    <ResourcePageShell
      slug="linkedin-packaging"
      eyebrow="Free project + setup guide"
      title="Give your LinkedIn profile a clearer first impression"
      subhead="Turn your experience into a banner, portrait and headline that belong together. Ten design styles. Your real story. One downloadable project."
      repoCta={{ href: DOWNLOAD, label: "Download the project", icon: DOWNLOAD_ICON }}
      beforeSetup={<ProfileExamples />}
      steps={[]}
      setupContent={<SetupSteps />}
      howTo={{
        name: "Set up LinkedIn Packaging",
        description: "Download the standalone Python project, install its dependencies, add your own API keys and create a local profile package.",
        steps: [
          { name: "Download and unzip", text: "Download the GitHub ZIP, extract linkedin-packaging-main and open a terminal in that folder. Python 3.10 or newer is required." },
          { name: "Run setup", text: "Run bash setup.sh on Mac or Linux, or powershell -NoProfile -ExecutionPolicy Bypass -File .\\setup.ps1 in Windows PowerShell. Wait for setup to finish and create .env." },
          { name: "Add keys and create your package", text: "Add your own KIE_AI_API_KEY and APIFY_API_KEY to .env, save it, choose one of the ten styles (Clare is the default), and run the create command with your LinkedIn profile URL. Review the files in output/your-handle/." },
        ],
      }}
      guide={
        <Guide>
          <GuideSection title="What you get">
            <KeyFacts rows={[
              { label: "Banner", value: "3168 × 792 PNG, with a clear message and deliberate layout" },
              { label: "Portrait", value: "800 × 800 image, edited from your real photograph" },
              { label: "Headline", value: "A standalone headline of at most 220 characters" },
              { label: "Previews", value: "Desktop and mobile views to check the full profile together" },
            ]} />
            <p>The ten references guide the layout, typography and photo treatment. The copy comes from your background: who you help, what you do and the results your source material actually supports. A style’s original claims or endorsements do not become yours.</p>
            <p>When a layout includes a person in the banner, it uses a separate, wider photograph with a different pose or framing from the profile portrait. Check the likeness and the details yourself before uploading. The full package also keeps editable files and source evidence for revisions.</p>
            <p>Open <Code>headline.txt</Code> for the headline, <Code>banner.png</Code> for the cover and <Code>portrait.png</Code> for the profile picture. Preview crops can differ from the final LinkedIn crop, and small supporting banner text will be harder to read on a phone.</p>
          </GuideSection>
          <GuideSection title="Make the first version your own">
            <p>Start with one profile and one direction. Read every claim, confirm the company relationships and check that the face still looks like you. Give the project a specific audience and factual context if your existing headline does not explain what you sell.</p>
            <p>For another layout, choose a different style in step 3 and copy the updated command. For more control over copy, photos and company branding, use the instructions in the <Out href={REPO}>public GitHub repository</Out>. The worked examples are curated; the first generated result is a draft to review.</p>
          </GuideSection>
        </Guide>
      }
      faq={faq}
      jsonLd={{
        title: "LinkedIn Packaging: Banner, Portrait & Headline",
        description: "Download the LinkedIn packaging project, compare real before and after examples, and set up your own banner, portrait and headline in three steps.",
        url: "https://www.oleg.ae/linkedin-packaging",
        datePublished: "2026-11-07",
        dateModified: "2026-11-07",
      }}
      boldaneCredit
    />
  );
}
