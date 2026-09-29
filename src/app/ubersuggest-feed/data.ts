// The Ubersuggest LinkedIn drafts. posts.json and public/ubersuggest-feed/media are
// generated in the vault (areas/ubersuggest/2026-09-25_linkedin_formats/share/build_media.py)
// and copied here; edit the drafts there, not here.
import raw from "./posts.json";

export type Post = {
  id: string;
  n: number;
  format: string;
  title: string;
  kind: "image" | "video";
  w: number;
  h: number;
  media: string;
  poster: string | null;
  text: string;
};

export const POSTS = raw as Post[];

/** One post per format, the first of each: what visitors are asked to rate. */
export const RATE_POST_IDS = ["v1", "a1_seo_in_chatgpt", "b1_ghosted", "c1_service_pages", "d1_ai_share_donut", "e1_cost_per_click"];

export const RATE_POSTS = RATE_POST_IDS.map((id) => POSTS.find((p) => p.id === id) as Post);
