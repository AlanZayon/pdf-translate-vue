<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'gold', 'success', 'muted'].includes(v),
  },
});

const variants = {
  default: 'bg-surface-alt text-text border-gold/20',
  gold: 'bg-gold/15 text-gold border-gold/40',
  success: 'bg-success/10 text-success border-success/30',
  muted: 'bg-surface-alt/60 text-muted border-transparent',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      variants[variant],
    ]"
  >
    <slot />
  </span>
</template>
