// Archive: the 19 posts exactly as they stood in round three (2026-10-07), the version Oleg rated
// before the round-four rebuild.
import raw from "./posts-round-3.json";
import type { Post } from "../data";
import { Board } from "../board";

export default function RoundThreeArchive() {
  return <Board posts={raw as unknown as Post[]} archive="round three archive" />;
}
