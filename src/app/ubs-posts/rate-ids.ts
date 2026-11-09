// Which of the 25 drafts the team rates on /ubs-posts-rate, and the round their
// votes are stored under. Kept apart from data.ts (which imports posts.json) so
// the unit tests and the API route can read it without the feed data.

/** The round stamped on every submission of this batch (ubs_vote_submission.round). */
export const ROUND = "2026-11-09";

/**
 * Five posts, the strongest and the most different from each other: five formats,
 * three for the company page and two for personal pages. The first two are the
 * ones Oleg liked most in his own review.
 */
export const RATE_POST_IDS = ["09_company_case", "13_layers", "05_table", "mike_brand_search", "gabriel_dev_then_now"];
