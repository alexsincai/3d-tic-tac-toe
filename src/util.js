const rotateX = cube =>
  cube.map((slice, z) =>
    slice.map((row, y) => row.map((_, x) => cube[z][y][x])),
  );

const rotateY = cube =>
  cube.map((slice, z) =>
    slice.map((row, y) => row.map((_, x) => cube[z][x][y])),
  );

const rotateZ = cube =>
  cube.map((slice, z) =>
    slice.map((row, y) => row.map((_, x) => cube[x][y][z])),
  );

const checkRow = cube =>
  cube.some(slice =>
    slice.some(row =>
      row.every((cell, _, array) => cell === array[0] && array[0] !== null),
    ),
  );

const checkX = cube => checkRow(rotateX(cube));
const checkY = cube => checkRow(rotateY(cube));
const checkZ = cube => checkRow(rotateZ(cube));
const checkD = cube =>
  [
    [
      [cube[0][0][0], cube[0][1][1], cube[0][2][2]],
      [cube[0][0][2], cube[0][1][1], cube[0][2][0]],
    ],
    [
      [cube[1][0][0], cube[1][1][1], cube[1][2][2]],
      [cube[1][0][2], cube[1][1][1], cube[1][2][0]],
    ],
    [
      [cube[2][0][0], cube[2][1][1], cube[2][2][2]],
      [cube[2][0][2], cube[2][1][1], cube[2][2][0]],
    ],

    [
      [cube[0][0][0], cube[2][0][2], cube[2][0][2]],
      [cube[0][0][2], cube[2][0][2], cube[2][0][0]],
    ],
    [
      [cube[0][1][0], cube[2][1][2], cube[2][1][2]],
      [cube[0][1][2], cube[2][1][2], cube[2][1][0]],
    ],
    [
      [cube[0][2][0], cube[2][2][2], cube[2][2][2]],
      [cube[0][2][2], cube[2][2][2], cube[2][2][0]],
    ],

    [
      [cube[0][0][0], cube[1][1][0], cube[2][2][0]],
      [cube[0][2][0], cube[1][1][0], cube[2][0][0]],
    ],
    [
      [cube[0][0][1], cube[1][1][1], cube[2][2][1]],
      [cube[0][2][1], cube[1][1][1], cube[2][0][1]],
    ],
    [
      [cube[0][0][2], cube[1][1][2], cube[2][2][2]],
      [cube[0][2][2], cube[1][1][2], cube[2][0][2]],
    ],

    [
      [cube[0][0][0], cube[1][1][1], cube[2][2][2]],
      [cube[2][0][2], cube[1][1][1], cube[0][2][0]],
    ],
    [
      [cube[2][0][0], cube[1][1][1], cube[0][2][2]],
      [cube[0][0][2], cube[1][1][1], cube[2][2][0]],
    ],
  ].some(diag =>
    diag.some(option => option.every((c, i, a) => c === a[0] && a[0] !== null)),
  );

export const checker = cube => [
  checkX(cube),
  checkY(cube),
  checkZ(cube),
  checkD(cube),
];
