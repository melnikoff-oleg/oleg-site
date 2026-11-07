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
      subhead="Banner, portrait and headline. Ten styles. One free download."
      repoCta={{ href: DOWNLOAD, label: "Download the project", icon: DOWNLOAD_ICON }}
      beforeSetup={<ProfileExamples />}
      steps={[]}
      setupContent={<SetupSteps />}
      howTo={{
        name: "Set up LinkedIn Packaging",
        description: "Download the standalone Python project, install its dependencies, add your own API keys and create a local profile package.",
        steps: [
          { name: "Download and install", text: "Download and unzip the project. Open a terminal in its folder and run setup for your operating system. Wait for Setup complete." },
          { name: "Add your keys", text: "Open .env, fill in your KIE_AI_API_KEY and APIFY_API_KEY, and save. The file stays private and git-ignored." },
          { name: "Create your package", text: "Choose a style and replace your-handle with your LinkedIn username in the command. Run it and review the files in output/your-handle/ before uploading." },
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
