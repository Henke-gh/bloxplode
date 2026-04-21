<script setup>
import { ref, watch } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const visible = ref(false);
let hideTimeout = null;

watch(() => store.showLevelOverlay, (show) => {
  if (show) {
    visible.value = true;
    if (hideTimeout) clearTimeout(hideTimeout);
  } else {
    hideTimeout = setTimeout(() => {
      visible.value = false;
    }, 300);
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="level">
      <div v-if="visible" class="level-overlay">
        <h2 class="level-text kavoon-regular">Level {{ store.level }}</h2>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.level-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #833ab4;
  background-image: linear-gradient(164deg,
      rgb(66, 30, 91) 0%,
      rgb(253, 29, 186) 50%,
      rgb(53, 23, 72) 100%);
  background-image: url("blockbg.png");
  border-radius: 1rem;
  border: 4px double var(--gold);
  z-index: 9999;
  pointer-events: none;
}

.level-text {
  color: var(--gold);
  text-shadow: 2px 2px 3px var(--brown);
  letter-spacing: 0.1em;
}

.level-enter-active {
  animation: levelIn 0.5s ease-out;
}

.level-leave-active {
  animation: levelOut 0.3s ease-in;
}

@keyframes levelIn {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes levelOut {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
</style>