<script setup>
import { Swords, Map, Castle, Lock } from '@lucide/vue';

const props = defineProps({
  complexities: { type: Array, required: true },
  modelValue: { type: String, required: true },
  userPlan: { type: String, default: 'free' },
  creditCosts: { type: Object, default: () => ({ simple: 1, medium: 2, complex: 4 }) },
});

const emit = defineEmits(['update:modelValue', 'locked-click']);

const iconMap = { simple: Swords, medium: Map, complex: Castle };
const creditMap = { simple: 1, medium: 2, complex: 4 };
const etaMap = { simple: '~3 min', medium: '~5 min', complex: '~10 min' };

function getIcon(id) {
  return iconMap[id] || Map;
}

function isLocked(c) {
  return props.userPlan === 'free' && c.id !== 'simple';
}

function onSelect(c) {
  if (isLocked(c)) {
    emit('locked-click', c);
    return;
  }
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
        :disabled="isLocked(c)"
        :class="[
          'text-left p-5 rounded-2xl border-2 transition-all duration-200 relative',
          isLocked(c) ? 'opacity-55 cursor-not-allowed border-muted/15' : '',
          modelValue === c.id && !isLocked(c)
            ? 'border-gold bg-gold/10 shadow-gold ring-2 ring-gold/30'
            : !isLocked(c)
              ? 'border-muted/20 bg-surface-alt hover:border-gold/40 hover:shadow-gold'
              : 'bg-surface-alt',
        ]"
        @click="onSelect(c)"
      >
        <span
          v-if="isLocked(c)"
          class="absolute top-3 right-3 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full flex items-center gap-1"
        >
          <Lock class="w-3 h-3" /> Pro
        </span>
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
          {{ creditMap[c.id] || 2 }} credit{{ (creditMap[c.id] || 2) > 1 ? 's' : '' }} · {{ etaMap[c.id] || '~5 min' }}
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
