var board;
var beginning;
var gameStatus;
var firstMine;
var currentCell;
var mineSlider;
var numMines;

function setup() {
  createCanvas(620, 750);
  ellipseMode(CENTER);
  //initialize variables
  beginning = true;
  gameStatus = 0;
  firstMine = createVector(100, 100);
  currentCell = createVector(7, 7);
  mineSlider = createSlider(5, 100, 35);
  mineSlider.position(410, 45);
  mineSlider.style('width', '190px');
  numMines = 35;

  //create blank board
  board = [];
  for (var i = 0; i < 15; i++) {
    board[i] = [];
    for (var j = 0; j < 15; j++) {
      board[i][j] = new Cell(i, j);
    }
  }
}

function draw() {
  background(255);

  //slider was moved --> reset board
  if (numMines != mineSlider.value()) {
    resetGame();
    numMines = mineSlider.value();
  }

  //on screen text
  textFont('Georgia');
  textSize(15);
  noStroke();
  fill(0);
  text("number of mines: " + numMines, 440, 80);

  textSize(20);
  text("Controls:", 75, 35);
  textSize(15);
  text("move with arrows", 55, 55);
  text("open cell with spacebar", 37, 75);
  text("place flag with 'F'", 59, 95);

  //draw cells
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      board[i][j].drawTile();
      board[i][j].showCell();
    }
  }

  //draw current cell
  drawBorder(currentCell.x * 40 + 10, currentCell.y * 40 + 140, 40, 40, true);

  //reset button
  fill(189);
  stroke(0);
  rect(width / 2 - 80, 30, 160, 80);
  drawBorder(width / 2 - 80, 30, 160, 80, false);
  textSize(40);
  fill(0, 0, 255);
  textFont('Georgia');
  text("RESET", width / 2 - 64.3, 85);
}

function keyPressed() {
  var x = currentCell.x;
  var y = currentCell.y;

  if (gameStatus == 0) {
    //space bar
    if (key == ' ') {
      //beginning of game: set up board
      if (beginning) {
        board[y][x].value = 0;
        setupBoard(y, x);
        beginning = false;
      } else {
        if (board[y][x].flagged) {
          board[y][x].flagged = false;
        }
        if (board[y][x].hidden) {
          //empty cell: explode
          if (board[y][x].value == 0) {
            explode(y, x);
          }
          //normal cell: open
          if (board[y][x].value > 0) {
            board[y][x].hidden = false;
          }
          //mine: game over
          if (board[y][x].value == -1) {
            firstMine.set(x, y);
            gameStatus = -1;
            //show every mine
            for (var i = 0; i < board.length; i++) {
              for (var j = 0; j < board[0].length; j++) {
                showCells("mine");
              }
            }
          }
        }
      }
    }
    //f
    if (key == 'f') {
      if (board[y][x].hidden && !beginning) {
        board[y][x].flagged = !board[y][x].flagged;
        gameStatus = checkBoard();
        if (gameStatus == 1) {
          showCells("regular");
        }
      }
    }
    //arrows
    switch (keyCode) {
      case LEFT_ARROW:
        currentCell.x = constrain(currentCell.x - 1, 0, 14);
        break;
      case RIGHT_ARROW:
        currentCell.x = constrain(currentCell.x + 1, 0, 14);
        break;
      case UP_ARROW:
        currentCell.y = constrain(currentCell.y - 1, 0, 14);
        break;
      case DOWN_ARROW:
        currentCell.y = constrain(currentCell.y + 1, 0, 14);
        break;
    }
  }
}

function setupBoard(startI, startJ) {
  //assign mines
  var tempNumMines = numMines;
  while (tempNumMines > 0) {
    var i = parseInt(random(15));
    var j = parseInt(random(15));

    if (abs(startI - i) > 1 && abs(startJ - j) > 1) {
      if (board[i][j].value != -1) {
        board[i][j].value = -1;
        tempNumMines --;
      }
    }
  }
  //assign values
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].value != -1) {
        board[i][j].value = checkNeighbors(i, j);
      }
    }
  }
  //starting explode
  explode(startI, startJ);
}

function checkNeighbors(i, j) {
  var count = 0;
  if (i > 0) { //can check top
    count += (board[i-1][j].value == -1 ? 1 : 0);
  }
  if (i < board.length - 1) { //can check bottom
    count += (board[i+1][j].value == -1 ? 1 : 0);
  }
  if (j > 0) { //can check left
    count += (board[i][j-1].value == -1 ? 1 : 0);
  }
  if (j < board[0].length - 1) { //can check right
    count += (board[i][j+1].value == -1 ? 1 : 0);
  }
  if (i > 0 && j > 0) { //can check top left
    count += (board[i-1][j-1].value == -1 ? 1 : 0);
  }
  if (i > 0 && j < board[0].length - 1) { //can check top right
    count += (board[i-1][j+1].value == -1 ? 1 : 0);
  }
  if (i < board.length - 1 && j > 0) { //can check bottom left
    count += (board[i+1][j-1].value == -1 ? 1 : 0);
  }
  if (i < board.length - 1 && j < board[0].length - 1) { //can check bottom right
    count += (board[i+1][j+1].value == -1 ? 1 : 0);
  }
  return count;
}

function explode(i, j) {
  board[i][j].hidden = false;
  if (i > 0) { //can check top
    if (board[i-1][j].value == 0 && board[i-1][j].hidden) {
      explode(i-1, j);
    }
    board[i-1][j].hidden = false;
  }
  if (i < board.length - 1) { //can check bottom
    if (board[i+1][j].value == 0 && board[i+1][j].hidden) {
      explode(i+1, j);
    }
    board[i+1][j].hidden = false;
  }
  if (j > 0) { //can check left
    if (board[i][j-1].value == 0 && board[i][j-1].hidden) {
      explode(i, j-1);
    }
    board[i][j-1].hidden = false;
  }
  if (j < board[0].length - 1) { //can check right
    if (board[i][j+1].value == 0 && board[i][j+1].hidden) {
      explode(i, j+1);
    }
    board[i][j+1].hidden = false;
  }
  if (i > 0 && j > 0) { //can check top left
    if (board[i-1][j-1].value == 0 && board[i-1][j-1].hidden) {
      explode(i-1, j-1);
    }
    board[i-1][j-1].hidden = false;
  }
  if (i > 0 && j < board[0].length - 1) { //can check top right
    if (board[i-1][j+1].value == 0 && board[i-1][j+1].hidden) {
      explode(i-1, j+1);
    }
    board[i-1][j+1].hidden = false;
  }
  if (i < board.length - 1 && j > 0) { //can check bottom left
    if (board[i+1][j-1].value == 0 && board[i+1][j-1].hidden) {
      explode(i+1, j-1);
    }
    board[i+1][j-1].hidden = false;
  }
  if (i < board.length - 1 && j < board[0].length - 1) { //can check bottom right
    if (board[i+1][j+1].value == 0 && board[i+1][j+1].hidden) {
      explode(i+1, j+1);
    }
    board[i+1][j+1].hidden = false;
  }
}

function mousePressed() {
  //clicking reset button
  if (mouseX >= 230 && mouseX <= 390 && mouseY >= 30 && mouseY <= 110) {
    resetGame();
  }
}

function resetGame() {
  beginning = true;
  gameStatus = 0;
  currentCell.set(7, 7);
  firstMine.set(100, 100);
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      board[i][j].value = 0;
      board[i][j].hidden = true;
      board[i][j].flagged = false;
    }
  }
}

function showCells(type) {
for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].value == -1 && type == "mine") {
        board[i][j].hidden = false;
        board[i][j].flagged = false;
      } else if (board[i][j].value != -1 && type == "regular") {
        board[i][j].hidden = false;
        board[i][j].flagged = false;
      }
    }
  }
}

function checkBoard() {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].value == -1) {
        if (!board[i][j].flagged) {
          return 0;
        }
      }
    }
  }
  return 1;
}

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.value = 0;
    this.hidden = true;
    this.flagged = false;
  }

  drawTile() {
    fill(189);
    stroke(0);
    rect(this.j * 40 + 10, this.i * 40 + 140, 40, 40);

    //if hidden, add 3D border
    if (this.hidden) {
      drawBorder(this.j * 40 + 10, this.i * 40 + 140, 40, 40, false);
    }

    //if flagged, add flag
    if (this.flagged) {
      drawFlag(this.j * 40 + 10, this.i * 40 + 140, gameStatus);
    }
  }

  showCell() {
    textSize(30);
    textFont('Arial');

    if (!this.hidden) {
      if (this.value >= 0) {
        noStroke();
        switch (this.value) {
          case 0:
            noFill();
            break;
          case 1:
            fill(0, 0, 255);
            break;
          case 2:
            fill(0, 170, 0);
            break;
          case 3:
            fill(255, 0, 0);
            break;
          case 4:
            fill(150, 0, 200);
            break;
          default:
            fill(255, 150, 50);
            break;
        }
        text(this.value, this.j * 40 + 22, this.i * 40 + 171);
      } else if (this.value == -1) {
        if (gameStatus != 0 && firstMine.x == this.j && firstMine.y == this.i) {
          fill(189, 0, 0);
          noStroke();
          rect(this.j * 40 + 11, this.i * 40 + 141, 39, 39);
        }
        drawMine(this.j * 40 + 10, this.i * 40 + 140);
      }
    }
  }

}

function drawMine(x, y) {
  fill(0);
  stroke(0);
  rect(x + 16, y + 11, 8, 18);
  rect(x + 11, y + 16, 18, 8);
  rect(x + 13, y + 13, 14, 14);
  rect(x + 11, y + 11, 1.5, 1.5);
  rect(x + 27, y + 11, 1.5, 1.5);
  rect(x + 11, y + 27, 1.5, 1.5);
  rect(x + 27, y + 27, 1.5, 1.5);
  rect(x + 19, y + 7.5, 1.5, 25);
  rect(x + 7.5, y + 19, 25, 1.5);
  fill(255);
  stroke(255);
  rect(x + 16, y + 16, 3, 3);
}

function drawFlag(x, y, gameStatus) {
  strokeWeight(2);
  stroke(0);
  line(x + 20, y + 9, x + 20, y + 31);
  strokeWeight(1);
  fill(0);
  rect(x + 12, y + 29, 14, 2);
  rect(x + 15, y + 26.5, 8, 2);
  fill(255, 0, 0);
  stroke(255, 0, 0);
  //if won, flags turn green
  if (gameStatus == 1) {
    fill(0, 255, 0);
    stroke(0, 200, 0);
  }
  triangle(x + 20.5, y + 8, x + 10, y + 14.5, x + 20.5, y + 20);
}

function drawBorder(x, y, w, h, color) {

  push();
  translate(x, y);
  //light corner
  color ? fill(255, 0, 0) : fill(255);
  color ? stroke(255, 0, 0) : stroke(255);
  beginShape();
  vertex(1.6, h - 1.6);
  vertex(1.6, 1.6);
  vertex(w - 1.6, 1.6);
  vertex(w - 5, 5);
  vertex(5, 5);
  vertex(5, h - 5);
  vertex(1.6, h - 1.6);
  endShape();

  //dark corner
  color ? fill(123, 0, 0) : fill(123);
  color ? stroke(123, 0, 0) : stroke(123);
  beginShape();
  vertex(1.6, h - 0.6);
  vertex(w - 0.6, h - 0.6);
  vertex(w - 0.6, 1.6);
  vertex(w - 4.5, 5.6);
  vertex(w - 4.5, h - 4.6);
  vertex(5.6, h - 4.6);
  vertex(1.6, h - 0.6);
  endShape();
  pop();
}
