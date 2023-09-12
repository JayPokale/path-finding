document.addEventListener("contextmenu", (e) => e.preventDefault()); // Disable right click menu

var width = window.innerWidth;
var height = window.innerHeight;
var rows = 30;
var cols = 30;

var dimenstion = ~~Math.min(width / rows, (height - 150) / cols); // Give dimentions for cells

// Create grid for cells
var cellGrid = document.getElementById("grid");
cellGrid.style.gridTemplateRows = `repeat(${cols}, ${dimenstion}px)`;
cellGrid.style.gridTemplateColumns = `repeat(${rows}, ${dimenstion}px)`;

var addObstacle = true;
var add = document.getElementById("add");
var remove = document.getElementById("remove");

add.addEventListener("click", () => (addObstacle = true));
remove.addEventListener("click", () => (addObstacle = false));

// Store all cells
var cells = Array(rows)
  .fill()
  .map(() => Array(cols));

// Store cells state
var grid = Array(rows)
  .fill()
  .map(() => Array(cols).fill(false));

// Create cells
for (let i = 0; i < rows; ++i) {
  for (let j = 0; j < cols; ++j) {
    const cell = document.createElement("div");
    cells[i][j] = cell;
    cell.classList.add("cell");
    cell.draggable = false;
    cellGrid.appendChild(cell);

    // Event listners to create or remove obstacles
    cell.addEventListener("click", () => handleLeftClick(cell, i, j));
    cell.addEventListener("contextmenu", () => handleRightClick(cell, i, j));
    cell.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) handleLeftClick(cell, i, j);
      else if (e.buttons === 2) handleRightClick(cell, i, j);
    });
  }
}

function handleLeftClick(cell, i, j) {
  if (addObstacle) cell.classList.add("obstacle");
  else cell.classList.remove("obstacle");
  grid[i][j] = true;
}

function handleRightClick(cell, i, j) {
  if (addObstacle) cell.classList.remove("obstacle");
  else cell.classList.add("obstacle");
  grid[i][j] = false;
}

document.getElementById("dijkstra").addEventListener("click", dijkstra);
document.getElementById("astar").addEventListener("click", astar);
document.getElementById("stop").addEventListener("click", stop);
document.getElementById("clear").addEventListener("click", clear);

var outputVisited = document.getElementById("visited");
var outputShortest = document.getElementById("shortest");

var countVisited = 0;
var countShortest = 0;
var isStop = true;

async function dijkstra() {
  stop();
  isStop = false;
  if (grid[0][0]) return null;

  var visited = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));
  visited[0][0] = true;

  var stack = [];
  var queue = [[0, 0, null, null]];

  while (queue.length) {
    if (isStop) break;

    var [x, y, prevX, prevY] = queue.shift();
    cells[x][y].classList.add("visited");

    if (x === rows - 1 && y === cols - 1) {
      stack.push([x, y, prevX, prevY]);
      break;
    }

    for (var [i, j] of [
      [x + 1, y + 0],
      [x + 0, y + 1],
      [x - 1, y + 0],
      [x + 0, y - 1],
    ]) {
      if (
        i >= 0 &&
        j >= 0 &&
        i < rows &&
        j < cols &&
        !visited[i][j] &&
        !grid[i][j]
      ) {
        visited[i][j] = true;
        queue.push([i, j, x, y]);
      }
    }

    stack.push([x, y, prevX, prevY]);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 10);
    });
    outputVisited.innerText = ++countVisited;
  }
  if (x === rows - 1 && y === cols - 1) createPath(stack);
}

// Priority Queue Data Structure
class PriorityQueue {
  constructor(priority) {
    this.queArr = [];
    this.priority = priority;
  }

  enqueue(elem) {
    this.queArr.unshift({ elem });
    this.sortQueue();
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.queArr.shift().elem;
  }

  remove(x, y) {
    this.queArr.filter((cur) => cur[0] !== x && cur[1] !== y);
  }

  isEmpty() {
    return this.queArr.length === 0;
  }

  sortQueue() {
    this.queArr.sort(this.priority);
  }
}

async function astar() {
  stop();
  isStop = false;
  if (grid[0][0]) return null;

  const visited = Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));
  visited[0][0] = rows + cols - 2;
  cells[0][0].classList.add("visited");

  const stack = [];
  const pq = new PriorityQueue((a, b) => a.elem[5] - b.elem[5]);
  pq.enqueue([0, 0, null, null, 0, rows + cols]);

  while (!pq.isEmpty()) {
    if (isStop) break;

    var [x, y, prevX, prevY, len, _] = pq.dequeue();
    cells[x][y].classList.add("visited");

    if (x === rows - 1 && y === cols - 1) {
      stack.push([x, y, prevX, prevY]);
      break;
    }

    for (const [i, j] of [
      [x + 0, y + 1],
      [x + 1, y + 0],
      [x + 0, y - 1],
      [x - 1, y + 0],
    ]) {
      if (i === prevX && j === prevY) continue;
      if (i >= 0 && j >= 0 && i < rows && j < cols && !grid[i][j]) {
        let cost = rows - i + cols - j + len;
        if (!visited[i][j] || cost < visited[i][j]) {
          pq.remove(i, j);
          visited[i][j] = cost;
          pq.enqueue([i, j, x, y, len + 1, cost]);
        }
      }
    }
    stack.push([x, y, prevX, prevY]);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 10);
    });
    outputVisited.innerText = ++countVisited;
  }
  if (x === rows - 1 && y === cols - 1) createPath(stack);
}

function stop() {
  outputVisited.innerText = 0;
  outputShortest.innerText = Infinity;
  countVisited = 0;
  countShortest = 0;
  isStop = true;
  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      cells[i][j].classList.remove("visited");
      cells[i][j].classList.remove("path");
    }
  }
}

function clear() {
  outputVisited.innerText = 0;
  outputShortest.innerText = Infinity;
  countVisited = 0;
  countShortest = 0;
  isStop = true;
  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      cells[i][j].classList.remove("visited");
      cells[i][j].classList.remove("obstacle");
      cells[i][j].classList.remove("path");
      grid[i][j] = false;
    }
  }
}

async function createPath(stack) {
  var prev = stack.at(-1);
  var [x, y] = [prev[2], prev[3]];

  cells[rows - 1][cols - 1].classList.add("path");
  cells[prev[0]][prev[1]].classList.add("path");

  for (let i = stack.length - 1; ~i; --i) {
    var cur = stack[i];
    if (x === cur[0] && y === cur[1]) {
      cells[x][y].classList.add("path");
      x = cur[2];
      y = cur[3];
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 20);
      });
      outputShortest.innerText = ++countShortest;
    }
  }
}
