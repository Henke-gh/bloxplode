<script setup>
import { ChessQueen } from '@lucide/vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();
</script>

<template>
  <div class="score-board">
    <div class="score-item">
      <span class="label">Score: </span>
      <span class="value">{{ store.score }}</span>
    </div>
    <ChessQueen class="icon" />
    <div class="score-item">
      <span class="label">Level: </span>
      <span class="value">{{ store.level }}</span>
    </div>
  </div>
  <div class="score-item">
    <span class="label">High Score: </span>
    <span class="value">{{ store.highScore || 0 }}</span>
  </div>
</template>

<style scoped>
.score-board {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 16px 24px;
  border-radius: 8px;
}

.score-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--pinkDarker);
  border: 2px solid gold;
  border-radius: 1rem;
  padding: 0.2rem 1rem;
}

.label {
  font-size: 1rem;
  color: var(--gold);
  font-weight: 600;
  text-transform: uppercase;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #EDC9AF;
  line-height: 1;
  padding-bottom: 5px;
}
</style>