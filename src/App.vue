<script setup>
import { useGameStore } from './stores/game';
import GameBoard from './components/GameBoard.vue';
import ShapeTray from './components/ShapeTray.vue';
import ScoreBoard from './components/ScoreBoard.vue';

const store = useGameStore();
</script>

<template>
  <div class="app">
    <header class="header bitcount-ink-test">
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
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bitcount+Ink:wght@100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto+Slab:wght@100..900&display=swap');

.bitcount-ink-test {
  font-family: "Bitcount Ink", system-ui;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
  font-variation-settings:
    "slnt" 0.5,
    "CRSV" 0.5,
    "ELSH" 50,
    "ELXP" 0,
    "SZP1" 0,
    "SZP2" 0,
    "XPN1" 0,
    "XPN2" 0,
    "YPN1" -10,
    "YPN2" 10;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #121212;
  min-height: 100vh;
}

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
  color: #E320A8;
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
