<script setup>
import { RouterLink } from 'vue-router';
import ThemeToggle from '../shared/ThemeToggle.vue';
import { UserButton, SignInButton } from '@clerk/vue';
import { isDevAuth } from '../../composables/useAuth.js';

defineProps({
  showNav: { type: Boolean, default: true },
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-void/80 backdrop-blur-lg border-b border-gold/25">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-3 min-w-0 group">
        <div
          class="w-10 h-10 flex-shrink-0 rounded-lg border border-gold/40 flex items-center justify-center bg-surface group-hover:border-gold transition"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-gold" fill="currentColor">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zm0 7.5L4.5 6.75 12 3.5l7.5 3.25L12 9.5zm0 2.5l8-4v5.5l-8 4-8-4V8l8 4z"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span class="font-display text-xl font-bold text-gold tracking-wide">Arcane Forge</span>
          <p class="text-muted text-xs hidden sm:block">RPG Campaign Generator</p>
        </div>
      </RouterLink>

      <nav v-if="showNav" class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <RouterLink to="/dashboard" class="text-sm text-muted hover:text-gold transition hidden md:inline">Dashboard</RouterLink>
        <RouterLink
          to="/app"
          class="text-sm font-medium text-gold border border-gold/40 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition"
        >
          Open App
        </RouterLink>
        <template v-if="!isDevAuth">
          <SignInButton mode="modal">
            <button type="button" class="text-sm text-muted hover:text-gold hidden sm:inline">Sign in</button>
          </SignInButton>
          <UserButton />
        </template>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>
