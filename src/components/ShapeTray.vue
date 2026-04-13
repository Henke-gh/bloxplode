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
  store.setDraggingShape(shape.id);

  // Store touch information for the drag
  const touch = e.touches[0];
  const rect = e.currentTarget.getBoundingClientRect();
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;

  // Store touch drag data in a way that touchmove/touchend can access it
  e.currentTarget._touchDragData = {
    shapeId: shape.id,
    offsetX,
    offsetY,
    startX: touch.clientX,
    startY: touch.clientY
  };
};

const handleTouchEnd = (e) => {
  // Clean up touch drag data
  if (e.currentTarget._touchDragData) {
    delete e.currentTarget._touchDragData;
  }
  store.clearDragState();
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
      @dragend="handleDragEnd" @touchstart="(e) => handleTouchStart(e, shape)" @touchend="handleTouchEnd">
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
}

.shape-container:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.shape-container[draggable="true"]:hover {
  transform: scale(1.02);
}
</style>