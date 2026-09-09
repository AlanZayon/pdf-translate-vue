<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import {
  fetchMe,
  fetchGameSession,
  claimSessionCharacter,
  setSessionReady,
  startGameSession,
  endGameSession,
} from '../services/campaignApi.js';

const route = useRoute();
const router = useRouter();

const me = ref(null);
const session = ref(null);
const loading = ref(true);
const error = ref('');
const actionError = ref('');
const busy = ref(false);
let pollTimer = null;

const sessionId = computed(() => route.params.sessionId);
const isHost = computed(() => me.value && session.value && me.value.id === session.value.host_user_id);
const myPlayer = computed(() =>
  session.value?.players?.find((p) => p.user_id === me.value?.id) || null,
);
const claimedCount = computed(
  () => session.value?.players?.filter((p) => p.character_id).length || 0,
);
const allReady = computed(() => {
  const players = session.value?.players || [];
  return players.length >= 2 && players.every((p) => p.character_id && p.ready);
});
const canStart = computed(
  () =>
    isHost.value &&
    session.value?.status === 'LOBBY' &&
    claimedCount.value >= 2 &&
    claimedCount.value <= 4 &&
    allReady.value,
);

function characterName(characterId) {
  const c = session.value?.characters?.find((ch) => ch.id === characterId);
  return c?.display_name || '—';
}

async function refresh() {
  session.value = await fetchGameSession(sessionId.value);
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    me.value = await fetchMe();
    await refresh();
  } catch {
    error.value = 'GameSession not found or you are not a member.';
  } finally {
    loading.value = false;
  }
}

async function run(fn) {
  busy.value = true;
  actionError.value = '';
  try {
    session.value = await fn();
  } catch (e) {
    actionError.value = e.response?.data?.message || e.response?.data?.error || 'Action failed.';
  } finally {
    busy.value = false;
  }
}

function claim(characterId) {
  return run(() => claimSessionCharacter(sessionId.value, characterId));
}

function toggleReady() {
  const next = !myPlayer.value?.ready;
  return run(() => setSessionReady(sessionId.value, next));
}

function start() {
  return run(() => startGameSession(sessionId.value));
}

async function end() {
  await run(() => endGameSession(sessionId.value));
}

function copyInvite() {
  const code = session.value?.invite_code;
  if (!code) return;
  navigator.clipboard.writeText(code).catch(() => {});
}

onMounted(async () => {
  await load();
  pollTimer = setInterval(() => {
    if (!error.value) refresh().catch(() => {});
  }, 4000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-3xl">
      <p v-if="loading" class="text-muted text-center">Loading lobby...</p>
      <p v-else-if="error" class="text-danger text-center">{{ error }}</p>
      <template v-else-if="session">
        <p class="text-sm text-muted mb-2 uppercase tracking-wider">GameSession lobby</p>
        <h1 class="font-display text-3xl text-gold mb-2">{{ session.campaign_title }}</h1>
        <p class="text-muted text-sm mb-6">
          Status: {{ session.status }}
          · {{ session.players.length }} / 4 players
        </p>

        <UiCard class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-2">Invite code</h2>
          <div class="flex flex-wrap items-center gap-3">
            <code class="text-2xl tracking-widest text-text font-mono">{{ session.invite_code }}</code>
            <UiButton variant="ghost" size="sm" @click="copyInvite">Copy</UiButton>
          </div>
          <p class="text-sm text-muted mt-3">
            Share this code. Friends join at
            <RouterLink class="text-gold underline" to="/join">/join</RouterLink>.
          </p>
        </UiCard>

        <UiCard class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Roster</h2>
          <ul class="space-y-2">
            <li
              v-for="p in session.players"
              :key="p.id"
              class="flex flex-wrap items-center justify-between gap-2 border-b border-muted/15 py-2 last:border-0"
            >
              <span class="text-text">
                {{ p.user_id === me?.id ? 'You' : p.user_id.slice(0, 12) }}
                <span v-if="p.role === 'host'" class="text-xs text-muted ml-1">(host)</span>
              </span>
              <span class="text-sm text-muted">
                {{ p.character_id ? characterName(p.character_id) : 'no character' }}
                · {{ p.ready ? 'ready' : 'not ready' }}
              </span>
            </li>
          </ul>
        </UiCard>

        <UiCard v-if="session.status === 'LOBBY'" class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Claim a character</h2>
          <ul class="space-y-2">
            <li
              v-for="c in session.characters"
              :key="c.id"
              class="flex items-center justify-between gap-3 border-b border-muted/15 py-2 last:border-0"
            >
              <span class="text-text">{{ c.display_name }}</span>
              <UiButton
                v-if="!c.claimed_by"
                variant="ghost"
                size="sm"
                :disabled="busy"
                @click="claim(c.id)"
              >
                Claim
              </UiButton>
              <span v-else-if="c.claimed_by === me?.id" class="text-xs text-gold">Yours</span>
              <span v-else class="text-xs text-muted">Taken</span>
            </li>
          </ul>
          <p v-if="!session.characters.length" class="text-sm text-muted">
            No claimable characters on this Campaign.
          </p>
        </UiCard>

        <p v-if="actionError" class="text-danger text-sm mb-4">{{ actionError }}</p>

        <div class="flex flex-wrap gap-3 mb-8">
          <UiButton
            v-if="session.status === 'LOBBY' && myPlayer?.character_id"
            variant="ghost"
            :disabled="busy"
            @click="toggleReady"
          >
            {{ myPlayer?.ready ? 'Unready' : 'Ready' }}
          </UiButton>
          <UiButton
            v-if="isHost && session.status === 'LOBBY'"
            variant="primary"
            :disabled="busy || !canStart"
            @click="start"
          >
            Start session
          </UiButton>
          <UiButton
            v-if="isHost && session.status !== 'ENDED'"
            variant="ghost"
            :disabled="busy"
            @click="end"
          >
            End session
          </UiButton>
          <UiButton variant="ghost" @click="router.push(`/campaigns/${session.campaign_id}`)">
            Back to Campaign
          </UiButton>
        </div>

        <p v-if="session.status === 'ACTIVE'" class="text-sm text-gold">
          Session is active. Live AI GM play comes in the next tickets.
        </p>
        <p v-else-if="session.status === 'ENDED'" class="text-sm text-muted">
          This GameSession has ended. Create a new one from the Campaign page.
        </p>
        <p v-else-if="isHost && !canStart" class="text-sm text-muted">
          Start needs 2–4 players, each with a claimed character and ready.
        </p>
      </template>
    </main>

    <AppFooter />
  </div>
</template>
