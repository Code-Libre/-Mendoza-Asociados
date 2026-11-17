/* =========================================================
   PRINCIPAL.JS - Mendoza & Asociados, estudio jurídico (demostración)
   Índice: 1 Menú | 2 Encabezado y enlace activo | 3 Aparición al bajar
   4 Cifras | 5 Áreas de práctica | 6 Carrusel de clientes | 7 Formulario
   8 Imágenes que faltan | 9 Video de portada | 10 Año del pie
   ========================================================= */

const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- 1. MENÚ EN CELULAR ---------- */
function iniciarMenu() {
  const boton = document.getElementById("boton-menu");
  const menu = document.getElementById("menu-principal");

  function cerrar() {
    menu.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }

  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto);
  });

  menu.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", cerrar));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrar();
  });
}


/* ---------- 2. ENCABEZADO Y ENLACE ACTIVO ---------- */
function iniciarEncabezado() {
  const encabezado = document.getElementById("encabezado");
  const enlaces = document.querySelectorAll(".menu__enlace");
  let bloqueoHasta = 0;

  function marcar(id) {
    enlaces.forEach((enlace) => {
      enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + id);
    });
  }

  // Al hacer clic, el enlace queda marcado enseguida y no salta por las secciones del camino
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      bloqueoHasta = Date.now() + 1000;
      marcar(enlace.getAttribute("href").slice(1));
    });
  });

  // Mientras se baja, se marca la sección que está en el medio de la pantalla
  const observador = new IntersectionObserver((entradas) => {
    if (Date.now() < bloqueoHasta) return;

    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) marcar(entrada.target.id);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  document.querySelectorAll("main section[id]").forEach((seccion) => observador.observe(seccion));

  // El encabezado se achica y toma sombra al bajar
  function actualizarSombra() {
    encabezado.classList.toggle("encabezado--reducido", window.scrollY > 40);
  }

  window.addEventListener("scroll", actualizarSombra, { passive: true });
  actualizarSombra();
}


/* ---------- 3. APARICIÓN AL BAJAR ---------- */
function iniciarAparicion() {
  if (sinMovimiento) return;

  const elementos = [
    ".titulo-seccion", ".quienes-somos__texto", ".cifra", ".area",
    ".abogado", ".carrusel", ".contacto__datos", ".formulario"
  ];

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(elementos.join(",")).forEach((el) => {
    // Los hermanos entran escalonados, con un tope para que no demoren de más
    const posicion = [...el.parentElement.children].indexOf(el);

    el.style.transitionDelay = Math.min(posicion * 0.1, 0.4) + "s";
    el.classList.add("revelar");
    observador.observe(el);
  });
}


/* ---------- 4. CIFRAS QUE SUBEN ---------- */
function iniciarCifras() {
  const cifras = document.querySelectorAll(".cifra__numero");

  if (sinMovimiento) return;

  function contar(el) {
    const meta = Number(el.dataset.meta);
    const sufijo = el.dataset.sufijo;
    const inicio = performance.now();

    function paso(ahora) {
      const avance = Math.min((ahora - inicio) / 1500, 1);
      const suave = 1 - Math.pow(1 - avance, 3);

      el.textContent = Math.round(meta * suave).toLocaleString("es-AR") + sufijo;
      if (avance < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      observador.unobserve(entrada.target);
      contar(entrada.target);
    });
  }, { threshold: 0.6 });

  cifras.forEach((cifra) => {
    cifra.textContent = "0" + cifra.dataset.sufijo;
    observador.observe(cifra);
  });
}


/* ---------- 5. ÁREAS DE PRÁCTICA ---------- */
function iniciarAreas() {
  const areas = document.querySelectorAll(".area");
  const selector = document.getElementById("area-consulta");

  // Se abre una sola área a la vez
  areas.forEach((area) => {
    const boton = area.querySelector(".area__boton");

    boton.addEventListener("click", () => {
      const abrir = !area.classList.contains("abierta");

      areas.forEach((otra) => {
        otra.classList.remove("abierta");
        otra.querySelector(".area__boton").setAttribute("aria-expanded", "false");
      });

      area.classList.toggle("abierta", abrir);
      boton.setAttribute("aria-expanded", abrir);
    });
  });

  // "Consultar por este servicio" deja elegida esa área en el formulario
  document.querySelectorAll(".area__consulta").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      selector.value = enlace.dataset.area;
    });
  });
}


/* ---------- 6. CARRUSEL DE CLIENTES ---------- */
function iniciarCarrusel() {
  const carrusel = document.getElementById("carrusel");
  const testimonios = [...carrusel.querySelectorAll(".testimonio")];
  const contenedorPuntos = document.getElementById("carrusel-puntos");
  let actual = 0;
  let temporizador;

  function mostrar(indice) {
    actual = indice;

    testimonios.forEach((testimonio, i) => testimonio.classList.toggle("activo", i === actual));
    puntos.forEach((punto, i) => punto.classList.toggle("activo", i === actual));
  }

  // Pasa solo cada 6 segundos, salvo que el usuario pida menos movimiento
  function reiniciar() {
    clearInterval(temporizador);

    if (!sinMovimiento) {
      temporizador = setInterval(() => mostrar((actual + 1) % testimonios.length), 6000);
    }
  }

  const puntos = testimonios.map((_, i) => {
    const punto = document.createElement("button");

    punto.type = "button";
    punto.setAttribute("aria-label", "Ver opinión " + (i + 1));
    punto.addEventListener("click", () => {
      mostrar(i);
      reiniciar();
    });

    contenedorPuntos.append(punto);
    return punto;
  });

  carrusel.addEventListener("mouseenter", () => clearInterval(temporizador));
  carrusel.addEventListener("mouseleave", reiniciar);

  mostrar(0);
  reiniciar();
}


/* ---------- 7. FORMULARIO DE CONTACTO ---------- */
// Es una demostración: valida los datos y muestra la confirmación, pero no envía nada
function iniciarFormulario() {
  const formulario = document.getElementById("formulario-contacto");
  const aviso = document.getElementById("mensaje-envio");

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = formulario.elements["nombre"].value.trim();

    aviso.textContent = "Gracias, " + nombre + ". Es un sitio de demostración: la consulta no se envió a ningún lado, los datos ingresados no se guardaran en ninguna base de datos.";
    formulario.reset();
  });
}


/* ---------- 8. IMÁGENES QUE FALTAN ---------- */
// Si una foto todavía no está en la carpeta img, se muestra un aviso con su ruta
function iniciarImagenesFaltantes() {
  document.querySelectorAll(".marco img").forEach((img) => {
    function marcar() {
      img.parentElement.dataset.ruta = img.getAttribute("src");
      img.parentElement.classList.add("sin-imagen");
    }

    img.addEventListener("error", marcar);

    if (img.complete && img.naturalWidth === 0) marcar();
  });
}


/* ---------- 9. VIDEO DE PORTADA ---------- */
function iniciarVideo() {
  const video = document.querySelector(".inicio__video");

  if (!video) return;

  if (sinMovimiento) {
    video.pause();
    return;
  }

  video.play().catch(() => {});
}


/* ---------- 10. AÑO DEL PIE ---------- */
function iniciarAnio() {
  document.getElementById("anio-actual").textContent = new Date().getFullYear();
}


iniciarMenu();
iniciarEncabezado();
iniciarAparicion();
iniciarCifras();
iniciarAreas();
iniciarCarrusel();
iniciarFormulario();
iniciarImagenesFaltantes();
iniciarVideo();
iniciarAnio();
