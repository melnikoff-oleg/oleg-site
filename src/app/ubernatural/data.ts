// The übernatural founders' LinkedIn drafts. posts.json and public/ubernatural/media are
// generated in the vault (projects/ubernatural/scripts/build_site.py) and copied here;
// edit the drafts there, not here.
import raw from "./posts.json";
import round2 from "./round-2/posts-round-2.json";
import round3 from "./round-3/posts-round-3.json";
import round4 from "./round-4/posts-round-4.json";
import round5 from "./round-5/posts-round-5.json";
import round6 from "./round-6/posts-round-6.json";

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
  /** Oleg's score when he approved the post; approved posts are not rated again. */
  approved?: number;
};

export const POSTS = raw as unknown as Post[];
// Votes are accepted for any post shown on any page, so the archives stay rateable.
export const POST_IDS = [...new Set([...POSTS, ...(round2 as unknown as Post[]), ...(round3 as unknown as Post[]), ...(round4 as unknown as Post[]), ...(round5 as unknown as Post[]), ...(round6 as unknown as Post[])].map((p) => p.id))];
