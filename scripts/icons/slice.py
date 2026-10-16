#!/usr/bin/env python3
"""Cut sheet.png (4x3 grid on black) into 12 transparent webp icons in public/icons/.
Black is keyed to alpha (alpha = brightest channel), colour is un-premultiplied so
the glass keeps its blue, then each icon is trimmed, centred on a square and saved at 192px."""
import pathlib
from PIL import Image
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "public" / "icons"
NAMES = ["collect", "score", "understand", "create", "math", "trading",
         "building", "media", "life", "boldane", "ubersuggest", "youtube"]

sheet = np.asarray(Image.open(HERE / "sheet.png").convert("RGB")).astype(np.float32) / 255
h, w, _ = sheet.shape
OUT.mkdir(parents=True, exist_ok=True)
for i, name in enumerate(NAMES):
    r, c = divmod(i, 4)
    cell = sheet[r*h//3:(r+1)*h//3, c*w//4:(c+1)*w//4]
    a = cell.max(axis=2)
    a = np.clip((a - 0.04) / 0.96, 0, 1)          # floor the near-black noise
    rgb = np.where(a[..., None] > 0, cell / np.maximum(cell.max(axis=2, keepdims=True), 1e-6), 0)
    img = Image.fromarray(np.dstack([rgb, a]).__mul__(255).astype(np.uint8), "RGBA")
    bbox = img.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    img = img.crop(bbox)
    side = int(max(img.size) * 1.08)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    sq.resize((192, 192), Image.LANCZOS).save(OUT / f"{name}.webp", quality=90, method=6)
print("wrote", len(NAMES), "icons to", OUT)
