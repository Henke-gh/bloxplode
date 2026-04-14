<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useGameStore } from '../stores/game';
import { TETROMINOES } from '../assets/tetrominoes';

const CELL_SIZE = 32;
const BOARD_SIZE = 8;
const CELL_BG_COLOR = '#2a2a2a';
const CELL_OCCUPIED_COLOR = '#ffd700';
const GRID_COLOR = '#444';
const BOARD_BG = '#1a1a1a';

const VALID_PREVIEW_COLOR = 'rgba(227, 32, 168, 89)';
const INVALID_PREVIEW_COLOR = 'rgba(220, 53, 69, 0.5)';
const CURSOR_INDICATOR_COLOR = 'rgba(255, 255, 255, 0.15)';

const ANIMATION_DURATION = 600;
const DROP_OFFSET_ROW = 2;
const DROP_OFFSET_COL = 2;

const store = useGameStore();
const boardContainer = ref(null);
const cursorCell = ref(null);

// Particle system for explosion animation
const particles = ref([]);
const clearingRowCells = ref([]);
const clearingColCells = ref([]);
let animationFrameId = null;

const gridConfig = computed(() => ({
  width: BOARD_SIZE * CELL_SIZE,
  height: BOARD_SIZE * CELL_SIZE
}));

const cells = computed(() => {
  const result = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Keep cells visible during animation
      const isRowClearing = store.clearingPhase === 'row' && clearingRowCells.value.some(c => c.row === row && c.col === col);
      const isColClearing = store.clearingPhase === 'col' && clearingColCells.value.some(c => c.row === row && c.col === col);
      const isClearing = isRowClearing || isColClearing;

      result.push({
        key: `${row}-${col}`,
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
        fill: store.board[row][col] ? CELL_OCCUPIED_COLOR : CELL_BG_COLOR,
        stroke: isClearing ? '#ffffff' : GRID_COLOR,
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
          stroke: canPlace ? '#4CAF50' : '#f44336',
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

  const rect = boardContainer.value.getBoundingClientRect();
  const cursorX = newPos.x - rect.left;
  const cursorY = newPos.y - rect.top;

  let cursorCol = Math.floor(cursorX / CELL_SIZE);
  let cursorRow = Math.floor(cursorY / CELL_SIZE);

  // Offset placement location
  cursorRow = Math.max(0, cursorRow - DROP_OFFSET_ROW);
  cursorCol = Math.max(0, cursorCol - DROP_OFFSET_COL);

  if (cursorRow >= 0 && cursorRow < BOARD_SIZE && cursorCol >= 0 && cursorCol < BOARD_SIZE) {
    cursorCell.value = { row: cursorRow, col: cursorCol };
    store.setHoveringCell(cursorRow, cursorCol);
  } else {
    cursorCell.value = null;
    store.setHoveringCell(null, null);
  }
});

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const rect = boardContainer.value.getBoundingClientRect();

  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  let cursorCol = Math.floor(cursorX / CELL_SIZE);
  let cursorRow = Math.floor(cursorY / CELL_SIZE);

  // Offset placement location
  cursorRow = Math.max(0, cursorRow - DROP_OFFSET_ROW);
  cursorCol = Math.max(0, cursorCol - DROP_OFFSET_COL);

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

  let col = Math.floor(x / CELL_SIZE);
  let row = Math.floor(y / CELL_SIZE);

  // Offset placement location
  row = Math.max(0, row - DROP_OFFSET_ROW);
  col = Math.max(0, col - DROP_OFFSET_COL);

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
    store.board[cell.row].every((c, idx) => c !== null)
  );
  clearingRowCells.value = rowCells;

  rowCells.forEach(cell => {
    createExplosionParticles(cell.row, cell.col);
  });

  setTimeout(() => {
    store.nextClearPhase();
  }, ANIMATION_DURATION);
}

function triggerColExplosion() {
  const colCells = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (store.board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        colCells.push({ row: r, col: c });
      }
    }
  }

  clearingColCells.value = colCells;

  colCells.forEach(cell => {
    createExplosionParticles(cell.row, cell.col);
  });

  setTimeout(() => {
    store.nextClearPhase();
  }, ANIMATION_DURATION);
}

function createExplosionParticles(row, col) {
  const centerX = col * CELL_SIZE + CELL_SIZE / 2;
  const centerY = row * CELL_SIZE + CELL_SIZE / 2;
  const particleSize = CELL_SIZE / 3;

  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i + Math.random() * 0.5;
    const speed = 80 + Math.random() * 60;

    particles.value.push({
      id: `${Date.now()}-${row}-${col}-${i}`,
      startX: centerX,
      startY: centerY,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: particleSize,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360,
      color: '#ffffff',
      startTime: Date.now(),
      row,
      col
    });
  }

  startParticleAnimation();
}

function startParticleAnimation() {
  if (animationFrameId) return;

  const animate = () => {
    const now = Date.now();
    const elapsed = now - (particles.value[0]?.startTime || now);
    const progress = elapsed / ANIMATION_DURATION;

    if (progress >= 1) {
      particles.value = [];
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      return;
    }

    particles.value = particles.value.map(p => {
      const pElapsed = now - p.startTime;
      const pProgress = pElapsed / ANIMATION_DURATION;

      return {
        ...p,
        x: p.startX + p.vx * pProgress,
        y: p.startY + p.vy * pProgress,
        rotation: p.rotation + p.rotationSpeed * pProgress,
        opacity: 1 - pProgress
      };
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animationFrameId = requestAnimationFrame(animate);
}

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
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
}
</style>