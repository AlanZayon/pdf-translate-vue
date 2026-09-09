<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { joinGameSession } from '../services/campaignApi.js';

const route = useRoute();
const router = useRouter();

const inviteCode = ref('');
const error = ref('');
const busy = ref(false);

onMounted(() => {
  const q = route.query.code || route.params.code;
  if (q) inviteCode.value = String(q).toUpperCase();
});

async function join() {
  const code = inviteCode.value.trim().toUpperCase();
  if (!code) {
    error.value = 'Enter an invite code.';
    return;
  }
  busy.value = true;
  error.value = '';
  try {
    const session = await joinGameSession(code);
    router.push(`/sessions/${session.id}`);
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data?.error || 'Could not join.';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-md">
      <p class="text-sm text-muted mb-2 uppercase tracking-wider">Join GameSession</p>
      <h1 class="font-display text-3xl text-gold mb-6">Enter invite code</h1>

      <UiCard padding="p-6">
        <label class="block text-sm text-muted mb-2" for="invite">Invite code</label>
        <input
          id="invite"
          v-model="inviteCode"
          class="w-full bg-void border border-muted/30 rounded px-3 py-2 text-text tracking-widest uppercase mb-4"
          maxlength="12"
          autocomplete="off"
          @keyup.enter="join"
        />
        <p v-if="error" class="text-danger text-sm mb-4">{{ error }}</p>
        <UiButton variant="primary" :disabled="busy" @click="join">
          {{ busy ? 'Joining…' : 'Join lobby' }}
        </UiButton>
      </UiCard>
    </main>

    <AppFooter />
  </div>
</template>
