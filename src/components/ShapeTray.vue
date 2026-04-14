<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { TETROMINOES } from '../assets/tetrominoes';
import { useBoardPosition } from '../composables/useBoardPosition';

const CELL_SIZE = 24;
const SHAPE_COLOR = '#ffd700';
const BG_COLOR = '#2a2a2a';
const GRID_COLOR = '#e37620';

const { screenToBoard } = useBoardPosition();

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
  const offsetX = e.clientX - rect.right;
  const offsetY = e.clientY - rect.bottom;

  e.dataTransfer.setData('shapeId', shape.id);
  e.dataTransfer.setData('offsetX', offsetX.toString());
  e.dataTransfer.setData('offsetY', offsetY.toString());
  e.dataTransfer.effectAllowed = 'move';

  store.setDragPosition(e.clientX, e.clientY);

  document.addEventListener('drag', handleGlobalDrag);
  document.addEventListener('dragend', handleGlobalDragEnd);
};

const handleGlobalDrag = (e) => {
  store.setDragPosition(e.clientX, e.clientY);
};

const handleGlobalDragEnd = () => {
  document.removeEventListener('drag', handleGlobalDrag);
  document.removeEventListener('dragend', handleGlobalDragEnd);
  store.clearDragState();
};

const handleTouchStart = (e, shape) => {
  e.preventDefault();
  e.stopPropagation();

  store.setDraggingShape(shape.id);
  store.setDragPosition(e.touches[0].clientX, e.touches[0].clientY);

  // Set up global touch event listeners for the drag operation
  const handleGlobalTouchMove = (globalE) => {
    globalE.preventDefault();
    const touch = globalE.touches[0];
    if (!touch) return;

    store.setDragPosition(touch.clientX, touch.clientY);

    // Check if touch is over the board using composable
    const boardElement = document.querySelector('.board-container');
    if (boardElement) {
      const boardPos = screenToBoard(touch.clientX, touch.clientY, boardElement);

      if (boardPos) {
        store.setHoveringCell(boardPos.row, boardPos.col);
      } else {
        store.setHoveringCell(null, null);
      }
    }
  };

  const handleGlobalTouchEnd = (globalE) => {
    globalE.preventDefault();
    const touch = globalE.changedTouches[0];
    if (!touch) return;

    // Check if touch ended over the board using composable
    const boardElement = document.querySelector('.board-container');
    if (boardElement) {
      const boardPos = screenToBoard(touch.clientX, touch.clientY, boardElement);

      if (boardPos) {
        const draggingShape = store.getDraggingShape();
        if (draggingShape) {
          store.placeShape(draggingShape, boardPos.row, boardPos.col);
        }
      }
    }

    // Clean up
    store.setHoveringCell(null, null);
    store.clearDragState();
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
            cornerRadius: 4
          }" />
          <v-rect v-for="cell in getShapeConfig(shape).cells" :key="cell.key" :config="{
            x: cell.x,
            y: cell.y,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            fill: SHAPE_COLOR,
            stroke: GRID_COLOR,
            strokeWidth: 2,
            cornerRadius: 4,
            offsetX: 0,
            offsetY: 0
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