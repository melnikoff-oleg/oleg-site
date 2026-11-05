/**
 * Where a visitor originally came from, and how that travels on to boldane.com.
 *
 * The rule (2026-11-05, sources in the dantane vault, areas/attribution/README.md): the ORIGINAL
 * source wins. oleg.ae is Oleg's own bridge, not a marketing channel, so someone who watched a
 * video, opened oleg.ae and then clicked to Boldane reads on Boldane as that video:
 *   utm_source / utm_medium / utm_content  where they originally came from
 *   utm_campaign                           what this link sells (discovery-call on Boldane)
 *   utm_term                               the bridge, the oleg.ae page they clicked on
 *
 * The first known source is kept for 30 days in localStorage: campaign labels only, no identifier,
 * on the visitor's device, sent nowhere until they click through themselves. Plausible itself stays
 * cookieless and is not involved.
 */

export type FirstTouch = {
  source: string;
  medium: string;
  content: string;
  /** Nothing better is known than "they were on oleg.ae". A real source may still replace this. */
  fallback?: boolean;
  at: number;
};

export const STORAGE_KEY = "first-touch";
export const TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Hostnames worth a proper name, so an untagged click still reads as `youtube`, `google` and so on.
 *  Anything else is its own hostname with medium `referral` (chatgpt.com, github.com). */
const REFERRERS: [RegExp, string, string][] = [
  [/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$|^com\.google\.android\.youtube$/, "youtube", "social"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$|^com\.linkedin\.android$/, "linkedin", "social"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x", "social"],
  [/(^|\.)instagram\.com$/, "instagram", "social"],
  [/(^|\.)tiktok\.com$/, "tiktok", "social"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "facebook", "social"],
  [/(^|\.)reddit\.com$/, "reddit", "social"],
  [/^(www\.)?google\.(com?\.)?[a-z]{2,3}$|^com\.google\.android\.googlequicksearchbox$/, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)yandex\.(com?\.)?[a-z]{2,3}$|^ya\.ru$/, "yandex", "organic"],
  [/(^|\.)baidu\.com$/, "baidu", "organic"],
  [/(^|\.)ecosia\.org$/, "ecosia", "organic"],
  [/^search\.brave\.com$/, "brave", "organic"],
];

/** The page as a tag value: `claude-reels`, and `home` for the front page. */
export function pageSlug(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-").toLowerCase() || "home";
}

/** Tags are case sensitive and every spelling is its own row, so what is passed on is normalized. */
function label(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 100);
}

const bareHost = (host: string) => host.replace(/^www\./, "").toLowerCase();

/** What this page load says about the visitor, from its address and referrer alone. */
export function fromLanding(landing: {
  search: string;
  referrer: string;
  pathname: string;
  host: string;
  now: number;
}): FirstTouch {
  const { search, referrer, pathname, host, now } = landing;
  const content = pageSlug(pathname);
  const query = new URLSearchParams(search);

  const tagged = label(query.get("utm_source") ?? "");
  if (tagged) {
    return {
      source: tagged,
      medium: label(query.get("utm_medium") ?? "") || "referral",
      content: label(query.get("utm_content") ?? "") || content,
      at: now,
    };
  }

  let refHost = "";
  try {
    refHost = bareHost(new URL(referrer).hostname);
  } catch {
    // No referrer, or one that is not a URL: same as direct.
  }
  if (refHost && refHost !== bareHost(host)) {
    const known = REFERRERS.find(([pattern]) => pattern.test(refHost));
    return {
      source: known ? known[1] : refHost,
      medium: known ? known[2] : "referral",
      content,
      at: now,
    };
  }
  return { source: "oleg.ae", medium: "referral", content, fallback: true, at: now };
}

/** First known source wins until it expires. A direct visit never replaces a real source, and a
 *  real source replaces a direct visit, because direct says nothing about where someone came from. */
export function chooseFirstTouch(stored: FirstTouch | null, landing: FirstTouch, now: number): FirstTouch {
  if (!stored || now - stored.at >= TTL_MS) return landing;
  if (stored.fallback && !landing.fallback) return landing;
  return stored;
}

export function parseStored(raw: string | null): FirstTouch | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const valid =
      typeof value?.source === "string" &&
      value.source &&
      typeof value.medium === "string" &&
      typeof value.content === "string" &&
      typeof value.at === "number";
    return valid ? value : null;
  } catch {
    return null;
  }
}

/** The link to Boldane from this page. Without a touch (the server's HTML, or before hydration) it
 *  says what the page alone knows: this visitor clicked on oleg.ae. */
export function boldaneUrl(pathname: string, touch: FirstTouch | null): string {
  const page = pageSlug(pathname);
  const params = [
    ["utm_source", touch?.source ?? "oleg.ae"],
    ["utm_medium", touch?.medium ?? "referral"],
    ["utm_campaign", "discovery-call"],
    ["utm_content", touch?.content ?? page],
    ["utm_term", `oleg.ae-${page}`],
  ];
  return `https://boldane.com/?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
}

/** The same address without its utm_ tags. Anything else in it is left exactly as it was. */
export function withoutUtm(href: string): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  const tags = [...url.searchParams.keys()].filter((key) => key.startsWith("utm_"));
  if (!tags.length) return href;
  tags.forEach((key) => url.searchParams.delete(key));
  return url.href;
}

let memo: FirstTouch | undefined;

/** Browser only. Reads the landing address once per page load, so it must first run before anything
 *  rewrites the address bar (`Plausible` calls it on mount, before it loads the tracker). */
export function firstTouch(): FirstTouch {
  if (memo) return memo;
  const now = Date.now();
  let stored: FirstTouch | null = null;
  try {
    stored = parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage can be off (private modes, blocked by policy). Then this page load is all we know.
  }
  memo = chooseFirstTouch(
    stored,
    fromLanding({
      search: location.search,
      referrer: document.referrer,
      pathname: location.pathname,
      host: location.hostname,
      now,
    }),
    now,
  );
  if (memo !== stored) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memo));
    } catch {
      // Same as above: still correct for this page load.
    }
  }
  return memo;
}
