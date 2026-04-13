import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getRandomShapes, TETROMINOES } from "../assets/tetrominoes";

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
  const draggingShapeId = ref(null);
  const hoveringCell = ref(null);

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
          board.value[row + r][col + c] = shape.name;
        }
      }
    }

    shapes.value = shapes.value.filter((s) => s.id !== shape.id);
    checkAndClearLines();

    if (shapes.value.length === 0) {
      shapes.value = getRandomShapes(3);
    }

    checkGameOver();
    return true;
  };

  const checkAndClearLines = () => {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board.value[r].every((cell) => cell !== null)) {
        rowsToClear.push(r);
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      let full = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (board.value[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) colsToClear.push(c);
    }

    if (rowsToClear.length === 0 && colsToClear.length === 0) return;

    const points = calculateScore(rowsToClear.length, colsToClear.length);
    score.value += points;

    rowsToClear.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board.value[r][c] = null;
      }
    });

    colsToClear.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        board.value[r][c] = null;
      }
    });
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
      gameState.value = "gameover";
    }
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
  };

  const getDraggingShape = () => {
    if (!draggingShapeId.value) return null;
    return shapes.value.find(s => s.id === draggingShapeId.value);
  };

  const resetGame = () => {
    board.value = createEmptyBoard();
    shapes.value = getRandomShapes(3);
    score.value = 0;
    level.value = 1;
    gameState.value = "playing";
  };

  return {
    board,
    shapes,
    score,
    level,
    gameState,
    draggingShapeId,
    hoveringCell,
    canPlace,
    placeShape,
    checkGameOver,
    resetGame,
    canAnyShapeFit,
    setDraggingShape,
    setHoveringCell,
    clearDragState,
    getDraggingShape,
  };
});
