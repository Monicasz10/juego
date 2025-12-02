// ------------------------------
// 🎮 VARIABLES PRINCIPALES
// ------------------------------
const btnIniciar = document.getElementById("btn-iniciar");
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
const puntajeDiv = document.getElementById("puntaje");
const preguntaBox = document.getElementById("pregunta-box");
const preguntaText = document.getElementById("pregunta-text");
const respuestaInput = document.getElementById("respuesta-input");
const responderBtn = document.getElementById("responder-btn");

const golSound = document.getElementById("gol-sound");
const tiroSound = document.getElementById("tiro-sound");

// ------------------------------
// 📱 HACER CANVAS RESPONSIVE
// ------------------------------
let escala = 1;

function ajustarCanvas() {
  const baseW = 800;
  const baseH = 500;

  // El canvas ocupa 95% del ancho sin deformarse
  const anchoDisponible = window.innerWidth * 0.95;
  escala = anchoDisponible / baseW;

  canvas.width = baseW * escala;
  canvas.height = baseH * escala;
}

// Ejecutar al inicio y en cada resize
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

// ------------------------------
// 🔥 OBJETOS DEL JUEGO
// ------------------------------
let jugador = {
  x: 100,
  y: 200,
  width: 120,
  height: 120,
  speed: 8 * escala
};

let impresora = {
  x: 700,
  y: 200,
  width: 100,
  height: 100,
  dy: 4 * escala
};

let balon = {
  x: 180,
  y: 230,
  radius: 15,
  dx: 0,
  enMovimiento: false
};

let goles = 0;
let nivel = 1;
let vidas = 3;

// ------------------------------
// 🧠 PREGUNTAS
// ------------------------------
const preguntas = [
  { p: "¿Cuántos centímetros tiene un metro?", r: "100" },
  { p: "¿Capital de Francia?", r: "paris" },
  { p: "5 + 7 =", r: "12" },
  { p: "Color del cielo:", r: "azul" }
];

let preguntaActual = null;

// ------------------------------
// 🎮 INICIO DEL JUEGO
// ------------------------------
btnIniciar.addEventListener("click", () => {
  pantallaInicio.classList.add("oculto");
  pantallaJuego.classList.remove("oculto");
  iniciar();
});

function iniciar() {
  goles = 0;
  nivel = 1;
  vidas = 3;

  actualizarHUD();
  loop();
}

// ------------------------------
// 🔄 BUCLE DEL JUEGO
// ------------------------------
function loop() {
  actualizar();
  dibujar();
  requestAnimationFrame(loop);
}

// ------------------------------
// ⚽ LÓGICA
// ------------------------------
function actualizar() {
  // Movimiento vertical de la impresora
  impresora.y += impresora.dy;

  if (impresora.y < 0 || impresora.y + impresora.height > canvas.height) {
    impresora.dy *= -1;
  }

  // Movimiento del balón
  if (balon.enMovimiento) {
    balon.x += balon.dx;

    if (balon.x + balon.radius > impresora.x) {
      golSound.play();

      goles++;
      verificarNivel();

      resetBalon();
    }
  }
}

// ------------------------------
// 📈 SUBIR NIVEL
// ------------------------------
function verificarNivel() {
  if (goles % 3 === 0) {
    nivel++;

    // Aumentar solo velocidad, NUNCA bajar
    impresora.dy = (4 + nivel) * escala;

    actualizarHUD();
  }
}

// ------------------------------
// 🔁 Reset balón tras gol
// ------------------------------
function resetBalon() {
  balon.x = 180 * escala;
  balon.y = 230 * escala;
  balon.enMovimiento = false;
  balon.dx = 0;
}

// ------------------------------
// 🎨 DIBUJO
// ------------------------------
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = "blue";
  ctx.fillRect(jugador.x * escala, jugador.y * escala, jugador.width * escala, jugador.height * escala);

  // Impresora
  ctx.fillStyle = "red";
  ctx.fillRect(impresora.x * escala, impresora.y * escala, impresora.width * escala, impresora.height * escala);

  // Balón
  ctx.beginPath();
  ctx.arc(balon.x * escala, balon.y * escala, balon.radius * escala, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

// ------------------------------
// ⌨️ CONTROLES
// ------------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") jugador.y -= jugador.speed;
  if (e.key === "ArrowDown") jugador.y += jugador.speed;
  if (e.key === " ") disparar();
});

// ------------------------------
// 📱 CONTROLES TÁCTILES
// ------------------------------
document.querySelector(".arriba")?.addEventListener("click", () => jugador.y -= jugador.speed);
document.querySelector(".abajo")?.addEventListener("click", () => jugador.y += jugador.speed);
document.querySelector(".derecha")?.addEventListener("click", disparar);

// ------------------------------
// 🔫 DISPARO
// ------------------------------
function disparar() {
  if (!balon.enMovimiento) {
    tiroSound.play();
    balon.enMovimiento = true;
    balon.dx = (7 + (nivel - 1) * 2) * escala;
  }
}

// ------------------------------
// 🎯 HUD (puntaje, nivel, vidas)
// ------------------------------
function actualizarHUD() {
  puntajeDiv.textContent = `Goles impresos: ${goles} | Nivel: ${nivel} | ❤️ Vidas: ${vidas}`;
}
