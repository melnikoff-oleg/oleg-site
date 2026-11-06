#!/usr/bin/env python3
"""Turn scripts/ubs-agencies/raw/NN.png into public/ubs-agencies/NN.webp
(1600 x 900, the size /ubs-agencies serves through next/image).
Needs cwebp (brew install webp). Run after generate.py."""
import pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "public" / "ubs-agencies"
OUT.mkdir(parents=True, exist_ok=True)
for n in range(1, 11):
    src = HERE / "raw" / f"{n:02d}.png"
    if not src.exists():
        sys.exit(f"missing {src}")
    dest = OUT / f"{n:02d}.webp"
    subprocess.run(["cwebp", "-quiet", "-q", "82", "-resize", "1600", "900", str(src), "-o", str(dest)], check=True)
    print(dest.name, dest.stat().st_size // 1024, "KB")
