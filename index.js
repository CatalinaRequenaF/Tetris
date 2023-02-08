//Constantes
const secuencia = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];


// Obtenemos un número aleatorio 
function numAleatorio(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Con el numero aleatorio que sacamos en la funcion anteriorGenera una nueva secuencia de tetrominio
function generarSecuencia() {
  while (secuencia.length) {
    const rand = numAleatorio(0, secuencia.length - 1);
    const nombre = secuencia.splice(rand, 1)[0];
    tetrominosecuencia.push(nombre);
  }
}

// Obtiene la proxima secuencia
function nuevoTetromino() {
  if (tetrominosecuencia.length === 0) {
    generarSecuencia();
  }

  const nombre = tetrominosecuencia.pop();
  const matriz = tetrominos[nombre];

  // I and O start centered, all others start in left-middle
  const Columna = campoDeJuego[0].length / 2 - Math.ceil(matriz[0].length / 2);

  // I starts on Fila 21 (-1), all others start on Fila 22 (-2)
  const Fila = nombre === 'I' ? -1 : -2;

  return {
    nombre: nombre,      // Nombre de la pieza 
    matriz: matriz,  // Rotacion actual de la pieza
    Fila: Fila,        // Fila actual 
    Columna: Columna         // Columna actual
  };
}

// Rotar matriz 90 grados
function rotar(matriz) {
  const N = matriz.length - 1;
  const result = matriz.map((Fila, i) =>
    Fila.map((val, j) => matriz[N - j][i])
  );

  return result;
}

// Verificar que es valida una nueva matriz, fila o columna
function esValido(matriz, celdaFila, celdaColumna) {
  for (let Fila = 0; Fila < matriz.length; Fila++) {
    for (let Columna = 0; Columna < matriz[Fila].length; Columna++) {
      if (matriz[Fila][Columna] && (
          // Limites del juego
          celdaColumna + Columna < 0 ||
          celdaColumna + Columna >= campoDeJuego[0].length ||
          celdaFila + Fila >= campoDeJuego.length ||
          // Columnalides with another piece
          campoDeJuego[celdaFila + Fila][celdaColumna + Columna])
        ) {
        return false;
      }
    }
  }

  return true;
}

// Coloca el tetromino en el campo de juego
function colocarTetromino() {
  for (let Fila = 0; Fila < tetromino.matriz.length; Fila++) {
    for (let Columna = 0; Columna < tetromino.matriz[Fila].length; Columna++) {
      if (tetromino.matriz[Fila][Columna]) {

        // Si algun trozo del tetromino se sale de la pantalla, el juego se acaba
        if (tetromino.Fila + Fila < 0) {
          return mostrarGameOver();
        }

        campoDeJuego[tetromino.Fila + Fila][tetromino.Columna + Columna] = tetromino.nombre;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let Fila = campoDeJuego.length - 1; Fila >= 0; ) {
    if (campoDeJuego[Fila].every(celda => !!celda)) {

      // drop every Fila above this one
      for (let r = Fila; r >= 0; r--) {
        for (let c = 0; c < campoDeJuego[r].length; c++) {
          campoDeJuego[r][c] = campoDeJuego[r-1][c];
        }
      }
    }
    else {
      Fila--;
    }
  }

  tetromino = nuevoTetromino();
}

// show the game over screen
function mostrarGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = 'black';
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominosecuencia = [];

// Ver estado de cada celda del juego (con un array 2d)
// tetris campoDeJuego is 10x20, with a few Filas offscreen
const campoDeJuego = [];

// populate the empty state
for (let Fila = -2; Fila < 20; Fila++) {
  campoDeJuego[Fila] = [];

  for (let Columna = 0; Columna < 10; Columna++) {
    campoDeJuego[Fila][Columna] = 0;
  }
}

// Dibujo de cada tetronimio // figura de tetris
const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

// Colorear cada tetronimio
const Columnaors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

let count = 0;
let tetromino = nuevoTetromino();
let rAF = null;  // keep track of the animation frame so we can cancel it
let gameOver = false;

// game loop
function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  // draw the campoDeJuego
  for (let Fila = 0; Fila < 20; Fila++) {
    for (let Columna = 0; Columna < 10; Columna++) {
      if (campoDeJuego[Fila][Columna]) {
        const nombre = campoDeJuego[Fila][Columna];
        context.fillStyle = Columnaors[nombre];

        // drawing 1 px smaller than the grid creates a grid effect
        context.fillRect(Columna * grid, Fila * grid, grid-1, grid-1);
      }
    }
  }

  // draw the active tetromino
  if (tetromino) {

    // tetromino falls every 35 frames
    if (++count > 35) {
      tetromino.Fila++;
      count = 0;

      // colocar piece if it runs into anything
      if (!esValido(tetromino.matriz, tetromino.Fila, tetromino.Columna)) {
        tetromino.Fila--;
        colocarTetromino();
      }
    }

    context.fillStyle = Columnaors[tetromino.nombre];

    for (let Fila = 0; Fila < tetromino.matriz.length; Fila++) {
      for (let Columna = 0; Columna < tetromino.matriz[Fila].length; Columna++) {
        if (tetromino.matriz[Fila][Columna]) {

          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect((tetromino.Columna + Columna) * grid, (tetromino.Fila + Fila) * grid, grid-1, grid-1);
        }
      }
    }
  }
}

// listen to keyboard events to move the active tetromino
document.addEventListener('keydown', function(e) {
  if (gameOver) return;

  // left and right arFila keys (move)
  if (e.which === 37 || e.which === 39) {
    const Columna = e.which === 37
      ? tetromino.Columna - 1
      : tetromino.Columna + 1;

    if (esValido(tetromino.matriz, tetromino.Fila, Columna)) {
      tetromino.Columna = Columna;
    }
  }

  // up arFila key (rotar)
  if (e.which === 38) {
    const matriz = rotar(tetromino.matriz);
    if (esValido(matriz, tetromino.Fila, tetromino.Columna)) {
      tetromino.matriz = matriz;
    }
  }

  // down arFila key (drop)
  if(e.which === 40) {
    const Fila = tetromino.Fila + 1;

    if (!esValido(tetromino.matriz, Fila, tetromino.Columna)) {
      tetromino.Fila = Fila - 1;

      colocarTetromino();
      return;
    }

    tetromino.Fila = Fila;
  }
});

// start the game
rAF = requestAnimationFrame(loop);
