<script setup>
defineProps({
  section: { type: Object, required: true },
  variant: { type: String, default: 'default' },
});
</script>

<template>
  <section :id="section.id" class="campaign-section" :class="`campaign-section--${variant}`">
    <h3 class="font-display text-lg text-gold mb-3">{{ section.heading }}</h3>
    <div class="manuscript-prose text-sm" v-html="section.html" />
  </section>
</template>

<style scoped>
.campaign-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-gold) 10%, transparent);
}
.campaign-section--overview {
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 15%, transparent);
  background: color-mix(in srgb, var(--color-gold) 3%, transparent);
}
</style>
