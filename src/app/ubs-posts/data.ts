// The 25 Ubersuggest LinkedIn drafts of November 2026: 13 for the company page and
// 3 each for Mike Kamo, Neil Patel, Salun Marvin and Gabriel Tsunoda. posts.json and
// public/ubs-posts are written by the MS repo
// (projects/accounts/ubersuggest/content/sync_site.py); edit the drafts there, not here.
import raw from "./posts.json";
import { RATE_POST_IDS } from "./rate-ids";

export type Post = {
  id: string;
  n: number;
  format: string;
  title: string;
  author: { key: string; name: string; headline: string; company: boolean };
  w: number;
  h: number;
  media: string;
  text: string;
  /** The viral post whose format this draft borrows; null when it has none. */
  ref: { author: string; url: string; likes: number; comments: number; followers: number } | null;
};

export const POSTS = raw as Post[];

export const RATE_POSTS = RATE_POST_IDS.map((id) => POSTS.find((p) => p.id === id) as Post);
