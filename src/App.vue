<script setup>
import "./assets/main.css";
import { useGameStore } from './stores/game';
import GameBoard from './components/GameBoard.vue';
import ShapeTray from './components/ShapeTray.vue';
import ScoreBoard from './components/ScoreBoard.vue';
import { Flower } from "@lucide/vue";

const store = useGameStore();
</script>

<template>
  <div class="app">
    <header class="header kavoon-regular">
      <h1 class="title">BLOXPLODE</h1>
      <ScoreBoard />
    </header>

    <main class="game-area">
      <GameBoard />
    </main>

    <footer class="footer">
      <ShapeTray />

      <div v-if="store.gameState === 'gameover'" class="game-over">
        <p>Game Over!</p>
        <button @click="store.resetGame">Play Again</button>
      </div>
      <Flower class="icon" />
    </footer>
  </div>
</template>

<style>
.app {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.title {
  font-size: 48px;
  color: var(--gold);
  letter-spacing: 2px;
}

.game-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 400px;
}

.game-over {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 32px 48px;
  border-radius: 12px;
  text-align: center;
  z-index: 100;
}

.game-over p {
  font-size: 32px;
  color: #EDC9AF;
  margin-bottom: 16px;
}

.game-over button {
  background: #EDC9AF;
  color: #121212;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.1s;
}

.game-over button:hover {
  transform: scale(1.05);
}
</style>
