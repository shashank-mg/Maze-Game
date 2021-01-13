let { World, Engine, Runner, Render, Bodies, Body, Events } = Matter;

const cellsHorizontal = 3;
const cellsVerticle = 3;
const height = window.innerHeight; //600;
const width = window.innerWidth; //600;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVerticle;

const engine = Engine.create();
const { world } = engine; // world gets created along with the engine
world.gravity.y = 0;
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
  Bodies.rectangle(width / 2, 0, width, 3, { isStatic: true, label: "wall" }),
  Bodies.rectangle(width, height / 2, 3, height, {
    isStatic: true,
    label: "wall",
  }),
  Bodies.rectangle(width / 2, height, width, 3, {
    isStatic: true,
  }),
  Bodies.rectangle(0, height / 2, 3, height, { isStatic: true, label: "wall" }),
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
const grid = new Array(cellsVerticle)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticles = new Array(cellsVerticle)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = new Array(cellsVerticle - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

// Pick a random cell from grid

const startRow = Math.floor(Math.random() * cellsVerticle);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
      nextRow >= cellsVerticle ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }

    if (grid[nextRow][nextColumn]) continue;

    // updating horizontal / verticle array
    if (direction === "left") verticles[row][column - 1] = true;
    else if (direction === "right") verticles[row][column] = true;
    else if (direction === "up") horizontals[row - 1][column] = true;
    else if (direction === "down") horizontals[row][column] = true;
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

// Iterate over walls
verticles.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) return;
    else {
      let wall = Bodies.rectangle(
        rowIndex * unitLengthX + unitLengthX,
        colIndex * unitLengthY + unitLengthY / 2,
        10,
        unitLengthY,
        {
          isStatic: true,
          label: "wall",
        }
      );
      World.add(world, wall);
    }
  });
});

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) return;
    else {
      let wall = Bodies.rectangle(
        colIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        10,
        {
          isStatic: true,
          label: "wall",
        }
      );
      World.add(world, wall);
    }
  });
});

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX / 2,
  unitLengthY / 2,
  {
    isStatic: true,
    render: {
      fillStyle: "red",
    },
    label: "goal",
  }
);
World.add(world, goal);

const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  Math.min(unitLengthX, unitLengthY) / 4,
  {
    // isStatic: true, Just remove gravity
    render: { fillStyle: "purple" },
    label: "ball",
  }
);
World.add(world, ball);

document.addEventListener("keydown", (e) => {
  let { x, y } = ball.velocity;
  if (e.key === "ArrowUp") {
    Body.setVelocity(ball, { x, y: y - 2 });
  } else if (e.key === "ArrowRight") {
    Body.setVelocity(ball, { x: x + 2, y });
  } else if (e.key === "ArrowDown") {
    Body.setVelocity(ball, { x, y: y + 2 });
  } else if (e.key === "ArrowLeft") {
    Body.setVelocity(ball, { x: x - 2, y });
  }
  // console.log(e);
});

Events.on(engine, "collisionStart", (e) => {
  e.pairs.forEach((collision) => {
    let labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      console.log("coming");
      world.gravity.y = 1;
      world.bodies.forEach((e) => {
        if (e.label === "wall") {
          Body.setStatic(e, false);
          document.querySelector(".winner").classList.remove("hidden");
        }
      });
    }
  });
});
