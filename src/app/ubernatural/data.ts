// The übernatural founders' LinkedIn drafts. posts.json and public/ubernatural/media are
// generated in the vault (projects/ubernatural/scripts/build_site.py) and copied here;
// edit the drafts there, not here.
import raw from "./posts.json";
import archive from "./round-2/posts-round-2.json";

export type Post = {
  id: string;
  n: number;
  who: "ivan" | "egor" | "bogdan";
  author: string;
  headline: string;
  avatar: string;
  format: string;
  title: string;
  kind: "image" | "video";
  w: number;
  h: number;
  media: string;
  poster: string | null;
  text: string;
  /** The author's first comment: sources and the link. */
  comment?: string | null;
  /** The viral post whose format this draft borrows, with its real numbers as proof. */
  refAuthor: string;
  refUrl: string;
  refLikes: number;
  refComments: number;
  refReposts: number;
  refFollowers: string;
  why: string;
};

export const POSTS = raw as unknown as Post[];
// Votes are accepted for any post shown on either page, so the archive stays rateable.
export const POST_IDS = [...new Set([...POSTS, ...(archive as unknown as Post[])].map((p) => p.id))];
