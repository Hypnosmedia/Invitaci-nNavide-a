/* =========================================================
   MÚSICA DE LA INVITACIÓN
   ---------------------------------------------------------
   Reproduce una canción cuando alguien hace clic en
   "Confirmar asistencia". Los navegadores solo permiten
   iniciar sonido después de un clic, por eso se activa ahí.
   Requiere el archivo de audio indicado en index.html
   (por defecto: cancion.mp3, en la misma carpeta).
   ========================================================= */
(function musica() {

  // ---- AJUSTES (puedes cambiarlos) ----
  const VOLUMEN = 0.6;           // de 0 (silencio) a 1 (máximo)
  const SEGUNDOS_FUNDIDO = 2;    // el volumen sube poco a poco durante estos segundos
  const REPETIR = false;         // true = la canción se repite sin parar

  // Elementos de la página
  const audio  = document.getElementById("cancion");
  const abrir  = document.getElementById("abrirFormulario");  // botón "Confirmar asistencia"
  const boton  = document.getElementById("musica");           // botón ♪ de la ventana
  if (!audio || !abrir || !boton) return;

  audio.loop = REPETIR;

  let iniciada = false;          // para que solo arranque sola la primera vez
  let temporizador = null;

  // Actualiza el aspecto y el texto accesible del botón ♪
  function marcarEstado(sonando) {
    boton.setAttribute("aria-pressed", String(sonando));
    boton.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
  }

  // Sube el volumen poco a poco (suena más agradable que empezar de golpe)
  function entradaSuave() {
    clearInterval(temporizador);
    const pasos = SEGUNDOS_FUNDIDO * 10;
    let actual = 0;
    temporizador = setInterval(() => {
      actual++;
      audio.volume = Math.min(VOLUMEN, (VOLUMEN * actual) / pasos);
      if (actual >= pasos) clearInterval(temporizador);
    }, 100);
  }

  // Al hacer clic en "Confirmar asistencia": arranca la canción (solo la primera vez)
  abrir.addEventListener("click", () => {
    if (iniciada) return;
    iniciada = true;

    audio.volume = 0;            // empieza en silencio para el fundido
    audio.play()
      .then(() => {
        entradaSuave();
        marcarEstado(true);
      })
      .catch((error) => {
        // Pasa si falta el archivo de audio o el navegador bloquea el sonido
        iniciada = false;
        marcarEstado(false);
        console.warn("No se pudo reproducir la canción. Revisa que el archivo exista y el nombre coincida.", error);
      });
  });

  // Botón ♪: pausa o reanuda
  boton.addEventListener("click", () => {
    if (audio.paused) {
      audio.volume = VOLUMEN;
      audio.play().then(() => marcarEstado(true)).catch(() => marcarEstado(false));
    } else {
      audio.pause();
      marcarEstado(false);
    }
  });

  // Cuando la canción termina (si no se repite), el botón vuelve a "apagado"
  audio.addEventListener("ended", () => marcarEstado(false));
})();
