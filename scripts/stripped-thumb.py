#!/usr/bin/env python3
"""Print a ~1 KB inline data URL of an image, shrunk to 32 px wide: the Telegram
"stripped thumbnail" a component paints (CSS-blurred) before the real file loads.
Usage: python3 scripts/stripped-thumb.py public/preview-poster.jpg"""
import base64, io, sys
from PIL import Image

im = Image.open(sys.argv[1]).convert("RGB")
w = 32
im = im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
buf = io.BytesIO()
im.save(buf, "JPEG", quality=50)
print("data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode())
