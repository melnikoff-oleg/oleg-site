// Archive: all 29 drafts exactly as they stood in round two (2026-09-30), before Oleg's
// second review cut the list to the posts he scored 6 or higher.
import raw from "./posts-round-2.json";
import type { Post } from "../data";
import { Board } from "../board";

export default function RoundTwoArchive() {
  return <Board posts={raw as unknown as Post[]} archive="round two archive" />;
}
