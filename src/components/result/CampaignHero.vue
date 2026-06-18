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
  <div class="campaign-hero relative overflow-hidden p-6 md:p-10 border-b border-gold/20 text-center">
    <div class="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

    <p class="text-gold/80 text-xs uppercase tracking-[0.25em] mb-3">{{ forgeLabel }}</p>
    <h2 class="font-display text-2xl md:text-4xl font-bold text-gold mb-3 leading-tight">{{ title }}</h2>
    <p v-if="processingTime" class="text-muted text-sm">
      Forged in {{ formatTime(processingTime) }} · ready for the table
    </p>

    <div class="flex flex-wrap justify-center gap-2 mt-5">
      <UiBadge v-if="complexityName" variant="gold">{{ complexityName }}</UiBadge>
      <UiBadge v-if="languageName" variant="default">{{ languageName }}</UiBadge>
      <UiBadge v-if="stats.sessionCount" variant="muted">{{ stats.sessionCount }} sessions</UiBadge>
      <UiBadge v-if="stats.wordCount" variant="muted">{{ stats.wordCount.toLocaleString() }} words</UiBadge>
      <UiBadge v-if="stats.estimatedReadMinutes" variant="muted">~{{ stats.estimatedReadMinutes }} min read</UiBadge>
      <UiBadge v-if="qualityScore != null && qualityScore !== ''" variant="muted">
        Quality {{ qualityScore }}/100
      </UiBadge>
    </div>

    <div v-if="bookSignals.length" class="mt-6 pt-5 border-t border-gold/10">
      <p class="text-xs uppercase tracking-widest text-gold/80 mb-3">Inspired by your book</p>
      <div class="flex flex-wrap justify-center gap-2">
        <UiBadge v-for="term in bookSignals" :key="term" variant="default">{{ term }}</UiBadge>
      </div>
    </div>
  </div>
</template>
