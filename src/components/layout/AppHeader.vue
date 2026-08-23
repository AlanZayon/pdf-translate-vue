<script setup>
import UiBadge from '../shared/UiBadge.vue';
import ThemeToggle from '../shared/ThemeToggle.vue';

defineProps({
  apiStatus: { type: Object, default: null },
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-void/80 backdrop-blur-lg border-b border-gold/25">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-10 h-10 flex-shrink-0 rounded-lg border border-gold/40 flex items-center justify-center bg-surface"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-gold" fill="currentColor">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zm0 7.5L4.5 6.75 12 3.5l7.5 3.25L12 9.5zm0 2.5l8-4v5.5l-8 4-8-4V8l8 4z"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <h1 class="font-display text-xl font-bold text-gold tracking-wide truncate">
            Arcane Forge
          </h1>
          <p class="text-muted text-xs hidden sm:block">RPG Campaign Generator</p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <template v-if="apiStatus">
          <UiBadge :variant="apiStatus.redis_connected ? 'success' : 'muted'" class="hidden sm:inline-flex">
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="apiStatus.redis_connected ? 'bg-success' : 'bg-ember'"
            />
            {{ apiStatus.redis_connected ? 'Queue Online' : 'Degraded' }}
          </UiBadge>
          <UiBadge v-if="apiStatus.llm_configured || apiStatus.gemini_configured" variant="gold" class="hidden md:inline-flex">
            AI Ready
          </UiBadge>
        </template>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
