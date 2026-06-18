<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import UiButton from './UiButton.vue';
import { acceptAnalyticsConsent, declineAnalyticsConsent, hasAnalyticsConsent } from '../../composables/useAnalytics.js';

const visible = ref(!hasAnalyticsConsent() && !!import.meta.env.VITE_POSTHOG_KEY);

function accept() {
  acceptAnalyticsConsent();
  visible.value = false;
}

function decline() {
  declineAnalyticsConsent();
  visible.value = false;
}
</script>

<template>
  <Transition name="fade-slide">
    <div
      v-if="visible"
      class="fixed bottom-0 inset-x-0 z-[100] p-4 bg-surface border-t border-gold/25 shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-muted max-w-2xl">
          We use cookies and analytics (PostHog) to improve Arcane Forge.
          See our <RouterLink to="/privacy" class="text-gold underline">Privacy Policy</RouterLink>.
        </p>
        <div class="flex gap-2 flex-shrink-0">
          <UiButton variant="ghost" size="sm" @click="decline">Decline</UiButton>
          <UiButton variant="primary" size="sm" @click="accept">Accept</UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
