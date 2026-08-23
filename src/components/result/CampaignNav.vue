<script setup>
import { ref, watch } from 'vue';
import { sessionTitle } from '../../utils/campaignParser.js';

const props = defineProps({
  groups: { type: Array, default: () => [] },
  sections: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
});

const emit = defineEmits(['navigate']);

const activeGroup = ref(props.groups[0]?.id || 'overview');

watch(
  () => props.groups,
  (g) => {
    if (g.length && !g.find((x) => x.id === activeGroup.value)) {
      activeGroup.value = g[0].id;
    }
  },
  { immediate: true },
);

function scrollTo(id) {
  emit('navigate', id);
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function visibleSections(groupId) {
  const group = props.groups.find((g) => g.id === groupId);
  if (!group) return [];
  return props.sections.filter((s) => group.sectionIds.includes(s.id));
}

function linkLabel(section) {
  if (section.type === 'session') {
    const name = sessionTitle(section.heading);
    return name ? `${section.number}. ${name}` : `Session ${section.number}`;
  }
  return section.heading;
}
</script>

<template>
  <nav class="campaign-nav lg:sticky lg:top-24" aria-label="Campaign sections">
    <div class="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      <button
        v-for="group in groups"
        :key="group.id"
        type="button"
        class="nav-tab shrink-0 lg:w-full"
        :class="{ 'nav-tab--active': activeGroup === group.id }"
        @click="activeGroup = group.id"
      >
        {{ group.label }}
      </button>
    </div>

    <ul class="hidden lg:block mt-4 space-y-0.5 text-sm">
      <li v-for="section in visibleSections(activeGroup)" :key="section.id">
        <button
          type="button"
          class="nav-link w-full text-left"
          :class="{ 'nav-link--active': activeId === section.id }"
          @click="scrollTo(section.id)"
        >
          {{ linkLabel(section) }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.campaign-nav {
  padding: 0.75rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-gold) 14%, transparent);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  backdrop-filter: blur(8px);
}
.nav-tab {
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  color: var(--color-muted);
  border: 1px solid transparent;
  transition: all 0.2s;
}
.nav-tab:hover {
  color: var(--color-gold);
}
.nav-tab--active {
  color: var(--color-gold);
  border-color: color-mix(in srgb, var(--color-gold) 35%, transparent);
  background: color-mix(in srgb, var(--color-gold) 8%, transparent);
}
.nav-link {
  padding: 0.4rem 0.55rem;
  border-radius: 0.4rem;
  color: var(--color-muted);
  transition: color 0.2s, background 0.2s;
  line-height: 1.35;
}
.nav-link:hover,
.nav-link--active {
  color: var(--color-gold);
  background: color-mix(in srgb, var(--color-gold) 7%, transparent);
}
</style>
