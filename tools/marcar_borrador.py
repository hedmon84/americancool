#!/usr/bin/env python3
"""Convierte una copia del sitio en el sitio de prueba.

Trabaja sobre la carpeta que se le pasa (normalmente _sitio/), nunca sobre
el repositorio, así que no hay forma de publicar el sitio real con la marca
de borrador puesta.

Hace cuatro cosas:
  - pone un distintivo visible en cada página
  - deja robots.txt en noindex, para que no aparezca en los buscadores
  - agrega la cabecera X-Robots-Tag: noindex, que los buscadores respetan
    aunque nunca lean el robots.txt
  - borra sitemap.xml, que solo tiene sentido en el sitio real

Uso:  python3 tools/marcar_borrador.py _sitio
"""
import pathlib
import sys

TEXTO = "Borrador · sitio de prueba"

DISTINTIVO = f"""
<div style="position:fixed;left:12px;bottom:12px;z-index:9999;
  background:#9a6700;color:#fff;font:600 13px/1.2 system-ui,sans-serif;
  padding:8px 14px;border-radius:20px;box-shadow:0 4px 14px rgba(0,0,0,.25);
  pointer-events:none;" role="status">{TEXTO}</div>
"""

ROBOTS = (
    "# Sitio de prueba: no debe aparecer en los buscadores\n"
    "User-agent: *\n"
    "Disallow: /\n"
)

# Segunda barrera, por si algún buscador llega a una página sin pasar por
# robots.txt. Cloudflare lee este archivo y lo convierte en cabeceras.
CABECERAS = "/*\n  X-Robots-Tag: noindex, nofollow\n"


def main() -> int:
    if len(sys.argv) != 2:
        print("Uso: python3 tools/marcar_borrador.py <carpeta>", file=sys.stderr)
        return 1

    carpeta = pathlib.Path(sys.argv[1])
    if not carpeta.is_dir():
        print(f"ERROR: no existe la carpeta {carpeta}", file=sys.stderr)
        return 1

    (carpeta / "robots.txt").write_text(ROBOTS)
    (carpeta / "_headers").write_text(CABECERAS)
    sitemap = carpeta / "sitemap.xml"
    if sitemap.exists():
        sitemap.unlink()

    marcadas = 0
    for pagina in sorted(carpeta.glob("*.html")):
        texto = pagina.read_text()
        if TEXTO in texto or "</body>" not in texto:
            continue
        pagina.write_text(texto.replace("</body>", DISTINTIVO + "</body>", 1))
        marcadas += 1

    print(f"Borrador: {marcadas} páginas marcadas, robots.txt y _headers en noindex")
    return 0


if __name__ == "__main__":
    sys.exit(main())
