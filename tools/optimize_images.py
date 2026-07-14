#!/usr/bin/env python3
"""Convierte fotos de producto PNG sin transparencia real a JPEG (calidad 82)
y actualiza las rutas en data/products.json. Idempotente."""
import json
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "assets" / "products"
DATA = ROOT / "data" / "products.json"

renamed = {}
for png in sorted(PRODUCTS.rglob("*.png")):
    img = Image.open(png)
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        alpha_min = rgba.getchannel("A").getextrema()[0]
        if alpha_min < 250:  # transparencia real: dejar como PNG
            continue
        img = rgba.convert("RGB")
    else:
        img = img.convert("RGB")
    jpg = png.with_suffix(".jpg")
    img.save(jpg, "JPEG", quality=82, optimize=True, progressive=True)
    if jpg.stat().st_size < png.stat().st_size:
        png.unlink()
        renamed[str(png.relative_to(ROOT))] = str(jpg.relative_to(ROOT))
    else:
        jpg.unlink()

data = json.loads(DATA.read_text())
for p in data["productos"]:
    p["imagenes"] = [renamed.get(i, i) for i in p["imagenes"]]
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

print(f"convertidas a JPEG: {len(renamed)}")
