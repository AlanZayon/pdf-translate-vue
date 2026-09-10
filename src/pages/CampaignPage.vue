<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { isDevAuth } from '../composables/useAuth.js';
import { fetchCampaign, createGameSession } from '../services/campaignApi.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const campaign = ref(null);
const starting = ref(false);
const startError = ref('');
const devSeat = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('devAuthToken') || 'dev-token'
    : 'dev-token',
);

const campaignId = computed(() => route.params.campaignId);
const characters = computed(() => campaign.value?.characters || []);
const blueprint = computed(() => campaign.value?.blueprint || {});
const activeSession = computed(() => campaign.value?.active_session || null);

function switchDevSeat(token) {
  if (!isDevAuth) return;
  localStorage.setItem('devAuthToken', token);
  window.location.reload();
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    campaign.value = await fetchCampaign(campaignId.value);
  } catch {
    error.value =
      isDevAuth && devSeat.value === 'player-2'
        ? 'Campaign not found for this seat. Switch to Host seat — this campaign belongs to the host.'
        : 'Campaign not found or unavailable.';
  } finally {
    loading.value = false;
  }
}

async function startLobby() {
  starting.value = true;
  startError.value = '';
  try {
    const session = await createGameSession(campaignId.value);
    router.push(`/sessions/${session.id}`);
  } catch (e) {
    startError.value =
      e.response?.data?.message || e.response?.data?.error || 'Could not create GameSession.';
  } finally {
    starting.value = false;
  }
}

function returnToLobby() {
  if (activeSession.value?.id) {
    router.push(`/sessions/${activeSession.value.id}`);
  }
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-3xl">
      <p v-if="loading" class="text-muted text-center">Loading campaign...</p>
      <div v-else-if="error" class="max-w-md mx-auto text-center space-y-4">
        <p class="text-danger">{{ error }}</p>
        <UiCard v-if="isDevAuth" class="border border-gold/30 text-left" padding="p-4">
          <p class="text-sm text-gold mb-2">Homolog seat (current: {{ devSeat === 'player-2' ? 'Guest' : 'Host' }})</p>
          <div class="flex flex-wrap gap-2">
            <UiButton size="sm" :variant="devSeat === 'dev-token' ? 'primary' : 'ghost'" @click="switchDevSeat('dev-token')">
              Host seat
            </UiButton>
            <UiButton size="sm" :variant="devSeat === 'player-2' ? 'primary' : 'ghost'" @click="switchDevSeat('player-2')">
              Guest seat
            </UiButton>
          </div>
        </UiCard>
      </div>
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

        <p v-if="startError" class="text-danger text-sm mb-4">{{ startError }}</p>

        <div v-if="activeSession" class="mb-4 rounded-lg border border-gold/30 bg-surface/40 px-4 py-3">
          <p class="text-sm text-text">
            Live GameSession:
            <span class="text-gold font-mono">{{ activeSession.status }}</span>
            · invite
            <code class="font-mono tracking-widest text-gold">{{ activeSession.invite_code }}</code>
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UiButton v-if="activeSession" variant="primary" @click="returnToLobby">
            Return to lobby
          </UiButton>
          <UiButton v-else variant="primary" :disabled="starting" @click="startLobby">
            {{ starting ? 'Opening lobby…' : 'Start GameSession' }}
          </UiButton>
          <UiButton variant="ghost" @click="router.push('/join')">Join with invite</UiButton>
          <UiButton variant="ghost" @click="router.push(`/app/result/${campaign.job_id}`)">
            Back to manuscript
          </UiButton>
          <UiButton variant="ghost" @click="router.push('/dashboard')">Dashboard</UiButton>
        </div>
      </template>
    </main>

    <AppFooter />
  </div>
</template>
