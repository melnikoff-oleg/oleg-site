#!/usr/bin/env python3
"""Generate per-source quality scores (1-10) for the Marketing Brain retriever.

Each data point (a book, or an individual video) gets a value score:

  - Books (8-10): a book is years of distilled, edited thinking, so books are the
    top tier. Within books, scored by authority / timelessness (manual rubric).
  - Videos (2-7): scored primarily by view count (log scale), with a small bump
    for long-form depth. Every video is rated individually.

The retriever turns these scores into BM25 weight multipliers so books land at
roughly 5x a typical video (see weightForScore in retriever.ts / query.py).

Output: src/lib/marketing-brain/quality-scores.json  (source of truth for both
the web retriever and query.py). Rerun after adding books/videos.

Usage: python3 marketing-brain/scripts/build-quality-scores.py
"""
import glob
import json
import math
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MB = os.path.join(ROOT, "marketing-brain")
OUT = os.path.join(ROOT, "src", "app", "..", "lib", "marketing-brain", "quality-scores.json")
OUT = os.path.normpath(os.path.join(ROOT, "src", "lib", "marketing-brain", "quality-scores.json"))

# Manual book rubric (8-10). Books are the top tier by medium.
BOOK_SCORE = {
    "cialdini-influence": 10.0,         # seminal, decades of research; definitive on persuasion
    "ogilvy-on-advertising": 10.0,      # legendary, timeless craft
    "hormozi-100m-offers": 9.0,
    "hormozi-100m-leads": 9.0,
    "brunson-dotcom-secrets": 8.0,
    "godin-purple-cow": 8.0,
    "vaynerchuk-jjjrh": 8.0,
    "hormozi-100m-money-models": 8.0,
}


def dur_minutes(s):
    p = [int(x) for x in s.split(":")]
    return p[0] * 60 + p[1] + p[2] / 60 if len(p) == 3 else p[0] + p[1] / 60


def video_score(views, minutes):
    """2-7, driven by views (log) with a small long-form depth bump."""
    lv = math.log10(max(views, 1))          # corpus spans ~5.0 .. 7.35
    base = 2.0 + (lv - 5.0) / 2.4 * 4.8      # ~2.0 .. ~6.8
    depth = min(0.7, minutes / 120 * 0.5)    # multi-hour courses get up to +0.7
    return round(max(2.0, min(7.0, base + depth)), 1)


def field(raw, key):
    m = re.search(r"^" + key + r':\s*"?(.*?)"?\s*$', raw, re.M)
    return m.group(1) if m else None


def main():
    videos = {}
    for f in sorted(glob.glob(os.path.join(MB, "videos", "*", "*.md"))):
        raw = open(f).read()
        vid = field(raw, "video_id")
        views = int(field(raw, "views"))
        minutes = dur_minutes(field(raw, "duration"))
        if vid:
            videos[vid] = video_score(views, minutes)

    out = {"books": dict(BOOK_SCORE), "videos": videos}
    json.dump(out, open(OUT, "w"), indent=2, sort_keys=True)
    print(f"wrote {len(BOOK_SCORE)} book + {len(videos)} video scores -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
