#!/usr/bin/env python3
"""Generate the homepage icon sheet with Kie.ai gpt-image-2, then slice it.

One image holds all 12 icons in a 4x3 grid so they share one style. The sheet is
drawn on pure black; slice.py keys black out to alpha so each icon sits on the
navy cards. Usage: python3 scripts/icons/generate.py  (writes scripts/icons/sheet.png)
KIE_AI_API_KEY is read from the dantane vault .env.
"""
import json, pathlib, sys, time, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ENV = pathlib.Path.home() / "Desktop/Software Projects/dantane/.env"
UA = "curl/8.7.1"
ICONS = [
    "a stack of database cylinders with tiny content cards flowing into it",
    "a speedometer gauge with the needle in the top range",
    "an eye with a neural-network pattern in the iris",
    "a magic wand drawing a sparkle",
    "a sigma symbol beside code brackets",
    "rising candlestick chart with an upward arrow",
    "a rocket lifting off from building blocks",
    "a play button inside a rounded screen with a microphone",
    "a globe with a paper plane orbiting it",
    "a speech bubble with a crown inside",
    "a magnifying glass over a rising line chart",
    "a video camera on a tripod",
]
PROMPT = (
    "An icon sheet: 12 icons in a perfectly even 4 columns by 3 rows grid, each icon centered in its own cell "
    "with generous empty space around it, nothing touching the cell edges. Background is pure solid black #000000 everywhere, "
    "no texture, no gradient, no cell borders, no labels, no text, no numbers. "
    "Style for every icon, identical across all 12: premium 3D glass-and-metal icon, frosted vivid blue glass (#2863F0) "
    "with brushed silver metal accents, soft inner glow, gentle rim light, rendered like an Apple keynote icon, front view. "
    "Row by row, left to right: " + "; ".join(f"{i+1}. {d}" for i, d in enumerate(ICONS)) + "."
)

def key():
    for line in ENV.read_text().splitlines():
        if line.startswith("KIE_AI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit("no key")

def call(url, k, payload=None):
    req = urllib.request.Request(url, data=json.dumps(payload).encode() if payload else None,
        headers={"Authorization": f"Bearer {k}", "Content-Type": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())

def main():
    k = key()
    res = call("https://api.kie.ai/api/v1/jobs/createTask", k, {"model": "gpt-image-2-text-to-image",
        "input": {"prompt": PROMPT, "aspect_ratio": "4:3", "resolution": "2K"}})
    if res.get("code") != 200:
        sys.exit(res)
    tid = res["data"]["taskId"]; print("task", tid, flush=True)
    while True:
        time.sleep(6)
        d = call("https://api.kie.ai/api/v1/jobs/recordInfo?taskId=" + tid, k)["data"]
        if d["state"] == "success":
            url = json.loads(d["resultJson"])["resultUrls"][0]; break
        if d["state"] == "fail":
            sys.exit(d.get("failMsg"))
    signed = call("https://api.kie.ai/api/v1/common/download-url", k, {"url": url}).get("data") or url
    req = urllib.request.Request(signed, headers={"User-Agent": UA})
    out = HERE / "sheet.png"
    out.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    print("saved", out)

if __name__ == "__main__":
    main()
