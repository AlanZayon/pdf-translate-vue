<script setup>
import { computed } from 'vue';
import { Moon, Sun } from '@lucide/vue';
import { useTheme } from '../../composables/useTheme.js';

const { theme, toggleTheme } = useTheme();

const isDark = computed(() => theme.value === 'dark' || (theme.value === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

const label = computed(() => (isDark.value ? 'Switch to light mode' : 'Switch to dark mode'));
</script>

<template>
  <button
    type="button"
    class="p-2 rounded-lg border border-gold/30 bg-surface-alt text-gold hover:bg-gold/10 hover:border-gold/50 transition-all"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <Moon v-if="isDark" class="w-5 h-5" aria-hidden="true" />
    <Sun v-else class="w-5 h-5" aria-hidden="true" />
  </button>
</template>
