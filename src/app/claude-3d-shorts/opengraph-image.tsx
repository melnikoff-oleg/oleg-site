import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "Make 3D cartoon Shorts with Claude from one prompt, free";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "Make 3D cartoon Shorts with Claude from one prompt", eyebrow: "Free guide" });
}
