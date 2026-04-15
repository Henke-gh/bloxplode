import { ref } from 'vue';

const particles = ref([]);
const activeTweens = ref(new Map());
let particleFrameId = null;
let tweenFrameId = null;

function createExplosion(options) {
  const {
    x,
    y,
    colors = ['#e37620', '#e6e6d9'],
    count = 32,
    particleSize = 4,
    speed = 80
  } = options;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI / 2) * i + Math.random() * 0.5;
    const speedVariation = speed + Math.random() * 60;
    const colorIndex = i % 2;

    particles.value.push({
      id: `${Date.now()}-${x}-${y}-${i}`,
      startX: x,
      startY: y,
      x,
      y,
      vx: Math.cos(angle) * speedVariation,
      vy: Math.sin(angle) * speedVariation,
      size: particleSize,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360,
      color: colors[colorIndex],
      opacity: 1,
      startTime: Date.now()
    });
  }

  startParticleAnimation();
}

function clearParticles() {
  particles.value = [];
  if (particleFrameId) {
    cancelAnimationFrame(particleFrameId);
    particleFrameId = null;
  }
}

function startParticleAnimation(duration = 600) {
  if (particleFrameId) return;

  const animate = () => {
    const now = Date.now();

    if (particles.value.length === 0) {
      particleFrameId = null;
      return;
    }

    const firstParticle = particles.value[0];
    const elapsed = now - firstParticle.startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      particles.value = [];
      if (particleFrameId) {
        cancelAnimationFrame(particleFrameId);
        particleFrameId = null;
      }
      return;
    }

    particles.value = particles.value.map(p => {
      const pElapsed = now - p.startTime;
      const pProgress = pElapsed / duration;

      return {
        ...p,
        x: p.startX + p.vx * pProgress,
        y: p.startY + p.vy * pProgress,
        rotation: p.rotation + p.rotationSpeed * pProgress,
        opacity: 1 - pProgress
      };
    });

    particleFrameId = requestAnimationFrame(animate);
  };

  particleFrameId = requestAnimationFrame(animate);
}

function tween(options) {
  const {
    from = 0,
    to = 1,
    duration = 600,
    onUpdate,
    onComplete
  } = options;

  const id = `tween-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  activeTweens.value.set(id, {
    id,
    from,
    to,
    current: from,
    progress: 0,
    duration,
    onUpdate,
    onComplete,
    startTime: Date.now()
  });

  startTweenAnimation();

  return id;
}

function cancelTween(id) {
  const tween = activeTweens.value.get(id);
  if (tween && tween.onComplete) {
    tween.onComplete(tween.current);
  }
  activeTweens.value.delete(id);
}

function cancelAllTweens() {
  activeTweens.value.forEach((tween, id) => {
    if (tween.onComplete) {
      tween.onComplete(tween.current);
    }
  });
  activeTweens.value.clear();

  if (tweenFrameId) {
    cancelAnimationFrame(tweenFrameId);
    tweenFrameId = null;
  }
}

function startTweenAnimation() {
  if (tweenFrameId) return;

  const animate = () => {
    const now = Date.now();
    const completedIds = [];

    activeTweens.value.forEach((tween, id) => {
      const elapsed = now - tween.startTime;
      const progress = Math.min(elapsed / tween.duration, 1);

      const newValue = tween.from + (tween.to - tween.from) * progress;

      const updatedTween = {
        ...tween,
        current: newValue,
        progress
      };

      activeTweens.value.set(id, updatedTween);

      if (tween.onUpdate) {
        tween.onUpdate(newValue);
      }

      if (progress >= 1) {
        completedIds.push(id);
      }
    });

    completedIds.forEach(id => {
      const tween = activeTweens.value.get(id);
      if (tween?.onComplete) {
        tween.onComplete(tween.to);
      }
      activeTweens.value.delete(id);
    });

    if (activeTweens.value.size === 0) {
      tweenFrameId = null;
      return;
    }

    tweenFrameId = requestAnimationFrame(animate);
  };

  tweenFrameId = requestAnimationFrame(animate);
}

function stopAllAnimations() {
  clearParticles();
  cancelAllTweens();
}

export function useAnimations() {
  return {
    particles,
    createExplosion,
    clearParticles,
    activeTweens,
    tween,
    cancelTween,
    cancelAllTweens,
    stopAllAnimations
  };
}