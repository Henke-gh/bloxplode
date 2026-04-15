<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import { TETROMINOES } from '../assets/tetrominoes';
import { useBoardPosition } from '../composables/useBoardPosition';
import { useAnimations } from '../composables/useAnimations';

//Colours
const pinkDark = '#c320e3';
const pinkDarker = '#931dab';
const orange = '#e37620';
const offWhite = '#e6e6d9';
const gold = '#e3ae20';

const CELL_SIZE = 32;
const BOARD_SIZE = 8;
const CELL_BG_COLOR = pinkDark;
const CELL_OCCUPIED_COLOR = '#ffd700';
const GRID_COLOR = '#444';
const BOARD_BG = pinkDarker;

const VALID_PREVIEW_COLOR = gold;
const INVALID_PREVIEW_COLOR = 'rgba(220, 53, 69, 0.5)';
const CURSOR_INDICATOR_COLOR = 'rgba(255, 255, 255, 0.15)';

const ANIMATION_DURATION = 600;

const { screenToBoard, isValidBoardPosition } = useBoardPosition();
const { particles, createExplosion, stopAllAnimations } = useAnimations();

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
      const isRowClearing = store.clearingPhase === 'row' && store.rowsToClear.includes(row);
      const isColClearing = store.clearingPhase === 'col' && store.colsToClear.includes(col);
      const isClearing = isRowClearing || isColClearing;

      result.push({
        key: `${row}-${col}`,
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
        fill: store.board[row][col] ? CELL_OCCUPIED_COLOR : CELL_BG_COLOR,
        stroke: isClearing ? orange : pinkDarker,
        strokeWidth: isClearing ? 2 : 1,
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
          stroke: canPlace ? '#e320a8' : '#f44336',
          strokeWidth: 2,
        });
      }
    }
  }

  return cursorCellIndicator;
});



// Watch drag position to update cursor cell
watch(() => store.dragPosition, (newPos) => {
  if (!newPos || !boardContainer.value) {
    cursorCell.value = null;
    return;
  }

  const boardPos = screenToBoard(newPos.x, newPos.y, boardContainer.value);

  if (boardPos) {
    cursorCell.value = boardPos;
    store.setHoveringCell(boardPos.row, boardPos.col);
  } else {
    cursorCell.value = null;
    store.setHoveringCell(null, null);
  }
});

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const boardPos = screenToBoard(e.clientX, e.clientY, boardContainer.value);

  if (boardPos) {
    cursorCell.value = boardPos;
    store.setHoveringCell(boardPos.row, boardPos.col);
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

  const boardPos = screenToBoard(e.clientX, e.clientY, boardContainer.value);

  if (!boardPos) {
    store.clearDragState();
    cursorCell.value = null;
    return;
  }

  const { row, col } = boardPos;
  const shape = store.shapes.find(s => s.id === shapeId);

  if (shape) {
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

// Watch for clearing phase changes to trigger animations
watch(() => store.clearingPhase, (newPhase, oldPhase) => {
  if (newPhase && newPhase !== oldPhase) {
    if (newPhase === 'row') {
      triggerRowExplosion();
    } else if (newPhase === 'col') {
      triggerColExplosion();
    } else if (newPhase === 'complete') {
      store.resetClearState();
    }
  }
});

function triggerRowExplosion() {
  const rowCells = store.cellsToClear.filter(cell =>
    store.board[cell.row].every((c) => c !== null)
  );

  rowCells.forEach(cell => {
    const x = cell.col * CELL_SIZE + CELL_SIZE / 2;
    const y = cell.row * CELL_SIZE + CELL_SIZE / 2;
    createExplosion({
      x,
      y,
      colors: [orange, offWhite],
      count: 32,
      particleSize: CELL_SIZE / 8
    });
  });

  setTimeout(() => {
    store.nextClearPhase();
  }, ANIMATION_DURATION);
}

function triggerColExplosion() {
  store.colsToClear.forEach(col => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = row * CELL_SIZE + CELL_SIZE / 2;
      createExplosion({
        x,
        y,
        colors: [orange, offWhite],
        count: 32,
        particleSize: CELL_SIZE / 8
      });
    }
  });

  setTimeout(() => {
    store.nextClearPhase();
  }, ANIMATION_DURATION);
}

onUnmounted(() => {
  stopAllAnimations();
});
</script>

<template>
  <div ref="boardContainer" class="board-container" @dragover="handleDragOver" @dragenter="handleDragEnter"
    @dragleave="handleDragLeave" @drop="handleDrop" @dragend="handleDragEnd">
    <v-stage :config="gridConfig">
      <v-layer>
        <v-rect :config="{
          x: 0,
          y: 0,
          width: BOARD_SIZE * CELL_SIZE,
          height: BOARD_SIZE * CELL_SIZE,
          fill: BOARD_BG,
          cornerRadius: 4,
          stroke: pinkDark,
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
          cornerRadius: 4,
          offsetX: 0,
          offsetY: 0
        }" />
        <v-rect v-for="preview in previewCells" :key="preview.key" :config="{
          x: preview.x,
          y: preview.y,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          fill: preview.fill,
          cornerRadius: 4,
          offsetX: 0,
          offsetY: 0
        }" />

        <v-rect v-for="cursorCell in cursorIndicatorCells" :key="cursorCell.key" :config="{
          x: cursorCell.x,
          y: cursorCell.y,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          fill: 'transparent',
          stroke: cursorCell.stroke,
          strokeWidth: cursorCell.strokeWidth,
          cornerRadius: 4,
          offsetX: 1,
          offsetY: 1
        }" />
        <v-rect v-for="particle in particles" :key="particle.id" :config="{
          x: particle.x - particle.size / 2,
          y: particle.y - particle.size / 2,
          width: particle.size,
          height: particle.size,
          fill: particle.color,
          rotation: particle.rotation,
          opacity: particle.opacity,
          cornerRadius: 2
        }" />
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped>
.board-container {
  display: inline-block;
  touch-action: none;
  /* Prevent default touch behaviors like scrolling */
  border: 4px double #ffd700;
  border-radius: 1rem;
  padding: 0.5rem;
  background: var(--pinkDarker);
}
</style>