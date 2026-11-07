import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "LinkedIn packaging: a banner, portrait and headline that belong together";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "Give your LinkedIn profile a clearer first impression", eyebrow: "Free project + guide" });
}
