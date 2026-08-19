<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | gold | ghost | outline | danger
  size: { type: String, default: 'md' },          // sm | md | lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    class="rift-btn"
    :class="[`rift-btn--${variant}`, `rift-btn--${size}`, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="rift-spinner" />
    <span class="rift-btn__content"><slot /></span>
  </button>
</template>

<style scoped>
.rift-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: transform 0.15s var(--ease-spring), box-shadow 0.25s var(--ease-out), background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.rift-btn.is-block { width: 100%; }
.rift-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.rift-btn:active:not(:disabled) { transform: scale(0.97); }

/* Sizes */
.rift-btn--sm { padding: 8px 14px; font-size: var(--fs-xs); }
.rift-btn--md { padding: 12px 22px; font-size: var(--fs-sm); }
.rift-btn--lg { padding: 16px 32px; font-size: var(--fs-base); }

/* Primary — morado, acción principal */
.rift-btn--primary {
  background: linear-gradient(135deg, var(--purple-lt), var(--purple));
  color: #fff;
  box-shadow: 0 4px 20px var(--purple-glow);
}
.rift-btn--primary:hover:not(:disabled) {
  box-shadow: 0 6px 28px var(--purple-glow-strong);
  transform: translateY(-1px);
}

/* Gold — CTA hero, momentos épicos */
.rift-btn--gold {
  background: linear-gradient(135deg, var(--gold-lt), var(--gold-dim));
  color: #14100a;
  box-shadow: 0 4px 24px var(--gold-glow);
}
.rift-btn--gold:hover:not(:disabled) {
  box-shadow: 0 8px 36px var(--gold-glow-strong);
  transform: translateY(-1px);
}

/* Outline */
.rift-btn--outline {
  background: transparent;
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.rift-btn--outline:hover:not(:disabled) {
  border-color: var(--gold);
  background: rgba(200, 170, 110, 0.06);
}

/* Ghost */
.rift-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
}
.rift-btn--ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* Danger */
.rift-btn--danger {
  background: rgba(228, 45, 41, 0.1);
  color: var(--red);
  border-color: rgba(228, 45, 41, 0.3);
}
.rift-btn--danger:hover:not(:disabled) {
  background: rgba(228, 45, 41, 0.18);
}

.rift-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: rift-spin 0.7s linear infinite;
}
@keyframes rift-spin { to { transform: rotate(360deg); } }

.is-loading .rift-btn__content { opacity: 0.75; }
</style>
