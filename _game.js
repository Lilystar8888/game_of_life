const GameOfLife = (() => {
  const draw = (canvas, ctx, config, random) => {

    let x, y;

      // Reset canvas and set colors
      canvas.width = canvas.width;
      ctx.strokeStyle = config.gridColor;
      ctx.fillStyle = random?getRndColor():config.cellColor;

      // draw grid
      for (x = 0.5; x < config.cellsX * config.cellSize; x += config.cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, config.cellsY * config.cellSize);
      }

      for (y = 0.5; y < config.cellsY * config.cellSize; y += config.cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(config.cellsX * config.cellSize, y);
      }

      ctx.stroke();

      // draw matrix
      for (x = 0; x < matrix.length; x++) {
        for (y = 0; y < matrix[x].length; y++) {
          if (matrix[x][y]) {
            ctx.fillRect(
              x * config.cellSize + 1,
              y * config.cellSize + 1,
              config.cellSize - 1,
              config.cellSize - 1
            );
          }
        }
      }
    },
    countNeighbours = (cx, cy) => {
      let count = 0;

      for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
          if (x == cx && y == cy) continue;
          if (x < 0 || x >= matrix.length || y < 0 || y >= matrix[x].length)
            continue;
          if (matrix[x][y]) count++;
        }
      }

      return count;
    },
    randomize = (canvas, ctx, config, random) => {

      for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix[x].length; y++) {
          matrix[x][y] = Math.random() < 0.3;
        }
      }

      draw(canvas, ctx, config, random);
    },
    toggleCell = (cx, cy) => {
      if (cx >= 0 && cx < matrix.length && cy >= 0 && cy < matrix[0].length) {
        matrix[cx][cy] = !matrix[cx][cy];
        draw(canvas, ctx, config);
      }
    };
  return {
    // Initialize the canvas and matrix.
    init: (canvas, ctx, config) => {
      console.log("init=>canvas", canvas);
      console.log("init=>ctx", ctx);
      console.log("init=>config", config);

      // set canvas dimensions
      canvas.width = config.cellsX * config.cellSize;
      canvas.height = config.cellsY * config.cellSize;

      // initialize matrix
      matrix = new Array(config.cellsX);
      for (var x = 0; x < matrix.length; x++) {
        matrix[x] = new Array(config.cellsY);
        for (var y = 0; y < matrix[x].length; y++) {
          matrix[x][y] = false;
        }
      }

      draw(canvas, ctx, config);
      randomize(canvas, ctx, config, false);
    },
    getRandom: (canvas, ctx, config) => {
      randomize(canvas, ctx, config, true);
    },
    step: (canvas, ctx, config) => {
      // initalize buffer
      let x, y;
      let buffer = new Array(matrix.length);
      for (x = 0; x < buffer.length; x++) {
        buffer[x] = new Array(matrix[x].length);
      }

      // calculate one step
      for (x = 0; x < matrix.length; x++) {
        for (y = 0; y < matrix[x].length; y++) {
          // count neighbours
          let neighbours = countNeighbours(x, y);

          // use rules
          if (matrix[x][y]) {
            //2.Any live cell with two or three live neighbors lives
            if (neighbours == 2 || neighbours == 3) buffer[x][y] = true;
            //1.Any live cell with fewer than two live neighbors dies
            if (neighbours < 2 || neighbours > 3) buffer[x][y] = false;
          } else {
            //3.Any live cell with more than three live neighbors dies
            //4.Any dead cell with exactly three live neighbors becomes a live cell
            if (neighbours == 3) buffer[x][y] = true;
          }
        }
      }

      // 5.The next state is created by applying the above rules simultaneously to every cell in the current state, where births and deaths occur
      matrix = buffer;
      round++;
      draw(canvas, ctx, config);
    },
    Reset: (canvas, ctx, config) => {
      for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix[x].length; y++) {
          matrix[x][y] = false;
        }
      }

      draw(canvas, ctx, config);
      randomize(canvas, ctx, config, false);
    },
  };
})();

// animation loop
var timer;
var matrix = undefined;
var round = 0;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
var heightRatio = 1.5;
canvas.height = canvas.width * heightRatio;

const getRndColor = () => {
  var r = 255*Math.random()|0,
      g = 255*Math.random()|0,
      b = 255*Math.random()|0;
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

// default config.
const config = {
  cellsX: 100,
  cellsY: 80,
  cellSize: 10,
  rules: "23/3",
  gridColor: "#eee",
  cellColor: "#ccc",
};

// Initialize game
GameOfLife.init(canvas, ctx, config);

// run or stop the animation loop
$("#run").click((e) => {
  if (timer === undefined) {
    GameOfLife.init(canvas, ctx, config);
    timer = setInterval(run, 40);
    $(e.target).text("Stop");
  } else {
    clearInterval(timer);
    timer = undefined;
    $(e.target).text("Start");
  }
});

// make a single step in the animation loop
$("#step").click(() => {
  if (timer === undefined) {
    GameOfLife.step(canvas, ctx, config);
    $("#round span").text(round);
  }
});

// Reset the entire game board
$("#Reset").click(() => {
  GameOfLife.Reset(canvas, ctx, config);
  round = 0;
  $("#round span").text(round);
});

// set a random pattern on the game board
$("#rand").click(() => {
  GameOfLife.getRandom(canvas, ctx, config);
  round = 0;
  $("#round span").text(round);
});

// runs the animation loop, calculates a new step and updates the counter
const run = () => {
  GameOfLife.step(canvas, ctx, config);
  $("#round span").text(round);
};
