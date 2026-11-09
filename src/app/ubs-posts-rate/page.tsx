import { RATE_POSTS } from "../ubs-posts/data";
import { RateFlow } from "./rate-flow";

export default function UbsPostsRatePage() {
  return <RateFlow posts={RATE_POSTS} />;
}
