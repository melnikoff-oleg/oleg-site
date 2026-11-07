import { ResourcePageShell } from "@/components/resource-page-shell";
import { DOWNLOAD_ICON } from "@/components/repo-cta";
import { ProfileExamples } from "./profile-examples";
import { SetupSteps } from "./setup-steps";
import { DOWNLOAD } from "./project";

export default function LinkedInPackagingPage() {
  return (
    <ResourcePageShell
      slug="linkedin-packaging"
      eyebrow="Free project"
      title="Package your LinkedIn profile"
      subhead="Your profile in 10 styles. Made with Claude Code or Codex."
      repoCta={{ href: DOWNLOAD, label: "Download the project", icon: DOWNLOAD_ICON, download: "linkedin-packaging.zip" }}
      beforeSetup={<ProfileExamples />}
      steps={[]}
      setupContent={<SetupSteps />}
      howTo={{
        name: "Set up LinkedIn Packaging",
        description: "Download the project, describe your profile and branding to your local AI agent, then compare all 10 styles and refine your favorite.",
        steps: [
          { name: "Open the folder in your agent", text: "Download and unzip the project. Open the folder locally in Codex or Claude Code." },
          { name: "Paste your brief", text: "Give the agent your LinkedIn profile, website, branding, factual background and photo. Ask it to handle setup and generate all 10 styles." },
          { name: "Pick your favorite, then refine", text: "Compare all 10 styles in the localhost preview, choose your favorite, request changes in the same chat, and download your upload files and editable sources." },
        ],
      }}
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
