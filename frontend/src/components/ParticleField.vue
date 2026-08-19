<script setup>
import { ref } from 'vue'
import { useParticles } from '../composables/useParticles.js'

const props = defineProps({
  density: { type: Number, default: 90 },
  maxParticles: { type: Number, default: 220 },
  colors: { type: Array, default: () => ['#c8aa6e', '#e2c98f', '#8B7EE8'] },
  fog: { type: Boolean, default: true },
  connect: { type: Boolean, default: false },
})

const canvas = ref(null)
useParticles(canvas, {
  density: props.density,
  maxParticles: props.maxParticles,
  colors: props.colors,
  connect: props.connect,
})
</script>

<template>
  <div class="particle-field" aria-hidden="true">
    <canvas ref="canvas" class="particle-canvas" />
    <div v-if="fog" class="fog-layer fog-layer--1" />
    <div v-if="fog" class="fog-layer fog-layer--2" />
    <div class="vignette" />
  </div>
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fog-layer {
  position: absolute;
  inset: -10%;
  background: radial-gradient(ellipse 60% 40% at 30% 20%, var(--purple-glow) 0%, transparent 60%),
              radial-gradient(ellipse 50% 35% at 75% 70%, var(--gold-glow) 0%, transparent 55%);
  filter: blur(40px);
  opacity: 0.8;
  animation: fog-drift-1 24s ease-in-out infinite alternate;
}

.fog-layer--2 {
  background: radial-gradient(ellipse 45% 30% at 80% 15%, var(--gold-glow) 0%, transparent 55%),
              radial-gradient(ellipse 55% 40% at 15% 85%, var(--purple-glow) 0%, transparent 60%);
  animation: fog-drift-2 30s ease-in-out infinite alternate;
  opacity: 0.6;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, var(--bg-base) 100%);
}

@keyframes fog-drift-1 {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(3%, -3%) scale(1.08); }
}
@keyframes fog-drift-2 {
  0%   { transform: translate(0, 0) scale(1.05); }
  100% { transform: translate(-4%, 2%) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .fog-layer { animation: none; }
}
</style>
