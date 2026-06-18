<script setup>
import { ref, watch } from 'vue';

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
</script>

<template>
  <nav class="campaign-nav" aria-label="Campaign sections">
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

    <ul class="hidden lg:block mt-4 space-y-1 text-sm">
      <li v-for="section in visibleSections(activeGroup)" :key="section.id">
        <button
          type="button"
          class="nav-link w-full text-left"
          :class="{ 'nav-link--active': activeId === section.id }"
          @click="scrollTo(section.id)"
        >
          {{ section.heading }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
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
  padding: 0.35rem 0.5rem;
  border-radius: 0.375rem;
  color: var(--color-muted);
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link--active {
  color: var(--color-gold);
}
</style>
