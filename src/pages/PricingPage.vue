<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { startCheckout } from '../services/campaignApi.js';
import { trackEvent } from '../composables/useAnalytics.js';
import { useToast } from '../composables/useToast.js';

const router = useRouter();
const loading = ref(null);
const { toastMessage, toastVisible, showToast } = useToast();

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: '1 credit / month',
    features: ['Simple campaigns only', '7-day retention', 'Watermark on preview'],
    priceKey: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/ month',
    credits: '10 credits / month',
    features: ['Medium & Complex campaigns', 'Priority queue', '90-day history', 'PDF export & share links'],
    priceKey: 'pro_monthly',
    highlighted: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$29',
    period: '/ month',
    credits: '40 credits / month',
    features: ['Everything in Pro', '3 seats', 'API access', 'Commercial content license'],
    priceKey: 'studio_monthly',
  },
];

const packs = [
  { credits: 5, price: '$7', priceKey: 'credits_5' },
  { credits: 20, price: '$24', priceKey: 'credits_20' },
];

async function checkout(priceKey) {
  if (!priceKey) {
    router.push('/app');
    return;
  }
  loading.value = priceKey;
  trackEvent('checkout_start', { price_key: priceKey });
  try {
    const url = await startCheckout(priceKey);
    if (url) window.location.href = url;
  } catch {
    showToast('Checkout unavailable. Sign in and ensure billing is configured.');
  } finally {
    loading.value = null;
  }
}

const faqs = [
  { q: 'What counts as a credit?', a: 'Simple = 1, Medium = 2, Complex = 4 credits per campaign.' },
  { q: 'Can I upload any PDF?', a: 'You must confirm you have rights to use the PDF. See Upload Consent.' },
  { q: 'Refund policy?', a: 'Credits are refunded automatically if generation fails due to a system error.' },
  { q: 'Which languages?', a: 'English, Portuguese, Spanish, French, German, Italian, Japanese, Korean, Chinese, Russian.' },
];
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-16 flex-1">
      <div class="text-center mb-14">
        <h1 class="font-display text-4xl text-gold mb-4">Pricing</h1>
        <p class="text-muted max-w-xl mx-auto">
          Start free. Upgrade when you need more campaigns, complexity, or team features.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        <UiCard
          v-for="plan in plans"
          :key="plan.id"
          :class="plan.highlighted ? 'border-gold ring-1 ring-gold/30' : ''"
          glow
        >
          <p v-if="plan.highlighted" class="text-xs uppercase tracking-widest text-gold mb-2">Most popular</p>
          <h2 class="font-display text-2xl text-gold">{{ plan.name }}</h2>
          <p class="text-3xl font-bold mt-2">
            {{ plan.price }}<span class="text-base font-normal text-muted">{{ plan.period }}</span>
          </p>
          <p class="text-sm text-muted mt-1 mb-6">{{ plan.credits }}</p>
          <ul class="space-y-2 text-sm text-muted mb-8">
            <li v-for="f in plan.features" :key="f">✦ {{ f }}</li>
          </ul>
          <UiButton
            :variant="plan.highlighted ? 'primary' : 'ghost'"
            block
            :loading="loading === plan.priceKey"
            @click="checkout(plan.priceKey)"
          >
            {{ plan.priceKey ? 'Subscribe' : 'Get started' }}
          </UiButton>
        </UiCard>
      </div>

      <section class="max-w-3xl mx-auto mb-16">
        <h2 class="font-display text-xl text-gold mb-6 text-center">Credit packs</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UiCard v-for="pack in packs" :key="pack.priceKey" padding="p-6">
            <p class="font-display text-lg text-gold">{{ pack.credits }} credits</p>
            <p class="text-2xl font-bold my-2">{{ pack.price }}</p>
            <UiButton
              variant="ghost"
              block
              :loading="loading === pack.priceKey"
              @click="checkout(pack.priceKey)"
            >
              Buy pack
            </UiButton>
          </UiCard>
        </div>
      </section>

      <section class="max-w-2xl mx-auto">
        <h2 class="font-display text-xl text-gold mb-6 text-center">FAQ</h2>
        <div class="space-y-4">
          <details v-for="item in faqs" :key="item.q" class="border border-gold/20 rounded-xl p-4 bg-surface">
            <summary class="font-medium cursor-pointer text-text">{{ item.q }}</summary>
            <p class="text-muted text-sm mt-3">{{ item.a }}</p>
          </details>
        </div>
      </section>
    </main>

    <AppFooter />

    <div
      v-if="toastVisible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2 rounded-lg bg-surface border border-gold/30 text-sm shadow-lg"
      role="status"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>
