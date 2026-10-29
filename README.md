# Invitación Navideña — Posada Antavi

Invitación digital para la Nochebuena de la familia Ramírez. Es una página web estática que se puede abrir en cualquier navegador o compartir por WhatsApp con un enlace.

## ¿Qué incluye?

- **Invitado personalizado** — agrega `?para=Nombre` al final del enlace y la página saludará a esa persona por su nombre.
- **Conteo regresivo** — muestra los días, horas, minutos y segundos que faltan para el 24 de diciembre.
- **Música de fondo** — botón para activar o pausar la música; nunca suena sola al cargar la página.
- **Nieve animada** — botón para encender o apagar los copos de nieve.
- **Formulario de confirmación** — los invitados confirman su asistencia y el registro llega a una hoja de Google Sheets.

## Estructura de archivos

```
index.html          Página principal
styles.css          Estilos visuales
script.js           Lógica: saludo, conteo, nieve y formulario
musica.js           Control del reproductor de música
audio/
  musica-navidad.mp3  Pista de fondo (60 s, 128 kbps)
antavi.png          Logo
```

## Cómo usar

Abre `index.html` en el navegador o súbelo a cualquier servicio de hosting estático (GitHub Pages, Netlify, Vercel).

Para enviar una invitación personalizada:
```
https://tu-dominio.com/?para=María
```

## Configuración del formulario

En `script.js`, busca la línea `const URL_HOJA` y pega ahí la URL de tu aplicación web de Google Apps Script. Sin ese paso, el botón "Confirmar asistencia" no guarda nada.

## Ajustes rápidos

| Qué cambiar | Dónde |
|---|---|
| Fecha del evento | `index.html` → atributo `data-fecha` del `<div id="conteo">` |
| Lugar y hora | `index.html` → párrafo `.detalles` |
| Música (volumen, fundido) | `musica.js` → constantes `VOLUMEN` y `SEGUNDOS_FUNDIDO` |
| Intensidad de la nieve | `script.js` → objeto `CONFIG` dentro de la función `nieve()` |
