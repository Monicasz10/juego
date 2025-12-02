// 🎮 VARIABLES PRINCIPALES
const btnIniciar = document.getElementById("btn-iniciar");
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
// 📱 HACER EL CANVAS RESPONSIVO SIN CAMBIAR EL JUEGO
function ajustarCanvas() {
  const scale = Math.min(window.innerWidth / 900, window.innerHeight / 500);
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = "top center";
}
window.addEventListener("resize", ajustarCanvas);
ajustarCanvas(); // ejecuta al entrar

const puntajeDiv = document.getElementById("puntaje");
const preguntaBox = document.getElementById("pregunta-box");
const preguntaText = document.getElementById("pregunta-text");
const respuestaInput = document.getElementById("respuesta-input");
const responderBtn = document.getElementById("responder-btn");

const golSound = document.getElementById("gol-sound");
const tiroSound = document.getElementById("tiro-sound");

// 🎨 IMÁGENES DEL JUEGO
const canchas = [
  "imagenes/canchaa.png",
  "imagenes/estadio2.png",
  "imagenes/estadio3.png",
  "imagenes/estadio4.png",
  "imagenes/estadio5.png",
];

let fondo = new Image();
fondo.src = canchas[0];

const jugadorImg = new Image();
jugadorImg.src = "imagenes/jugadorr.webp";

const impresoraImg = new Image();
impresoraImg.src = "imagenes/impresoraa.webp";

// ⚙️ VARIABLES DEL JUEGO
let jugador = { x: 100, y: 200, width: 120, height: 120, speed: 8 };
let impresora = { x: 700, y: 200, width: 100, height: 100, dy: 4 }; // velocidad base estable
let balon = { x: 180, y: 230, radius: 15, dx: 0, enMovimiento: false };

let goles = 0;
let nivel = 1;
let vidas = 3;
let juegoActivo = false;
let mostrandoPregunta = false;
let gameOver = false;

// 🧠 PREGUNTAS
const preguntas = [
  { pregunta: "¿Cuál es el planeta más grande del sistema solar?", respuesta: "jupiter" },
  { pregunta: "¿En qué continente está Egipto?", respuesta: "africa" },
  { pregunta: "¿Cuál es el océano más grande?", respuesta: "pacifico" },
  { pregunta: "¿Qué idioma se habla en Brasil?", respuesta: "portugues" },
  { pregunta: "¿Quién pintó la Mona Lisa?", respuesta: "leonardo da vinci" },
  { pregunta: "¿Cuál es el metal más ligero?", respuesta: "litio" },
  { pregunta: "¿Cuántos lados tiene un hexágono?", respuesta: "6" },
  { pregunta: "¿En qué país se encuentra la Torre Eiffel?", respuesta: "francia" },
  { pregunta: "¿Cuál es el río más largo del mundo?", respuesta: "nilo" },
  { pregunta: "¿Qué gas respiramos para vivir?", respuesta: "oxigeno" }
];

// ▶️ INICIAR EL JUEGO
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

  impresora.y = 200;
  impresora.dy = 4; // velocidad inicial FIXED

  jugador.speed = 8;
  balon.enMovimiento = false;

  fondo.src = canchas[0];
  loop();
}

// 🎮 CONTROLES DEL JUGADOR
document.addEventListener("keydown", (e) => {
  if (!juegoActivo || mostrandoPregunta || gameOver) return;

  switch (e.key) {
    case "ArrowUp":
      jugador.y = Math.max(0, jugador.y - jugador.speed);
      break;
    case "ArrowDown":
      jugador.y = Math.min(canvas.height - jugador.height, jugador.y + jugador.speed);
      break;
    case "ArrowLeft":
      jugador.x = Math.max(0, jugador.x - jugador.speed);
      break;
    case "ArrowRight":
      jugador.x = Math.min(canvas.width - jugador.width, jugador.x + jugador.speed);
      break;
    case " ":
      if (!balon.enMovimiento) {
        tiroSound.play();
        balon.enMovimiento = true;
        balon.dx = 7 + (nivel - 1) * 2;
      }
      break;
  }
});

// 🔁 LOOP PRINCIPAL
function loop() {
  if (!juegoActivo) return;
  actualizar();
  dibujar();
  if (!gameOver) requestAnimationFrame(loop);
}

// ⚽ LÓGICA DEL JUEGO
function actualizar() {
  if (!balon.enMovimiento) {
    balon.x = jugador.x + jugador.width - 40;
    balon.y = jugador.y + jugador.height / 2;
  } else {
    balon.x += balon.dx;
  }

  // Movimiento de impresora
  impresora.y += impresora.dy;
  if (impresora.y <= 0 || impresora.y + impresora.height >= canvas.height) {
    impresora.dy *= -1;
  }

  // Detectar gol
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

  // Balón fuera
  if (balon.x > canvas.width) {
    balon.enMovimiento = false;
    vidas--;
    if (vidas <= 0) mostrarGameOver();
  }

  // Marcador reducido
  puntajeDiv.innerHTML = `
    <div style="
      display: inline-block;
      background: rgba(0, 0, 0, 0.7);
      padding: 8px 12px;
      border: 2px solid #00ffcc;
      border-radius: 10px;
      font-family:'Press Start 2P';
      color:#00ffcc;
      text-shadow:0 0 6px #00ffcc;
    ">
    ⚽ ${goles} | ❤️ ${vidas} | 🌍 ${nivel}
    </div>`;
}

// 🎨 DIBUJAR
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
  ctx.drawImage(impresoraImg, impresora.x, impresora.y, impresora.width, impresora.height);

  ctx.beginPath();
  ctx.arc(balon.x, balon.y, balon.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.stroke();
}

// ❓ PREGUNTAS
function mostrarPregunta() {
  mostrandoPregunta = true;

  const p = preguntas[Math.floor(Math.random() * preguntas.length)];
  preguntaText.textContent = p.pregunta;

  preguntaBox.classList.remove("oculto");
  respuestaInput.focus();

  responderBtn.onclick = () => {
    const r = respuestaInput.value.toLowerCase();
    respuestaInput.value = "";
    preguntaBox.classList.add("oculto");
    mostrandoPregunta = false;

    if (r === p.respuesta) {
      subirNivel();
    } else {
      vidas--;
      if (vidas <= 0) mostrarGameOver();
    }
  };
}

// ⬆️ SUBIR NIVEL
function subirNivel() {
  nivel++;

  // ACELERACIÓN REAL
  impresora.dy *= 1.35;   // más rápido sin error
  jugador.speed += 0.5;   // mejora suave
  cambiarCancha();

  if (nivel > 5) mostrarVictoria();
}

// 🏟️ CAMBIAR CANCHA
function cambiarCancha() {
  fondo.src = canchas[(nivel - 1) % canchas.length];
}

// 💀 GAME OVER
function mostrarGameOver() {
  juegoActivo = false;
  gameOver = true;

  setTimeout(() => {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#ff4444";
    ctx.font="bold 48px 'Press Start 2P'";
    ctx.textAlign="center";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 30);

    crearBotonReinicio();
  },300);
}

// 🏆 VICTORIA
function mostrarVictoria() {
  juegoActivo = false;
  gameOver = true;

  setTimeout(() => {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#00ffcc";
    ctx.textAlign="center";

    ctx.font="bold 42px 'Press Start 2P'";
    ctx.fillText("¡GANASTE!", canvas.width/2, canvas.height/2 - 40);

    ctx.font="bold 20px 'Press Start 2P'";
    ctx.fillText("Reparaste la impresora", canvas.width/2, canvas.height/2 + 15);

    crearBotonReinicio();
  },300);
}

// 🔁 BOTÓN DE REINICIO
function crearBotonReinicio() {
  const boton = document.createElement("button");
  boton.textContent = "🔁 Reiniciar";
  Object.assign(boton.style, {
    position:"absolute",
    top:"70%",
    left:"50%",
    transform:"translate(-50%,-50%)",
    padding:"15px 30px",
    background:"#00ffcc",
    border:"none",
    borderRadius:"12px",
    fontFamily:"'Press Start 2P'",
    cursor:"pointer",
    zIndex:"999"
  });
  pantallaJuego.appendChild(boton);
  boton.onclick = () => location.reload();
}

// 📱 CONTROLES MÓVILES
const btnUp = document.querySelector(".flecha.arriba");
const btnDown = document.querySelector(".flecha.abajo");
const btnLeft = document.querySelector(".flecha.izquierda");
const btnRight = document.querySelector(".flecha.derecha");
const btnShoot = document.querySelector(".boton-space");

function moverArriba(){ if(juegoActivo&&!mostrandoPregunta) jugador.y-=jugador.speed; }
function moverAbajo(){ if(juegoActivo&&!mostrandoPregunta) jugador.y+=jugador.speed; }
function moverIzquierda(){ if(juegoActivo&&!mostrandoPregunta) jugador.x-=jugador.speed; }
function moverDerecha(){ if(juegoActivo&&!mostrandoPregunta) jugador.x+=jugador.speed; }

function disparar(){
  if(!balon.enMovimiento && juegoActivo && !mostrandoPregunta){
    tiroSound.play();
    balon.enMovimiento = true;
    balon.dx = 7 + (nivel - 1) * 2;
  }
}

btnUp.addEventListener("touchstart", moverArriba);
btnDown.addEventListener("touchstart", moverAbajo);
btnLeft.addEventListener("touchstart", moverIzquierda);
btnRight.addEventListener("touchstart", moverDerecha);
btnShoot.addEventListener("touchstart", disparar);
// 📱 CONTROLES MÓVILES — FIX DEFINITIVO
document.addEventListener("DOMContentLoaded", () => {
  const btnUp = document.querySelector(".flecha.arriba");
  const btnDown = document.querySelector(".flecha.abajo");
  const btnLeft = document.querySelector(".flecha.izquierda");
  const btnRight = document.querySelector(".flecha.derecha");
  const btnShoot = document.querySelector(".boton-space");

  if (btnUp) btnUp.addEventListener("touchstart", (e) => { e.preventDefault(); moverArriba(); });
  if (btnDown) btnDown.addEventListener("touchstart", (e) => { e.preventDefault(); moverAbajo(); });
  if (btnLeft) btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); moverIzquierda(); });
  if (btnRight) btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); moverDerecha(); });
  if (btnShoot) btnShoot.addEventListener("touchstart", (e) => { e.preventDefault(); disparar(); });

  // Para que también funcionen con click (PC)
  if (btnUp) btnUp.addEventListener("mousedown", moverArriba);
  if (btnDown) btnDown.addEventListener("mousedown", moverAbajo);
  if (btnLeft) btnLeft.addEventListener("mousedown", moverIzquierda);
  if (btnRight) btnRight.addEventListener("mousedown", moverDerecha);
  if (btnShoot) btnShoot.addEventListener("mousedown", disparar);
});
