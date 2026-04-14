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
  T2: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    width: 3,
    height: 2,
  },
  T3: {
    shape: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    width: 2,
    height: 3,
  },
  T4: {
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    width: 2,
    height: 3,
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
  sL: {
    shape: [
      [1, 1],
      [1, 0],
    ],
    width: 2,
    height: 2,
  },
  sL2: {
    shape: [
      [1, 0],
      [1, 1],
    ],
    width: 2,
    height: 2,
  },
  sL3: {
    shape: [
      [0, 1],
      [1, 1],
    ],
    width: 2,
    height: 2,
  },
  sL4: {
    shape: [
      [1, 1],
      [0, 1],
    ],
    width: 2,
    height: 2,
  },
  dot: { shape: [[1]], width: 1, height: 1 },
};

export const SHAPE_NAMES = Object.keys(TETROMINOES);

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomShapes(count = 3) {
  const availableShapes = shuffleArray(SHAPE_NAMES);
  const selectedCount = Math.min(count, availableShapes.length);

  return availableShapes.slice(0, selectedCount).map((name, index) => ({
    id: `${name}-${Date.now()}-${index}`,
    name,
    ...TETROMINOES[name],
  }));
}
