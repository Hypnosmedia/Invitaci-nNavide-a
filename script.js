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
