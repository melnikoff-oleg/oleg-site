#!/usr/bin/env python3
"""
Query the Marketing Brain knowledge base. Fast local BM25 retrieval over book
and video chunks. Every result comes with a validated citation:
  - books:  page number (PDF page) + file path
  - videos: timecode + a clickable deep link that opens the video at that moment

Usage:
  python3 marketing-brain/scripts/query.py "how do I make an irresistible offer"
  python3 marketing-brain/scripts/query.py -k 8 "thumbnail click through rate"
  python3 marketing-brain/scripts/query.py --rebuild "..."   # force index rebuild

The index is cached (pickle) and rebuilt automatically when source files change,
so repeat queries are sub-100ms. First build over the full corpus is ~1-2s.
"""
import os, re, sys, math, glob, pickle, time, html as _html

MB = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE = os.path.join(MB, ".cache", "query-index.pkl")

# Per-source quality scores (books 8-10, videos 2-7); see build-quality-scores.py.
_SCORES_PATH = os.path.normpath(os.path.join(MB, "..", "src", "lib", "marketing-brain", "quality-scores.json"))
try:
    import json as _json
    _QUALITY = _json.load(open(_SCORES_PATH))
except Exception:
    _QUALITY = {"books": {}, "videos": {}}

BETA = 0.35            # weight of the quality prior vs normalized relevance
RESERVE_VIDEOS = 2     # always let the best N videos through
PER_SOURCE = 2         # max chunks per book/video

def _src_key(cite):
    if cite["type"] == "book":
        return os.path.splitext(os.path.basename(cite.get("path", "")))[0]
    m = re.search(r"[?&]v=([^&]+)", cite.get("url", ""))
    return m.group(1) if m else ""

def _quality_prior(cite):
    """Quality prior added to normalized relevance; mirrors retriever.ts.
    Books 0.90-1.00 (lead timeless topics); videos 0.00-0.40 (view-graded)."""
    if cite["type"] == "book":
        s = min(10, max(8, _QUALITY["books"].get(_src_key(cite), 8)))
        return 0.9 + (s - 8) / 2 * 0.1
    s = min(7, max(2, _QUALITY["videos"].get(_src_key(cite), 4)))
    return (s - 2) / 5 * 0.4

STOP = set("a an the of to in is it for and or but on with as at by from this that "
           "you your i we they he she them his her our my me do does so if then than "
           "be been being are was were will would can could should how what why when "
           "who which there here not no yes get got just like very really about into "
           "out up down over under more most some any all one two".split())

def tok(s):
    return [w for w in re.findall(r"[a-z0-9]+", s.lower()) if w not in STOP and len(w) > 1]

def hms_to_sec(t):
    p = [int(x) for x in t.split(":")]
    return p[0]*3600+p[1]*60+p[2] if len(p) == 3 else p[0]*60+p[1]

# ---------- index build ----------
def chunk_words(words, size):
    for i in range(0, len(words), size):
        yield " ".join(words[i:i+size])

def build_index():
    chunks = []  # each: dict(text, tokens, cite)
    # books: track page markers, chunk by ~200 words within page-run
    for f in sorted(glob.glob(os.path.join(MB, "books", "*.md"))):
        raw = open(f).read()
        title = re.search(r"^title:\s*(.+)$", raw, re.M)
        author = re.search(r"^author:\s*(.+)$", raw, re.M)
        title = title.group(1).strip() if title else os.path.basename(f)
        author = author.group(1).strip() if author else ""
        body = raw.split("---", 2)[-1]
        # split keeping page markers
        parts = re.split(r"<!--\s*page\s+(\d+)\s*-->", body)
        # parts: [pre, pagenum, text, pagenum, text, ...]
        page = 1
        rel = os.path.relpath(f, MB)
        it = iter(parts)
        next(it, None)  # discard preamble before first marker
        for pagenum, text in zip(it, it):
            page = int(pagenum)
            clean = re.sub(r"^#+\s.*$", "", text, flags=re.M)        # drop headings
            clean = re.sub(r"\s+", " ", clean).strip()
            if not clean:
                continue
            for ch in chunk_words(clean.split(), 200):
                # Fold identity (title + author) into the indexed tokens so the
                # book is matchable by its name and author, not only body prose.
                chunks.append({"text": ch, "tokens": tok(f"{title} {author} {ch}"),
                               "cite": {"type": "book", "title": title, "author": author,
                                        "page": page, "path": rel}})
    # videos: each timecoded paragraph is a chunk
    for f in sorted(glob.glob(os.path.join(MB, "videos", "*", "[0-9]*.md"))):
        raw = open(f).read()
        title = re.search(r'^title:\s*"?(.*?)"?$', raw, re.M)
        expert = re.search(r"^expert:\s*(.+)$", raw, re.M)
        title = title.group(1).strip() if title else os.path.basename(f)
        expert = expert.group(1).strip() if expert else ""
        rel = os.path.relpath(f, MB)
        for m in re.finditer(r"\[`([0-9:]+)`\]\((https?://[^)]+)\)\s*(.*?)(?=\n\n\[`|\Z)", raw, re.S):
            tc, url, text = m.group(1), m.group(2), m.group(3)
            text = re.sub(r"\s+", " ", text).strip()
            if not text:
                continue
            # Fold identity (title + expert) into the indexed tokens, mirroring
            # the web retriever (src/lib/marketing-brain/retriever.ts). The
            # per-source diversity cap there is a serving-time concern and is
            # intentionally not replicated in this offline CLI.
            chunks.append({"text": text, "tokens": tok(f"{title} {expert} {text}"),
                           "cite": {"type": "video", "title": title, "expert": expert,
                                    "timecode": tc, "seconds": hms_to_sec(tc),
                                    "url": url, "path": rel}})
    # BM25 stats
    N = len(chunks)
    df = {}
    for c in chunks:
        for w in set(c["tokens"]):
            df[w] = df.get(w, 0) + 1
    avgdl = sum(len(c["tokens"]) for c in chunks) / max(N, 1)
    idf = {w: math.log(1 + (N - d + 0.5) / (d + 0.5)) for w, d in df.items()}
    # inverted index
    inv = {}
    for i, c in enumerate(chunks):
        tf = {}
        for w in c["tokens"]:
            tf[w] = tf.get(w, 0) + 1
        c["tf"] = tf
        for w in tf:
            inv.setdefault(w, []).append(i)
    return {"chunks": chunks, "idf": idf, "avgdl": avgdl, "inv": inv}

def newest_source_mtime():
    files = glob.glob(os.path.join(MB, "books", "*.md")) + glob.glob(os.path.join(MB, "videos", "*", "[0-9]*.md"))
    return max((os.path.getmtime(f) for f in files), default=0)

def get_index(rebuild=False):
    if not rebuild and os.path.exists(CACHE) and os.path.getmtime(CACHE) >= newest_source_mtime():
        try:
            return pickle.load(open(CACHE, "rb"))
        except Exception:
            pass
    idx = build_index()
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    pickle.dump(idx, open(CACHE, "wb"))
    return idx

# ---------- search ----------
def search(idx, q, k=5, k1=1.5, b=0.75):
    qt = tok(q)
    cand = set()
    for w in qt:
        cand.update(idx["inv"].get(w, []))
    # 1. raw BM25 relevance, tracking the per-query max for normalization
    raw = []
    maxraw = 0.0
    for i in cand:
        c = idx["chunks"][i]
        dl = len(c["tokens"]) or 1
        s = 0.0
        for w in qt:
            if w in c["tf"]:
                f = c["tf"][w]
                s += idx["idf"].get(w, 0) * (f*(k1+1)) / (f + k1*(1 - b + b*dl/idx["avgdl"]))
        if s > 0:
            raw.append((s, i))
            maxraw = max(maxraw, s)
    if not raw:
        return []
    # 2. final = normalized relevance + quality prior (mirrors retriever.ts)
    scored = sorted(((s/maxraw + BETA*_quality_prior(idx["chunks"][i]["cite"]), i) for s, i in raw), reverse=True)
    smap = {i: sc for sc, i in scored}
    # 3. per-source cap
    picked, per = [], {}
    for sc, i in scored:
        key = _src_key(idx["chunks"][i]["cite"])
        if per.get(key, 0) >= PER_SOURCE:
            continue
        per[key] = per.get(key, 0) + 1
        picked.append(i)
        if len(picked) >= k:
            break
    # 4. guarantee >= RESERVE_VIDEOS videos (drop lowest-ranked books for room)
    is_vid = lambda i: idx["chunks"][i]["cite"]["type"] == "video"
    nv = sum(1 for i in picked if is_vid(i))
    if nv < RESERVE_VIDEOS:
        have = set(picked); extra = []
        for sc, i in scored:
            if nv + len(extra) >= RESERVE_VIDEOS:
                break
            if not is_vid(i) or i in have:
                continue
            key = _src_key(idx["chunks"][i]["cite"])
            if per.get(key, 0) >= PER_SOURCE:
                continue
            per[key] = per.get(key, 0) + 1
            extra.append(i); have.add(i)
        if extra:
            books = [i for i in picked if not is_vid(i)]
            drop = set(books[-len(extra):])
            picked = sorted([i for i in picked if i not in drop] + extra, key=lambda i: smap[i], reverse=True)[:k]
    return [idx["chunks"][i] for i in picked]

def snippet(text, q, width=45):
    qt = set(tok(q)); words = text.split()
    best, bi = -1, 0
    for i, w in enumerate(words):
        if re.sub(r"[^a-z0-9]", "", w.lower()) in qt:
            win = sum(1 for x in words[i:i+width] if re.sub(r"[^a-z0-9]","",x.lower()) in qt)
            if win > best: best, bi = win, i
    start = max(0, bi - 8)
    s = " ".join(words[start:start+width])
    return ("..." if start else "") + s + ("..." if start+width < len(words) else "")

def format_result(c, q, rank):
    cl = c["cite"]
    if cl["type"] == "book":
        head = f"{rank}. \U0001F4D6 {cl['title']} ({cl['author']}) · p. {cl['page']}"
        ref = f"   ref: {cl['path']} (PDF p. {cl['page']})"
    else:
        head = f"{rank}. ▶ {cl['title']} · {cl['expert']} @ {cl['timecode']}"
        ref = f"   ref: {cl['url']}"
    return f"{head}\n   \"{snippet(c['text'], q)}\"\n{ref}"

def main():
    args = sys.argv[1:]
    rebuild = "--rebuild" in args
    args = [a for a in args if a != "--rebuild"]
    k = 5
    if "-k" in args:
        i = args.index("-k"); k = int(args[i+1]); del args[i:i+2]
    q = " ".join(args).strip()
    if not q:
        print("usage: query.py [-k N] [--rebuild] \"your question\""); return
    t0 = time.time(); idx = get_index(rebuild); t1 = time.time()
    res = search(idx, q, k); t2 = time.time()
    print(f"\nQ: {q}")
    print(f"({len(idx['chunks'])} chunks · index {1000*(t1-t0):.0f}ms · search {1000*(t2-t1):.0f}ms)\n")
    if not res:
        print("No matches."); return
    for i, c in enumerate(res, 1):
        print(format_result(c, q, i)); print()

if __name__ == "__main__":
    main()
