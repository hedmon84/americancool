#!/usr/bin/env python3
"""Une data/categorias.json + data/productos/<categoria>/*.json en
data/products.json, que es el archivo que carga el sitio.

La carpeta manda: un producto guardado en data/productos/congeladores/
queda en la categoría "congeladores". Por eso en el CMS la categoría se
elige entrando a su carpeta, no con un campo del formulario.

Se ejecuta solo en GitHub Actions cada vez que el CMS guarda un cambio.
Para correrlo a mano:  python3 tools/build_catalog.py
"""
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FICHAS = RAIZ / "data" / "productos"
CATEGORIAS = RAIZ / "data" / "categorias.json"
SALIDA = RAIZ / "data" / "products.json"

CAMPOS = ["sku", "categoria", "nombre", "descripcion", "imagenes", "detalle"]


def main() -> int:
    if not CATEGORIAS.exists():
        print(f"ERROR: falta {CATEGORIAS}", file=sys.stderr)
        return 1

    categorias = json.loads(CATEGORIAS.read_text())["categorias"]
    orden_cat = {c["id"]: i for i, c in enumerate(categorias)}
    ids_validos = set(orden_cat)

    productos, avisos = [], []
    for ruta in sorted(FICHAS.rglob("*.json")):
        p = json.loads(ruta.read_text())
        sku = p.get("sku") or ruta.stem
        p["sku"] = sku
        p.setdefault("nombre", sku)
        p.setdefault("descripcion", "")
        p["imagenes"] = [i for i in (p.get("imagenes") or []) if i]
        p.setdefault("detalle", {})

        # La categoría sale de la carpeta; si la ficha quedó suelta en
        # data/productos/, se respeta el campo que traiga adentro.
        carpeta = ruta.parent.name
        p["categoria"] = carpeta if carpeta in ids_validos else p.get("categoria", "")

        if p["categoria"] not in ids_validos:
            avisos.append(
                f"  {ruta.relative_to(FICHAS)}: sin categoría válida; "
                f"movela a una carpeta ({', '.join(sorted(ids_validos))})"
            )

        productos.append({k: p[k] for k in CAMPOS if k in p})

    # mismo orden que muestra el sitio: por categoría y luego por SKU
    productos.sort(key=lambda p: (orden_cat.get(p["categoria"], 99), p["sku"]))

    skus = [p["sku"] for p in productos]
    repetidos = {s for s in skus if skus.count(s) > 1}
    if repetidos:
        print(f"ERROR: SKU repetido: {', '.join(sorted(repetidos))}", file=sys.stderr)
        return 1

    SALIDA.write_text(
        json.dumps({"categorias": categorias, "productos": productos},
                   ensure_ascii=False, indent=2) + "\n"
    )

    print(f"{len(productos)} productos y {len(categorias)} categorías -> {SALIDA.name}")
    if avisos:
        print("Avisos:", *avisos, sep="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
