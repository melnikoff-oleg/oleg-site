import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "Viral AI tweets, ranked by outlier score";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "Viral AI tweets, ranked by outlier score", eyebrow: "Viral on X" });
}
