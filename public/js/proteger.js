// Bloquea clic derecho (evento estándar)
document.addEventListener('contextmenu', event => {
  event.preventDefault();
  return false;
}, true);

// Forzar manualmente el return false en window (algunos navegadores antiguos)
window.oncontextmenu = () => false;

// Además, bloquear el botón derecho desde el evento mouse
document.addEventListener('mousedown', event => {
  if (event.button === 2) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Bloquear teclas comunes de inspección
document.addEventListener('keydown', event => {
  // F12
  if (event.key === 'F12') event.preventDefault();
  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
  if (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase()))
    event.preventDefault();
  // Ctrl+U (ver código fuente)
  if (event.ctrlKey && event.key.toUpperCase() === 'U')
    event.preventDefault();
  // Ctrl+S (guardar página)
  if (event.ctrlKey && event.key.toUpperCase() === 'S')
    event.preventDefault();
  // Ctrl+Shift+K (consola en Firefox)
  if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'K')
    event.preventDefault();
});
