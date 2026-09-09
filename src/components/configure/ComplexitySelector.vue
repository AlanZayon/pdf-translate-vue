<script setup>
import { Swords, Map, Castle } from '@lucide/vue';

defineProps({
  complexities: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);

const iconMap = { simple: Swords, medium: Map, complex: Castle };
const etaMap = { simple: '~3 min', medium: '~5 min', complex: '~10 min' };

function getIcon(id) {
  return iconMap[id] || Map;
}

function onSelect(c) {
  emit('update:modelValue', c.id);
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-muted mb-3 uppercase tracking-wider">
      Campaign Complexity
    </label>
    <div role="radiogroup" aria-label="Select campaign complexity" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        v-for="c in complexities"
        :key="c.id"
        type="button"
        role="radio"
        :aria-checked="modelValue === c.id"
        :class="[
          'text-left p-5 rounded-2xl border-2 transition-all duration-200 relative bg-surface-alt',
          modelValue === c.id
            ? 'border-gold bg-gold/10 shadow-gold ring-2 ring-gold/30'
            : 'border-muted/20 hover:border-gold/40 hover:shadow-gold',
        ]"
        @click="onSelect(c)"
      >
        <component
          :is="getIcon(c.id)"
          class="w-8 h-8 mb-3"
          :class="modelValue === c.id ? 'text-gold' : 'text-muted'"
          aria-hidden="true"
        />
        <h3 class="font-display font-semibold text-base mb-1" :class="modelValue === c.id ? 'text-gold' : 'text-text'">
          {{ c.name }}
        </h3>
        <p class="text-gold/80 text-xs font-semibold mb-1">
          {{ etaMap[c.id] || '~5 min' }}
        </p>
        <p class="text-gold/70 text-xs font-medium mb-2">{{ c.sessions }}</p>
        <p class="text-muted text-sm leading-snug">{{ c.description }}</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.shadow-gold {
  box-shadow: var(--shadow-gold);
}
</style>
