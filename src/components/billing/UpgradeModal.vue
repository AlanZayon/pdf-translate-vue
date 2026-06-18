<script setup>
import { computed, ref } from 'vue';
import UiButton from '../shared/UiButton.vue';
import { Sparkles } from '@lucide/vue';
import { startCheckout } from '../../services/campaignApi.js';
import { isInsufficientCredits, resolveUpgradePriceKey } from '../../utils/billingHelpers.js';
import { useToast } from '../../composables/useToast.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  payload: { type: Object, default: null },
});

const emit = defineEmits(['close', 'upgrade']);

const loading = ref(null);
const { showToast } = useToast();

const message = computed(() => {
  if (!props.payload) return 'Upgrade to continue generating campaigns.';
  if (props.payload.error === 'plan_restriction') {
    return props.payload.message || 'Free plan supports Simple campaigns only.';
  }
  if (props.payload.error === 'insufficient_credits') {
    return `You need ${props.payload.credits_required} credits but have ${props.payload.credits_available}.`;
  }
  return props.payload.message || 'Upgrade required.';
});

const showCreditOptions = computed(() => isInsufficientCredits(props.payload));

const primaryLabel = computed(() => {
  if (isInsufficientCredits(props.payload)) return 'Buy 5 credits';
  return 'Upgrade to Pro';
});

async function onCheckout(priceKey) {
  loading.value = priceKey;
  try {
    const url = await startCheckout(priceKey);
    if (url) window.location.href = url;
    else {
      showToast('Checkout unavailable. Try again from the pricing page.');
      emit('upgrade');
    }
  } catch {
    showToast('Checkout failed. Please try again or visit Pricing.');
    emit('upgrade');
  } finally {
    loading.value = null;
  }
}

function onPrimaryCheckout() {
  onCheckout(resolveUpgradePriceKey(props.payload));
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="bg-surface border border-gold/30 rounded-2xl p-8 max-w-md w-full shadow-gold-lg">
        <div class="flex items-center gap-3 mb-4">
          <Sparkles class="w-8 h-8 text-gold" />
          <h2 class="font-display text-xl text-gold">Upgrade Required</h2>
        </div>
        <p class="text-muted mb-6">{{ message }}</p>
        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <UiButton variant="ghost" class="flex-1" @click="emit('close')">Not now</UiButton>
            <UiButton
              variant="primary"
              class="flex-1"
              :loading="loading === resolveUpgradePriceKey(payload)"
              @click="onPrimaryCheckout"
            >
              {{ primaryLabel }}
            </UiButton>
          </div>
          <template v-if="showCreditOptions">
            <UiButton
              variant="ghost"
              block
              :loading="loading === 'credits_20'"
              @click="onCheckout('credits_20')"
            >
              Buy 20 credits
            </UiButton>
            <UiButton variant="ghost" block @click="onCheckout('pro_monthly')">
              Subscribe to Pro
            </UiButton>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.shadow-gold-lg {
  box-shadow: var(--shadow-gold-lg);
}
</style>
