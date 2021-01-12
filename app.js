let { World, Engine, Runner, Render, Bodies } = Matter;

const cells = 3;
const height = 600;
const width = 600;

const engine = Engine.create();
const { world } = engine; // world gets created along with the engine
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls

const walls = [
  Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 20, height, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 20, height, { isStatic: true }),
];

World.add(world, walls); // an array can be directly be passed

// Shuffle neighbours
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

// Maze
const grid = new Array(cells).fill(null).map(() => Array(cells).fill(false));

const verticles = new Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = new Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

// Pick a random cell from grid

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
  // If the cell is visisted then return
  if (grid[row][column] === true) return;

  // if not then mark the cell as visited
  grid[row][column] = true;

  // Working with neighbours
  const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  // For each neighbour
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;
    // if out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    if (grid[nextRow][nextColumn]) continue;

    // updating horizontal / verticle array
    if (direction === "left") verticles[row][column - 1] = true;
    else if (direction === "right") verticles[row][column] = true;
    else if (direction === "up") horizontals[row - 1][column] = true;
    else horizontals[row][column] = true;
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

// Iterate over walls
horizontals.forEach((row) => {
  row.forEach((open) => {
    if (open) return;
    else {
      let wall = Bodies.rectangle();
    }
  });
});

verticles.forEach((row) => {
  row.forEach((open) => {
    if (open) return;
    else {
      let wall = Bodies.rectangle();
    }
  });
});
