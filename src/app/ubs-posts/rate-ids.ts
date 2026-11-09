// Which of the 25 drafts the team rates on /ubs-posts-rate, and the round their
// votes are stored under. Kept apart from data.ts (which imports posts.json) so
// the unit tests and the API route can read it without the feed data.

/** The round stamped on every submission of this batch (ubs_vote_submission.round). */
export const ROUND = "2026-11-09";

/**
 * Five posts, the strongest and the most different from each other: five formats,
 * three for the company page and two for personal pages. The first one is post #1
 * of the 25 (Oleg's call, 2026-11-09; it replaced the Vercel case).
 */
export const RATE_POST_IDS = ["01_viewed", "13_layers", "05_table", "mike_brand_search", "gabriel_dev_then_now"];
