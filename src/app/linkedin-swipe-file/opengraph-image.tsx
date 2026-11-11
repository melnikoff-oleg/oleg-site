import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "LinkedIn profile swipe file: 30 creators with the best banners, photos and headlines";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "30 LinkedIn profiles with the best banners and headlines", eyebrow: "Swipe file" });
}
