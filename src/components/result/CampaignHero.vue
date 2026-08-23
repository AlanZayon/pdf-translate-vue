<script setup>
import UiBadge from '../shared/UiBadge.vue';

defineProps({
  title: { type: String, required: true },
  complexityName: { type: String, default: '' },
  languageName: { type: String, default: '' },
  processingTime: { type: Number, default: 0 },
  formatTime: { type: Function, required: true },
  stats: { type: Object, default: () => ({}) },
  qualityScore: { type: [Number, String], default: null },
  bookSignals: { type: Array, default: () => [] },
  forgeLabel: { type: String, default: 'Campaign Complete' },
});
</script>

<template>
  <div class="campaign-hero relative overflow-hidden px-6 py-8 md:px-12 md:py-12 text-center">
    <div class="absolute inset-0 pointer-events-none hero-glow" aria-hidden="true" />
    <div class="hero-rule hero-rule--top" aria-hidden="true" />

    <p class="text-gold/80 text-xs uppercase tracking-[0.28em] mb-4">{{ forgeLabel }}</p>
    <h2 class="font-display text-3xl md:text-5xl font-bold text-gold mb-4 leading-[1.15] max-w-3xl mx-auto">
      {{ title }}
    </h2>
    <p v-if="processingTime" class="text-muted text-sm">
      Forged in {{ formatTime(processingTime) }} · ready for the table
    </p>

    <div class="hero-rule hero-rule--mid" aria-hidden="true" />

    <div class="flex flex-wrap justify-center gap-2 mt-1">
      <UiBadge v-if="complexityName" variant="gold">{{ complexityName }}</UiBadge>
      <UiBadge v-if="languageName" variant="default">{{ languageName }}</UiBadge>
      <UiBadge v-if="stats.sessionCount" variant="muted">{{ stats.sessionCount }} sessions</UiBadge>
      <UiBadge v-if="stats.wordCount" variant="muted">{{ stats.wordCount.toLocaleString() }} words</UiBadge>
      <UiBadge v-if="stats.estimatedReadMinutes" variant="muted">~{{ stats.estimatedReadMinutes }} min read</UiBadge>
      <UiBadge v-if="qualityScore != null && qualityScore !== ''" variant="muted">
        Quality {{ qualityScore }}/100
      </UiBadge>
    </div>

    <div v-if="bookSignals.length" class="mt-7 pt-5">
      <p class="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Inspired by your book</p>
      <div class="flex flex-wrap justify-center gap-2">
        <UiBadge v-for="term in bookSignals" :key="term" variant="default">{{ term }}</UiBadge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaign-hero {
  border-bottom: 1px solid color-mix(in srgb, var(--color-gold) 20%, transparent);
  background:
    radial-gradient(ellipse at 50% -10%, color-mix(in srgb, var(--color-gold) 16%, transparent), transparent 58%);
}
.hero-rule {
  height: 1px;
  margin: 1.25rem auto;
  max-width: 16rem;
  background: linear-gradient(to right, transparent, color-mix(in srgb, var(--color-gold) 55%, transparent), transparent);
}
.hero-rule--top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16rem;
  margin: 0;
}
.hero-rule--mid {
  margin-top: 1.4rem;
  margin-bottom: 1.1rem;
}
</style>
