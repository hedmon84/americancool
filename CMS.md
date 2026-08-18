# Panel de administración (CMS)

El sitio ahora se puede editar desde un panel visual, sin tocar código. Se usa **Pages CMS**: es gratuito, no hay que instalar nada y los cambios se publican solos.

## Cómo entrar la primera vez

1. Abre **https://app.pagescms.org** e inicia sesión con tu cuenta de GitHub (la de `hedmon84`).
2. Autoriza a Pages CMS el acceso al repositorio **americancool**. Puedes darle acceso *solo* a ese repositorio.
3. Al entrar verás el repositorio en la lista. Ábrelo y aparecerá la sección **Productos**.

Guárdate esa dirección en favoritos: es tu panel de administración de ahora en adelante.

## Qué puedes editar

Dentro de **Productos** encontrarás dos listas:

- **Productos** — cada equipo del catálogo con todos sus datos:
  - Nombre, Código (SKU) y Categoría
  - Descripción corta (la línea que se ve en la tarjeta del catálogo)
  - Fotos del producto (la primera es la que se muestra en el catálogo; se pueden arrastrar para reordenar)
  - **Página de detalle**: descripción larga, especificaciones principales (los recuadros de capacidad, voltaje, dimensiones…) e información adicional (la tabla de garantía, modos, accesorios…)
- **Categorías** — las cinco categorías del sitio, con su nombre y descripción.

## Agregar un producto nuevo

1. Entra a **Productos** y haz clic en **Add an entry** dentro de la lista de productos.
2. Llena al menos **Nombre**, **Código (SKU)** y **Categoría**.
3. Sube las fotos en **Fotos del producto** (se guardan solas en el repositorio).
4. Llena la sección **Página de detalle** con las especificaciones.
5. Haz clic en **Save**.

El sitio se actualiza solo en **más o menos un minuto**. Si no ves el cambio, recarga con `Cmd+Shift+R` (Mac) o `Ctrl+F5` (Windows) para saltarte el caché del navegador.

> Puedes guardar un producto aunque todavía no tengas las fotos o las especificaciones: mientras tanto se muestra una imagen de "Foto pendiente" y la página funciona con normalidad.

## Invitar a tu equipo

En Pages CMS puedes invitar a otras personas **por correo electrónico**, sin que necesiten cuenta de GitHub. Búscalo en la opción de colaboradores del panel. Así mercadeo puede subir productos sin pedirte nada.

## Cosas importantes

- **No cambies el "Identificador" de una categoría** (`aires`, `vitrinas`, etc.) si ya hay productos usándola: se romperían los filtros del catálogo. El "Nombre visible" sí se puede cambiar sin problema.
- **El SKU debe ser único.** Es lo que identifica al producto en la dirección de su página de detalle.
- Cada cambio queda guardado en el historial de GitHub, así que **siempre se puede volver atrás** si algo sale mal.

## Qué NO se edita todavía desde el panel

Estos textos siguen en el código y hay que pedir el cambio:

- Los textos de la página de inicio y de "Nosotros"
- Las direcciones de las tiendas y el mapa
- El número de WhatsApp
- Los banners del slider

Si quieres que alguno de estos también se pueda editar desde el panel, se puede agregar.
