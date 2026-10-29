import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "Build a viral Instagram page with Claude Code";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "Build a viral Instagram page with Claude Code", eyebrow: "Free guide" });
}
