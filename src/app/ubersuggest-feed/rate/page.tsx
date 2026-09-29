import { RATE_POSTS } from "../data";
import { RateFlow } from "./rate-flow";

export default function RatePage() {
  return <RateFlow posts={RATE_POSTS} />;
}
