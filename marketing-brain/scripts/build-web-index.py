#!/usr/bin/env python3
"""
Build the web retrieval corpus for the /marketing-brain chat page.

Emits a single JSON file (chunks + citation metadata) that the Next.js BM25
retriever (src/lib/marketing-brain/retriever.ts) loads at runtime. This is a
faithful port of the chunking + citation extraction in query.py — same chunk
sizes, same page-marker / timecode parsing — so retrieval quality matches the
terminal experience.

Output: src/app/marketing-brain/_data/chunks.json   (server-only; never under public/)

Usage: python3 marketing-brain/scripts/build-web-index.py
Run after build-kb.py whenever the knowledge base changes.
"""
import os, re, json, glob

MB = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT = os.path.dirname(MB)
OUT = os.path.join(ROOT, "src", "app", "marketing-brain", "_data", "chunks.json")

MANIFEST = json.load(open(os.path.join(MB, "manifest.json")))
# video_id -> thumbnail url (reuse the validated thumbnails from the manifest)
THUMBS = {v["video_id"]: v.get("thumbnail") for v in MANIFEST.get("videos", [])}
# slug -> cover web path (covers are served from public/marketing-brain/book-covers)
def cover_path(slug):
    return f"/marketing-brain/book-covers/{slug}.jpg"


def hms_to_sec(t):
    p = [int(x) for x in t.split(":")]
    return p[0] * 3600 + p[1] * 60 + p[2] if len(p) == 3 else p[0] * 60 + p[1]


def chunk_words(words, size):
    for i in range(0, len(words), size):
        yield " ".join(words[i:i + size])


def build():
    chunks = []
    cid = 0

    # ---- books: chunk by ~200 words within each page run ----
    for f in sorted(glob.glob(os.path.join(MB, "books", "*.md"))):
        raw = open(f).read()
        slug = os.path.splitext(os.path.basename(f))[0]
        title = re.search(r"^title:\s*(.+)$", raw, re.M)
        author = re.search(r"^author:\s*(.+)$", raw, re.M)
        title = title.group(1).strip() if title else slug
        author = author.group(1).strip() if author else ""
        body = raw.split("---", 2)[-1]
        parts = re.split(r"<!--\s*page\s+(\d+)\s*-->", body)
        it = iter(parts)
        next(it, None)  # discard preamble before first marker
        for pagenum, text in zip(it, it):
            page = int(pagenum)
            clean = re.sub(r"^#+\s.*$", "", text, flags=re.M)   # drop headings
            clean = re.sub(r"\s+", " ", clean).strip()
            if not clean:
                continue
            for ch in chunk_words(clean.split(), 200):
                chunks.append({
                    "id": cid,
                    "type": "book",
                    "text": ch,
                    "title": title,
                    "author": author,
                    "slug": slug,
                    "page": page,
                    "cover": cover_path(slug),
                })
                cid += 1

    # ---- videos: each timecoded paragraph is a chunk ----
    for f in sorted(glob.glob(os.path.join(MB, "videos", "*", "[0-9]*.md"))):
        raw = open(f).read()
        title = re.search(r'^title:\s*"?(.*?)"?$', raw, re.M)
        expert = re.search(r"^expert:\s*(.+)$", raw, re.M)
        vid = re.search(r"^video_id:\s*(.+)$", raw, re.M)
        channel = re.search(r'^channel:\s*"?(.*?)"?$', raw, re.M)
        title = title.group(1).strip() if title else os.path.basename(f)
        expert = expert.group(1).strip() if expert else ""
        vid = vid.group(1).strip() if vid else ""
        channel = channel.group(1).strip() if channel else ""
        for m in re.finditer(r"\[`([0-9:]+)`\]\((https?://[^)]+)\)\s*(.*?)(?=\n\n\[`|\Z)", raw, re.S):
            tc, url, text = m.group(1), m.group(2), m.group(3)
            text = re.sub(r"\s+", " ", text).strip()
            if not text:
                continue
            chunks.append({
                "id": cid,
                "type": "video",
                "text": text,
                "title": title,
                "expert": expert,
                "channel": channel,
                "videoId": vid,
                "timecode": tc,
                "seconds": hms_to_sec(tc),
                "url": url,
                "thumb": THUMBS.get(vid) or f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
            })
            cid += 1

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"chunks": chunks}, open(OUT, "w"), ensure_ascii=False)
    books = sum(1 for c in chunks if c["type"] == "book")
    videos = sum(1 for c in chunks if c["type"] == "video")
    print(f"wrote {len(chunks)} chunks ({books} book, {videos} video) -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    build()
