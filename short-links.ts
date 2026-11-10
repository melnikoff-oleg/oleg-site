// Short links on oleg.ae, the same shape as boldane.com/yt-ig (see short-links.ts in boldane-site):
// a clean address for a YouTube description, forwarding to the page with its four tracking tags.
// One line per link. Temporary redirects (307), so a destination can be changed at any time without
// browsers holding on to the old one. Rules and the full list: dantane vault, areas/attribution/README.md
//
// A video uses the same slug on both sites: oleg.ae/yt-ig is its free guide, boldane.com/yt-ig its
// agency link, and both carry the same utm_content, so one video reads as one row.
const guide = (page: string, video: string, spot = "description") =>
  `${page}?utm_source=youtube&utm_medium=social&utm_campaign=free-guide&utm_content=${spot}-${video}`;

export const shortLinks: { path: string; to: string }[] = [
  { path: "/yt-ig", to: guide("/claude-reels", "viral-instagram-reels") },
  { path: "/yt-co", to: guide("/claude-cowork-outreach", "cold-outreach-b2b-sales") },
  { path: "/yt-mk", to: guide("/claude-marketing", "claude-code-marketing") },
  { path: "/yt-cc", to: guide("/claude-content", "content-creation-10-minutes") },
  { path: "/yt-bo", to: guide("/claude-b2b-outreach", "b2b-outreach-35-reply-rate") },
  { path: "/yt-tt", to: guide("/claude-tiktok", "viral-tiktok-videos") },
  { path: "/yt-br", to: guide("/claude-code-instagram", "banger-instagram-reels") },
  { path: "/yt-tw", to: guide("/claude-twitter", "x-twitter-content-machine") },
  { path: "/yt-mh", to: guide("/claude-riemann-hypothesis", "claude-math-history") },
  { path: "/yt-ip", to: guide("/instagram-viral-pages", "viral-instagram-pages-higgsfield") },
  { path: "/yt-sg", to: guide("/claude-social-growth", "viral-social-media-growth") },
  { path: "/yt-fl", to: guide("/5-levels-ai", "five-levels-ai") },
  { path: "/yt-ce", to: guide("/", "claude-ceo-slow-down") },
  { path: "/yt-lo", to: guide("/", "linkedin-outreach-agent") },
  { path: "/yt-lp", to: guide("/linkedin-packaging", "linkedin-profile-packaging") },
  { path: "/yt-lc", to: guide("/linkedin-packaging", "linkedin-profile-packaging", "pinned-comment") },
  // Ready for the pinned comment on the Instagram pages video, which still has the plain page link.
  { path: "/yt-ic", to: guide("/instagram-viral-pages", "viral-instagram-pages-higgsfield", "pinned-comment") },
];
