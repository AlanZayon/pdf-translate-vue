<script setup>
import { ref } from 'vue';
import UiBadge from '../shared/UiBadge.vue';

const props = defineProps({
  section: { type: Object, required: true },
  defaultExpanded: { type: Boolean, default: true },
  showWatermark: { type: Boolean, default: false },
});

const expanded = ref(props.defaultExpanded);
</script>

<template>
  <article :id="section.id" class="session-card">
    <button
      type="button"
      class="session-card__header w-full text-left"
      @click="expanded = !expanded"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="session-card__number">Session {{ section.number }}</span>
          <h3 class="font-display text-lg text-gold mt-1">{{ section.heading.replace(/^Session\s*\d+[:\s]*/i, '').replace(/^Sessão\s*\d+[:\s]*/i, '') }}</h3>
        </div>
        <span class="text-muted text-sm shrink-0 mt-1">{{ expanded ? '−' : '+' }}</span>
      </div>
      <div v-if="section.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
        <UiBadge v-for="tag in section.tags" :key="tag" variant="default" class="text-xs">{{ tag }}</UiBadge>
      </div>
    </button>

    <div v-show="expanded" class="session-card__body relative">
      <div
        v-if="showWatermark"
        class="pointer-events-none absolute inset-0 flex items-center justify-center z-10 opacity-[0.06] rotate-[-18deg]"
        aria-hidden="true"
      >
        <span class="text-3xl font-display text-gold whitespace-nowrap">Arcane Forge Preview</span>
      </div>

      <div v-if="section.objectives" class="session-objectives">
        <strong class="text-gold text-sm">Objectives</strong>
        <p class="text-muted text-sm mt-1">{{ section.objectives }}</p>
      </div>

      <div v-for="(scene, idx) in section.scenes" :key="idx" class="session-scene">
        <p class="text-sm">
          <span v-if="scene.label" class="text-gold font-medium">Scene {{ scene.label }} — </span>
          <span class="text-text">{{ scene.text }}</span>
        </p>
      </div>

      <p v-if="section.combat" class="text-sm mt-3">
        <strong class="text-ember">Combat:</strong>
        <span class="text-muted ml-1">{{ section.combat }}</span>
      </p>
      <p v-if="section.puzzle" class="text-sm mt-2">
        <strong class="text-ember">Puzzle:</strong>
        <span class="text-muted ml-1">{{ section.puzzle }}</span>
      </p>

      <div
        v-if="!section.objectives && !section.scenes?.length && section.html"
        class="manuscript-prose text-sm"
        v-html="section.html"
      />
    </div>
  </article>
</template>

<style scoped>
.session-card {
  border: 1px solid color-mix(in srgb, var(--color-gold) 20%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-parchment-dark) 80%, transparent);
  overflow: hidden;
  margin-bottom: 1rem;
}
.session-card__header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-gold) 10%, transparent);
}
.session-card__number {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.8;
}
.session-card__body {
  padding: 1rem 1.25rem 1.25rem;
}
.session-objectives {
  background: color-mix(in srgb, var(--color-gold) 6%, transparent);
  border-left: 3px solid var(--color-gold-dim);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0 0.375rem 0.375rem 0;
}
.session-scene {
  margin-bottom: 0.75rem;
  padding-left: 0.75rem;
  border-left: 2px solid color-mix(in srgb, var(--color-gold) 15%, transparent);
}
</style>
