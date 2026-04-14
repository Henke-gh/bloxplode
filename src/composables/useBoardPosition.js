import { computed } from 'vue';

const BOARD_SIZE = 8;
const CELL_SIZE = 32;

const DROP_OFFSET_ROW = 2;
const DROP_OFFSET_COL = 2;

export function useBoardPosition() {
  
  const boardConfig = computed(() => ({
    cellSize: CELL_SIZE,
    boardSize: BOARD_SIZE,
    dropOffsetRow: DROP_OFFSET_ROW,
    dropOffsetCol: DROP_OFFSET_COL,
  }));

  function screenToBoard(screenX, screenY, boardElement) {
    if (!boardElement) return null;

    const rect = boardElement.getBoundingClientRect();
    const cursorX = screenX - rect.left;
    const cursorY = screenY - rect.top;

    let cursorCol = Math.floor(cursorX / CELL_SIZE);
    let cursorRow = Math.floor(cursorY / CELL_SIZE);

    // Apply drop offset
    cursorRow = Math.max(0, cursorRow - DROP_OFFSET_ROW);
    cursorCol = Math.max(0, cursorCol - DROP_OFFSET_COL);

    // Check bounds
    if (cursorRow >= 0 && cursorRow < BOARD_SIZE && cursorCol >= 0 && cursorCol < BOARD_SIZE) {
      return { row: cursorRow, col: cursorCol };
    }

    return null;
  }

  function isValidBoardPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  function gridToPixel(row, col) {
    return {
      x: col * CELL_SIZE,
      y: row * CELL_SIZE
    };
  }

  function pixelToGrid(pixelX, pixelY) {
    return {
      row: Math.floor(pixelY / CELL_SIZE),
      col: Math.floor(pixelX / CELL_SIZE)
    };
  }

  return {
    boardConfig,
    screenToBoard,
    isValidBoardPosition,
    gridToPixel,
    pixelToGrid,
  };
}