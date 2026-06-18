<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import { trackEvent } from '../composables/useAnalytics.js';
import { fetchCheckoutSession } from '../services/campaignApi.js';

const route = useRoute();
const loading = ref(true);
const error = ref('');
const sessionInfo = ref(null);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

onMounted(async () => {
  const sessionId = route.query.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    error.value = 'Missing checkout session. If you completed payment, check your dashboard for credits.';
    loading.value = false;
    return;
  }

  for (let attempt = 0; attempt < 15; attempt += 1) {
    try {
      const data = await fetchCheckoutSession(sessionId);
      if (data.payment_status === 'paid' || data.status === 'complete') {
        sessionInfo.value = data;
        trackEvent('subscription_active', {
          plan: data.plan,
          price_key: data.price_key,
          credits_added: data.credits_added,
        });
        loading.value = false;
        return;
      }
    } catch {
      if (attempt === 14) {
        error.value =
          'We could not confirm your payment yet. Credits may take a minute — check your dashboard.';
      }
    }
    await sleep(2000);
  }
  loading.value = false;
});

const headline = () => {
  if (sessionInfo.value?.plan) return `Welcome to Arcane Forge ${sessionInfo.value.plan.charAt(0).toUpperCase()}${sessionInfo.value.plan.slice(1)}!`;
  if (sessionInfo.value?.credits_added) return 'Credits added!';
  return 'Welcome to Arcane Forge!';
};

const subline = () => {
  if (sessionInfo.value?.credits_added) {
    return `${sessionInfo.value.credits_added} credits were added to your account. Start forging campaigns.`;
  }
  if (sessionInfo.value?.plan) {
    return 'Your subscription is active. Start forging campaigns.';
  }
  return 'Your purchase is being processed.';
};
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader :show-nav="false" />
    <main class="flex-1 flex items-center justify-center px-4 py-20 text-center">
      <div class="max-w-md">
        <div v-if="loading" class="space-y-4">
          <div class="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p class="text-muted">Confirming your payment…</p>
        </div>
        <template v-else-if="error">
          <h1 class="font-display text-2xl text-gold mb-4">Almost there</h1>
          <p class="text-muted mb-8">{{ error }}</p>
          <RouterLink to="/dashboard"><UiButton variant="primary" size="lg">Open dashboard</UiButton></RouterLink>
        </template>
        <template v-else>
          <h1 class="font-display text-3xl text-gold mb-4">{{ headline() }}</h1>
          <p class="text-muted mb-8">{{ subline() }}</p>
          <RouterLink to="/app"><UiButton variant="primary" size="lg">Open the Forge</UiButton></RouterLink>
        </template>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
