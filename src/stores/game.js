import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getRandomShapes, TETROMINOES } from "../assets/tetrominoes";
import {
  getLevelInfo,
  getNextLevelThreshold,
  generateBoardPattern,
} from "../assets/levels";

const BOARD_SIZE = 8;
const POINTS_PER_LINE = 10;

function createEmptyBoard() {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export const useGameStore = defineStore("game", () => {
  const board = ref(createEmptyBoard());
  const shapes = ref(getRandomShapes(3));
  const score = ref(0);
  const level = ref(1);
  const gameState = ref("playing");
  const highScore = ref(localStorage.getItem("highScore") || 0);
  const showLevelOverlay = ref(false);
  const preFilledCells = ref([]);
  const draggingShapeId = ref(null);
  const hoveringCell = ref(null);
  const dragPosition = ref(null); // { x, y } cursor position during drag

  // Animation state for line/column clearing
  const clearingPhase = ref(null); // null | 'row' | 'col' | 'complete'
  const rowsToClear = ref([]); // [rowIndex]
  const colsToClear = ref([]); // [colIndex]
  const cellsToClear = ref([]); // [{row, col}]

  const canPlace = (shape, row, col) => {
    if (!shape) return false;
    const { shape: matrix } = TETROMINOES[shape.name];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardRow = row + r;
          const boardCol = col + c;
          if (
            boardRow < 0 ||
            boardRow >= BOARD_SIZE ||
            boardCol < 0 ||
            boardCol >= BOARD_SIZE
          ) {
            return false;
          }
          if (board.value[boardRow][boardCol] !== null) {
            return false;
          }
          const isPreFilled = preFilledCells.value.some(
            (c) => c.row === boardRow && c.col === boardCol,
          );
          if (isPreFilled) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placeShape = (shape, row, col) => {
    if (!canPlace(shape, row, col)) return false;

    const { shape: matrix } = TETROMINOES[shape.name];
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardRow = row + r;
          const boardCol = col + c;
          const existing = board.value[boardRow][boardCol];
          board.value[boardRow][boardCol] =
            existing === "filled" ? shape.name : shape.name;
        }
      }
    }
    //Award some points for placing a tile.
    score.value += 5;

    shapes.value = shapes.value.filter((s) => s.id !== shape.id);
    const cleared = checkAndClearLines();

    if (shapes.value.length === 0) {
      const useAdvanced = getLevelInfo(score.value).useAdvancedShapes;
      shapes.value = getRandomShapes(3, useAdvanced ? 1000 : 0);
    }

    if (!cleared) {
      checkGameOver();
    }
    return true;
  };

  const checkAndClearLines = () => {
    const foundRows = [];
    const foundCols = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      const preFilledInRow = preFilledCells.value.filter(
        (c) => c.row === r,
      ).length;
      const cellsInRow = board.value[r].filter((cell) => cell !== null).length;
      if (preFilledInRow + cellsInRow === BOARD_SIZE) {
        foundRows.push(r);
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      const preFilledInCol = preFilledCells.value.filter(
        (cell) => cell.col === c,
      ).length;
      const cellsInCol = board.value.reduce(
        (count, row) => (row[c] !== null ? count + 1 : count),
        0,
      );
      if (cellsInCol + preFilledInCol === BOARD_SIZE) {
        foundCols.push(c);
      }
    }

    if (foundRows.length === 0 && foundCols.length === 0) return false;

    // Remember the original rows/columns to clear
    rowsToClear.value = [...foundRows];
    colsToClear.value = [...foundCols];

    // Calculate score first
    const points = calculateScore(foundRows.length, foundCols.length);
    score.value += points;

    // Collect cells to clear (excluding intersections - don't clear twice)
    const cellSet = new Set();
    foundRows.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) {
        cellSet.add(`${r},${c}`);
      }
    });
    foundCols.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        cellSet.add(`${r},${c}`);
      }
    });

    const allCells = Array.from(cellSet).map((key) => {
      const [row, col] = key.split(",").map(Number);
      return { row, col };
    });

    const didLevelUp = updateLevel();
    if (didLevelUp) {
      return { rowsToClear: foundRows, colsToClear: foundCols, cells: [] };
    }

    // Set up animation state - row first, then column
    cellsToClear.value = allCells;

    if (foundRows.length > 0) {
      clearingPhase.value = "row";
    } else {
      clearingPhase.value = "col";
    }

    return { rowsToClear: foundRows, colsToClear: foundCols, cells: allCells };
  };

  const confirmClear = () => {
    if (clearingPhase.value === "complete") return;

    const cells = cellsToClear.value;
    cells.forEach(({ row, col }) => {
      board.value[row][col] = null;
    });

    if (clearingPhase.value === "col") {
      clearingPhase.value = "complete";
    }
  };

  const nextClearPhase = () => {
    if (clearingPhase.value === "row") {
      rowsToClear.value.forEach((r) => {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board.value[r][c] = null;
        }
      });
      preFilledCells.value = preFilledCells.value.filter(
        (c) => !rowsToClear.value.includes(c.row),
      );

      if (colsToClear.value.length > 0) {
        clearingPhase.value = "col";
      } else {
        clearingPhase.value = "complete";
      }
    } else if (clearingPhase.value === "col") {
      colsToClear.value.forEach((c) => {
        for (let r = 0; r < BOARD_SIZE; r++) {
          board.value[r][c] = null;
        }
      });
      preFilledCells.value = preFilledCells.value.filter(
        (c) => !colsToClear.value.includes(c.col),
      );
      clearingPhase.value = "complete";
    }

    if (clearingPhase.value === "complete") {
      resetClearState();
      checkGameOver();
    }
  };

  const resetClearState = () => {
    clearingPhase.value = null;
    rowsToClear.value = [];
    colsToClear.value = [];
    cellsToClear.value = [];
  };

  const calculateScore = (rowsCleared, colsCleared) => {
    if (rowsCleared === 0 && colsCleared === 0) return 0;

    const totalLines = rowsCleared + colsCleared;
    let points = 0;

    const rowPoints = rowsCleared * POINTS_PER_LINE;
    const colPoints = colsCleared * POINTS_PER_LINE;

    if (rowsCleared > 0 && colsCleared > 0) {
      points = (rowPoints + colPoints) * 2;
    } else if (rowsCleared >= 2 || colsCleared >= 2) {
      points = (rowPoints > 0 ? rowPoints : colPoints) * 1.5;
    } else {
      points = rowPoints + colPoints;
    }

    return Math.floor(points);
  };

  const canAnyShapeFit = () => {
    for (const shape of shapes.value) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (canPlace(shape, r, c)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkGameOver = () => {
    if (!canAnyShapeFit()) {
      isHighScore();
      gameState.value = "gameover";
    }
  };

  const isHighScore = () => {
    const currentHighScore = localStorage.getItem("highScore") || 0;

    if (currentHighScore < score.value) {
      localStorage.setItem("highScore", score.value);
      highScore.value = score.value;
    }
  };

  const getHighScore = () => {
    return highScore.value;
  };

  const setDraggingShape = (shapeId) => {
    draggingShapeId.value = shapeId;
  };

  const setHoveringCell = (row, col) => {
    hoveringCell.value = row !== null && col !== null ? { row, col } : null;
  };

  const clearDragState = () => {
    draggingShapeId.value = null;
    hoveringCell.value = null;
    dragPosition.value = null;
  };

  const setDragPosition = (x, y) => {
    dragPosition.value = { x, y };
  };

  const getDraggingShape = () => {
    if (!draggingShapeId.value) return null;
    return shapes.value.find((s) => s.id === draggingShapeId.value);
  };

  const updateLevel = () => {
    const levelInfo = getLevelInfo(score.value);

    if (levelInfo.level > level.value) {
      const newLevel = levelInfo.level;
      const useAdvanced = levelInfo.useAdvancedShapes;

      level.value = newLevel;
      showLevelOverlay.value = true;

      board.value = createEmptyBoard();
      preFilledCells.value = generateBoardPattern(levelInfo);
      shapes.value = getRandomShapes(3, useAdvanced ? 1000 : 0);

      rowsToClear.value = [];
      colsToClear.value = [];
      cellsToClear.value = [];
      clearingPhase.value = null;

      setTimeout(() => {
        showLevelOverlay.value = false;
      }, 1500);

      return true;
    }
    return false;
  };

  const resetGame = () => {
    board.value = createEmptyBoard();
    preFilledCells.value = [];
    shapes.value = getRandomShapes(3);
    score.value = 0;
    level.value = 1;
    gameState.value = "playing";
    resetClearState();
  };

  return {
    board,
    shapes,
    score,
    level,
    gameState,
    highScore,
    showLevelOverlay,
    preFilledCells,
    draggingShapeId,
    hoveringCell,
    dragPosition,
    clearingPhase,
    rowsToClear,
    colsToClear,
    cellsToClear,
    canPlace,
    placeShape,
    checkGameOver,
    resetGame,
    canAnyShapeFit,
    setDraggingShape,
    setHoveringCell,
    clearDragState,
    getDraggingShape,
    setDragPosition,
    confirmClear,
    nextClearPhase,
    resetClearState,
    getHighScore,
  };
});
