<script setup>
defineProps({
  padding: { type: String, default: 'p-6 md:p-8' },
  glow: { type: Boolean, default: false },
});
</script>

<template>
  <div
    :class="[
      'bg-surface/90 backdrop-blur-md rounded-2xl border border-gold/20',
      padding,
      glow ? 'shadow-gold' : '',
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.shadow-gold {
  box-shadow: var(--shadow-gold);
}
</style>
