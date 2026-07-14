#!/usr/bin/env python3
"""Regenera data/products.json a partir de las carpetas de assets/products
y de las especificaciones extraídas de las fichas de marketing."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "assets" / "products"
DATA = ROOT / "data" / "products.json"

CATEGORIAS = [
    {"id": "aires", "nombre": "Aires Acondicionados",
     "descripcion": "Equipos split de 12,000 a 24,000 BTU con gas ecológico R410 y eficiencia SEER 13."},
    {"id": "refrigeradores", "nombre": "Refrigeradores",
     "descripcion": "Refrigeradores side by side sin escarcha, con dispensador de agua."},
    {"id": "congeladores", "nombre": "Congeladores",
     "descripcion": "Congeladores horizontales de 10 a 26 pies, de una y dos puertas, doble y triple función."},
    {"id": "estufas", "nombre": "Estufas",
     "descripcion": "Estufas de gas de 30\" con 6 quemadores de hierro colado y superficie de acero inoxidable."},
    {"id": "vitrinas", "nombre": "Vitrinas",
     "descripcion": "Vitrinas refrigerantes de 10 a 40 pies para comercios, con luz LED y termómetro."},
]

INFO = {
    "L02A00132": ("Aire Acondicionado Split 18,000 BTU", "Gas R410 · SEER 13. Dimensiones: 29 × 85 × 19 cm."),
    "L02A00134": ("Aire Acondicionado Split 24,000 BTU", "Gas R410 · SEER 13. Dimensiones: 30.5 × 95 × 22 cm."),
    "L02A00136": ("Aire Acondicionado Split 12,000 BTU", "Gas R410 · SEER 13. Dimensiones: 28 × 79.5 × 17.5 cm."),
    "L02R00411": ("Refrigerador Side by Side 16 Pies", "Modelo ARSS1530SS. 2 puertas, sin escarcha, con dispensador de agua."),
    "L02FR00123": ("Congelador 26 Pies · 2 Puertas", "Triple función. Dimensiones: 85 × 194 × 75 cm."),
    "L02FR00314": ("Congelador 18 Pies · 2 Puertas", "Doble función."),
    "L02FR00315": ("Congelador 21 Pies · 2 Puertas", "Triple función. Dimensiones: 80 × 179 × 68 cm."),
    "L02FR00316": ("Congelador 12 Pies · 1 Puerta", "Doble función."),
    "L02FR00317": ("Congelador 15 Pies · 2 Puertas", "Triple función."),
    "L02FR00938": ("Congelador 10.3 Pies · Puertas de Vidrio", "Doble función, puertas corredizas de vidrio."),
    "L02FR00939": ("Congelador 12 Pies · Puertas de Vidrio", "Doble función, puertas corredizas de vidrio."),
    "L02E00322": ("Estufa de Gas 30\" · 6 Quemadores (Negra)", "Quemadores de hierro colado, superficie de acero inoxidable, luz y chispero. Dimensiones: 92 × 51 × 58 cm."),
    "L02E00323": ("Estufa de Gas 30\" · 6 Quemadores (Inoxidable)", "Quemadores de hierro colado, superficie de acero inoxidable, luz y chispero. Dimensiones: 92 × 51 × 58 cm."),
    "L02FR00102": ("Vitrina Refrigerante 12 Pies · 1 Puerta", "Luz LED e indicador de temperatura. Dimensiones: 199 × 61 × 59 cm."),
    "L02FR00326": ("Vitrina Refrigerante 25 Pies · 2 Puertas", "Termómetro, enfría hasta 0 °C. Dimensiones: 194 × 99 × 56 cm."),
    "L02FR00327": ("Vitrina Refrigerante 35 Pies · 2 Puertas", "Termómetro, enfría hasta 0 °C. Dimensiones: 196 × 119 × 57.5 cm."),
    "L02FR00328": ("Vitrina Refrigerante 40 Pies · 3 Puertas", "Termómetro y luz LED. Dimensiones: 202 × 150 × 55 cm."),
    "L02FR00329": ("Vitrina Refrigerante 10 Pies · 1 Puerta", "Luz LED. Dimensiones: 173 × 60 × 59 cm."),
    "L02FR00934": ("Vitrina Refrigerante 10 Pies · 1 Puerta", "Luz LED, enfría hasta 0 °C. Dimensiones: 177 × 57.5 × 50.5 cm."),
    "L02FR00941": ("Vitrina Refrigerante 20 Pies · 2 Puertas", "Luz LED y termómetro. Dimensiones: 194 × 78 × 57 cm."),
}

ORDEN_CATEGORIA = {c["id"]: i for i, c in enumerate(CATEGORIAS)}

productos = []
for cat_dir in sorted(PRODUCTS.iterdir()):
    if not cat_dir.is_dir():
        continue
    for sku_dir in sorted(cat_dir.iterdir()):
        if not sku_dir.is_dir():
            continue
        archivos = sorted(f for f in sku_dir.iterdir() if f.suffix.lower() in (".png", ".jpg"))
        # solo fotos de producto; las fichas promocionales con precio (main) se
        # excluyen porque el sitio es informativo
        numeradas = [f for f in archivos if f.stem != "main"]
        imagenes = [str(f.relative_to(ROOT)) for f in numeradas]
        sku = sku_dir.name
        nombre, descripcion = INFO.get(sku, (f"{cat_dir.name.title()} {sku}", ""))
        productos.append({
            "sku": sku,
            "categoria": cat_dir.name,
            "nombre": nombre,
            "descripcion": descripcion,
            "imagenes": imagenes,
        })

productos.sort(key=lambda p: (ORDEN_CATEGORIA.get(p["categoria"], 99), p["sku"]))
DATA.write_text(json.dumps({"categorias": CATEGORIAS, "productos": productos}, ensure_ascii=False, indent=2) + "\n")
print(f"{len(productos)} productos escritos")
