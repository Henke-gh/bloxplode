<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { TETROMINOES } from '../assets/tetrominoes';

const CELL_SIZE = 40;
const SHAPE_COLOR = '#EDC9AF';
const BG_COLOR = '#2a2a2a';
const GRID_COLOR = '#444';

const store = useGameStore();

const getShapeConfig = (shape) => {
  const matrix = TETROMINOES[shape.name].shape;
  const rows = matrix.length;
  const cols = matrix[0].length;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c]) {
        cells.push({
          key: `${r}-${c}`,
          x: c * CELL_SIZE,
          y: r * CELL_SIZE,
        });
      }
    }
  }

  return {
    width: cols * CELL_SIZE,
    height: rows * CELL_SIZE,
    cells
  };
};

const handleDragStart = (e, shape) => {
  store.setDraggingShape(shape.id);

  const rect = e.currentTarget.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  e.dataTransfer.setData('shapeId', shape.id);
  e.dataTransfer.setData('offsetX', offsetX.toString());
  e.dataTransfer.setData('offsetY', offsetY.toString());
  e.dataTransfer.effectAllowed = 'move';
};

const handleTouchStart = (e, shape) => {
  e.preventDefault(); // Prevent scrolling and other default touch behaviors
  e.stopPropagation(); // Prevent event from bubbling to Konva

  store.setDraggingShape(shape.id);

  // Set up global touch event listeners for the drag operation
  const handleGlobalTouchMove = (globalE) => {
    globalE.preventDefault();
    const touch = globalE.touches[0];
    if (!touch) return;

    // Check if touch is over the board
    const boardElement = document.querySelector('.board-container');
    if (boardElement) {
      const rect = boardElement.getBoundingClientRect();
      const cursorX = touch.clientX - rect.left;
      const cursorY = touch.clientY - rect.top;

      const cursorCol = Math.floor(cursorX / 40); // CELL_SIZE = 40
      const cursorRow = Math.floor(cursorY / 40);

      if (cursorRow >= 0 && cursorRow < 8 && cursorCol >= 0 && cursorCol < 8) { // BOARD_SIZE = 8
        // Update hover state - we'll need to access the store
        store.setHoveringCell(cursorRow, cursorCol);
      } else {
        store.setHoveringCell(null, null);
      }
    }
  };

  const handleGlobalTouchEnd = (globalE) => {
    globalE.preventDefault();
    const touch = globalE.changedTouches[0];
    if (!touch) return;

    // Check if touch ended over the board
    const boardElement = document.querySelector('.board-container');
    if (boardElement) {
      const rect = boardElement.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const col = Math.floor(x / 40);
      const row = Math.floor(y / 40);

      const draggingShape = store.getDraggingShape();
      if (draggingShape && row >= 0 && row < 8 && col >= 0 && col < 8) {
        store.placeShape(draggingShape, row, col);
      }
    }

    // Clean up
    store.setHoveringCell(null, null);
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
  };

  // Add global listeners
  document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
  document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
};

const handleDragEnd = () => {
  store.clearDragState();
};
</script>

<template>
  <div class="shape-tray">
    <div v-for="shape in store.shapes" :key="shape.id" class="shape-container" :style="{
      width: getShapeConfig(shape).width + 'px',
      height: getShapeConfig(shape).height + 'px'
    }" :draggable="store.gameState === 'playing'" @dragstart="(e) => handleDragStart(e, shape)"
      @dragend="handleDragEnd" @touchstart="(e) => handleTouchStart(e, shape)">
      <v-stage :config="{
        width: getShapeConfig(shape).width,
        height: getShapeConfig(shape).height
      }">
        <v-layer>
          <v-rect :config="{
            x: 0,
            y: 0,
            width: getShapeConfig(shape).width,
            height: getShapeConfig(shape).height,
            fill: BG_COLOR,
            cornerRadius: 4
          }" />
          <v-rect v-for="cell in getShapeConfig(shape).cells" :key="cell.key" :config="{
            x: cell.x,
            y: cell.y,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            fill: SHAPE_COLOR,
            stroke: GRID_COLOR,
            strokeWidth: 1,
            cornerRadius: 2,
            offsetX: 1,
            offsetY: 1
          }" />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<style scoped>
.shape-tray {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  min-height: 140px;
}

.shape-container {
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 0.1s;
  touch-action: none;
  /* Prevent default touch behaviors */
}

.shape-container:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.shape-container[draggable="true"]:hover {
  transform: scale(1.02);
}
</style>