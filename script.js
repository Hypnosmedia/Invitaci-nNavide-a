/* =========================================================
   LÓGICA DE LA INVITACIÓN DE NAVIDAD
   ---------------------------------------------------------
   Tiene tres partes independientes:
   1. Saludo personalizado (?para=Nombre)
   2. Conteo regresivo
   3. Nieve animada
   ========================================================= */


/* =========================================================
   1. SALUDO PERSONALIZADO
   Ejemplo: index.html?para=Maria  ->  "Para Maria"
   Así puedes mandar un enlace distinto a cada invitado.
   ========================================================= */
(function saludoPersonalizado() {
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get("para");
  const elemento = document.getElementById("invitado");

  if (nombre && elemento) {
    // textContent (y no innerHTML) evita que alguien inserte código en el enlace
    elemento.textContent = "Para " + nombre;
    elemento.hidden = false;
  }
})();


/* =========================================================
   2. CONTEO REGRESIVO
   La fecha del evento se edita en index.html, en el atributo
   data-fecha del elemento con id="conteo".
   ========================================================= */
(function conteoRegresivo() {
  const contenedor = document.getElementById("conteo");
  const mensajeFinal = document.getElementById("final");
  const fechaEvento = new Date(contenedor.dataset.fecha).getTime();

  // Referencias a los números que se actualizan
  const campos = {
    dias:     document.getElementById("dias"),
    horas:    document.getElementById("horas"),
    minutos:  document.getElementById("minutos"),
    segundos: document.getElementById("segundos"),
  };

  // Pone dos dígitos (5 -> "05"). Los días pueden tener 3 dígitos (ej. "120").
  const dosDigitos = (n) => String(n).padStart(2, "0");

  // Cambia el texto solo si el valor es distinto, y dispara el pequeño "pulso"
  function actualizar(campo, valor) {
    if (campo.textContent === valor) return;
    campo.textContent = valor;
    campo.classList.remove("cambio");
    void campo.offsetWidth;            // reinicia la animación CSS
    campo.classList.add("cambio");
  }

  function tic() {
    const restante = fechaEvento - Date.now();

    // Si ya llegó la fecha: oculta el conteo y muestra el mensaje final
    if (restante <= 0) {
      contenedor.hidden = true;
      mensajeFinal.hidden = false;
      clearInterval(temporizador);
      return;
    }

    // Convierte milisegundos a días / horas / minutos / segundos
    const segundosTotales = Math.floor(restante / 1000);
    const dias     = Math.floor(segundosTotales / 86400);
    const horas    = Math.floor((segundosTotales % 86400) / 3600);
    const minutos  = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    actualizar(campos.dias,     dosDigitos(dias));
    actualizar(campos.horas,    dosDigitos(horas));
    actualizar(campos.minutos,  dosDigitos(minutos));
    actualizar(campos.segundos, dosDigitos(segundos));
  }

  // Si la fecha del HTML está mal escrita, avisamos en la consola
  if (Number.isNaN(fechaEvento)) {
    console.warn("La fecha en data-fecha no es válida. Usa el formato AAAA-MM-DDTHH:MM:SS");
    return;
  }

  tic();                                      // primera lectura inmediata
  const temporizador = setInterval(tic, 1000); // luego, cada segundo
})();


/* =========================================================
   3. NIEVE ANIMADA (canvas)
   Cambia los valores de CONFIG para ajustar el efecto.
   ========================================================= */
(function nieve() {
  const CONFIG = {
    copos: 70,           // cantidad de copos (menos = más sutil)
    tamanoMin: 1,        // radio mínimo en píxeles
    tamanoMax: 3.2,      // radio máximo en píxeles
    velocidadMin: 0.3,   // velocidad de caída mínima
    velocidadMax: 1.1,   // velocidad de caída máxima
    viento: 0.25,        // qué tanto se mecen de lado a lado
    color: "255, 255, 255", // color RGB de los copos
  };

  const lienzo = document.getElementById("nieve");
  const ctx = lienzo.getContext("2d");
  const interruptor = document.getElementById("interruptorNieve");

  // ¿La persona prefiere menos movimiento? Entonces la nieve empieza apagada.
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let copos = [];
  let activa = !menosMovimiento;
  let idAnimacion = null;

  // Ajusta el lienzo al tamaño de la ventana (con nitidez en pantallas retina)
  function ajustarTamano() {
    const ratio = window.devicePixelRatio || 1;
    lienzo.width = window.innerWidth * ratio;
    lienzo.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // Crea un copo con valores al azar
  function crearCopo(desdeArriba) {
    return {
      x: Math.random() * window.innerWidth,
      y: desdeArriba ? -10 : Math.random() * window.innerHeight,
      radio: CONFIG.tamanoMin + Math.random() * (CONFIG.tamanoMax - CONFIG.tamanoMin),
      velocidad: CONFIG.velocidadMin + Math.random() * (CONFIG.velocidadMax - CONFIG.velocidadMin),
      fase: Math.random() * Math.PI * 2,   // para que no se mezan todos igual
    };
  }

  function iniciarCopos() {
    copos = Array.from({ length: CONFIG.copos }, () => crearCopo(false));
  }

  // Dibuja un fotograma
  function dibujar() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const c of copos) {
      c.y += c.velocidad;
      c.fase += 0.01;
      c.x += Math.sin(c.fase) * CONFIG.viento;

      // Cuando sale por abajo, reaparece arriba
      if (c.y > window.innerHeight + 10) {
        Object.assign(c, crearCopo(true));
      }

      // Los copos más grandes se ven más opacos (da sensación de profundidad)
      const opacidad = 0.35 + (c.radio / CONFIG.tamanoMax) * 0.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radio, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + CONFIG.color + ", " + opacidad + ")";
      ctx.fill();
    }

    idAnimacion = requestAnimationFrame(dibujar);
  }

  function encender() {
    activa = true;
    if (!idAnimacion) dibujar();
    interruptor.textContent = "Nieve: sí";
    interruptor.setAttribute("aria-pressed", "true");
  }

  function apagar() {
    activa = false;
    cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    interruptor.textContent = "Nieve: no";
    interruptor.setAttribute("aria-pressed", "false");
  }

  // Botón de la esquina: alterna entre encendido y apagado
  interruptor.addEventListener("click", () => (activa ? apagar() : encender()));

  // Si cambia el tamaño de la ventana, reajustamos
  window.addEventListener("resize", () => {
    ajustarTamano();
    iniciarCopos();
  });

  // Ahorra batería: pausa la nieve cuando la pestaña no está visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(idAnimacion);
      idAnimacion = null;
    } else if (activa && !idAnimacion) {
      dibujar();
    }
  });

  // Arranque
  ajustarTamano();
  iniciarCopos();
  activa ? encender() : apagar();
})();


/* =========================================================
   4. FORMULARIO DE ASISTENCIA (envía los datos a Google Sheets)
   ---------------------------------------------------------
   Para que funcione, pega abajo la URL de tu "Aplicación web"
   de Google Apps Script (termina en /exec).
   ========================================================= */
(function formularioAsistencia() {

  // >>> PEGA AQUÍ LA URL DE TU APLICACIÓN WEB DE GOOGLE <<<
  const URL_HOJA = "PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT";

  // Atajo para buscar elementos por su id
  const $ = (id) => document.getElementById(id);

  // Referencias a los elementos de la página
  const ventana         = $("ventana");
  const abrir           = $("abrirFormulario");
  const formulario      = $("formulario");
  const vistaFormulario = $("vistaFormulario");
  const vistaExito      = $("vistaExito");
  const enviar          = $("enviar");
  const mensaje         = $("mensajeForm");
  const textoExito      = $("textoExito");
  const chispas         = $("chispas");

  // Campos que se validan: el input, su mensaje de error y el texto a mostrar si está vacío
  const campos = [
    { input: $("nombre"),   error: $("errorNombre"),   vacio: "Escribe tu nombre." },
    { input: $("apellido"), error: $("errorApellido"), vacio: "Escribe tu apellido." },
  ];

  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilidades ---------- */

  // Pone en mayúscula la primera letra de cada palabra: "maría lópez" -> "María López"
  // (así tu hoja queda ordenada aunque la gente escriba en minúsculas)
  function capitalizar(texto) {
    return texto.replace(/(^|\s)\p{L}/gu, (letra) => letra.toUpperCase());
  }

  // Cambia entre la vista del formulario y la de éxito
  function mostrarVista(nombreVista) {
    vistaFormulario.hidden = nombreVista !== "formulario";
    vistaExito.hidden = nombreVista !== "exito";
  }

  // Quita los errores y limpia los campos
  function reiniciarFormulario() {
    formulario.reset();
    mensaje.textContent = "";
    campos.forEach(({ input, error }) => {
      input.closest(".campo").classList.remove("con-error", "sacudir");
      error.textContent = "";
    });
  }

  // Revisa un campo. Devuelve true si está bien, false si hay que corregirlo
  function validar(campo, conSacudida) {
    const valor = campo.input.value.trim();
    const contenedor = campo.input.closest(".campo");
    let aviso = "";

    if (valor.length === 0) aviso = campo.vacio;
    else if (valor.length < 2) aviso = "Escribe al menos 2 letras.";

    contenedor.classList.toggle("con-error", aviso !== "");
    campo.error.textContent = aviso;

    if (aviso && conSacudida && !menosMovimiento) {
      contenedor.classList.remove("sacudir");
      void contenedor.offsetWidth;          // reinicia la animación
      contenedor.classList.add("sacudir");
    }
    return aviso === "";
  }

  // Chispas doradas que salen de la palomita al confirmar
  function lanzarChispas() {
    chispas.innerHTML = "";
    if (menosMovimiento) return;

    const total = 16;
    for (let i = 0; i < total; i++) {
      const chispa = document.createElement("span");
      const angulo = (Math.PI * 2 * i) / total + Math.random() * 0.4;
      const distancia = 45 + Math.random() * 35;

      chispa.className = i % 3 === 0 ? "chispa chispa-blanca" : "chispa";
      chispa.style.setProperty("--dx", Math.cos(angulo) * distancia + "px");
      chispa.style.setProperty("--dy", Math.sin(angulo) * distancia + "px");
      chispa.style.setProperty("--tam", 3 + Math.random() * 3 + "px");
      chispa.style.animationDelay = 0.5 + Math.random() * 0.15 + "s";  // salen cuando se dibuja la palomita
      chispas.appendChild(chispa);
    }
  }

  /* ---------- Abrir y cerrar la ventana ---------- */

  abrir.addEventListener("click", () => {
    reiniciarFormulario();
    mostrarVista("formulario");
    ventana.showModal();
  });

  // Todos estos botones cierran la ventana
  [$("cerrarX"), $("cancelar"), $("cerrarExito")].forEach((boton) => {
    boton.addEventListener("click", () => ventana.close());
  });

  // Clic en el fondo oscuro también cierra
  // (se comprueba que el clic EMPEZÓ en el fondo, para no cerrar al seleccionar texto)
  let pulsoEnElFondo = false;
  ventana.addEventListener("mousedown", (evento) => {
    pulsoEnElFondo = evento.target === ventana;
  });
  ventana.addEventListener("click", (evento) => {
    if (pulsoEnElFondo && evento.target === ventana) ventana.close();
  });

  // "Confirmar a otra persona": vuelve al formulario limpio
  $("otraPersona").addEventListener("click", () => {
    reiniciarFormulario();
    mostrarVista("formulario");
    campos[0].input.focus();
  });

  /* ---------- Validación en vivo ---------- */

  campos.forEach((campo) => {
    // Al salir del campo, revisa lo escrito
    campo.input.addEventListener("blur", () => {
      if (campo.input.value.length > 0) validar(campo, false);
    });
    // Mientras escribe, quita el error en cuanto el texto sea correcto
    campo.input.addEventListener("input", () => {
      if (campo.input.closest(".campo").classList.contains("con-error")) validar(campo, false);
    });
  });

  /* ---------- Envío ---------- */

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();          // evita que la página se recargue
    mensaje.textContent = "";

    // Revisa todos los campos (sin cortar en el primero, para marcar todos los errores)
    const resultados = campos.map((campo) => validar(campo, true));
    if (resultados.includes(false)) {
      campos[resultados.indexOf(false)].input.focus();
      return;
    }

    // Aviso si todavía no pegaste la URL de Google
    if (URL_HOJA.startsWith("PEGA_AQUI")) {
      mensaje.textContent = "El formulario aún no está conectado a la hoja de cálculo.";
      return;
    }

    const nombre   = capitalizar(campos[0].input.value.trim());
    const apellido = capitalizar(campos[1].input.value.trim());

    // Bloquea el botón mientras se envía (evita envíos dobles) y muestra la ruedita
    enviar.disabled = true;
    enviar.classList.add("cargando");
    enviar.textContent = "Enviando...";

    try {
      // Datos que recibirá Google (los nombres deben coincidir con el código de Apps Script)
      const datos = new URLSearchParams({
        nombre: nombre,
        apellido: apellido,
        empresa: formulario.empresa.value,   // campo trampa para bots (siempre vacío en personas)
      });

      // "no-cors" es necesario para hablar con Google desde una página externa.
      // La respuesta no se puede leer, pero el envío sí llega a la hoja.
      await fetch(URL_HOJA, { method: "POST", mode: "no-cors", body: datos });

      // Éxito: muestra la palomita animada y el agradecimiento
      textoExito.textContent = "Gracias, " + nombre + ". Tu asistencia quedó confirmada. ¡Te esperamos!";
      formulario.reset();
      mostrarVista("exito");
      lanzarChispas();
      $("cerrarExito").focus();

    } catch (error) {
      // Solo entra aquí si falla la conexión
      mensaje.textContent = "No pudimos enviar tu confirmación. Revisa tu conexión e inténtalo de nuevo.";
    } finally {
      enviar.disabled = false;
      enviar.classList.remove("cargando");
      enviar.textContent = "Enviar confirmación";
    }
  });
})();
