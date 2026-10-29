(function musica() {

  const VOLUMEN          = 0.6;
  const SEGUNDOS_FUNDIDO = 2;

  const audio = document.getElementById("cancion");
  const boton = document.getElementById("musica");
  if (!audio || !boton) return;

  let temporizador = null;

  // Restores button visual from last session (never autoplays — browsers block it).
  try {
    const guardado = localStorage.getItem("musica");
    if (guardado !== null) {
      boton.setAttribute("aria-pressed", guardado);
      boton.setAttribute("aria-label", guardado === "true" ? "Pausar música" : "Reproducir música");
    }
  } catch (_) {}

  function marcarEstado(sonando) {
    boton.setAttribute("aria-pressed", String(sonando));
    boton.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
    try { localStorage.setItem("musica", String(sonando)); } catch (_) {}
  }

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

  boton.addEventListener("click", () => {
    if (audio.paused) {
      audio.volume = 0;
      audio.play()
        .then(() => {
          entradaSuave();
          marcarEstado(true);
        })
        .catch((err) => {
          marcarEstado(false);
          console.warn("No se pudo reproducir la canción.", err);
        });
    } else {
      audio.pause();
      marcarEstado(false);
    }
  });

  audio.addEventListener("ended", () => marcarEstado(false));
})();
