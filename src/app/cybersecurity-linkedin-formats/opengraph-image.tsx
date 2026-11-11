import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const alt = "30 LinkedIn post formats that go viral in cybersecurity";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({ title: "30 LinkedIn post formats that go viral in cybersecurity", eyebrow: "Viral formats" });
}
