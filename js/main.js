/* ============================================================
   AMERICANCOOL — lógica del sitio
   ============================================================ */

/* ⚠️ CAMBIAR AQUÍ si es necesario: número de WhatsApp con código de país,
   solo dígitos. Tomado de los banners de Mundi Ofertas: 3267-7622 (Honduras). */
const WHATSAPP_NUMERO = "50432677622";

const enlaceWhatsApp = (mensaje) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

/* Ícono de WhatsApp para los botones de cotización */
const ICONO_WA =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.7C8.7 2.7 2.8 8.6 2.8 15.9c0 2.3.6 4.6 1.8 6.6L2.7 29.3l7-1.8c1.9 1 4.1 1.6 6.3 1.6 7.3 0 13.2-5.9 13.2-13.2S23.3 2.7 16 2.7zm0 24.1c-2 0-3.9-.5-5.6-1.5l-.4-.2-4.2 1.1 1.1-4.1-.3-.4c-1.1-1.8-1.7-3.8-1.7-5.8C4.9 9.8 9.9 4.9 16 4.9s11.1 5 11.1 11.1S22.1 26.8 16 26.8zm6.1-8.3c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.8 5.2.8.4 1.4.6 1.9.7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4z"/></svg>';

let DATOS = { categorias: [], productos: [] };

/* Tiendas físicas (Mundi Ofertas) donde se venden los productos */
const TIENDAS = [
  {
    ciudad: "Villanueva",
    direccion: "Sobre el boulevard principal de la CA-5, a la par de Popeyes y Autorepuestos.",
    coords: [15.3172, -87.9885]
  },
  {
    ciudad: "San Pedro Sula",
    direccion: "Bo. El Benque, 7 calle y 8 avenida, a una cuadra del Hospital Leonardo Martínez.",
    coords: [15.4995, -88.0322]
  },
  {
    ciudad: "Choloma",
    direccion: "Boulevard hacia Puerto Cortés, atrás de Popeyes.",
    coords: [15.6142, -87.9532]
  }
];

const enlaceComoLlegar = (t) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Mundi Ofertas ${t.ciudad}, Honduras`)}`;

/* Iconos SVG de línea por categoría (24x24, trazo redondeado) */
const ICONO_SVG = {
  aires: '<rect x="2" y="4" width="20" height="9" rx="2"/><line x1="5" y1="9.5" x2="19" y2="9.5"/><path d="M7 16.5v3.5M12 16.5v3.5M17 16.5v3.5"/>',
  refrigeradores: '<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="6" y1="9" x2="18" y2="9"/><line x1="9" y1="4.8" x2="9" y2="6.8"/><line x1="9" y1="11.5" x2="9" y2="15"/>',
  congeladores: '<path d="M12 1.5v5M9.8 2.8l4.4 2.5M14.2 2.8l-4.4 2.5"/><rect x="2" y="8.5" width="20" height="12" rx="2"/><line x1="2" y1="12.5" x2="22" y2="12.5"/><line x1="12" y1="8.5" x2="12" y2="20.5"/>',
  estufas: '<path d="M7 4.5h4M13 4.5h4"/><rect x="4" y="7" width="16" height="15" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="7.5" cy="9" r=".2"/><circle cx="10.5" cy="9" r=".2"/><circle cx="13.5" cy="9" r=".2"/><circle cx="16.5" cy="9" r=".2"/><rect x="7" y="13.5" width="10" height="5.5" rx="1"/>',
  vitrinas: '<rect x="5" y="2" width="14" height="20" rx="2"/><rect x="8" y="5" width="8" height="13" rx="1"/><line x1="8" y1="9.5" x2="16" y2="9.5"/><line x1="8" y1="13.5" x2="16" y2="13.5"/>'
};

function iconoCategoria(id) {
  const trazos = ICONO_SVG[id];
  if (!trazos) return "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos}</svg>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  iniciarMenuMovil();
  iniciarCarrusel();
  iniciarWhatsAppGeneral();
  iniciarMapa();

  try {
    const resp = await fetch("data/products.json");
    DATOS = await resp.json();
  } catch (e) {
    console.error("No se pudo cargar data/products.json", e);
    return;
  }

  renderizarCategorias();
  renderizarFiltros();
  renderizarProductos();
  renderizarDetalleProducto();
  iniciarVisor();
});

/* ---------- Menú móvil ---------- */
function iniciarMenuMovil() {
  const boton = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (!boton || !nav) return;
  boton.addEventListener("click", () => nav.classList.toggle("abierto"));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("abierto");
  });
}

/* ---------- Carrusel del héroe ---------- */
function iniciarCarrusel() {
  const carrusel = document.querySelector(".carrusel");
  if (!carrusel) return;
  const pista = carrusel.querySelector(".carrusel__pista");
  const imagenes = pista.querySelectorAll("img");
  const puntos = carrusel.querySelector(".carrusel__puntos");
  if (imagenes.length < 2) return;

  let indice = 0;
  imagenes.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Banner ${i + 1}`);
    if (i === 0) b.classList.add("activo");
    b.addEventListener("click", () => mostrar(i));
    puntos.appendChild(b);
  });

  function mostrar(i) {
    indice = i;
    pista.style.transform = `translateX(-${i * 100}%)`;
    puntos.querySelectorAll("button").forEach((p, j) =>
      p.classList.toggle("activo", j === i)
    );
  }

  setInterval(() => mostrar((indice + 1) % imagenes.length), 5000);
}

/* ---------- WhatsApp: botón flotante y CTA genéricos ---------- */
function iniciarWhatsAppGeneral() {
  const mensaje = "Hola, quisiera más información sobre los productos AMERICANCOOL.";
  document.querySelectorAll("[data-whatsapp-general]").forEach((el) => {
    el.href = enlaceWhatsApp(mensaje);
    el.target = "_blank";
    el.rel = "noopener";
  });
  // Agregar el ícono de WhatsApp a los botones verdes que aún no lo tienen
  document.querySelectorAll(".btn--whatsapp").forEach((el) => {
    if (!el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", ICONO_WA);
  });
}

/* ---------- Mapa de tiendas (sección Ubicación) ---------- */
function iniciarMapa() {
  const lista = document.querySelector("[data-tiendas]");
  const cajaMapa = document.getElementById("mapa");
  if (!lista || !cajaMapa) return;

  lista.innerHTML = TIENDAS.map(
    (t, i) => `
    <article class="tienda" data-tienda="${i}">
      <span class="tienda__icono"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.5S5 15.7 5 10a7 7 0 0 1 14 0c0 5.7-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
      <div>
        <h3>${t.ciudad}</h3>
        <p>${t.direccion}</p>
        <a href="${enlaceComoLlegar(t)}" target="_blank" rel="noopener">Cómo llegar →</a>
      </div>
    </article>`
  ).join("");

  // Si la librería del mapa no cargó (sin internet), dejamos solo las tarjetas
  if (typeof L === "undefined") {
    cajaMapa.classList.add("oculto");
    return;
  }

  const mapa = L.map(cajaMapa, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  const icono = L.divIcon({
    className: "pin-tienda",
    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 23S4 16.4 4 9.8A8 8 0 0 1 20 9.8C20 16.4 12 23 12 23z" fill="#0b5ed7" stroke="#072a55" stroke-width="1"/><circle cx="12" cy="9.8" r="3" fill="#fff"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -30]
  });

  const marcadores = TIENDAS.map((t) =>
    L.marker(t.coords, { icon: icono, title: t.ciudad })
      .addTo(mapa)
      .bindPopup(
        `<strong>${t.ciudad}</strong><br>${t.direccion}<br>
         <a href="${enlaceComoLlegar(t)}" target="_blank" rel="noopener">Cómo llegar →</a>`
      )
  );

  mapa.fitBounds(L.latLngBounds(TIENDAS.map((t) => t.coords)), { padding: [45, 45] });

  // Al hacer clic en una tarjeta, centrar el mapa en esa tienda
  lista.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const tarjeta = e.target.closest("[data-tienda]");
    if (!tarjeta) return;
    const i = parseInt(tarjeta.dataset.tienda, 10);
    mapa.flyTo(TIENDAS[i].coords, 15, { duration: 0.8 });
    marcadores[i].openPopup();
  });
}

/* ---------- Categorías (página de inicio) ---------- */
function renderizarCategorias() {
  const cont = document.querySelector("[data-categorias]");
  if (!cont) return;
  cont.innerHTML = DATOS.categorias
    .map(
      (c) => `
      <a class="categoria" href="catalogo.html#${c.id}">
        <span class="categoria__icono">${iconoCategoria(c.id)}</span>${c.nombre}
        ${c.descripcion ? `<p class="categoria__descripcion">${c.descripcion}</p>` : ""}
        <span class="categoria__ver">Ver productos →</span>
      </a>`
    )
    .join("");
}

/* ---------- Filtros (página de catálogo) ---------- */
function renderizarFiltros() {
  const cont = document.querySelector("[data-filtros]");
  if (!cont) return;
  const desdeHash = location.hash.replace("#", "");
  const activo = DATOS.categorias.some((c) => c.id === desdeHash) ? desdeHash : "todos";

  const botones = [{ id: "todos", nombre: "Todos" }, ...DATOS.categorias];
  cont.innerHTML = botones
    .map(
      (c) =>
        `<button class="filtro ${c.id === activo ? "activo" : ""}" data-filtro="${c.id}">${c.nombre}</button>`
    )
    .join("");

  cont.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-filtro]");
    if (!boton) return;
    cont.querySelectorAll(".filtro").forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");
    renderizarProductos(boton.dataset.filtro);
  });

  if (activo !== "todos") renderizarProductos(activo);
}

/* ---------- Rejilla de productos ---------- */
function nombreCategoria(id) {
  const cat = DATOS.categorias.find((c) => c.id === id);
  return cat ? cat.nombre : id;
}

function tarjetaHTML(p) {
  const mensaje = `Hola, quisiera más información sobre ${p.nombre} (SKU: ${p.sku}).`;
  const urlDetalle = `producto.html?sku=${encodeURIComponent(p.sku)}`;
  return `
  <article class="tarjeta">
    <a class="tarjeta__imagen" href="${urlDetalle}" aria-label="Ver detalle de ${p.nombre}">
      <img src="${p.imagenes[0]}" alt="${p.nombre}" loading="lazy" width="600" height="600">
      ${p.imagenes.length > 1 ? `<span class="tarjeta__fotos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></svg> ${p.imagenes.length}</span>` : ""}
    </a>
    <div class="tarjeta__cuerpo">
      <span class="tarjeta__categoria">${nombreCategoria(p.categoria)}</span>
      <h3 class="tarjeta__nombre"><a href="${urlDetalle}">${p.nombre}</a></h3>
      ${p.descripcion ? `<p class="tarjeta__descripcion">${p.descripcion}</p>` : ""}
      <span class="tarjeta__sku">SKU: ${p.sku}</span>
      <div class="tarjeta__acciones">
        <a class="btn btn--primario" href="${urlDetalle}">Ver detalles</a>
        <a class="btn btn--whatsapp" href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener">
          ${ICONO_WA} Cotizar
        </a>
      </div>
    </div>
  </article>`;
}

function renderizarProductos(filtro = "todos") {
  const cont = document.querySelector("[data-productos]");
  if (!cont) return;

  let lista = DATOS.productos;
  if (filtro !== "todos") lista = lista.filter((p) => p.categoria === filtro);

  const limite = parseInt(cont.dataset.limite || "0", 10);
  if (limite > 0) lista = lista.slice(0, limite);

  cont.innerHTML = lista.map(tarjetaHTML).join("");
}

/* ---------- Página de detalle de producto ---------- */
function renderizarDetalleProducto() {
  const cont = document.querySelector("[data-detalle-producto]");
  if (!cont) return;

  const sku = new URLSearchParams(location.search).get("sku");
  const p = DATOS.productos.find((x) => x.sku === sku);

  if (!p) {
    cont.innerHTML = `
      <div class="detalle__no-encontrado">
        <h1 class="seccion__titulo">Producto no encontrado</h1>
        <p class="seccion__sub">El producto que buscas no está disponible.</p>
        <p style="text-align:center;"><a class="btn btn--primario" href="catalogo.html">Ver el catálogo</a></p>
      </div>`;
    document.querySelector("#relacionados")?.classList.add("oculto");
    return;
  }

  const d = p.detalle || {};
  const mensaje = `Hola, quisiera más información sobre ${p.nombre} (SKU: ${p.sku}).`;
  document.title = `${p.nombre} — AMERICANCOOL`;

  const miniaturas = p.imagenes
    .map(
      (f, i) => `<button class="detalle__miniatura ${i === 0 ? "activo" : ""}" data-foto-detalle="${i}" aria-label="Foto ${i + 1}">
        <img src="${f}" alt="Foto ${i + 1} de ${p.nombre}">
      </button>`
    )
    .join("");

  const especificaciones = (d.especificaciones || [])
    .map(
      (e) => `
      <div class="especificacion">
        <span class="especificacion__etiqueta">${e.etiqueta}</span>
        <span class="especificacion__valor">${e.valor}</span>
      </div>`
    )
    .join("");

  const adicionales = (d.adicionales || [])
    .map(
      (a) => `
      <div class="adicionales__fila">
        <span class="adicionales__etiqueta">${a.etiqueta}</span>
        <span class="adicionales__valor">${a.valor}</span>
      </div>`
    )
    .join("");

  cont.innerHTML = `
    <nav class="miga" aria-label="Ruta de navegación">
      <a href="index.html">Inicio</a> <span>/</span>
      <a href="catalogo.html#${p.categoria}">${nombreCategoria(p.categoria)}</a> <span>/</span>
      <span>${p.nombre}</span>
    </nav>

    <div class="detalle">
      <div class="detalle__galeria">
        <div class="detalle__imagen" data-abrir-visor="${p.sku}" title="Haz clic para ampliar">
          <img src="${p.imagenes[0]}" alt="${p.nombre}">
          <span class="detalle__lupa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></span>
        </div>
        ${p.imagenes.length > 1 ? `<div class="detalle__miniaturas">${miniaturas}</div>` : ""}
      </div>

      <div class="detalle__info">
        <span class="tarjeta__categoria">${nombreCategoria(p.categoria)}</span>
        <h1 class="detalle__nombre">${p.nombre}</h1>
        <p class="detalle__sku">SKU: ${p.sku}</p>
        ${d.descripcion ? `<p class="detalle__descripcion">${d.descripcion}</p>` : ""}
        <div class="detalle__acciones">
          <a class="btn btn--whatsapp" href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener">
            ${ICONO_WA} Cotizar por WhatsApp
          </a>
          <a class="btn btn--contorno" href="catalogo.html#${p.categoria}">Volver al catálogo</a>
        </div>
      </div>
    </div>

    ${especificaciones ? `
    <div class="detalle__bloque">
      <h2 class="detalle__rotulo">Características básicas</h2>
      <div class="especificaciones">${especificaciones}</div>
    </div>` : ""}

    ${adicionales ? `
    <div class="detalle__bloque">
      <h2 class="detalle__rotulo">Todas las características</h2>
      <div class="adicionales">
        <h3 class="adicionales__titulo">Detalles Adicionales</h3>
        <div class="adicionales__lista">${adicionales}</div>
      </div>
    </div>` : ""}
  `;

  // Cambiar la foto principal al hacer clic en una miniatura
  const imagenPrincipal = cont.querySelector(".detalle__imagen img");
  cont.querySelectorAll("[data-foto-detalle]").forEach((b) => {
    b.addEventListener("click", () => {
      imagenPrincipal.src = p.imagenes[parseInt(b.dataset.fotoDetalle, 10)];
      cont.querySelectorAll("[data-foto-detalle]").forEach((m) =>
        m.classList.toggle("activo", m === b)
      );
    });
  });

  renderizarRelacionados(p);
}

function renderizarRelacionados(producto) {
  const cont = document.querySelector("[data-relacionados]");
  if (!cont) return;
  const relacionados = DATOS.productos
    .filter((x) => x.categoria === producto.categoria && x.sku !== producto.sku)
    .slice(0, 4);
  if (relacionados.length === 0) {
    document.querySelector("#relacionados")?.classList.add("oculto");
    return;
  }
  cont.innerHTML = relacionados.map(tarjetaHTML).join("");
}

/* ---------- Visor de fotos ---------- */
function iniciarVisor() {
  const visor = document.querySelector(".visor");
  if (!visor) return;

  const imagenGrande = visor.querySelector(".visor__imagen img");
  const miniaturas = visor.querySelector(".visor__miniaturas");
  const titulo = visor.querySelector(".visor__info h3");
  const sku = visor.querySelector(".visor__info .sku");
  const botonWA = visor.querySelector(".visor__info .btn");
  let fotos = [];
  let indice = 0;

  function mostrarFoto(i) {
    indice = (i + fotos.length) % fotos.length;
    imagenGrande.src = fotos[indice];
    miniaturas.querySelectorAll("img").forEach((m, j) =>
      m.classList.toggle("activo", j === indice)
    );
  }

  function abrir(skuProducto) {
    const p = DATOS.productos.find((x) => x.sku === skuProducto);
    if (!p) return;
    fotos = p.imagenes;
    titulo.textContent = p.nombre;
    sku.textContent = `${p.descripcion ? p.descripcion + " · " : ""}SKU: ${p.sku}`;
    botonWA.href = enlaceWhatsApp(
      `Hola, quisiera más información sobre ${p.nombre} (SKU: ${p.sku}).`
    );
    miniaturas.innerHTML = fotos
      .map((f, i) => `<img src="${f}" alt="Foto ${i + 1} de ${p.nombre}" data-mini="${i}">`)
      .join("");
    mostrarFoto(0);
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";
  }

  function cerrar() {
    visor.classList.remove("abierto");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const disparador = e.target.closest("[data-abrir-visor]");
    if (disparador) abrir(disparador.dataset.abrirVisor);
    if (e.target.closest("[data-mini]")) mostrarFoto(parseInt(e.target.dataset.mini, 10));
    if (e.target.matches(".visor__cerrar") || e.target === visor) cerrar();
    if (e.target.closest(".visor__flecha--izq")) mostrarFoto(indice - 1);
    if (e.target.closest(".visor__flecha--der")) mostrarFoto(indice + 1);
  });

  document.addEventListener("keydown", (e) => {
    if (!visor.classList.contains("abierto")) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowLeft") mostrarFoto(indice - 1);
    if (e.key === "ArrowRight") mostrarFoto(indice + 1);
  });
}
