<script setup>
import { useGameStore } from '../stores/game';

const store = useGameStore();
</script>

<template>
  <div class="score-board">
    <div class="score-item">
      <span class="label">Score</span>
      <span class="value">{{ store.score }}</span>
    </div>
    <div class="score-item">
      <span class="label">Level</span>
      <span class="value">{{ store.level }}</span>
    </div>
  </div>
</template>

<style scoped>
.score-board {
  display: flex;
  gap: 32px;
  padding: 16px 24px;
  background: #1a1a1a;
  border-radius: 8px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #EDC9AF;
}
</style>