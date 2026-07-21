import Link from "next/link";
import {
  Send,
  Target,
  MousePointerClick,
  MessageSquare,
  PenTool,
  Film,
  Clapperboard,
  TrendingUp,
  Search,
  Megaphone,
  Globe,
  Code,
  Mic,
  Sparkles,
  DollarSign,
  Brain,
  LayoutTemplate,
  ArrowRight,
  ListOrdered,
  type LucideIcon,
} from "lucide-react";

const resources: { slug: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    slug: "marketing-brain",
    title: "The Marketing Brain",
    description: "Ask the greatest marketing minds with an AI chat grounded in 8 books & 75 talks, every answer cited to the page or timecode",
    icon: Brain,
  },
  {
    slug: "high-converting-website",
    title: "High-Converting Landing Page",
    description: "Build a landing page that actually sells with Claude Code, powered by a conversion playbook from Hormozi and top marketers",
    icon: LayoutTemplate,
  },
  {
    slug: "claude-outreach",
    title: "Cold Outreach",
    description: "Build an AI outreach system that scrapes leads and sends personalized messages",
    icon: Send,
  },
  {
    slug: "claude-b2b-outreach",
    title: "B2B Outreach (35% Reply Rate)",
    description: "AI-powered B2B lead gen with personalized visuals and value-first messaging",
    icon: Target,
  },
  {
    slug: "claude-cowork-outreach",
    title: "Cowork for Outreach",
    description: "Automate LinkedIn lead gen and cold outreach with Claude Cowork",
    icon: MousePointerClick,
  },
  {
    slug: "claude-twitter",
    title: "X/Twitter Content System",
    description: "Turn your expertise into a steady stream of X/Twitter content with Claude Code",
    icon: MessageSquare,
  },
  {
    slug: "claude-content",
    title: "Content Creation System",
    description: "Generate weeks of social media content with custom visuals from one prompt",
    icon: PenTool,
  },
  {
    slug: "claude-reels",
    title: "Viral Instagram Reels",
    description: "Create scroll-stopping Reels with AI-generated scripts and visuals",
    icon: Film,
  },
  {
    slug: "claude-tiktok",
    title: "Viral TikTok Videos",
    description: "Build a TikTok content engine with Claude Code and AI",
    icon: Clapperboard,
  },
  {
    slug: "claude-social-growth",
    title: "Viral Social Media Growth",
    description: "Scale your social presence with AI-powered content and growth tactics",
    icon: TrendingUp,
  },
  {
    slug: "claude-trend-scanner",
    title: "Trend Scanner",
    description: "Scan trending topics in your niche to create content worth watching",
    icon: Search,
  },
  {
    slug: "claude-marketing",
    title: "Marketing (SMM, Ads, Outreach)",
    description: "Set up AI-powered marketing workflows for social media, ads, and outreach",
    icon: Megaphone,
  },
  {
    slug: "claude-seo",
    title: "SEO Optimization",
    description: "SEO-optimize your website using Claude Code and AI tools",
    icon: Globe,
  },
  {
    slug: "claude-website",
    title: "Build Personal Website",
    description: "Build a personal website from scratch with Claude Code in minutes",
    icon: Code,
  },
  {
    slug: "claude-interviewer",
    title: "AI Interviewer for Content",
    description: "Build a voice AI agent that interviews you and turns conversations into LinkedIn posts",
    icon: Mic,
  },
  {
    slug: "ads-ai",
    title: "AI Ads Creator",
    description: "Study competitors' Meta ads with AI and generate ad concepts: copy, visuals, and video scripts",
    icon: Sparkles,
  },
  {
    slug: "60k-linkedin-post",
    title: "$60K LinkedIn Post",
    description: "3 AI prompts that generated $60,000 from a single LinkedIn post, copy and use them",
    icon: DollarSign,
  },
  {
    slug: "5-levels-ai",
    title: "The 5 Levels of AI Adoption",
    description: "A map from copy-pasting out of a chat window to a thousand agents that launch themselves, with the move to each next rung",
    icon: ListOrdered,
  },
];

export function ResourceFooter({
  currentSlug,
  boldaneCredit = false,
}: {
  currentSlug: string;
  /** Show the "founder of Boldane" credit line. Opt in ONLY on pages with no
   *  other Boldane mention — one Boldane moment per page, never two. */
  boldaneCredit?: boolean;
}) {
  const filtered = resources.filter((r) => r.slug !== currentSlug);

  return (
    <footer className="mx-auto max-w-3xl px-6 pb-12">
      <div className="surface-card px-5 py-10 sm:px-8 sm:py-12 mt-16">
        <p className="eyebrow text-center text-xs font-medium text-vivid-blue/80">
          more free resources
        </p>

        <div className="mx-auto mt-6 grid max-w-4xl gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <Link
              key={resource.slug}
              href={`/${resource.slug}`}
              className="group flex items-start gap-3 rounded-xl px-4 py-3 transition-colors duration-150 hover:bg-vivid-blue/10"
            >
              <resource.icon className="mt-0.5 size-4 shrink-0 text-vivid-blue transition-colors group-hover:text-white" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-silver transition-colors group-hover:text-white">
                  {resource.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-silver-muted">
                  {resource.description}
                </p>
              </div>
              <ArrowRight className="mt-1 size-3 shrink-0 text-silver-muted/60 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          ))}
        </div>
      </div>

      {boldaneCredit && (
        <p className="mt-8 text-center text-sm text-silver-muted">
          free guides by oleg, founder of{" "}
          <a
            href="https://www.boldane.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vivid-blue underline decoration-vivid-blue/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Boldane
          </a>
        </p>
      )}

      <p className={`${boldaneCredit ? "mt-3" : "mt-8"} text-center text-sm text-silver-muted`}>
        &copy; 2026 oleg melnikov
      </p>
    </footer>
  );
}
