#!/usr/bin/env python3
"""Reverse-engineer the best retrieval ranking policy from desired outcomes.

Defines 20 diverse scenarios, each with the IDEAL source mix we'd want to see,
then scores candidate policies (how to combine BM25 relevance with the per-source
quality scores) against those ideals. Pure simulation over chunks.json — no API.

Run: python3 marketing-brain/scripts/sim-ranking-policies.py
"""
import json, re, math, os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
chunks = json.load(open(os.path.join(ROOT, "src/app/marketing-brain/_data/chunks.json")))["chunks"]
Q = json.load(open(os.path.join(ROOT, "src/lib/marketing-brain/quality-scores.json")))

STOP = set(("a an the of to in is it for and or but on with as at by from this that you your i we they he she them his her our my me do does so if then than be been being are was were will would can could should how what why when who which there here not no yes get got just like very really about into out up down over under more most some any all one two").split())
def tok(s): return [w for w in re.findall(r"[a-z0-9]+", s.lower()) if len(w) > 1 and w not in STOP]
def idxtext(c): return c.get("title","") + " " + (c.get("author") if c["type"]=="book" else c.get("expert","")) + " " + c["text"]
def srckey(c): return c.get("slug") or c.get("videoId")
def vscore(c): return Q["videos"].get(c.get("videoId"), 4)
def bscore(c): return Q["books"].get(c.get("slug"), 8)

# ---- BM25 index (identity-indexed, mirrors retriever) ----
docs=[]; df=Counter(); inv={}
for i,c in enumerate(chunks):
    t=tok(idxtext(c)); tf=Counter(t); docs.append((c,t,tf))
    for w in tf: df[w]+=1; inv.setdefault(w,[]).append(i)
N=len(docs); avg=sum(len(t) for _,t,_ in docs)/N
idf={w:math.log(1+(N-x+0.5)/(x+0.5)) for w,x in df.items()}
K1,B=1.5,.75

def raw_scores(query):
    qt=tok(query); cand=set()
    for w in qt:
        for i in inv.get(w,[]): cand.add(i)
    out=[]
    for i in cand:
        c,t,tf=docs[i]; dl=len(t) or 1; s=0
        for w in qt:
            f=tf.get(w)
            if f: s+=idf.get(w,0)*(f*(K1+1))/(f+K1*(1-B+B*dl/avg))
        if s>0: out.append((s,i))
    return out

def w_book(s): return 4.5+(min(10,max(8,s))-8)/2*1.0     # 8->4.5..10->5.5 (~5x video)
def w_book3(s): return 2.5+(min(10,max(8,s))-8)/2*1.0    # ~3x
def w_video(s): return 0.6+(min(7,max(2,s))-2)/5*0.8     # 2->0.6..7->1.4
def bw(c, scale=1.0):
    return (w_book if scale==1.0 else w_book3)(bscore(c)) if c["type"]=="book" else w_video(vscore(c))

def cap_take(ranked, k=8, cap=2):
    out=[]; pk=Counter()
    for _,i in ranked:
        c=docs[i][0]; key=srckey(c)
        if pk[key]>=cap: continue
        pk[key]+=1; out.append(c)
        if len(out)>=k: break
    return out

# ---------- candidate policies: query -> list of chunks (top 8) ----------
def P_pure5x(q):
    sc=[(s*bw(docs[i][0]), i) for s,i in raw_scores(q)]
    sc.sort(reverse=True); return cap_take(sc)

def P_3x(q):
    sc=[(s*bw(docs[i][0], scale=3.0), i) for s,i in raw_scores(q)]
    sc.sort(reverse=True); return cap_take(sc)

def _reserve_videos(q, scale, nvid, k=8, cap=2):
    sc=[(s*bw(docs[i][0], scale=scale), i) for s,i in raw_scores(q)]
    sc.sort(reverse=True)
    base=cap_take(sc, k, cap)
    nv=sum(1 for c in base if c["type"]=="video")
    if nv>=nvid: return base
    have=set(id(c) for c in base)
    # next best videos not already included, respecting cap
    pk=Counter(srckey(c) for c in base)
    extra=[]
    for _,i in sc:
        c=docs[i][0]
        if c["type"]!="video" or id(c) in have: continue
        if pk[srckey(c)]>=cap: continue
        extra.append(c); pk[srckey(c)]+=1; have.add(id(c))
        if nv+len(extra)>=nvid: break
    # drop lowest-ranked books to make room, keep order by score
    books=[c for c in base if c["type"]=="book"]
    keep=[c for c in base if c["type"]=="video"]
    room=k-len(keep)-len(extra)
    merged=keep+extra+books[:max(0,room)]
    # re-sort merged by their weighted score to keep ranking sane
    wmap={}
    for s,i in sc: wmap[id(docs[i][0])]=s
    merged.sort(key=lambda c: wmap.get(id(c),0), reverse=True)
    return merged[:k]

def P_5x_reserve2(q): return _reserve_videos(q, 1.0, 2)
def P_5x_reserve3(q): return _reserve_videos(q, 1.0, 3)

def P_relgated(q, k=8, cap=2):
    rs=raw_scores(q)
    if not rs: return []
    mx=max(s for s,_ in rs)
    sc=[]
    for s,i in rs:
        c=docs[i][0]
        if c["type"]=="book":
            full=w_book(bscore(c))
            # taper the premium by how relevant the book is vs the best candidate:
            # a book at >=60% of max relevance gets the full premium; below that it
            # shrinks toward 1.0 so tangential books can't leap the best video.
            rel=min(1.0, (s/mx)/0.6)
            w=1.0+(full-1.0)*rel
        else:
            w=w_video(vscore(c))
        sc.append((s*w, i))
    sc.sort(reverse=True); return cap_take(sc, k, cap)

def P_relgated_reserve2(q, k=8, cap=2):
    # relevance-gated premium + guarantee the 2 best videos appear
    base=P_relgated(q,k,cap)
    nv=sum(1 for c in base if c["type"]=="video")
    if nv>=2: return base
    # reuse reserve logic on relgated weights
    rs=raw_scores(q); mx=max((s for s,_ in rs), default=1)
    sc=[]
    for s,i in rs:
        c=docs[i][0]
        if c["type"]=="book":
            full=w_book(bscore(c)); rel=min(1.0,(s/mx)/0.6); w=1.0+(full-1.0)*rel
        else: w=w_video(vscore(c))
        sc.append((s*w,i))
    sc.sort(reverse=True)
    return _reserve_from_sorted(sc, 2, k, cap)

def _reserve_from_sorted(sc, nvid, k=8, cap=2):
    base=cap_take(sc,k,cap)
    nv=sum(1 for c in base if c["type"]=="video")
    if nv>=nvid: return base
    have=set(id(c) for c in base); pk=Counter(srckey(c) for c in base); extra=[]
    for _,i in sc:
        c=docs[i][0]
        if c["type"]!="video" or id(c) in have or pk[srckey(c)]>=cap: continue
        extra.append(c); pk[srckey(c)]+=1; have.add(id(c))
        if nv+len(extra)>=nvid: break
    keep=[c for c in base if c["type"]=="video"]; books=[c for c in base if c["type"]=="book"]
    room=k-len(keep)-len(extra); merged=keep+extra+books[:max(0,room)]
    wmap={id(docs[i][0]):s for s,i in sc}; merged.sort(key=lambda c:wmap.get(id(c),0),reverse=True)
    return merged[:k]

# Additive "relevance + quality prior": normalize BM25 per query to [0,1], then
# add a quality bonus (books high, videos lower-but-view-graded). A clearly
# on-topic source (relevance ~1) wins; the bonus only decides near-ties and lifts
# books when they're competitive. beta controls how much quality matters.
def qprior(c):
    if c["type"]=="book": return 0.80+(min(10,max(8,bscore(c)))-8)/2*0.20   # 0.80..1.00
    return (min(7,max(2,vscore(c)))-2)/5*0.40                                # 0.00..0.40
def P_add(beta):
    def f(q):
        rs=raw_scores(q)
        if not rs: return []
        mx=max(s for s,_ in rs) or 1
        sc=[(s/mx + beta*qprior(docs[i][0]), i) for s,i in rs]
        sc.sort(reverse=True); return cap_take(sc)
    return f
def P_add_resv(beta, nvid):
    def f(q):
        rs=raw_scores(q)
        if not rs: return []
        mx=max(s for s,_ in rs) or 1
        sc=[(s/mx + beta*qprior(docs[i][0]), i) for s,i in rs]
        sc.sort(reverse=True); return _reserve_from_sorted(sc, nvid)
    return f

def P_add_param(beta, bfloor, nvid=0):
    def qp(c):
        if c["type"]=="book": return bfloor+(min(10,max(8,bscore(c)))-8)/2*(1.0-bfloor)
        return (min(7,max(2,vscore(c)))-2)/5*0.40
    def f(q):
        rs=raw_scores(q)
        if not rs: return []
        mx=max(s for s,_ in rs) or 1
        sc=[(s/mx + beta*qp(docs[i][0]), i) for s,i in rs]
        sc.sort(reverse=True)
        return _reserve_from_sorted(sc, nvid) if nvid else cap_take(sc)
    return f

POLICIES={"add b.3":P_add(0.3),
          "b.3 fl.9":P_add_param(0.30,0.90),
          "b.35 fl.85":P_add_param(0.35,0.85),
          "b.35 fl.9":P_add_param(0.35,0.90),
          "b.4 fl.85":P_add_param(0.40,0.85),
          "b.3 fl.9 rv2":P_add_param(0.30,0.90,2),
          "b.35 fl.9 rv2":P_add_param(0.35,0.90,2)}

# ---------- 20 scenarios with ideal-outcome checks ----------
def expert_of(c): return c.get("expert","")
def slugs(res): return [c.get("slug") for c in res if c["type"]=="book"]
def experts_top(res,n): return [expert_of(c) for c in res[:n] if c["type"]=="video"]

def chk_book_lead(res, **_):  # book topic: a book leads, >=3 books present
    nb=sum(1 for c in res if c["type"]=="book")
    return res and res[0]["type"]=="book" and nb>=3
def chk_video_lead(experts):  # video topic: a video leads, right expert in top3, >=3 videos
    def f(res, **_):
        nv=sum(1 for c in res if c["type"]=="video")
        top3v=set(expert_of(c) for c in res[:3] if c["type"]=="video")
        return res and res[0]["type"]=="video" and nv>=3 and (experts & top3v)
    return f
def chk_blend(res, **_):  # mixed: >=2 books and >=2 videos
    nb=sum(1 for c in res if c["type"]=="book"); nv=sum(1 for c in res if c["type"]=="video")
    return nb>=2 and nv>=2
def chk_book_present(slug):
    def f(res, **_): return slug in slugs(res)
    return f

SCEN=[
 ("principles of persuasion and influence","book",chk_book_lead),
 ("how do I write a long-form sales letter that converts","book",chk_book_lead),
 ("how do I make an irresistible offer","book",chk_book_lead),
 ("what actually makes advertising sell","book",chk_book_lead),
 ("how do I make my product remarkable and stand out","book",chk_book_lead),
 ("how do I write headlines that convert","book",chk_book_lead),
 ("how does MrBeast think about thumbnails and retention","video",chk_video_lead({"MrBeast"})),
 ("how do I get way more views on youtube","video",chk_video_lead({"MrBeast","Caleb Ralston"})),
 ("how do I make a short form video go viral","video",chk_video_lead({"MrBeast","Caleb Ralston","Gary Vaynerchuk"})),
 ("what is working in SEO in 2026","video",chk_video_lead({"Neil Patel"})),
 ("how do I grow on social media right now","video",chk_video_lead({"Gary Vaynerchuk","Neil Patel"})),
 ("how do I build a personal brand as a creator","video",chk_video_lead({"Caleb Ralston","Gary Vaynerchuk"})),
 ("how do I get my first 5 customers with no audience","mixed",chk_blend),
 ("give me a cold outreach strategy that gets replies","mixed",chk_blend),
 ("how do I build a content strategy that compounds","mixed",chk_blend),
 ("how do I use storytelling to sell","mixed",chk_blend),
 ("how do I build a sales funnel that makes money","mixed",chk_blend),
 ("what does Cialdini's Influence say about reciprocity","source",chk_book_present("cialdini-influence")),
 ("what does Hormozi teach about lead magnets","source",chk_book_present("hormozi-100m-leads")),
 ("summarize Gary Vee's jab jab jab right hook","source",chk_book_present("vaynerchuk-jjjrh")),
]

print(f"{'scenario':<52}{'cat':<7}"+"".join(f"{n:<16}" for n in POLICIES))
totals=Counter()
for q,cat,chk in SCEN:
    row=f"{q[:50]:<52}{cat:<7}"
    for name,pol in POLICIES.items():
        res=pol(q); ok=chk(res)
        nb=sum(1 for c in res if c["type"]=="book")
        row+=f"{('PASS' if ok else 'fail')+f' b{nb}':<16}"
        if ok: totals[name]+=1
    print(row)
print("\n"+"="*40+"\nSCOREBOARD (out of 20):")
for name in POLICIES:
    print(f"  {name:<16} {totals[name]}/20")
