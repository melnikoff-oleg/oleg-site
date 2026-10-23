import {
  Target,
  MousePointerClick,
  MessageSquare,
  PenTool,
  Film,
  Clapperboard,
  TrendingUp,
  Megaphone,
  DollarSign,
  ListOrdered,
  Scissors,
  Library,
  BookOpen,
  Bot,
  Wallet,
  GitCompare,
  type LucideIcon,
} from "lucide-react";

export type Resource = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * The full pool of free resources. Single source of truth shared by the
 * ResourceFooter grid and the NextUp recommendation surface. When adding a new
 * resource page, add it here (and regenerate recommendations, see
 * scripts/build-recommendations.mjs).
 */
export const RESOURCES: Resource[] = [
  {
    slug: "claude-code-tutorial",
    title: "Claude Code, Start Here",
    description:
      "What Claude Code is, how to install it, and the four ideas that make it click. Written for people who are not developers",
    icon: BookOpen,
  },
  {
    slug: "claude-cowork",
    title: "Claude Cowork, Explained",
    description:
      "What it does, how it differs from Claude Code, the new built-in browser, and the eight jobs I hand it every week",
    icon: Bot,
  },
  {
    slug: "claude-code-pricing",
    title: "What Claude Code Costs",
    description:
      "Every plan, the API route, Anthropic's own spend figures, and the four things that actually drive your bill",
    icon: DollarSign,
  },
  {
    slug: "claude-cowork-pricing",
    title: "What Claude Cowork Costs",
    description:
      "It is not free. Every tier compared, when Max is worth it, and the real monthly bill for running outreach through it",
    icon: Wallet,
  },
  {
    slug: "claude-code-vs-cursor",
    title: "Claude Code vs Cursor and Codex",
    description:
      "Editor or agent is the real question. An honest comparison, including what Claude Code is genuinely worse at",
    icon: GitCompare,
  },
  {
    slug: "claude-b2b-outreach",
    title: "B2B Outreach (35% Reply Rate)",
    description:
      "AI-powered B2B lead gen with personalized visuals and value-first messaging",
    icon: Target,
  },
  {
    slug: "claude-cowork-outreach",
    title: "Cowork for Outreach",
    description:
      "Automate LinkedIn lead gen and cold outreach with Claude Cowork",
    icon: MousePointerClick,
  },
  {
    slug: "claude-twitter",
    title: "X/Twitter Content System",
    description:
      "Turn your expertise into a steady stream of X/Twitter content with Claude Code",
    icon: MessageSquare,
  },
  {
    slug: "claude-content",
    title: "Content Creation System",
    description:
      "Generate weeks of social media content with custom visuals from one prompt",
    icon: PenTool,
  },
  {
    slug: "claude-reels",
    title: "Viral Instagram Reels",
    description:
      "Create scroll-stopping Reels with AI-generated scripts and visuals",
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
    description:
      "Scale your social presence with AI-powered content and growth tactics",
    icon: TrendingUp,
  },
  {
    slug: "claude-marketing",
    title: "Marketing (SMM, Ads, Outreach)",
    description:
      "Set up AI-powered marketing workflows for social media, ads, and outreach",
    icon: Megaphone,
  },
  {
    slug: "5-levels-ai",
    title: "The 5 Levels of AI Adoption",
    description:
      "A map from copy-pasting out of a chat window to a thousand agents that launch themselves, with the move to each next rung",
    icon: ListOrdered,
  },
  {
    slug: "claude-code-instagram",
    title: "Claude Code as a Video Editor",
    description:
      "Reel Studio: drop in photos and a voice take, get a finished Instagram Reel. Free and local",
    icon: Scissors,
  },
  {
    slug: "reels",
    title: "Viral Reels Database",
    description:
      "Search hundreds of Instagram reels that beat their creator's audience 5x, each with its hook, what held the viewer and what they got",
    icon: Library,
  },
];

/** slug -> resource, for O(1) lookup by the recommendation surface. */
export const RESOURCE_BY_SLUG: Record<string, Resource> = Object.fromEntries(
  RESOURCES.map((r) => [r.slug, r]),
);
