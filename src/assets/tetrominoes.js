export const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    width: 4,
    height: 1,
  },
  I2: {
    shape: [[1], [1], [1], [1]],
    width: 1,
    height: 4,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    width: 2,
    height: 2,
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    width: 3,
    height: 2,
  },
  L: {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    width: 2,
    height: 3,
  },
  J: {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    width: 2,
    height: 3,
  },
  N: {
    shape: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    width: 2,
    height: 3,
  },
  N: {
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    width: 2,
    height: 3,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    width: 3,
    height: 2,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    width: 3,
    height: 2,
  },
  ZI: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    width: 3,
    height: 2,
  },
};

export const SHAPE_NAMES = Object.keys(TETROMINOES);

export function getRandomShapes(count = 3) {
  const shapes = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * SHAPE_NAMES.length);
    shapes.push({
      id: `${SHAPE_NAMES[randomIndex]}-${Date.now()}-${i}`,
      name: SHAPE_NAMES[randomIndex],
      ...TETROMINOES[SHAPE_NAMES[randomIndex]],
    });
  }
  return shapes;
}
