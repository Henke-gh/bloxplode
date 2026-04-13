<script setup>
import { computed, ref, watch } from 'vue';
import { useGameStore } from '../stores/game';
import { TETROMINOES } from '../assets/tetrominoes';

const CELL_SIZE = 40;
const BOARD_SIZE = 8;
const CELL_BG_COLOR = '#2a2a2a';
const CELL_OCCUPIED_COLOR = '#EDC9AF';
const GRID_COLOR = '#444';
const BOARD_BG = '#1a1a1a';

const VALID_PREVIEW_COLOR = 'rgba(237, 201, 175, 0.5)';
const INVALID_PREVIEW_COLOR = 'rgba(220, 53, 69, 0.5)';
const CURSOR_INDICATOR_COLOR = 'rgba(255, 255, 255, 0.15)';

const store = useGameStore();
const boardContainer = ref(null);
const cursorCell = ref(null);

const gridConfig = computed(() => ({
  width: BOARD_SIZE * CELL_SIZE,
  height: BOARD_SIZE * CELL_SIZE
}));

const cells = computed(() => {
  const result = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      result.push({
        key: `${row}-${col}`,
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
        fill: store.board[row][col] ? CELL_OCCUPIED_COLOR : CELL_BG_COLOR,
        stroke: GRID_COLOR,
        strokeWidth: 1,
        row,
        col
      });
    }
  }
  return result;
});

const previewCells = computed(() => {
  const draggingShape = store.getDraggingShape();
  const hoverCell = store.hoveringCell;

  if (!draggingShape || !hoverCell) return [];

  const { row, col } = hoverCell;
  const matrix = TETROMINOES[draggingShape.name].shape;
  const canPlace = store.canPlace(draggingShape, row, col);

  const preview = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        preview.push({
          key: `preview-${r}-${c}`,
          x: (col + c) * CELL_SIZE,
          y: (row + r) * CELL_SIZE,
          fill: canPlace ? VALID_PREVIEW_COLOR : INVALID_PREVIEW_COLOR,
        });
      }
    }
  }

  return preview;
});

const cursorIndicatorCells = computed(() => {
  const draggingShape = store.getDraggingShape();
  const cursor = cursorCell.value;

  if (!draggingShape || !cursor) return [];

  const { row, col } = cursor;
  const matrix = TETROMINOES[draggingShape.name].shape;
  const canPlace = store.canPlace(draggingShape, row, col);

  const cursorCellIndicator = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        cursorCellIndicator.push({
          key: `cursor-${r}-${c}`,
          x: (col + c) * CELL_SIZE,
          y: (row + r) * CELL_SIZE,
          stroke: canPlace ? '#4CAF50' : '#f44336',
          strokeWidth: 2,
        });
      }
    }
  }

  return cursorCellIndicator;
});

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const rect = boardContainer.value.getBoundingClientRect();

  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  const cursorCol = Math.floor(cursorX / CELL_SIZE);
  const cursorRow = Math.floor(cursorY / CELL_SIZE);

  if (cursorRow >= 0 && cursorRow < BOARD_SIZE && cursorCol >= 0 && cursorCol < BOARD_SIZE) {
    cursorCell.value = { row: cursorRow, col: cursorCol };
    store.setHoveringCell(cursorRow, cursorCol);
  } else {
    cursorCell.value = null;
    store.setHoveringCell(null, null);
  }
};

const handleDragEnter = (e) => {
  e.preventDefault();
};

const handleDrop = (e) => {
  e.preventDefault();

  const shapeId = e.dataTransfer.getData('shapeId');
  if (!shapeId) {
    store.clearDragState();
    cursorCell.value = null;
    return;
  }

  const rect = boardContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  const shape = store.shapes.find(s => s.id === shapeId);

  if (shape && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    store.placeShape(shape, row, col);
  }

  store.setHoveringCell(null, null);
  cursorCell.value = null;
};

const handleDragLeave = (e) => {
  if (!e.relatedTarget || !boardContainer.value?.contains(e.relatedTarget)) {
    store.setHoveringCell(null, null);
    cursorCell.value = null;
  }
};

const handleDragEnd = () => {
  store.setHoveringCell(null, null);
  cursorCell.value = null;
};

const handleTouchMove = (e) => {
  e.preventDefault(); // Prevent scrolling

  const touch = e.touches[0];
  if (!touch) return;

  const rect = boardContainer.value.getBoundingClientRect();
  const cursorX = touch.clientX - rect.left;
  const cursorY = touch.clientY - rect.top;

  const cursorCol = Math.floor(cursorX / CELL_SIZE);
  const cursorRow = Math.floor(cursorY / CELL_SIZE);

  if (cursorRow >= 0 && cursorRow < BOARD_SIZE && cursorCol >= 0 && cursorCol < BOARD_SIZE) {
    cursorCell.value = { row: cursorRow, col: cursorCol };
    store.setHoveringCell(cursorRow, cursorCol);
  } else {
    cursorCell.value = null;
    store.setHoveringCell(null, null);
  }
};

const handleTouchEnd = (e) => {
  e.preventDefault();

  const touch = e.changedTouches[0];
  if (!touch) return;

  // Find the shape that was being dragged via touch
  const draggingShape = store.getDraggingShape();
  if (!draggingShape) {
    store.clearDragState();
    cursorCell.value = null;
    return;
  }

  const rect = boardContainer.value.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    store.placeShape(draggingShape, row, col);
  }

  store.setHoveringCell(null, null);
  cursorCell.value = null;
};

const handleTouchCancel = () => {
  store.setHoveringCell(null, null);
  cursorCell.value = null;
};
</script>

<template>
  <div ref="boardContainer" class="board-container" @dragover="handleDragOver" @dragenter="handleDragEnter"
    @dragleave="handleDragLeave" @drop="handleDrop" @dragend="handleDragEnd" @touchmove="handleTouchMove"
    @touchend="handleTouchEnd" @touchcancel="handleTouchCancel">
    <v-stage :config="gridConfig">
      <v-layer>
        <v-rect :config="{
          x: 0,
          y: 0,
          width: BOARD_SIZE * CELL_SIZE,
          height: BOARD_SIZE * CELL_SIZE,
          fill: BOARD_BG,
          cornerRadius: 4,
          stroke: GRID_COLOR,
          strokeWidth: 2
        }" />
        <v-rect v-for="cell in cells" :key="cell.key" :config="{
          x: cell.x,
          y: cell.y,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          fill: cell.fill,
          stroke: cell.stroke,
          strokeWidth: 1,
          cornerRadius: 2,
          offsetX: 1,
          offsetY: 1
        }" />
        <v-rect v-for="preview in previewCells" :key="preview.key" :config="{
          x: preview.x,
          y: preview.y,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          fill: preview.fill,
          cornerRadius: 2,
          offsetX: 1,
          offsetY: 1
        }" />
        <v-rect v-for="cursorCell in cursorIndicatorCells" :key="cursorCell.key" :config="{
          x: cursorCell.x,
          y: cursorCell.y,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          fill: 'transparent',
          stroke: cursorCell.stroke,
          strokeWidth: cursorCell.strokeWidth,
          cornerRadius: 2,
          offsetX: 1,
          offsetY: 1
        }" />
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped>
.board-container {
  display: inline-block;
}
</style>