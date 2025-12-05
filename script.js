// 🎮 VARIABLES PRINCIPALES
const btnIniciar = document.getElementById("btn-iniciar");
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");

function ajustarResolucion() {
  const container = document.getElementById("canvas-container");
  const width = container.clientWidth;

  canvas.width = width;
  canvas.height = width * (500 / 900);

  const escala = canvas.width / 900;

  jugador.width = 120 * escala;
  jugador.height = 120 * escala;

  impresora.width = 100 * escala;
  impresora.height = 100 * escala;

  balon.radius = 15 * escala;

  impresora.x = canvas.width - impresora.width - 10;

  if (impresora.y + impresora.height > canvas.height) {
    impresora.y = canvas.height - impresora.height;
  }

  jugador.x = Math.min(jugador.x, canvas.width - jugador.width);
  jugador.y = Math.min(jugador.y, canvas.height - jugador.height);

  // ✅ FIX CRÍTICO PARA CELULAR
  if (!impresora.dy || impresora.dy === 0) {
    impresora.dy = 4;
  }
}

window.addEventListener("resize", ajustarResolucion);
window.addEventListener("orientationchange", ajustarResolucion);
setTimeout(ajustarResolucion, 300);

const puntajeDiv = document.getElementById("puntaje");
const preguntaBox = document.getElementById("pregunta-box");
const preguntaText = document.getElementById("pregunta-text");
const respuestaInput = document.getElementById("respuesta-input");
const responderBtn = document.getElementById("responder-btn");
const golSound = document.getElementById("gol-sound");
const tiroSound = document.getElementById("tiro-sound");

// 🎨 IMÁGENES DEL JUEGO
const canchas = ["canchaa.png", "estadio2.png", "estadio3.png", "estadio4.png", "estadio5.png"];

let fondo = new Image();
fondo.src = canchas[0];

const jugadorImg = new Image();
jugadorImg.src = "jugadorr.webp";

const impresoraImg = new Image();
impresoraImg.src = "impresoraa.webp";

impresoraImg.onload = jugadorImg.onload = ajustarResolucion;

// ⚙️ VARIABLES DEL JUEGO
let jugador = { x: 100, y: 200, width: 120, height: 120, speed: 8 };
let impresora = { x: 0, y: 200, width: 100, height: 100, dy: 4 };
let balon = { x: 180, y: 230, radius: 15, dx: 0, enMovimiento: false };

let goles = 0;
let nivel = 1;
let vidas = 3;
let juegoActivo = false;
let mostrandoPregunta = false;
let gameOver = false;

// ▶️ INICIAR JUEGO
btnIniciar.addEventListener("click", () => {
  pantallaInicio.classList.add("oculto");
  pantallaJuego.classList.remove("oculto");
  iniciarJuego();
});

function iniciarJuego() {
  juegoActivo = true;
  gameOver = false;

  goles = 0;
  nivel = 1;
  vidas = 3;

  jugador.x = 100;
  jugador.y = 200;

  impresora.y = 50;
  impresora.dy = 4;

  jugador.speed = 8;
  balon.enMovimiento = false;

  fondo.src = canchas[0];
  ajustarResolucion();
  loop();
}

// 🎮 CONTROLES TECLADO
document.addEventListener("keydown", (e) => {
  if (!juegoActivo || mostrandoPregunta || gameOver) return;

  if (e.key === "ArrowUp") jugador.y -= jugador.speed;
  if (e.key === "ArrowDown") jugador.y += jugador.speed;
  if (e.key === "ArrowLeft") jugador.x -= jugador.speed;
  if (e.key === "ArrowRight") jugador.x += jugador.speed;
  if (e.key === " ") disparar();
});

// 🔁 LOOP
function loop() {
  if (!juegoActivo) return;
  actualizar();
  dibujar();
  if (!gameOver) requestAnimationFrame(loop);
}

// ⚽ LÓGICA
function actualizar() {
  if (!balon.enMovimiento) {
    balon.x = jugador.x + jugador.width - 40;
    balon.y = jugador.y + jugador.height / 2;
  } else {
    balon.x += balon.dx;
  }

  impresora.y += impresora.dy;
  if (impresora.y <= 0 || impresora.y + impresora.height >= canvas.height) {
    impresora.dy *= -1;
  }

  if (
    balon.x + balon.radius >= impresora.x &&
    balon.y > impresora.y &&
    balon.y < impresora.y + impresora.height
  ) {
    golSound.play();
    balon.enMovimiento = false;
    goles++;
    if (goles % 3 === 0) setTimeout(mostrarPregunta, 400);
  }

  if (balon.x > canvas.width) {
    balon.enMovimiento = false;
    vidas--;
    if (vidas <= 0) mostrarGameOver();
  }

  puntajeDiv.innerHTML = `⚽ ${goles} | ❤️ ${vidas} | 🌍 ${nivel}`;
}

// 🎨 DIBUJO
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
  ctx.drawImage(impresoraImg, impresora.x, impresora.y, impresora.width, impresora.height);

  ctx.beginPath();
  ctx.arc(balon.x, balon.y, balon.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

// ❓ PREGUNTAS
const preguntas = [
  { pregunta: "¿Cuál es el planeta más grande?", respuesta: "jupiter" },
  { pregunta: "¿En qué continente está Egipto?", respuesta: "africa" },
  { pregunta: "¿Qué océano es el más grande?", respuesta: "pacifico" }
];

function mostrarPregunta() {
  mostrandoPregunta = true;
  const p = preguntas[Math.floor(Math.random() * preguntas.length)];
  preguntaText.textContent = p.pregunta;
  preguntaBox.classList.remove("oculto");

  responderBtn.onclick = () => {
    const r = respuestaInput.value.toLowerCase();
    preguntaBox.classList.add("oculto");
    mostrandoPregunta = false;
    if (r === p.respuesta) subirNivel();
    else vidas--;
  };
}

// ⬆️ NIVELES
function subirNivel() {
  nivel++;
  impresora.dy *= 1.3;
}

// 💀 GAME OVER
function mostrarGameOver() {
  juegoActivo = false;
  gameOver = true;
  setTimeout(() => location.reload(), 2500);
}

// 📱 CONTROLES MÓVIL
function moverArriba(){ jugador.y -= jugador.speed; }
function moverAbajo(){ jugador.y += jugador.speed; }
function moverIzquierda(){ jugador.x -= jugador.speed; }
function moverDerecha(){ jugador.x += jugador.speed; }

function disparar(){
  if(!balon.enMovimiento){
    tiroSound.play();
    balon.enMovimiento = true;
    balon.dx = 8;
  }
}

const controles = {
  ".flecha.arriba": moverArriba,
  ".flecha.abajo": moverAbajo,
  ".flecha.izquierda": moverIzquierda,
  ".flecha.derecha": moverDerecha,
  ".boton-space": disparar
};

for (const sel in controles) {
  const btn = document.querySelector(sel);
  if (!btn) continue;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    controles[sel]();
  });

  btn.addEventListener("mousedown", controles[sel]);
}
