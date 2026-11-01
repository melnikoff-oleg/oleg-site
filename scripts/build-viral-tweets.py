#!/usr/bin/env python3
"""Build the /viral-tweets data and media from a saved Twitter Spy folder.

  python3 scripts/build-viral-tweets.py [SRC]

SRC defaults to the folder the page was first built from (MS repo,
projects/accounts/oleg_melnikov/twitter_spy/saved_2026-11-01). It holds
tweets_extract.json, web/ (the shrunk media, numbered in the JSON's own order,
01..14) and build_feed.py, the generator of Oleg's "Saved tweets for LinkedIn"
artifact. This script is a port of build_feed.py's rules, so the page and the
artifact agree: sorted by `outlier` high to low, t.co media links dropped and
the other t.co links swapped for their display URL, the same date and stat
formats, the same "first N s of M:SS" note under a trimmed clip, the same gold
check for a16z and the same "X Article" label on a quoted article.

What it deliberately leaves out: the `note` field. Those are Oleg's private
notes and this page is public, so they never reach the repo.

Writes src/app/viral-tweets/tweets.ts and copies the media to
public/viral-tweets/. Needs ffprobe and Pillow.
"""
import base64, io, json, re, shutil, subprocess, sys
from datetime import datetime
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else
           "/Users/olegmelnikov/Desktop/MS/projects/accounts/oleg_melnikov/twitter_spy/saved_2026-11-01")
WEB = SRC / "web"
PUB = ROOT / "public" / "viral-tweets"
OUT = ROOT / "src" / "app" / "viral-tweets" / "tweets.ts"
GOLD = {"a16z"}  # Business-verified accounts get the gold check (build_feed.py)

used: set[str] = set()


def asset(name: str) -> str:
    """Mark a file in web/ as shipped and return its public path."""
    if not (WEB / name).exists():
        raise SystemExit(f"missing media: {WEB / name}")
    used.add(name)
    return f"/viral-tweets/{name}"


def short(n):
    if n is None: return ""
    if n >= 1_000_000: return f"{n / 1e6:.1f}".rstrip("0").rstrip(".") + "M"
    if n >= 10_000: return f"{n / 1e3:.0f}K"
    if n >= 1_000: return f"{n / 1e3:.1f}".rstrip("0").rstrip(".") + "K"
    return str(n)


def when(s):
    t = datetime.strptime(s, "%a %b %d %H:%M:%S %z %Y")
    return {"label": t.strftime("%b %-d"), "iso": t.isoformat()}


def mmss(sec):
    sec = round(sec)
    return f"{sec // 60}:{sec % 60:02d}"


def span(a, b):
    """"Oct 29 to 31", or "Oct 29 to Nov 1" across a month end."""
    if (a.month, a.day) == (b.month, b.day): return a.strftime("%b %-d")
    return f'{a.strftime("%b %-d")} to {b.strftime("%-d" if a.month == b.month else "%b %-d")}'


def verified(handle, blue):
    return "gold" if handle in GOLD else ("blue" if blue else None)


def segments(text, urls):
    """build_feed.py's body(), as data: text, links and @mentions, trimmed like str.strip()."""
    expand = {u["url"]: u for u in urls}
    out = []
    for part in re.split(r"(https://t\.co/\w+)", text):
        if part.startswith("https://t.co/"):
            u = expand.get(part)
            if u:  # a real link: show where it goes; a media link is dropped
                out.append({"href": u["expanded_url"], "label": u["display_url"]})
        else:
            for bit in re.split(r"(@\w+)", part):
                if bit.startswith("@") and re.fullmatch(r"@\w+", bit):
                    out.append({"at": bit})
                elif bit:
                    out.append({"t": bit})
    while out and "t" in out[0]:
        out[0]["t"] = out[0]["t"].lstrip()
        if out[0]["t"]: break
        out.pop(0)
    while out and "t" in out[-1]:
        out[-1]["t"] = out[-1]["t"].rstrip()
        if out[-1]["t"]: break
        out.pop()
    return out


def thumb(path: Path) -> str:
    """The ~200-byte stripped WebP the guide figures use (scripts/stripped-thumb.py --module)."""
    im = Image.open(path).convert("RGB")
    im = im.resize((24, max(1, round(im.height * 24 / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=40)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def media(n, items, prefix="m"):
    out = []
    for k, m in enumerate(items):
        if m["type"] in ("video", "animated_gif"):
            v = WEB / f"{n:02d}_{prefix}{k}.mp4"
            full = m["dur_ms"] / 1000
            kept = float(subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(v)],
                capture_output=True, text=True, check=True).stdout)
            poster = f"{n:02d}_poster.jpg"
            out.append({
                "kind": "video",
                "src": asset(v.name),
                "poster": asset(poster),
                "placeholder": thumb(WEB / poster),
                "ratio": f'{m["w"]} / {m["h"]}',
                # build_feed.py: a note only when the clip was cut short
                "clip": None if kept >= full - 1 else {"kept": str(round(kept)), "full": mmss(full)},
            })
        else:
            name = f"{n:02d}_{prefix}{k}.jpg"
            w, h = Image.open(WEB / name).size
            out.append({"kind": "photo", "src": asset(name), "w": w, "h": h})
    return out


def main():
    d = json.load(open(SRC / "tweets_extract.json"))
    # highest outlier first; n keeps the media file number (build_feed.py)
    order = sorted(enumerate(d, 1), key=lambda x: -x[1]["outlier"])
    tweets = []
    for pos, (n, r) in enumerate(order, 1):
        quote = None
        if q := r.get("quote"):
            qa = q["author"]
            qtext = segments(q.get("text", ""), (q.get("entities") or {}).get("urls", []))
            article = not qtext or ("href" in qtext[0] and qtext[0]["href"].startswith("https://x.com/i/article"))
            qmedia = [{"type": m["type"]} for m in ((q.get("extendedEntities") or {}).get("media") or [])]
            quote = {
                "name": qa["name"],
                "handle": qa["userName"],
                "verified": verified(qa["userName"], qa.get("isBlueVerified")),
                "date": when(q["createdAt"]),
                "avatar": asset(f"{n:02d}_qavatar.jpg"),
                "article": article,
                "text": qtext,
                "media": media(n, qmedia, prefix="q"),
            }
        tweets.append({
            "pos": pos,
            "outlier": f'{r["outlier"]:g}',
            "url": r["url"],
            "name": r["name"],
            "handle": r["handle"],
            "verified": verified(r["handle"], r["blue"]),
            "date": when(r["created"]),
            "avatar": asset(f"{n:02d}_avatar.jpg"),
            "text": segments(r["text"], r["urls"]),
            "media": media(n, r["media"]),
            "quote": quote,
            "stats": [
                {"kind": "reply", "n": r["replies"], "label": short(r["replies"])},
                {"kind": "rt", "n": r["rts"], "label": short(r["rts"])},
                {"kind": "like", "n": r["likes"], "label": short(r["likes"])},
                {"kind": "view", "n": r["views"], "label": short(r["views"])},
            ],
        })

    PUB.mkdir(parents=True, exist_ok=True)
    for f in PUB.iterdir():
        if f.name not in used:
            f.unlink()
    for name in sorted(used):
        shutil.copy2(WEB / name, PUB / name)

    created = sorted(datetime.strptime(r["created"], "%a %b %d %H:%M:%S %z %Y") for r in d)
    head = f'''// GENERATED by scripts/build-viral-tweets.py from {SRC.name}/tweets_extract.json, do not edit.
// Re-run the script instead: it ports build_feed.py's rules (order, text cleanup,
// dates, stats, clip notes) and leaves out the private `note` field on purpose.

export type Segment = {{ t: string }} | {{ at: string }} | {{ href: string; label: string }};
export type Verified = "blue" | "gold" | null;
export type Media =
  | {{ kind: "photo"; src: string; w: number; h: number }}
  | {{
      kind: "video";
      src: string;
      poster: string;
      placeholder: string;
      ratio: string;
      clip: {{ kept: string; full: string }} | null;
    }};
export type Quote = {{
  name: string;
  handle: string;
  verified: Verified;
  date: {{ label: string; iso: string }};
  avatar: string;
  article: boolean;
  text: Segment[];
  media: Media[];
}};
export type Stat = {{ kind: "reply" | "rt" | "like" | "view"; n: number; label: string }};
export type Tweet = {{
  pos: number;
  outlier: string;
  url: string;
  name: string;
  handle: string;
  verified: Verified;
  date: {{ label: string; iso: string }};
  avatar: string;
  text: Segment[];
  media: Media[];
  quote: Quote | null;
  stats: Stat[];
}};

/** First and last post date, for the page's one-line context. */
export const POSTED = {json.dumps({"range": span(created[0], created[-1]), "year": created[-1].year})} as const;

export const TWEETS: Tweet[] = '''
    OUT.write_text(head + json.dumps(tweets, ensure_ascii=False, indent=1) + ";\n")
    print(f"{OUT.relative_to(ROOT)}: {len(tweets)} tweets; {len(used)} files in {PUB.relative_to(ROOT)}/")


main()
