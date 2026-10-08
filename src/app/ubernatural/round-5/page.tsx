// Archive: the 21 posts exactly as they stood in round five (2026-10-08), the version Oleg rated
// before the round-six rebuild.
import raw from "./posts-round-5.json";
import type { Post } from "../data";
import { Board } from "../board";

export default function RoundFiveArchive() {
  return <Board posts={raw as unknown as Post[]} archive="round five archive" />;
}
