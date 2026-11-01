import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "Build any machine in 3D with Claude Opus 5.5";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "Build any machine in 3D with Claude Opus 5.5", eyebrow: "Free guide" });
}
