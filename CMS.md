# Panel de administración (CMS)

El sitio ahora se puede editar desde un panel visual, sin tocar código. Se usa **Pages CMS**: es gratuito, no hay que instalar nada y los cambios se publican solos.

## Cómo entrar la primera vez

1. Abre **https://app.pagescms.org** e inicia sesión con tu cuenta de GitHub (la de `hedmon84`).
2. Autoriza a Pages CMS el acceso al repositorio **americancool**. Puedes darle acceso *solo* a ese repositorio.
3. Al entrar verás el repositorio en la lista. Ábrelo y aparecerá la sección **Productos**.

Guárdate esa dirección en favoritos: es tu panel de administración de ahora en adelante.

## Qué puedes editar

En el menú lateral verás tres secciones:

- **Productos** — una lista buscable donde **cada equipo es su propia ficha**. Puedes buscar por nombre, SKU o descripción, y ordenar por las columnas (nombre, código, categoría). Al abrir una ficha ves todos sus datos:
  - Nombre, Código (SKU) y Categoría
  - Descripción corta (la línea que se ve en la tarjeta del catálogo)
  - Fotos del producto (la primera es la que se muestra en el catálogo; se pueden arrastrar para reordenar)
  - **Página de detalle**: descripción larga, especificaciones principales (los recuadros de capacidad, voltaje, dimensiones…) e información adicional (la tabla de garantía, modos, accesorios…)
- **Banners del slider** — las imágenes de la cinta que gira debajo del encabezado en la página de inicio.
- **Categorías** — las cinco categorías del sitio, con su nombre y descripción.

## Agregar un producto nuevo

1. Entra a **Productos** y haz clic en el botón para agregar una entrada nueva.
2. Llena al menos **Nombre**, **Código (SKU)** y **Categoría**.
3. Sube las fotos en **Fotos del producto** (se guardan solas).
4. Llena la sección **Página de detalle** con las especificaciones.
5. Haz clic en **Save**.

El sitio se actualiza solo en **más o menos dos minutos** (primero se guarda la ficha y luego se reconstruye el catálogo). Si no ves el cambio, recarga con `Cmd+Shift+R` (Mac) o `Ctrl+F5` (Windows) para saltarte el caché del navegador.

> Puedes guardar un producto aunque todavía no tengas las fotos o las especificaciones: mientras tanto se muestra una imagen de "Foto pendiente" y la página funciona con normalidad.

## Cambiar los banners del slider

1. Entra a **Banners del slider**. Verás la lista de banners en el mismo orden en que aparecen en la página.
2. Para **cambiar uno**: ábrelo y sube otra imagen en *Imagen del banner*.
3. Para **agregar uno**: haz clic en el botón de agregar al final de la lista, sube la imagen y escribe el texto alternativo.
4. Para **quitar uno**: puedes borrarlo, o mejor apagar *Mostrar en el sitio* si lo vas a volver a usar más adelante.
5. Para **cambiar el orden**: arrastra los banners dentro de la lista.
6. Haz clic en **Save**.

Sobre las imágenes:

- El formato es una cinta horizontal, proporción **728 × 90**. Súbelas en **2184 × 270 px** para que se vean nítidas en pantallas grandes.
- El **texto alternativo** es obligatorio: no se ve en la página, pero lo leen Google y los lectores de pantalla. Describe la promoción en una frase.
- El **enlace** es opcional. Si lo llenas, el banner se vuelve clicable; por ejemplo `catalogo.html?categoria=congeladores` o `producto.html?sku=L02FR00314`.
- El slider cambia de banner solo cada 5 segundos. Con un solo banner se queda fijo, sin puntitos.

## Invitar a tu equipo (sin cuenta de GitHub)

El administrador o la persona de mercadeo **no necesita cuenta de GitHub**. Funciona así:

1. Tú, desde el panel del repositorio, abres la sección de **colaboradores** e invitas a la persona con su **correo electrónico**.
2. A esa persona le llega la invitación. Entra a **https://app.pagescms.org** y elige iniciar sesión **con su correo** (no con GitHub).
3. Le llega un **código de 6 dígitos** a su correo, lo escribe y entra directo a editar los productos.

De ahí en adelante entra siempre igual: correo + código. No tiene que crear ninguna cuenta.

> Como los cambios se guardan usando el permiso que tú le diste a la aplicación, en el historial de GitHub los commits pueden aparecer a nombre de la app y no de cada persona. Para el uso normal no afecta en nada.

**El único paso que sí requiere tu cuenta de GitHub** es el inicial: instalar la aplicación Pages CMS en el repositorio `americancool`. Eso lo haces tú una sola vez.

## Cosas importantes

- **No cambies el "Identificador" de una categoría** (`aires`, `vitrinas`, etc.) si ya hay productos usándola: se romperían los filtros del catálogo. El "Nombre visible" sí se puede cambiar sin problema.
- **El SKU debe ser único.** Identifica al producto en la dirección de su página de detalle y además da nombre a su ficha. Si repites un SKU, el sitio **no se actualiza** (se queda con la última versión buena) y GitHub te avisa por correo del error; corrige el SKU y se publica solo.
- Cada cambio queda guardado en el historial de GitHub, así que **siempre se puede volver atrás** si algo sale mal.

## Qué NO se edita todavía desde el panel

Estos textos siguen en el código y hay que pedir el cambio:

- Los textos de la página de inicio y de "Nosotros"
- Las direcciones de las tiendas y el mapa
- El número de WhatsApp

Si quieres que alguno de estos también se pueda editar desde el panel, se puede agregar.

## Cómo funciona por dentro (por si algún día hace falta)

- Cada producto es un archivo en `data/productos/<SKU>.json`; las categorías están en `data/categorias.json` y los banners en `data/banners.json`.
- Al guardar, GitHub ejecuta `tools/build_catalog.py`, que une todo en `data/products.json`, que es el único archivo que carga el sitio. Por eso la página sigue siendo rápida aunque haya muchos productos.
- Ese paso es automático. Si alguna vez quieres correrlo a mano: `python3 tools/build_catalog.py`.
- Los banners no pasan por ese paso: la página de inicio lee `data/banners.json` directamente, así que un cambio de banner se ve apenas termina de publicarse.
- **No edites `data/products.json` directamente**: se regenera solo y perderías el cambio.
