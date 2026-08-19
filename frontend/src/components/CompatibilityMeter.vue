<script setup>
defineProps({
  variant: { type: String, default: 'default' }, // default | gold | purple | green | red | blue | amber | outline
  size: { type: String, default: 'md' }, // sm | md
})
</script>

<template>
  <span class="rift-badge" :class="[`rift-badge--${variant}`, `rift-badge--${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.rift-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1;
}
.rift-badge--sm { padding: 4px 9px; font-size: 10.5px; letter-spacing: 0.03em; }
.rift-badge--md { padding: 6px 12px; font-size: var(--fs-xs); }

.rift-badge--default { background: var(--bg-hover); color: var(--text-secondary); border-color: var(--border-dim); }
.rift-badge--gold    { background: var(--gold-glow); color: var(--gold-lt); border-color: var(--border-strong); }
.rift-badge--purple  { background: var(--purple-glow); color: var(--purple-lt); border-color: var(--border-purple); }
.rift-badge--green   { background: var(--green-glow); color: var(--green); border-color: rgba(62,191,144,0.3); }
.rift-badge--red     { background: var(--red-glow); color: var(--red); border-color: rgba(228,45,41,0.3); }
.rift-badge--blue    { background: var(--blue-glow); color: var(--blue); border-color: rgba(19,165,222,0.3); }
.rift-badge--amber   { background: var(--amber-glow); color: var(--amber); border-color: rgba(212,150,10,0.3); }
.rift-badge--outline { background: transparent; color: var(--text-secondary); border-color: var(--border-dim); }
</style>
