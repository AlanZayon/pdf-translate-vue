<script setup>
import { RouterView } from 'vue-router';
import { useAuth, useClerk } from '@clerk/vue';
import CookieBanner from './components/shared/CookieBanner.vue';
import { authConfigError, bindClerkAuth, showAuthUI } from './composables/useAuth.js';

if (showAuthUI.value) {
  bindClerkAuth(useAuth(), useClerk());
}
</script>

<template>
  <div
    v-if="authConfigError"
    class="bg-danger/20 border-b border-danger/40 text-danger text-center text-sm px-4 py-3"
    role="alert"
  >
    {{ authConfigError }}
  </div>
  <RouterView />
  <CookieBanner />
</template>
