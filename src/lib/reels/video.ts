// The reels' VIDEO FILES, held in our own storage, so a tile can play in place
// instead of sending the visitor to Instagram.
//
// The bucket (`reel-videos`) is PRIVATE, unlike `reel-thumbs`. A thumbnail is a
// picture the page paints; a video file is somebody else's upload, and a public
// bucket would make this site a permanent open mirror of it, hot-linkable from
// anywhere. So the browser never gets a storage URL of its own: it asks this
// server, and gets a signed link that stops working in an hour.
//
// `reel_video` is a table of its own rather than a column on `reel_search` or
// `creator_reel`, because those are live tables on a database shared with
// another app and the rule there is create, never alter. The uploader in the
// vault writes a row only after reading the object's size back from the bucket,
// so a row means the file is really there.

import "server-only";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "reel-videos";
const TABLE = "reel_video";

/** Long enough to watch a reel several times, short enough to be worthless to hot-link. */
const LINK_SECONDS = 3600;

export const reelVideoConfigured = Boolean(SUPABASE_URL && SERVICE_KEY);

/**
 * An Instagram shortcode and nothing else. This is the only thing standing
 * between a query string and a PostgREST `in.(...)` list and a storage path, so
 * it is strict: the alphabet Instagram uses, and a sane length.
 */
const SHORTCODE = /^[A-Za-z0-9_-]{5,20}$/;

export function isShortcode(value: unknown): value is string {
  return typeof value === "string" && SHORTCODE.test(value);
}

/** The most tiles one page ever asks about. A search reveals 120; a wall shows 60. */
export const HELD_LIMIT = 200;

const headers = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

/** Which of these shortcodes we hold a video file for. */
export async function heldVideos(codes: string[], signal?: AbortSignal): Promise<string[]> {
  const clean = [...new Set(codes.filter(isShortcode))].slice(0, HELD_LIMIT);
  if (clean.length === 0) return [];
  const params = new URLSearchParams({
    select: "shortcode",
    shortcode: `in.(${clean.join(",")})`,
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?${params}`, {
    headers: headers(),
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`reel_video read failed: ${res.status}`);
  const rows = (await res.json()) as { shortcode: string }[];
  return Array.isArray(rows) ? rows.map((r) => r.shortcode) : [];
}

/** A link to the file that works for an hour, or null if we do not hold it. */
export async function signedVideoUrl(code: string, signal?: AbortSignal): Promise<string | null> {
  if (!isShortcode(code)) return null;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${code}.mp4`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: LINK_SECONDS }),
    signal,
    cache: "no-store",
  });
  // Storage answers 400 or 404 for an object that is not there. Both mean "we
  // do not hold this one", which is an answer and not a failure.
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error(`sign failed: ${res.status}`);
  const body = (await res.json()) as { signedURL?: string; signedUrl?: string };
  const path = body.signedURL ?? body.signedUrl;
  return path ? `${SUPABASE_URL}/storage/v1${path}` : null;
}
