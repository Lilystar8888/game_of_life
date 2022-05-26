
function Game(canvas, cfg) {
  
  // Properties
  this.canvas   = canvas;
  this.ctx      = canvas.getContext("2d");
  this.matrix   = undefined;
  this.round    = 0;
  
  // Merge of the default and delivered config.
  var defaults = {
    cellsX    : 100,
    cellsY    : 80,
    cellSize  : 10,
    rules     : "23/3",
    gridColor : "#eee",
    cellColor : "#ccc"
  };
  this.cfg = $.extend({}, defaults, cfg);
  
  // Initialize the canvas and matrix.
  this.init();
}


Game.prototype = {
  
  /**
   * Initializes the canvas object and the matrix.
   */
  init: function() {
    // set canvas dimensions
    this.canvas.width  = this.cfg.cellsX * this.cfg.cellSize;
    this.canvas.height = this.cfg.cellsY * this.cfg.cellSize;
    
    // initialize matrix
    this.matrix = new Array(this.cfg.cellsX);
    for (var x = 0; x < this.matrix.length; x++) {
      this.matrix[x] = new Array(this.cfg.cellsY);
      for (var y = 0; y < this.matrix[x].length; y++) {
        this.matrix[x][y] = false;
      }
    }
    
    this.draw();
  },
  
  /**
   * Draws the entire game on the canvas.
   */
  draw: function() {
    var x, y;
    // clear canvas and set colors
    this.canvas.width = this.canvas.width;
    this.ctx.strokeStyle = this.cfg.gridColor;
    this.ctx.fillStyle = this.cfg.cellColor;
    
    // draw grid
    for (x = 0.5; x < this.cfg.cellsX * this.cfg.cellSize; x += this.cfg.cellSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.cfg.cellsY * this.cfg.cellSize);
    }

    for (y = 0.5; y < this.cfg.cellsY * this.cfg.cellSize; y += this.cfg.cellSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.cfg.cellsX * this.cfg.cellSize, y);
    }

    this.ctx.stroke();
    
    // draw matrix
    for (x = 0; x < this.matrix.length; x++) {
      for (y = 0; y < this.matrix[x].length; y++) {
        if (this.matrix[x][y]) {
          this.ctx.fillRect(x * this.cfg.cellSize + 1,
                            y * this.cfg.cellSize + 1,
                    this.cfg.cellSize - 1,
                    this.cfg.cellSize - 1);
        }
      }
    }
  },
  
  /**
   * Calculates the new state by applying the rules.
   * All changes were made in a buffer matrix and swapped at the end.
   */
  step: function() {
    // initalize buffer
    var x, y;
    var buffer = new Array(this.matrix.length);
    for (x = 0; x < buffer.length; x++) {
      buffer[x] = new Array(this.matrix[x].length);
    }
    
    // calculate one step
    for (x = 0; x < this.matrix.length; x++) {
      for (y = 0; y < this.matrix[x].length; y++) {
        // count neighbours
        var neighbours = this.countNeighbours(x, y);
        
        // use rules
        if (this.matrix[x][y]) {
          if (neighbours == 2 || neighbours == 3)
            buffer[x][y] = true;
          if (neighbours < 2 || neighbours > 3)
            buffer[x][y] = false;
        } else {
          if (neighbours == 3)
            buffer[x][y] = true;
        }
      }
    }
    
    // flip buffers
    this.matrix = buffer;
    this.round++;
    this.draw();
  },
  
  /**
   * Counts the living neighbours of the cell at the given coordinates.
   * A cell can have up to 8 neighbours. Borders are concidered as dead.
   * 
   * @param cx horizontal coordinates of the given cell
   * @param cy vertical coordinates of the given cell
   * @return the number of living neighbours
   */
  countNeighbours: function(cx, cy) {
    var count = 0;
    
    for (var x = cx-1; x <= cx+1; x++) {
      for (var y = cy-1; y <= cy+1; y++) {
        if (x == cx && y == cy)
          continue;
        if (x < 0 || x >= this.matrix.length || y < 0 || y >= this.matrix[x].length)
          continue;
        if (this.matrix[x][y])
          count++;
      }
    }
    
    return count;
  },
  
  /**
   * Clears the entire matrix, by setting all cells to false.
   */
  clear: function() {
    for (var x = 0; x < this.matrix.length; x++) {
      for (var y = 0; y < this.matrix[x].length; y++) {
        this.matrix[x][y] = false;
      }
    }
    
    this.draw();
  },
  
  /**
   * Fills the matrix with a random pattern.
   * The chance that a cell will be alive is at 30%.
   */
  randomize: function() {
    for (var x = 0; x < this.matrix.length; x++) {
      for (var y = 0; y < this.matrix[x].length; y++) {
        this.matrix[x][y] = Math.random() < 0.3;
      }
    }
    
    this.draw();
  },
  
  /**
   * Toggels the state of one cell at the given coordinates.
   *
   * @param cx horizontal coordinates of the given cell
   * @param cy vertical coordinates of the given cell
   */
  toggleCell: function(cx, cy) {
    if (cx >= 0 && cx < this.matrix.length && cy >= 0 && cy < this.matrix[0].length) {
      this.matrix[cx][cy] = !this.matrix[cx][cy];
      this.draw();
    }
  }
};

/* ***** MAIN SCRIPT ***** */

// animation loop
var timer;

// Initialize game
var game = new Game(document.getElementById("game"));

// run or stop the animation loop
$("#run").click(function() {
  if (timer === undefined) {
    timer = setInterval(run, 40);
    $(this).text("Stop");
  } else {
    clearInterval(timer);
    timer = undefined;
    $(this).text("Start");
  }
});

// make a single step in the animation loop
$("#step").click(function() {
  if (timer === undefined) {
    game.step();
    $("#round span").text(game.round);
  }
});

// clear the entire game board
$("#clear").click(function() {
  game.clear();
  game.round = 0;
  $("#round span").text(game.round);
});

// set a random pattern on the game board
$("#rand").click(function() {
  game.randomize();
  game.round = 0;
  $("#round span").text(game.round);
});

// register onclick on the canvas
game.canvas.addEventListener("click", gameOnClick, false);

// determens the click position and toggels the corresponding cell
function gameOnClick(e) {
  var x;
  var y;
  
  // determen click position
  if (e.pageX !== undefined && e.pageY !== undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  
  // make it relativ to canvas
  x -= game.canvas.offsetLeft;
  y -= game.canvas.offsetTop;
  
  // calculate clicked cell
  x = Math.floor(x/game.cfg.cellSize);
  y = Math.floor(y/game.cfg.cellSize);
  
  game.toggleCell(x, y);
}

// runs the animation loop, calculates a new step and updates the counter
function run() {
  game.step();
  $("#round span").text(game.round);
}

game.randomize();