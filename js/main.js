/* ============================================================
   AMERICANCOOL — lógica del sitio
   ============================================================ */

/* ⚠️ CAMBIAR AQUÍ si es necesario: número de WhatsApp con código de país,
   solo dígitos. Tomado de los banners de Mundi Ofertas: 3267-7622 (Honduras). */
const WHATSAPP_NUMERO = "50432677622";

const enlaceWhatsApp = (mensaje) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

let DATOS = { categorias: [], productos: [] };

document.addEventListener("DOMContentLoaded", async () => {
  iniciarMenuMovil();
  iniciarCarrusel();
  iniciarWhatsAppGeneral();

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
}

/* ---------- Categorías (página de inicio) ---------- */
function renderizarCategorias() {
  const cont = document.querySelector("[data-categorias]");
  if (!cont) return;
  cont.innerHTML = DATOS.categorias
    .map(
      (c) => `
      <a class="categoria" href="catalogo.html#${c.id}">
        <span aria-hidden="true">${c.icono}</span>${c.nombre}
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

function renderizarProductos(filtro = "todos") {
  const cont = document.querySelector("[data-productos]");
  if (!cont) return;

  let lista = DATOS.productos;
  if (filtro !== "todos") lista = lista.filter((p) => p.categoria === filtro);

  const limite = parseInt(cont.dataset.limite || "0", 10);
  if (limite > 0) lista = lista.slice(0, limite);

  cont.innerHTML = lista
    .map((p, i) => {
      const mensaje = `Hola, quisiera más información sobre ${p.nombre} (SKU: ${p.sku}).`;
      return `
      <article class="tarjeta">
        <div class="tarjeta__imagen" data-abrir-visor="${p.sku}">
          <img src="${p.imagenes[0]}" alt="${p.nombre}" loading="lazy" width="600" height="600">
          ${p.imagenes.length > 1 ? `<span class="tarjeta__fotos">📷 ${p.imagenes.length}</span>` : ""}
        </div>
        <div class="tarjeta__cuerpo">
          <span class="tarjeta__categoria">${nombreCategoria(p.categoria)}</span>
          <h3 class="tarjeta__nombre">${p.nombre}</h3>
          ${p.descripcion ? `<p class="tarjeta__descripcion">${p.descripcion}</p>` : ""}
          <span class="tarjeta__sku">SKU: ${p.sku}</span>
          <a class="btn btn--whatsapp" href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener">
            Más información
          </a>
        </div>
      </article>`;
    })
    .join("");
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
