// Shared types for the Marketing Brain chat (/marketing-brain).

export type BookChunk = {
  id: number;
  type: "book";
  text: string;
  title: string;
  author: string;
  slug: string;
  page: number;
  cover: string;
};

export type VideoChunk = {
  id: number;
  type: "video";
  text: string;
  title: string;
  expert: string;
  channel: string;
  videoId: string;
  timecode: string;
  seconds: number;
  url: string;
  thumb: string;
};

export type Chunk = BookChunk | VideoChunk;

// A retrieved source, shaped for rendering a visual card on the client.
// `quote` is a short (<=~25 word) snippet; the full chunk text never leaves the server.
export type Source = {
  n: number; // 1-based citation number shown to the model and the user
  type: "book" | "video";
  title: string;
  attribution: string; // "Alex Hormozi" / "Alex Hormozi · The Diary Of A CEO"
  quote: string;
  // book
  page?: number;
  cover?: string;
  // video
  videoId?: string;
  timecode?: string;
  seconds?: number;
  url?: string;
  thumb?: string;
};

// One card per unique book/video; multiple citations to the same source are
// collapsed into `items` (each carries its own citation number + page/timecode).
export type GroupedSource = {
  key: string;
  type: "book" | "video";
  title: string;
  attribution: string;
  cover?: string;
  thumb?: string;
  videoId?: string;
  ns: number[]; // all citation numbers belonging to this card
  items: Array<{
    n: number;
    quote: string;
    page?: number;
    timecode?: string;
    seconds?: number;
    url?: string;
  }>;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// Streamed protocol frames (newline-delimited JSON) from /api/marketing-brain/chat
export type StreamFrame =
  | { type: "sources"; sources: Source[] }
  | { type: "delta"; text: string }
  | { type: "error"; message: string };
