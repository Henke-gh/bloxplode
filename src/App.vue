<script setup>
import "./assets/main.css";
import { useGameStore } from './stores/game';
import GameBoard from './components/GameBoard.vue';
import ShapeTray from './components/ShapeTray.vue';
import ScoreBoard from './components/ScoreBoard.vue';
import LevelOverlay from './components/LevelOverlay.vue';
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
      <LevelOverlay />
      <div v-if="store.gameState === 'gameover'" class="game-over">
        <h2 class="kavoon-regular">Game Over!</h2>
        <p class="kavoon-regular">Score: <span>{{ store.score }}</span></p>
        <button @click="store.resetGame" class="kavoon-regular">Play Again</button>
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
  color: var(--yellow);
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
  background: #833ab4;
  background: linear-gradient(164deg,
      rgb(66, 30, 91) 0%,
      rgb(253, 29, 186) 50%,
      rgb(53, 23, 72) 100%);
  padding: 2rem 3rem;
  border-radius: 1rem;
  border: 4px double var(--gold);
  text-align: center;
  z-index: 100;
  color: var(--yellow);
}

.game-over p {
  margin-bottom: 16px;
}

.game-over button {
  background: var(--pink);
  color: var(--yellow);
  border: 1px solid var(--gold);
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
