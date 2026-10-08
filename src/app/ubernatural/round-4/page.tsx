// Archive: the 19 posts exactly as they stood in round four (2026-10-08), the version Oleg rated
// before the round-five rebuild.
import raw from "./posts-round-4.json";
import type { Post } from "../data";
import { Board } from "../board";

export default function RoundFourArchive() {
  return <Board posts={raw as unknown as Post[]} archive="round four archive" />;
}
