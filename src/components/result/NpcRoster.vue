<script setup>
import { ref } from 'vue';

const props = defineProps({
  section: { type: Object, required: true },
});

const open = ref((props.section.npcs || []).map((npc, i) => Boolean(npc.html) && i < 1));

function toggle(index) {
  const next = [...open.value];
  next[index] = !next[index];
  open.value = next;
}
</script>

<template>
  <section :id="section.id" class="npc-roster">
    <header class="section-ornament mb-5">
      <h3 class="font-display text-xl text-gold">{{ section.heading }}</h3>
    </header>

    <div v-if="section.npcs?.length" class="grid sm:grid-cols-2 gap-3">
      <article v-for="(npc, index) in section.npcs" :key="npc.name" class="npc-card">
        <button type="button" class="npc-card__top w-full text-left" @click="toggle(index)">
          <div class="npc-avatar" aria-hidden="true">{{ npc.name.charAt(0).toUpperCase() }}</div>
          <div class="min-w-0 flex-1">
            <p class="font-display text-gold leading-snug">{{ npc.name }}</p>
            <p v-if="npc.role" class="npc-role">{{ npc.role }}</p>
            <p v-else-if="npc.description && !npc.html" class="text-muted text-sm mt-1">{{ npc.description }}</p>
          </div>
        </button>
        <p v-if="!open[index] && npc.description && npc.html" class="npc-preview">{{ npc.description }}</p>
        <div v-show="open[index] && npc.html" class="campaign-prose npc-bio" v-html="npc.html" />
        <p v-show="open[index] && !npc.html && npc.description" class="text-muted text-sm px-4 pb-4">
          {{ npc.description }}
        </p>
      </article>
    </div>

    <div v-else class="campaign-prose" v-html="section.html" />
  </section>
</template>

<style scoped>
.npc-roster {
  margin: 2rem 0 1.5rem;
}
.npc-card {
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 18%, transparent);
  background:
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--color-gold) 8%, transparent),
      color-mix(in srgb, var(--color-surface) 80%, transparent)
    );
  overflow: hidden;
}
.npc-card__top {
  display: flex;
  gap: 0.85rem;
  padding: 1rem 1rem 0.75rem;
}
.npc-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 30% 30%,
    color-mix(in srgb, var(--color-gold) 40%, transparent),
    color-mix(in srgb, var(--color-gold) 12%, transparent)
  );
  color: var(--color-gold);
  font-family: var(--font-display);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--color-gold) 35%, transparent);
}
.npc-role {
  color: var(--color-mist);
  font-size: 0.75rem;
  margin-top: 0.2rem;
  line-height: 1.4;
}
.npc-preview {
  color: var(--color-muted);
  font-size: 0.85rem;
  padding: 0 1rem 1rem 4.6rem;
  line-height: 1.5;
}
.npc-bio {
  padding: 0 1rem 1rem;
  border-top: 1px solid color-mix(in srgb, var(--color-gold) 10%, transparent);
}
</style>
