const BOARD_SIZE = 8;

function createEmptyPattern() {
  return [];
}

function createCenter2x2Pattern() {
  return [
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 4, col: 3 },
    { row: 4, col: 4 }
  ];
}

function createSparseRowsPattern() {
  return [
    { row: 2, col: 2 }, { row: 2, col: 5 },
    { row: 5, col: 2 }, { row: 5, col: 5 }
  ];
}

function createDiamondPattern() {
  return [
    { row: 2, col: 3 }, { row: 2, col: 4 },
    { row: 3, col: 2 }, { row: 3, col: 5 },
    { row: 4, col: 2 }, { row: 4, col: 5 },
    { row: 5, col: 3 }, { row: 5, col: 4 }
  ];
}

function createCornerBlocksPattern() {
  return [
    { row: 0, col: 0 }, { row: 0, col: 1 },
    { row: 1, col: 0 }, { row: 1, col: 1 },
    { row: 0, col: 6 }, { row: 0, col: 7 },
    { row: 1, col: 6 }, { row: 1, col: 7 },
    { row: 6, col: 0 }, { row: 6, col: 1 },
    { row: 7, col: 0 }, { row: 7, col: 1 },
    { row: 6, col: 6 }, { row: 6, col: 7 },
    { row: 7, col: 6 }, { row: 7, col: 7 }
  ];
}

function createRandomPattern() {
  const cells = [];
  const cellSet = new Set();
  const numCells = 4 + Math.floor(Math.random() * 4);

  while (cells.length < numCells) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    const key = `${row},${col}`;

    if (!cellSet.has(key)) {
      cellSet.add(key);
      cells.push({ row, col });
    }
  }

  return cells;
}

function createRandomPatternAvoidingClears() {
  const cells = [];
  const cellSet = new Set();

  let attempts = 0;
  const maxAttempts = 100;

  while (cells.length < 8 && attempts < maxAttempts) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    const key = `${row},${col}`;

    if (!cellSet.has(key)) {
      const tempCells = [...cells, { row, col }];
      if (!wouldTriggerClear(tempCells)) {
        cellSet.add(key);
        cells.push({ row, col });
      }
    }
    attempts++;
  }

  return cells;
}

function wouldTriggerClear(cells) {
  const rowCounts = {};
  const colCounts = {};

  cells.forEach(({ row, col }) => {
    rowCounts[row] = (rowCounts[row] || 0) + 1;
    colCounts[col] = (colCounts[col] || 0) + 1;
  });

  for (const count of Object.values(rowCounts)) {
    if (count >= BOARD_SIZE) return true;
  }
  for (const count of Object.values(colCounts)) {
    if (count >= BOARD_SIZE) return true;
  }

  return false;
}

const LEVELS = [
  {
    scoreThreshold: 0,
    name: 'Level 1',
    getPattern: createEmptyPattern,
    useAdvancedShapes: false
  },
  {
    scoreThreshold: 100,
    name: 'Level 2',
    getPattern: createCenter2x2Pattern,
    useAdvancedShapes: true
  },
  {
    scoreThreshold: 250,
    name: 'Level 3',
    getPattern: createSparseRowsPattern,
    useAdvancedShapes: true
  },
  {
    scoreThreshold: 450,
    name: 'Level 4',
    getPattern: createDiamondPattern,
    useAdvancedShapes: true
  },
  {
    scoreThreshold: 700,
    name: 'Level 5',
    getPattern: createCornerBlocksPattern,
    useAdvancedShapes: true
  }
];

const randomPatternGenerators = [
  createRandomPatternAvoidingClears,
  createDiamondPattern,
  createCenter2x2Pattern,
  createSparseRowsPattern
];

export function getLevelInfo(score) {
  const levelIndex = LEVELS.findIndex((level, index) => {
    const nextThreshold = LEVELS[index + 1]?.scoreThreshold;
    return nextThreshold === undefined || score < nextThreshold;
  });

  if (levelIndex >= 0) {
    return {
      level: levelIndex + 1,
      threshold: LEVELS[levelIndex].scoreThreshold,
      name: LEVELS[levelIndex].name,
      getPattern: LEVELS[levelIndex].getPattern,
      useAdvancedShapes: LEVELS[levelIndex].useAdvancedShapes
    };
  }

  const bonusLevels = Math.floor((score - 1000) / 500) + 1;
  const randomIndex = (bonusLevels - 1) % randomPatternGenerators.length;
  const pattern = randomPatternGenerators[randomIndex]();

  return {
    level: 6 + bonusLevels - 1,
    threshold: 1000 + (bonusLevels - 1) * 500,
    name: `Level ${6 + bonusLevels - 1}`,
    getPattern: () => pattern,
    useAdvancedShapes: true
  };
}

export function getNextLevelThreshold(currentLevel) {
  if (currentLevel < LEVELS.length) {
    return LEVELS[currentLevel].scoreThreshold;
  }
  return 1000 + (currentLevel - 5) * 500;
}

export function generateBoardPattern(levelInfo) {
  const pattern = levelInfo.getPattern ? levelInfo.getPattern() : createRandomPatternAvoidingClears();
  return pattern;
}

export { LEVELS };