// Archive: the 21 posts as approved in round seven, the board that stood at /ubernatural
// until 2026-10-16, when that address went to the new feed (see ../route.ts).
import { POSTS } from "../data";
import { Board } from "../board";

export default function RoundSevenArchive() {
  return <Board posts={POSTS} archive="round seven archive" />;
}
