<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { fetchCampaign } from '../services/campaignApi.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const campaign = ref(null);

const campaignId = computed(() => route.params.campaignId);
const characters = computed(() => campaign.value?.characters || []);
const blueprint = computed(() => campaign.value?.blueprint || {});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    campaign.value = await fetchCampaign(campaignId.value);
  } catch {
    error.value = 'Campaign not found or unavailable.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-3xl">
      <p v-if="loading" class="text-muted text-center">Loading campaign...</p>
      <p v-else-if="error" class="text-danger text-center">{{ error }}</p>
      <template v-else-if="campaign">
        <p class="text-sm text-muted mb-2 uppercase tracking-wider">Playable Campaign</p>
        <h1 class="font-display text-3xl text-gold mb-4">{{ campaign.title }}</h1>
        <p class="text-muted text-sm mb-8">
          Status: {{ campaign.status }}
          <span v-if="campaign.book_id"> · Book {{ campaign.book_id }}</span>
        </p>

        <UiCard class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Character roster</h2>
          <p v-if="!characters.length" class="text-muted text-sm">
            No character sheets were attached at generation. You can still create a GameSession later.
          </p>
          <ul v-else class="space-y-2">
            <li
              v-for="c in characters"
              :key="c.id"
              class="flex items-center justify-between border-b border-muted/15 py-2 last:border-0"
            >
              <span class="text-text">{{ c.display_name }}</span>
              <span class="text-xs text-muted">{{ c.sheet?.class || 'PC' }} · claimable</span>
            </li>
          </ul>
        </UiCard>

        <UiCard class="mb-8" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Blueprint summary</h2>
          <p class="text-sm text-muted mb-2">
            {{ (blueprint.sessions || []).length }} manuscript session(s)
            · {{ (blueprint.npcs || []).length }} NPC(s)
            · {{ (blueprint.locations || []).length }} location(s)
          </p>
          <p v-if="blueprint.premise" class="text-sm text-text leading-relaxed">{{ blueprint.premise }}</p>
        </UiCard>

        <p class="text-sm text-muted mb-6">
          Lobby / GameSession comes next — this page only confirms the Campaign was created from your Job.
        </p>

        <div class="flex flex-wrap gap-3">
          <UiButton variant="ghost" @click="router.push(`/app/result/${campaign.job_id}`)">
            Back to manuscript
          </UiButton>
          <UiButton variant="primary" @click="router.push('/dashboard')">Dashboard</UiButton>
        </div>
      </template>
    </main>

    <AppFooter />
  </div>
</template>
