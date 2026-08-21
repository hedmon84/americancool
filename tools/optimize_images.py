#!/usr/bin/env python3
"""Deja las fotos de producto livianas para la web.

Hace dos cosas, y solo cuando hacen falta (se puede correr las veces que sea):

  1. Achica a 1600 px de lado mayor las fotos más grandes que eso.
  2. Convierte los PNG a JPEG, apoyando la foto sobre fondo blanco.

Lo del fondo blanco no se nota: en el sitio las fotos de producto siempre
van sobre blanco (la tarjeta del catálogo, la galería del detalle, las
miniaturas y el visor).

Después actualiza las rutas en las fichas de data/productos/.

Uso:  python3 tools/optimize_images.py
"""
import json
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "assets" / "products"
FICHAS = ROOT / "data" / "productos"

LADO_MAXIMO = 1600      # px
PESO_MAXIMO = 900_000   # bytes: el mismo límite que revisa build_catalog.py
CALIDAD = 82


def guardar_jpeg(img, destino):
    img.save(destino, "JPEG", quality=CALIDAD, optimize=True, progressive=True)


def achicar(img):
    """Devuelve (imagen, se_achico)."""
    if max(img.size) <= LADO_MAXIMO:
        return img, False
    img.thumbnail((LADO_MAXIMO, LADO_MAXIMO), Image.LANCZOS)
    return img, True


renombradas = {}
achicadas = convertidas = 0

for foto in sorted(list(PRODUCTS.rglob("*.png")) + list(PRODUCTS.rglob("*.jpg"))):
    img = Image.open(foto)
    es_png = foto.suffix.lower() == ".png"

    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        fondo = Image.new("RGB", rgba.size, (255, 255, 255))
        fondo.paste(rgba, mask=rgba.getchannel("A"))
        img = fondo
    else:
        img = img.convert("RGB")

    img, se_achico = achicar(img)
    pesa_mucho = foto.stat().st_size > PESO_MAXIMO

    if not es_png and not se_achico and not pesa_mucho:
        continue  # JPEG ya liviano: no se vuelve a comprimir

    destino = foto.with_suffix(".jpg")
    guardar_jpeg(img, destino)

    if es_png:
        if destino.stat().st_size < foto.stat().st_size:
            foto.unlink()
            renombradas[str(foto.relative_to(ROOT))] = str(destino.relative_to(ROOT))
            convertidas += 1
        else:
            destino.unlink()
    else:
        achicadas += 1

for ficha in FICHAS.rglob("*.json"):
    d = json.loads(ficha.read_text())
    nuevas = [renombradas.get(i, i) for i in d.get("imagenes", [])]
    if nuevas != d.get("imagenes"):
        d["imagenes"] = nuevas
        ficha.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")

pesadas = [f for f in PRODUCTS.rglob("*") if f.is_file() and f.stat().st_size > PESO_MAXIMO]
print(f"convertidas a JPEG: {convertidas} · achicadas o recomprimidas: {achicadas}")
print(f"fotos que siguen arriba de {PESO_MAXIMO // 1000} KB: {len(pesadas)}")
for f in pesadas:
    print(f"  {f.relative_to(ROOT)} ({f.stat().st_size // 1000} KB)")
