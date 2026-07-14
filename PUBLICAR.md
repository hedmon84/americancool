# Cómo publicar el sitio AMERICANCOOL

El sitio es 100% estático (HTML + CSS + JavaScript), así que se puede publicar gratis en varios servicios. La opción más fácil es **Netlify Drop**.

## Opción recomendada: Netlify Drop (gratis, arrastrar y soltar)

1. Abre https://app.netlify.com/drop en tu navegador.
2. Crea una cuenta gratuita (o inicia sesión) — puedes usar tu cuenta de Google.
3. Arrastra la carpeta completa `MundiOferta` desde tu escritorio a la zona que dice "Drag and drop your site output folder here".
4. En menos de un minuto tendrás una dirección como `https://algo-aleatorio.netlify.app` — ¡el sitio ya está en línea!
5. Para cambiar el nombre: en Netlify ve a **Site settings → Change site name** y pon por ejemplo `americancool` → quedará `https://americancool.netlify.app`.

### Dominio propio (ej. www.americancool.hn)

1. Compra el dominio con un registrador (Namecheap, GoDaddy, o un registrador de dominios .hn).
2. En Netlify: **Domain settings → Add custom domain** y sigue las instrucciones (te pedirá apuntar el dominio a Netlify con un registro DNS).
3. Netlify activa el certificado HTTPS automáticamente, sin costo.

## Cosas que puedes editar tú mismo

- **Número de WhatsApp**: abre `js/main.js` y en la línea marcada con ⚠️ cambia `50400000000` por tu número real (código de país + número, solo dígitos). Ejemplo: `50499998888`.
- **Agregar o editar productos**: abre `data/products.json`. Cada producto tiene `sku`, `categoria`, `nombre`, `descripcion` e `imagenes`. Copia un bloque existente, cámbiale los datos y guarda. Las fotos nuevas van en `assets/products/<categoria>/<SKU>/`.
- **Cambiar textos**: los textos de la página principal están en `index.html` y los del catálogo en `catalogo.html`.

Después de cualquier cambio, vuelve a arrastrar la carpeta a Netlify Drop (en **Deploys → Drag and drop**) para actualizar el sitio.

## Probar el sitio en tu computadora

Abre la Terminal y ejecuta:

```
cd ~/Desktop/MundiOferta
python3 -m http.server 8000
```

Luego abre http://localhost:8000 en el navegador. (Ctrl+C en la Terminal para detenerlo.)
