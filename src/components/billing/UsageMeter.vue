<script setup>
import { computed } from 'vue';

const props = defineProps({
  used: { type: Number, default: 0 },
  total: { type: Number, default: 1 },
  plan: { type: String, default: 'free' },
  remaining: { type: Number, default: null },
});

const emit = defineEmits(['upgrade']);

const percentage = computed(() => {
  if (!props.total) return 0;
  return Math.min(100, Math.round((props.used / props.total) * 100));
});

const creditsLeft = computed(() =>
  props.remaining !== null ? props.remaining : Math.max(0, props.total - props.used),
);

const lowCredits = computed(() => creditsLeft.value <= 1);
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-4 cursor-pointer transition',
      lowCredits ? 'border-ember/50 bg-ember/5' : 'border-gold/25 bg-surface-alt/50',
    ]"
    @click="lowCredits && emit('upgrade')"
  >
    <div class="flex items-center justify-between text-sm mb-2">
      <span class="text-muted capitalize">{{ plan }} plan</span>
      <span :class="lowCredits ? 'text-ember font-medium' : 'text-gold font-medium'">
        {{ creditsLeft }} credits left
      </span>
    </div>
    <div class="h-2 bg-surface rounded-full overflow-hidden">
      <div class="h-full bg-gold transition-all duration-500" :style="{ width: `${100 - percentage}%` }" />
    </div>
    <p v-if="lowCredits" class="text-xs text-ember mt-2">Running low — tap to upgrade</p>
    <p v-else class="text-xs text-muted mt-2">{{ used }} of {{ total }} monthly credits used</p>
  </div>
</template>
