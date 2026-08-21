# Cómo se publica el sitio AMERICANCOOL

El sitio es 100 % estático (HTML + CSS + JavaScript): no hay servidor que mantener ni base de datos que respaldar.

## Cómo se publica hoy

**No hay que hacer nada a mano.** Cada cambio guardado en el panel del CMS —o cualquier cambio en el repositorio— dispara la publicación:

1. GitHub ejecuta `tools/build_catalog.py`, que revisa las fichas y genera el catálogo, la página de cada producto y el mapa del sitio.
2. Si algo está mal (SKU repetido, ficha fuera de las carpetas de categoría, archivo dañado), **no publica nada**: el sitio se queda con la última versión buena y llega un correo con el error.
3. Si todo está bien, guarda lo generado y GitHub Pages actualiza el sitio.

Dirección actual: **https://hedmon84.github.io/americancool/**

El sitio se ve actualizado en unos dos minutos. Puede tardar unos minutos más porque las páginas quedan guardadas en la red de GitHub; con `Cmd+Shift+R` (Mac) o `Ctrl+F5` (Windows) se ve al instante.

> El envío por FTP a un hosting propio también está preparado en el flujo de publicación, pero **apagado**. Se enciende creando la variable `FTP_ACTIVO` con el valor `si` en Settings > Secrets and variables > Actions, junto con los secretos `FTP_SERVIDOR`, `FTP_USUARIO` y `FTP_CLAVE`. Conviene tener **un solo hosting activo**: dos copias del mismo sitio con el mismo dominio terminan mostrando versiones distintas.

## Sitio de prueba (rama borrador)

El sitio de prueba vive en **Cloudflare Pages**, conectado al mismo repositorio pero a la rama `borrador`. El sitio real no se entera de nada de lo que pase ahí.

### Cómo se conecta (una sola vez)

1. Entrar a https://dash.cloudflare.com con la cuenta de la empresa → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Autorizar GitHub y elegir el repositorio `americancool`.
3. Llenar la configuración con estos valores exactos:

| Campo | Valor |
|---|---|
| Project name | `americancool-borrador` |
| Production branch | `borrador` |
| Framework preset | None |
| Build command | `bash tools/build_borrador.sh` |
| Build output directory | `_sitio` |

4. **Save and Deploy**. En un par de minutos queda en `https://americancool-borrador.pages.dev`.

Cloudflare trae Python incluido en su imagen de compilación, así que no hay que configurar nada más.

> Por defecto Cloudflare compila **todas** las ramas, así que `main` también quedaría con una dirección de vista previa. Si no se quiere, en **Settings > Builds & deployments > Branch control** dejar solo `borrador`.
>
> Para que el borrador no sea público: **Settings > Access policy**, que pide correo y código para entrar (gratis hasta 50 personas).

### Qué hace `tools/build_borrador.sh`

Corre el mismo build del sitio real —con las mismas validaciones—, copia a `_sitio/` solo lo que el visitante necesita (nada de `tools/`, fichas del CMS ni documentación) y sobre esa copia aplica la marca de borrador: el distintivo naranja en pantalla y el `robots.txt` en `Disallow`. **El repositorio nunca se modifica**, así que no hay forma de publicar el sitio real con la marca puesta.

Para verlo en la computadora:

```
bash tools/build_borrador.sh
cd _sitio && python3 -m http.server 8000
```

### Cómo se pasa a producción

Pestaña **Actions** del repositorio → **"Pasar el borrador a producción"** → **Run workflow**. Une `borrador` con `main`, publica el sitio real y deja las dos ramas iguales.

## Qué se edita desde el panel y qué no

Desde **https://app.pagescms.org** (ver `CMS.md`): productos, banners del inicio y categorías.

Desde el código, pidiendo el cambio: los textos de las páginas, las direcciones de las tiendas, el mapa y el número de WhatsApp (`js/main.js`, línea marcada con ⚠️).

**Nunca edites a mano** `data/products.json`, `sitemap.xml` ni las páginas `.html` de producto: se regeneran solas en cada publicación y el cambio se pierde.

## Al montar el dominio propio (americancool.hn)

El dominio se registra **a nombre del cliente** (los datos del titular de un `.hn` son públicos, así que van los datos comerciales de la empresa).

En el DNS del dominio:

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153` |
| AAAA | @ | `2606:50c0:8000::153` · `2606:50c0:8001::153` · `2606:50c0:8002::153` · `2606:50c0:8003::153` |
| CNAME | www | `hedmon84.github.io` |

Después, en el repositorio: **Settings > Pages > Custom domain**, verificar el dominio y activar *Enforce HTTPS* (el certificado es gratis y se renueva solo). La propagación del DNS puede tardar hasta 24 horas, así que este paso no se deja para el mismo día de la entrega.

Y hay que cambiar la dirección base en **dos lugares del código**:

1. `tools/build_catalog.py`, constante `SITIO` (marcada con ⚠️). De ahí salen las direcciones de las vistas previas de WhatsApp y Facebook y las del mapa del sitio.
2. `robots.txt`, la línea `Sitemap:`.

Con volver a publicar cualquier cambio, las páginas de producto se regeneran con la dirección nueva.

El correo `@americancool.hn` no lo da GitHub Pages: se contrata aparte (Google Workspace o Zoho) agregando los registros MX del dominio.

## Probar el sitio en la computadora

```
cd ~/Desktop/MundiOferta
python3 tools/build_catalog.py     # regenera catálogo, páginas y sitemap
python3 -m http.server 8000
```

Luego abrir http://localhost:8000 en el navegador (Ctrl+C en la Terminal para detenerlo).
