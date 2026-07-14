#!/bin/bash
# Descarga los assets de AMERICANCOOL desde Google Drive (requiere que la
# carpeta esté compartida como "Cualquier persona con el enlace").
# Uso: bash tools/download_assets.sh [max_espera_segundos]
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$ROOT/tools/manifest.tsv"
ASSETS="$ROOT/assets"
TESTID="1B38h94QG0GVlwjVxUKdaw6AalsyB2bJZ"
MAXWAIT="${1:-420}"

fetch() { # $1=fileId $2=outfile
  curl -sL --max-time 120 "https://drive.usercontent.google.com/download?id=$1&export=download" -o "$2"
}

is_image() { # magic-byte check: PNG or JPEG
  local sig
  sig=$(xxd -p -l 4 "$1" 2>/dev/null)
  [[ "$sig" == "89504e47" || "$sig" == ffd8ff* ]]
}

# 1. Esperar a que la carpeta sea accesible
waited=0
while true; do
  fetch "$TESTID" "$ASSETS/.access_test"
  if is_image "$ASSETS/.access_test"; then
    rm -f "$ASSETS/.access_test"
    echo "ACCESS_OK tras ${waited}s"
    break
  fi
  rm -f "$ASSETS/.access_test"
  if (( waited >= MAXWAIT )); then
    echo "ACCESS_TIMEOUT: la carpeta de Drive aún no es pública tras ${waited}s"
    exit 2
  fi
  sleep 30; waited=$((waited+30))
done

# 2. Descargar todo el manifiesto (idempotente: salta archivos ya válidos)
ok=0; fail=0; skipped=0
while IFS=$'\t' read -r id rel; do
  [[ -z "$id" ]] && continue
  out="$ASSETS/$rel"
  if [[ -s "$out" ]] && is_image "$out"; then skipped=$((skipped+1)); continue; fi
  mkdir -p "$(dirname "$out")"
  fetch "$id" "$out"
  if is_image "$out"; then
    ok=$((ok+1))
  else
    echo "FALLO: $rel (id=$id)"
    rm -f "$out"; fail=$((fail+1))
  fi
done < "$MANIFEST"
echo "Descarga: $ok nuevos, $skipped ya existentes, $fail fallidos"

# 3. Optimizar: fotos de producto a máx 1000 px por lado
find "$ASSETS/products" -type f \( -name '*.png' -o -name '*.jpg' \) | while read -r f; do
  w=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" 2>/dev/null | awk '/pixelHeight/{print $2}')
  if [[ -n "$w" && -n "$h" ]] && (( w > 1000 || h > 1000 )); then
    sips --resampleHeightWidthMax 1000 "$f" >/dev/null 2>&1
  fi
done
echo "Optimización completada"
du -sh "$ASSETS" 2>/dev/null
exit $(( fail > 0 ? 1 : 0 ))
