#!/usr/bin/env bash
# Prepara el sitio de prueba (borrador) en la carpeta _sitio/.
#
# Es lo que corre Cloudflare Pages en cada cambio de la rama borrador:
#   Build command:      bash tools/build_borrador.sh
#   Output directory:   _sitio
#
# El repositorio no se modifica: la marca de borrador se aplica solo sobre
# la copia que queda en _sitio/.
#
# Para verlo en la computadora:
#   bash tools/build_borrador.sh && (cd _sitio && python3 -m http.server 8000)
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. El mismo build del sitio real (con las mismas validaciones)
python3 tools/build_catalog.py

# 2. Copiar a _sitio solo lo que el visitante necesita: nada de scripts,
#    fichas del CMS ni documentación
rm -rf _sitio
mkdir -p _sitio/data
cp ./*.html _sitio/
cp robots.txt sitemap.xml _sitio/
cp -R css js assets _sitio/
cp data/products.json data/banners.json _sitio/data/

# 3. Marcar esa copia como borrador
python3 tools/marcar_borrador.py _sitio

echo "_sitio listo: $(find _sitio -type f | wc -l | tr -d ' ') archivos, $(du -sh _sitio | cut -f1)"
