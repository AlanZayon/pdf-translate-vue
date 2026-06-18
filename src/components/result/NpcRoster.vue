<script setup>
defineProps({
  section: { type: Object, required: true },
});
</script>

<template>
  <section :id="section.id" class="npc-roster">
    <h3 class="font-display text-lg text-gold mb-4">{{ section.heading }}</h3>
    <div v-if="section.npcs?.length" class="grid sm:grid-cols-2 gap-3">
      <div v-for="npc in section.npcs" :key="npc.name" class="npc-card">
        <div class="npc-avatar" aria-hidden="true">{{ npc.name.charAt(0).toUpperCase() }}</div>
        <div>
          <p class="font-display text-gold text-sm">{{ npc.name }}</p>
          <p class="text-muted text-sm mt-1">{{ npc.description }}</p>
        </div>
      </div>
    </div>
    <div v-else class="manuscript-prose text-sm" v-html="section.html" />
  </section>
</template>

<style scoped>
.npc-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 15%, transparent);
  background: color-mix(in srgb, var(--color-gold) 4%, transparent);
}
.npc-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-gold) 20%, transparent);
  color: var(--color-gold);
  font-family: var(--font-display);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
