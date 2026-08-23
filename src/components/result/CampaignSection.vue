<script setup>
defineProps({
  section: { type: Object, required: true },
  variant: { type: String, default: 'default' },
});

const cardTypes = ['endings', 'maps', 'puzzles'];
</script>

<template>
  <section :id="section.id" class="campaign-section" :class="`campaign-section--${variant}`">
    <header class="section-ornament mb-4">
      <h3 class="font-display text-xl text-gold">{{ section.heading }}</h3>
    </header>

    <div v-if="cardTypes.includes(section.type) && section.blocks?.length" class="block-grid">
      <article v-for="(block, idx) in section.blocks" :key="idx" class="block-card" :data-kind="block.kind">
        <p v-if="section.type === 'endings'" class="block-index">{{ String(idx + 1).padStart(2, '0') }}</p>
        <h4 class="block-card__title">{{ block.heading }}</h4>
        <div class="campaign-prose" v-html="block.html" />
      </article>
    </div>

    <div v-else class="campaign-prose" v-html="section.html" />
  </section>
</template>

<style scoped>
.campaign-section {
  margin-bottom: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-gold) 10%, transparent);
}
.campaign-section--overview {
  padding: 1.5rem 1.4rem 1.15rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 22%, transparent);
  background:
    radial-gradient(ellipse at top, color-mix(in srgb, var(--color-gold) 10%, transparent), transparent 55%),
    color-mix(in srgb, var(--color-parchment-dark) 70%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--color-gold) 22%, transparent);
}
.campaign-section--hook {
  padding: 0.25rem 0 1.5rem;
}
.block-grid {
  display: grid;
  gap: 0.85rem;
}
@media (min-width: 640px) {
  .campaign-section--endings .block-grid,
  .campaign-section--maps .block-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.block-card {
  padding: 1rem 1.05rem 0.5rem;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 16%, transparent);
  background: color-mix(in srgb, var(--color-gold) 4%, transparent);
}
.block-card[data-kind='ending'] {
  border-left: 3px solid var(--color-mist);
}
.block-card[data-kind='map'] {
  border-left: 3px solid var(--color-gold);
}
.block-index {
  font-family: var(--font-display);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: var(--color-gold);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}
.block-card__title {
  font-family: var(--font-display);
  color: var(--color-gold);
  font-size: 1rem;
  margin-bottom: 0.45rem;
  line-height: 1.35;
}
</style>
