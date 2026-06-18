<script setup>
import { RouterView } from 'vue-router';
import CookieBanner from './components/shared/CookieBanner.vue';
import { authConfigError } from './composables/useAuth.js';
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
