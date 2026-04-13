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
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid gold;
  border-radius: 1rem;
  padding: 0.2rem 1rem;
}

.label {
  font-size: 1rem;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #EDC9AF;
}
</style>