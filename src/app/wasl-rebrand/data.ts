// The name candidates for the Wasl Apps rebrand, strongest first. names.json and
// public/wasl-rebrand are generated in the vault (projects/wasl_apps_rebrand/); edit there.
import raw from "./names.json";

export type NameIdea = {
  id: string;
  n: number;
  name: string;
  domain: string;
  /** e.g. "Free to register, about $11 a year" */
  price: string;
  /** The story behind the name, 500 characters at most. */
  story: string;
  image: string;
  /** Set on a name carried over from an earlier round. */
  saved?: string;
};

export const NAMES = raw as NameIdea[];
export const NAME_IDS = NAMES.map((x) => x.id);
