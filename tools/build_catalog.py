#!/usr/bin/env python3
"""Arma el sitio a partir de las fichas del CMS.

Con data/categorias.json + data/productos/<categoria>/*.json genera:

  data/products.json   el catálogo que carga el sitio
  <slug>.html          una página propia por producto (título, descripción
                       y foto propios para Google y para WhatsApp)
  sitemap.xml          el mapa del sitio para los buscadores

La carpeta manda: un producto guardado en data/productos/congeladores/
queda en la categoría "congeladores". Por eso en el CMS la categoría se
elige entrando a su carpeta, no con un campo del formulario.

Antes de escribir nada revisa las fichas. Lo que rompe el sitio (SKU
repetido, ficha sin categoría, archivo dañado) frena la publicación y deja
en línea la última versión buena. Lo que solo se ve feo (una foto que no
existe o que pesa de más) sale como aviso y se publica igual.

Se ejecuta solo en GitHub Actions cada vez que el CMS guarda un cambio.
Para correrlo a mano:  python3 tools/build_catalog.py
"""
import html
import json
import os
import pathlib
import re
import sys
import unicodedata

# "produccion" (el sitio real) o "borrador" (el sitio de prueba). El sitio
# de prueba se marca con un distintivo en pantalla y se le pide a Google que
# no lo indexe. Se define con la variable de entorno ENTORNO en el panel del
# servicio que publica el borrador; corriendo el script a mano no cambia nada.
ENTORNO = os.environ.get("ENTORNO", "produccion")
ES_BORRADOR = ENTORNO != "produccion"

# ⚠️ CAMBIAR AQUÍ al montar el dominio propio: https://americancool.hn
# Se usa para las direcciones absolutas que piden WhatsApp, Facebook y
# Google (vista previa al compartir y mapa del sitio).
SITIO = "https://hedmon84.github.io/americancool"

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FICHAS = RAIZ / "data" / "productos"
CATEGORIAS = RAIZ / "data" / "categorias.json"
SALIDA = RAIZ / "data" / "products.json"
PLANTILLA = RAIZ / "producto.html"
SITEMAP = RAIZ / "sitemap.xml"

CAMPOS = ["sku", "categoria", "nombre", "descripcion", "imagenes", "detalle", "url"]

# Páginas fijas del sitio: ningún producto puede quedarse con estos nombres
RESERVADOS = {"index", "catalogo", "nosotros", "producto", "donde-comprar", "404"}

# Páginas fijas para el mapa del sitio, con su prioridad
PAGINAS_FIJAS = [
    ("index.html", "1.0"),
    ("catalogo.html", "0.9"),
    ("donde-comprar.html", "0.7"),
    ("nosotros.html", "0.6"),
]

FOTO_POR_DEFECTO = "assets/banners/variado-600x300.png"
PESO_MAXIMO_FOTO = 900_000  # bytes; arriba de esto la página carga lenta

MARCA_GENERADA = "<!-- META:INICIO — generado por tools/build_catalog.py -->"


def slug(texto: str) -> str:
    """'Aire Acondicionado 18,000 BTU' -> 'aire-acondicionado-18-000-btu'"""
    sin_tildes = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    limpio = re.sub(r"[^a-z0-9]+", "-", sin_tildes.lower()).strip("-")
    return limpio or "producto"


def leer_fichas(ids_validos):
    """Devuelve (productos, errores, avisos). Solo los errores frenan."""
    productos, errores, avisos = [], [], []

    for ruta in sorted(FICHAS.rglob("*.json")):
        relativa = ruta.relative_to(FICHAS)
        try:
            p = json.loads(ruta.read_text())
        except json.JSONDecodeError as e:
            errores.append(f"{relativa}: el archivo está dañado ({e})")
            continue

        # Los espacios de sobra al inicio o al final se ven feos en el sitio
        p["sku"] = str(p.get("sku") or ruta.stem).strip()
        p["nombre"] = str(p.get("nombre") or "").strip() or p["sku"]
        p["descripcion"] = str(p.get("descripcion") or "").strip()
        p["imagenes"] = [i.strip() for i in (p.get("imagenes") or []) if i and i.strip()]
        p.setdefault("detalle", {})

        # La categoría sale de la carpeta; si la ficha quedó suelta en
        # data/productos/, se respeta el campo que traiga adentro.
        carpeta = ruta.parent.name
        p["categoria"] = carpeta if carpeta in ids_validos else str(p.get("categoria") or "")

        if not p["sku"]:
            errores.append(f"{relativa}: la ficha no tiene código (SKU)")
        if p["categoria"] not in ids_validos:
            errores.append(
                f"{relativa}: no está dentro de una carpeta de categoría "
                f"({', '.join(sorted(ids_validos))})"
            )

        for foto in p["imagenes"]:
            archivo = RAIZ / foto
            if not archivo.exists():
                avisos.append(f"{relativa}: la foto {foto} no existe")
            elif archivo.stat().st_size > PESO_MAXIMO_FOTO:
                avisos.append(
                    f"{relativa}: la foto {foto} pesa "
                    f"{archivo.stat().st_size // 1000} KB; el máximo son "
                    f"{PESO_MAXIMO_FOTO // 1000} KB (corré tools/optimize_images.py)"
                )

        productos.append(p)

    skus = [p["sku"] for p in productos]
    for repetido in sorted({s for s in skus if s and skus.count(s) > 1}):
        errores.append(f"el código (SKU) {repetido} está en más de una ficha")

    return productos, errores, avisos


def asignar_urls(productos):
    """Cada producto recibe su propia página: nombre-del-producto.html"""
    usados = set(RESERVADOS)
    for p in productos:
        base = slug(p["nombre"])
        if base in usados:
            base = f"{base}-{slug(p['sku'])}"
        while base in usados:
            base += "-x"
        usados.add(base)
        p["url"] = f"{base}.html"


def bloque_meta(p, categorias):
    """El <head> propio de la página de un producto."""
    nombre_cat = next(
        (c["nombre"] for c in categorias if c["id"] == p["categoria"]), p["categoria"]
    )
    titulo = f"{p['nombre']} — AMERICANCOOL"
    descripcion = (
        p["descripcion"]
        or f"{p['nombre']}: {nombre_cat} AMERICANCOOL. "
           "Escríbenos por WhatsApp para más información."
    )
    foto = p["imagenes"][0] if p["imagenes"] else FOTO_POR_DEFECTO
    e = html.escape

    ficha = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p["nombre"],
        "sku": p["sku"],
        "category": nombre_cat,
        "brand": {"@type": "Brand", "name": "AMERICANCOOL"},
        "image": [f"{SITIO}/{f}" for f in (p["imagenes"] or [FOTO_POR_DEFECTO])],
        "url": f"{SITIO}/{p['url']}",
    }
    detalle_largo = (p.get("detalle") or {}).get("descripcion")
    if detalle_largo or p["descripcion"]:
        ficha["description"] = detalle_largo or p["descripcion"]

    return "\n".join([
        "  " + MARCA_GENERADA,
        f"  <title>{e(titulo)}</title>",
        f'  <meta name="description" content="{e(descripcion)}">',
        f'  <link rel="canonical" href="{SITIO}/{p["url"]}">',
        f'  <meta property="og:title" content="{e(titulo)}">',
        f'  <meta property="og:description" content="{e(descripcion)}">',
        f'  <meta property="og:image" content="{SITIO}/{e(foto)}">',
        f'  <meta property="og:url" content="{SITIO}/{p["url"]}">',
        '  <meta property="og:type" content="product">',
        '  <meta name="twitter:card" content="summary_large_image">',
        '  <script type="application/ld+json">',
        "  " + json.dumps(ficha, ensure_ascii=False),
        "  </script>",
        "  <!-- META:FIN -->",
    ])


def generar_paginas(productos, categorias):
    """Escribe una página por producto y borra las que sobraron."""
    plantilla = PLANTILLA.read_text()
    if "  <!-- META:INICIO" not in plantilla or "<body>" not in plantilla:
        print("ERROR: producto.html perdió las marcas META o el <body>", file=sys.stderr)
        return False

    inicio = plantilla.index("  <!-- META:INICIO")
    fin = plantilla.index("<!-- META:FIN -->") + len("<!-- META:FIN -->")
    cabeza, cola = plantilla[:inicio], plantilla[fin:]

    vigentes = set()
    for p in productos:
        cuerpo = cola.replace(
            "<body>", f'<body data-sku="{html.escape(p["sku"], quote=True)}">', 1
        )
        (RAIZ / p["url"]).write_text(cabeza + bloque_meta(p, categorias) + cuerpo)
        vigentes.add(p["url"])

    # Un producto borrado en el CMS no debe dejar su página colgando
    for archivo in sorted(RAIZ.glob("*.html")):
        if archivo.name not in vigentes and MARCA_GENERADA in archivo.read_text():
            archivo.unlink()
            print(f"  página eliminada: {archivo.name}")

    return True


def generar_sitemap(productos):
    paginas = list(PAGINAS_FIJAS) + [(p["url"], "0.8") for p in productos]

    lineas = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for pagina, prioridad in paginas:
        lineas += ["  <url>",
                   f"    <loc>{html.escape(f'{SITIO}/{pagina}')}</loc>",
                   f"    <priority>{prioridad}</priority>",
                   "  </url>"]
    lineas.append("</urlset>")
    SITEMAP.write_text("\n".join(lineas) + "\n")


DISTINTIVO = """
<div style="position:fixed;left:12px;bottom:12px;z-index:9999;
  background:#9a6700;color:#fff;font:600 13px/1.2 system-ui,sans-serif;
  padding:8px 14px;border-radius:20px;box-shadow:0 4px 14px rgba(0,0,0,.25);
  pointer-events:none;" role="status">Borrador · sitio de prueba</div>
"""


def marcar_borrador():
    """Deja claro que este NO es el sitio real y lo esconde de Google.

    Toca archivos del repositorio, así que solo corre en el servidor que
    publica el borrador, sobre una copia recién descargada.
    """
    (RAIZ / "robots.txt").write_text(
        "# Sitio de prueba: no debe aparecer en los buscadores\n"
        "User-agent: *\nDisallow: /\n"
    )
    if SITEMAP.exists():
        SITEMAP.unlink()

    marcadas = 0
    for pagina in sorted(RAIZ.glob("*.html")):
        texto = pagina.read_text()
        if "Borrador · sitio de prueba" in texto or "</body>" not in texto:
            continue
        pagina.write_text(texto.replace("</body>", DISTINTIVO + "</body>", 1))
        marcadas += 1
    print(f"Modo borrador: {marcadas} páginas marcadas y robots.txt en noindex")


def main() -> int:
    if not CATEGORIAS.exists():
        print(f"ERROR: falta {CATEGORIAS}", file=sys.stderr)
        return 1

    categorias = json.loads(CATEGORIAS.read_text())["categorias"]
    orden_cat = {c["id"]: i for i, c in enumerate(categorias)}

    productos, errores, avisos = leer_fichas(set(orden_cat))

    if errores:
        print("No se publicó nada. Hay que corregir esto:", file=sys.stderr)
        for e in errores:
            print(f"  - {e}", file=sys.stderr)
        return 1

    # mismo orden que muestra el sitio: por categoría y luego por SKU
    productos.sort(key=lambda p: (orden_cat.get(p["categoria"], 99), p["sku"]))
    asignar_urls(productos)

    if not generar_paginas(productos, categorias):
        return 1
    generar_sitemap(productos)

    SALIDA.write_text(
        json.dumps(
            {"categorias": categorias,
             "productos": [{k: p[k] for k in CAMPOS if k in p} for p in productos]},
            ensure_ascii=False, indent=2,
        ) + "\n"
    )

    if ES_BORRADOR:
        marcar_borrador()

    print(f"{len(productos)} productos y {len(categorias)} categorías -> {SALIDA.name}")
    print(f"{len(productos)} páginas de producto y sitemap.xml actualizados")
    if avisos:
        print("\nAvisos (se publicó igual, pero conviene revisarlos):")
        for a in avisos:
            print(f"  - {a}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
