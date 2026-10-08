// Archive: the 21 posts exactly as they stood in round six (2026-10-08), the version Oleg rated
// before the round-seven rebuild.
import raw from "./posts-round-6.json";
import type { Post } from "../data";
import { Board } from "../board";

export default function RoundSixArchive() {
  return <Board posts={raw as unknown as Post[]} archive="round six archive" />;
}
