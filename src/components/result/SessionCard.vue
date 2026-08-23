<script setup>
import { computed, ref } from 'vue';
import { sessionTitle } from '../../utils/campaignParser.js';

const props = defineProps({
  section: { type: Object, required: true },
  defaultExpanded: { type: Boolean, default: true },
  showWatermark: { type: Boolean, default: false },
});

const expanded = ref(props.defaultExpanded);
const label = computed(() =>
  /sessão|sessao/i.test(props.section.heading) ? 'Sessão' : 'Session',
);
const title = computed(() => sessionTitle(props.section.heading) || props.section.heading);
const hasBeats = computed(() => (props.section.beats || []).length > 0);
</script>

<template>
  <article :id="section.id" class="session-card">
    <button type="button" class="session-card__header w-full text-left" @click="expanded = !expanded">
      <div class="flex items-start gap-4">
        <span class="session-seal" aria-hidden="true">{{ section.number }}</span>
        <div class="min-w-0 flex-1">
          <span class="session-card__number">{{ label }} {{ section.number }}</span>
          <h3 class="font-display text-xl text-gold mt-1 leading-snug">{{ title }}</h3>
          <div v-if="section.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
            <span v-for="tag in section.tags" :key="tag" class="session-tag" :data-tag="tag.toLowerCase()">
              {{ tag }}
            </span>
          </div>
        </div>
        <span class="session-toggle shrink-0" :aria-expanded="expanded">{{ expanded ? '−' : '+' }}</span>
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
        <p class="session-objectives__label">Objectives</p>
        <ul v-if="section.objectives.includes('\n')" class="session-objectives__list">
          <li v-for="item in section.objectives.split('\n')" :key="item">{{ item }}</li>
        </ul>
        <p v-else class="text-sm mt-1">{{ section.objectives }}</p>
      </div>

      <template v-if="hasBeats">
        <div v-if="section.introHtml" class="campaign-prose session-intro" v-html="section.introHtml" />
        <article
          v-for="(beat, idx) in section.beats"
          :key="idx"
          class="session-beat"
          :class="`session-beat--${beat.kind}`"
        >
          <header class="session-beat__head">
            <h4 class="session-beat__title">{{ beat.heading }}</h4>
            <div v-if="beat.tags?.length" class="flex flex-wrap gap-1">
              <span v-for="tag in beat.tags" :key="tag" class="session-tag session-tag--sm" :data-tag="tag.toLowerCase()">
                {{ tag }}
              </span>
            </div>
          </header>
          <div class="campaign-prose" v-html="beat.html" />
        </article>
      </template>

      <div v-else class="campaign-prose" v-html="section.html" />
    </div>
  </article>
</template>

<style scoped>
.session-card {
  border: 1px solid color-mix(in srgb, var(--color-gold) 22%, transparent);
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-gold) 7%, transparent) 0%,
      color-mix(in srgb, var(--color-parchment-dark) 88%, transparent) 28%
    );
  overflow: hidden;
  margin-bottom: 1.25rem;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-void) 35%, transparent);
}
.session-card__header {
  padding: 1.15rem 1.35rem 1.05rem;
}
.session-seal {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--color-gold) 45%, transparent);
  background: radial-gradient(
    circle at 35% 30%,
    color-mix(in srgb, var(--color-gold) 35%, transparent),
    color-mix(in srgb, var(--color-gold) 8%, transparent) 70%
  );
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--color-gold) 12%, transparent);
}
.session-card__number {
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.8;
}
.session-toggle {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--color-gold) 25%, transparent);
  color: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.35rem;
  font-size: 1.1rem;
  line-height: 1;
}
.session-card__body {
  padding: 0 1.35rem 1.4rem;
}
.session-tag {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--color-gold) 25%, transparent);
  color: var(--color-gold);
  background: color-mix(in srgb, var(--color-gold) 8%, transparent);
}
.session-tag--sm {
  font-size: 0.58rem;
  padding: 0.12rem 0.45rem;
}
.session-tag[data-tag='combat'] {
  color: var(--color-ember);
  border-color: color-mix(in srgb, var(--color-ember) 40%, transparent);
  background: color-mix(in srgb, var(--color-ember) 10%, transparent);
}
.session-tag[data-tag='roleplay'] {
  color: var(--color-mist);
  border-color: color-mix(in srgb, var(--color-mist) 40%, transparent);
  background: color-mix(in srgb, var(--color-mist) 10%, transparent);
}
.session-tag[data-tag='puzzle'],
.session-tag[data-tag='investigation'] {
  color: var(--color-gold-dim);
}
.session-objectives {
  background: color-mix(in srgb, var(--color-gold) 8%, transparent);
  border-left: 3px solid var(--color-gold);
  padding: 0.85rem 1rem;
  margin-bottom: 1.15rem;
  border-radius: 0 0.6rem 0.6rem 0;
}
.session-objectives__label {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
}
.session-objectives__list {
  margin: 0.4rem 0 0;
  padding-left: 1.1rem;
  color: var(--color-text);
  font-size: 0.9rem;
}
.session-objectives__list li {
  margin-bottom: 0.25rem;
}
.session-intro {
  margin-bottom: 1rem;
}
.session-beat {
  margin-bottom: 1rem;
  padding: 0.95rem 1rem 0.35rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 14%, transparent);
  background: color-mix(in srgb, var(--color-surface) 55%, transparent);
  border-left-width: 3px;
}
.session-beat--scene {
  border-left-color: var(--color-gold);
}
.session-beat--encounter {
  border-left-color: var(--color-ember);
}
.session-beat--treasure {
  border-left-color: var(--color-gold-dim);
  background: color-mix(in srgb, var(--color-gold) 6%, transparent);
}
.session-beat--path,
.session-beat--puzzle {
  border-left-color: var(--color-mist);
}
.session-beat__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}
.session-beat__title {
  font-family: var(--font-display);
  color: var(--color-gold);
  font-size: 1rem;
  line-height: 1.35;
}
</style>
