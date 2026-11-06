#!/usr/bin/env python3
"""Generate the ten illustrations on /ubs-agencies with Kie.ai (gpt-image-2).

  python3 scripts/ubs-agencies/generate.py 1 4 7      # these numbers
  python3 scripts/ubs-agencies/generate.py all

Raw PNGs land in scripts/ubs-agencies/raw/ (git-ignored); optimize.py turns
them into the WebP files the page serves from public/ubs-agencies/.
KIE_AI_API_KEY is read from the vault .env. Never more than 4 jobs at once:
Kie answers a bigger fan-out with resets (found 2026-09-04). Results are
fetched through Kie's download-url endpoint, since the raw host is blocked
in the UAE. Prints the credit balance before and after.
"""
import concurrent.futures as cf, json, pathlib, sys, time, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
RAW = HERE / "raw"
ENV = pathlib.Path.home() / "Desktop/Software Projects/dantane/.env"
API = "https://api.kie.ai/api/v1"
UA = "curl/8.7.1"

STYLE = (
    "Premium minimal 3D illustration, a miniature diorama seen from a slight three-quarter angle. "
    "Seamless deep navy background, color #020b18, fading to black at the edges. "
    "All objects and the small featureless rounded figurines are matte silver-white clay. "
    "Exactly one accent color: vivid electric blue #2863f0, which glows softly and lights the scene around it. "
    "Soft studio lighting, gentle shadows, shallow depth of field, clean and uncluttered, lots of empty dark space around the subject. "
    "The subject is centered and fully inside the frame. Wide cinematic 16:9 composition. "
    "Absolutely no text, no letters, no numbers, no logos, no watermarks, no UI. "
    "Scene: "
)

SCENES = {
    1: "A large open silver book lying flat. Its pages rise up and turn into an ascending staircase. A small figurine climbs the stairs toward a small glowing blue flag at the top.",
    2: "A glowing blue moving walkway, like an airport travelator, carries one new small figurine quickly forward toward a team of five figurines waiting at desks at the far end. Behind the new figurine an open door.",
    3: "A glowing blue arched bridge connects two floating platforms. On the left platform a crowd of small figurines walks onto the bridge. On the right platform stands one small tidy office building with its door open.",
    4: "One small silver office building standing on a round pedestal. A large glowing blue wax-seal medal with a simple check mark and two ribbons is attached to its front like an award. Plain unmarked buildings stand dim in the background.",
    5: "One open silver toolbox seen from above at an angle, with neat foam compartments. Inside, each in its own slot: a miniature door, a clipboard with a checklist of plain lines, and a small bar chart sculpture. The bar chart glows blue.",
    6: "A large hand in the foreground offers a glowing blue hammer, handle first, to a group of small figurines who are building a small house with scaffolding. The hand only gives the tool and does not build.",
    7: "One small figurine stands on the roof of a small office building and speaks into a megaphone. Glowing blue concentric sound rings spread out from the megaphone over a crowd of small figurines gathered below, all facing the speaker.",
    8: "Two soft armchairs facing each other with a studio microphone on a stand between them, one figurine seated in each chair, in conversation. Above the seated guest floats a glowing blue ticket with a star shape cut out of it.",
    9: "A small theatre stage with open curtains. On the stage one figurine stands at a microphone under a soft spotlight. Behind the speaker a large glowing blue rising bar chart with an arrow going up. Rows of small figurines sit in the audience, seen from behind.",
    10: "A large billboard on a rooftop at night. The billboard shows a friendly figurine sitting at a laptop and waving. The billboard frame glows blue. Below, a few small figurines on the street look up at it.",
}


def key():
    for line in ENV.read_text().splitlines():
        if line.startswith("KIE_AI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("KIE_AI_API_KEY not found")


def call(url, k, payload=None, timeout=120, tries=1):
    """tries > 1 only for calls that are safe to repeat (reads, signing)."""
    for attempt in range(tries):
        try:
            return _call(url, k, payload, timeout)
        except Exception:  # noqa: BLE001 - a reset mid-poll must not lose a paid task
            if attempt == tries - 1:
                raise
            time.sleep(4)


def _call(url, k, payload=None, timeout=120):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {k}", "Content-Type": "application/json", "User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def balance(k):
    return call(f"{API}/chat/credit", k, tries=5)["data"]


def one(n, k, tag=""):
    res = call(f"{API}/jobs/createTask", k, {
        "model": "gpt-image-2-text-to-image",
        "input": {"prompt": STYLE + SCENES[n], "aspect_ratio": "16:9", "resolution": "2K"},
    })
    if res.get("code") != 200:
        return n, f"createTask failed: {res}"
    task = res["data"]["taskId"]
    return fetch(n, task, k, tag)


def fetch(n, task, k, tag=""):
    """Wait for a created task and save its image. Also the way back in after a
    crash: `generate.py --resume=<n>:<taskId>` costs nothing."""
    print(f"task {n} {task}", flush=True)
    deadline = time.time() + 900
    while time.time() < deadline:
        time.sleep(6)
        data = call(f"{API}/jobs/recordInfo?taskId={task}", k, tries=8).get("data") or {}
        if data.get("state") == "success":
            result = data["resultJson"]
            url = (json.loads(result) if isinstance(result, str) else result)["resultUrls"][0]
            signed = call(f"{API}/common/download-url", k, {"url": url}, tries=5)
            if signed.get("code") == 200 and signed.get("data"):
                url = signed["data"]
            dest = RAW / f"{n:02d}{tag}.png"
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r:
                dest.write_bytes(r.read())
            return n, str(dest)
        if data.get("state") == "fail":
            return n, f"failed: {data.get('failMsg')}"
    return n, "timed out"


def main():
    args = sys.argv[1:]
    tag = ""
    if args and args[0].startswith("--tag="):
        tag = args.pop(0).split("=", 1)[1]
    RAW.mkdir(exist_ok=True)
    k = key()
    if args and args[0].startswith("--resume="):
        n, task = args[0].split("=", 1)[1].split(":")
        print(fetch(int(n), task, k, tag))
        return
    nums = sorted(SCENES) if args == ["all"] else [int(a) for a in args]
    if not nums:
        sys.exit(__doc__)
    before = balance(k)
    print("credits before", before)
    with cf.ThreadPoolExecutor(4) as ex:
        for n, out in ex.map(lambda n: one(n, k, tag), nums):
            print(n, out)
    after = balance(k)
    print("credits after", after, "spent", round(before - after, 2))


if __name__ == "__main__":
    main()
