<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { useGameSessionSocket } from '../composables/useGameSessionSocket.js';
import { isDevAuth } from '../composables/useAuth.js';
import {
  fetchMe,
  fetchGameSession,
  claimSessionCharacter,
  setSessionReady,
  startGameSession,
  endGameSession,
  submitSessionAction,
  submitSessionVoiceAction,
} from '../services/campaignApi.js';

const route = useRoute();
const router = useRouter();

const me = ref(null);
const session = ref(null);
const loading = ref(true);
const error = ref('');
const actionError = ref('');
const busy = ref(false);
const actionText = ref('');
const lastNarration = ref('');
const campaignState = ref(null);
const liveEvents = ref([]);
const presence = ref([]);
const recording = ref(false);
const voiceHint = ref('');
const browserTtsEnabled = ref(true);
const lastSpokenText = ref('');
const devSeat = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('devAuthToken') || 'dev-token'
    : 'dev-token',
);

let mediaRecorder = null;
let mediaChunks = [];
let mediaStream = null;
let currentAudio = null;
let spokeFromSnapshot = false;

function switchDevSeat(token) {
  if (!isDevAuth) return;
  localStorage.setItem('devAuthToken', token);
  // Full reload so HTTP + WebSocket pick up the other user identity.
  window.location.reload();
}

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

function presenceLabel(userId) {
  const row = presence.value.find((p) => p.user_id === userId);
  if (!row) return '';
  return row.connected ? 'online' : 'offline';
}

async function refresh() {
  session.value = await fetchGameSession(sessionId.value);
}

function applySnapshot(snap) {
  if (snap.session) session.value = snap.session;
  if (snap.state) campaignState.value = snap.state;
  if (snap.presence) presence.value = snap.presence;
  let latestNarration = '';
  for (const ev of snap.events || []) {
    if (ev.type === 'gm_narration' && ev.payload?.text) {
      lastNarration.value = ev.payload.text;
      latestNarration = ev.payload.text;
    }
    liveEvents.value.push(ev);
  }
  if (liveEvents.value.length > 40) {
    liveEvents.value = liveEvents.value.slice(-40);
  }
  // On reconnect, speak the latest GM line once (opening / last turn).
  if (!spokeFromSnapshot && latestNarration && snap.session?.status === 'ACTIVE') {
    spokeFromSnapshot = true;
    speakNarration(latestNarration);
  }
}

function onLiveEvent(msg) {
  if (msg.type === 'error') {
    actionError.value = msg.payload?.message || msg.payload?.code || 'Live sync error';
    return;
  }
  if (msg.type === 'pong') return;
  liveEvents.value.push(msg);
  if (liveEvents.value.length > 40) {
    liveEvents.value = liveEvents.value.slice(-40);
  }
  if (msg.type === 'gm_narration' && msg.payload?.text) {
    lastNarration.value = msg.payload.text;
    // Server TTS may follow as gm_audio; browser voice covers mock/off TTS.
    speakNarration(msg.payload.text);
  }
  if (msg.type === 'gm_audio' && msg.payload?.data_base64) {
    stopBrowserSpeech();
    playGmAudio(msg.payload);
  }
  if (msg.type === 'dice_result' || msg.type === 'check_result') {
    campaignState.value = {
      ...(campaignState.value || {}),
      last_dice: msg.payload,
    };
  }
  if (msg.type === 'presence_up' || msg.type === 'presence_down') {
    const uid = msg.payload?.user_id;
    if (uid) {
      const idx = presence.value.findIndex((p) => p.user_id === uid);
      const connected = msg.type === 'presence_up';
      if (idx >= 0) presence.value[idx] = { ...presence.value[idx], connected };
      else presence.value.push({ user_id: uid, connected });
    }
  }
  if (
    msg.type === 'character_claimed' ||
    msg.type === 'player_ready' ||
    msg.type === 'session_started' ||
    msg.type === 'session_ended'
  ) {
    refresh().catch(() => {});
  }
}

const { connected: wsConnected, connect: connectWs, disconnect: disconnectWs } = useGameSessionSocket(
  sessionId,
  { onSnapshot: applySnapshot, onEvent: onLiveEvent },
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    me.value = await fetchMe();
    await refresh();
    connectWs();
  } catch {
    error.value =
      isDevAuth && devSeat.value === 'player-2'
        ? 'GameSession not found for Guest seat. Switch to Host seat, or join with the invite code.'
        : 'GameSession not found or you are not a member.';
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
  return run(async () => {
    const data = await startGameSession(sessionId.value);
    if (data.opening) {
      lastNarration.value = data.opening;
      speakNarration(data.opening);
    }
    return data.session;
  });
}

async function end() {
  await run(() => endGameSession(sessionId.value));
}

async function sendAction() {
  const text = actionText.value.trim();
  if (!text) return;
  busy.value = true;
  actionError.value = '';
  voiceHint.value = 'GM is resolving your action…';
  try {
    const data = await submitSessionAction(sessionId.value, text);
    lastNarration.value = data.narration || '';
    campaignState.value = data.state || null;
    if (data.audio?.data_base64) playResponseAudioIfNeeded(data.audio);
    else if (data.narration) speakNarration(data.narration);
    actionText.value = '';
    voiceHint.value = '';
    await refresh();
  } catch (e) {
    const status = e.response?.status;
    const msg = e.response?.data?.message || e.response?.data?.error;
    if (e.code === 'ECONNABORTED' || /timeout/i.test(e.message || '')) {
      actionError.value =
        'O GM demorou demais (timeout). Se a narração aparecer em live events, ignore este erro e continue.';
    } else if (status >= 500) {
      actionError.value = msg || 'Erro no servidor ao resolver a ação. Tenta de novo.';
    } else {
      actionError.value = msg || 'Action failed.';
    }
  } finally {
    busy.value = false;
  }
}

function playGmAudio(audioPayload) {
  if (!audioPayload?.data_base64) return;
  try {
    stopBrowserSpeech();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    const mime = audioPayload.content_type || 'audio/mpeg';
    const src = `data:${mime};base64,${audioPayload.data_base64}`;
    currentAudio = new Audio(src);
    currentAudio.play().catch(() => {});
  } catch {
    /* ignore decode/play failures — text narration remains */
  }
}

function stripForSpeech(text) {
  return String(text || '')
    .replace(/[#>*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function stopBrowserSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Homolog / fallback TTS — browser Speech Synthesis (no OpenAI key needed). */
function speakNarration(text, { force = false } = {}) {
  if (!browserTtsEnabled.value && !force) return;
  const clean = stripForSpeech(text);
  if (!clean || typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!force && clean === lastSpokenText.value) return;
  stopBrowserSpeech();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  const utter = new SpeechSynthesisUtterance(clean.slice(0, 1200));
  utter.rate = 1;
  utter.pitch = 1;
  const voices = window.speechSynthesis.getVoices?.() || [];
  const preferred =
    voices.find((v) => /en(-|_)US/i.test(v.lang) && /female|aria|jenny|sara/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
  if (preferred) utter.voice = preferred;
  lastSpokenText.value = clean;
  window.speechSynthesis.speak(utter);
}

/** Prefer live gm_audio; only play HTTP audio when the socket is down. */
function playResponseAudioIfNeeded(audio) {
  if (!audio?.data_base64) return;
  if (wsConnected.value) return;
  playGmAudio(audio);
}

async function startHoldToSpeak() {
  if (busy.value || recording.value || session.value?.status !== 'ACTIVE') return;
  actionError.value = '';
  voiceHint.value = '';
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaChunks = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    mediaRecorder = mime ? new MediaRecorder(mediaStream, { mimeType: mime }) : new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data?.size) mediaChunks.push(ev.data);
    };
    mediaRecorder.onstop = async () => {
      const type = mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(mediaChunks, { type });
      stopMicTracks();
      mediaRecorder = null;
      if (!blob.size) {
        voiceHint.value = 'No audio captured.';
        return;
      }
      busy.value = true;
      try {
        const data = await submitSessionVoiceAction(sessionId.value, blob, type);
        lastNarration.value = data.narration || '';
        campaignState.value = data.state || null;
        if (data.transcript) voiceHint.value = `Heard: ${data.transcript}`;
        if (data.audio?.data_base64) playResponseAudioIfNeeded(data.audio);
        else if (data.narration) speakNarration(data.narration);
        await refresh();
      } catch (e) {
        actionError.value =
          e.response?.data?.message || e.response?.data?.error || 'Voice action failed.';
      } finally {
        busy.value = false;
      }
    };
    mediaRecorder.start();
    recording.value = true;
    voiceHint.value = 'Listening… release to send';
  } catch {
    actionError.value = 'Microphone permission denied or unavailable.';
    stopMicTracks();
  }
}

function stopHoldToSpeak() {
  if (!recording.value || !mediaRecorder) return;
  recording.value = false;
  voiceHint.value = 'Transcribing…';
  try {
    mediaRecorder.stop();
  } catch {
    stopMicTracks();
    busy.value = false;
  }
}

function stopMicTracks() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
}

function copyInvite() {
  const code = session.value?.invite_code;
  if (!code) return;
  navigator.clipboard.writeText(code).catch(() => {});
}

onMounted(load);
onUnmounted(() => {
  disconnectWs();
  stopMicTracks();
  stopBrowserSpeech();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
});

</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-3xl">
      <p v-if="loading" class="text-muted text-center">Loading lobby...</p>
      <div v-else-if="error" class="max-w-md mx-auto text-center space-y-4">
        <p class="text-danger">{{ error }}</p>
        <UiCard v-if="isDevAuth" class="border border-gold/30 text-left" padding="p-4">
          <p class="text-sm text-gold mb-2">Homolog seat (current: {{ devSeat === 'player-2' ? 'Guest' : 'Host' }})</p>
          <div class="flex flex-wrap gap-2">
            <UiButton
              size="sm"
              :variant="devSeat === 'dev-token' ? 'primary' : 'ghost'"
              @click="switchDevSeat('dev-token')"
            >
              Host seat
            </UiButton>
            <UiButton
              size="sm"
              :variant="devSeat === 'player-2' ? 'primary' : 'ghost'"
              @click="switchDevSeat('player-2')"
            >
              Guest seat
            </UiButton>
          </div>
        </UiCard>
      </div>
      <template v-else-if="session">
        <p class="text-sm text-muted mb-2 uppercase tracking-wider">GameSession lobby</p>
        <h1 class="font-display text-3xl text-gold mb-2">{{ session.campaign_title }}</h1>
        <p class="text-muted text-sm mb-2">
          Status: {{ session.status }}
          · {{ session.players.length }} / 4 players
          · live {{ wsConnected ? 'connected' : 'reconnecting…' }}
        </p>
        <p v-if="me" class="text-xs text-muted mb-4">
          Signed in as {{ me.email || me.id }}
          <span v-if="isHost"> · host</span>
        </p>
        <UiCard v-if="isDevAuth" class="mb-6 border border-gold/30" padding="p-4">
          <p class="text-sm text-gold mb-2">Homolog — two seats need two identities</p>
          <p class="text-xs text-muted mb-3">
            Use Host in one browser and Guest in another (or a private window). Same seat =
            same player, so claim/ready will fight each other.
          </p>
          <div class="flex flex-wrap gap-2">
            <UiButton
              size="sm"
              :variant="devSeat === 'dev-token' ? 'primary' : 'ghost'"
              @click="switchDevSeat('dev-token')"
            >
              Host seat
            </UiButton>
            <UiButton
              size="sm"
              :variant="devSeat === 'player-2' ? 'primary' : 'ghost'"
              @click="switchDevSeat('player-2')"
            >
              Guest seat
            </UiButton>
          </div>
        </UiCard>

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
                <span v-if="presenceLabel(p.user_id)"> · {{ presenceLabel(p.user_id) }}</span>
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

        <p v-if="session.status === 'ACTIVE'" class="text-sm text-gold mb-4">
          Session is active. Text stays primary; hold the mic to speak an action.
        </p>
        <UiCard v-if="session.status === 'ACTIVE'" class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Your action</h2>
          <textarea
            v-model="actionText"
            rows="3"
            class="w-full bg-void border border-muted/30 rounded px-3 py-2 text-text mb-3"
            placeholder="What do you do?"
          />
          <div class="flex flex-wrap gap-3 items-center">
            <UiButton variant="primary" :disabled="busy || !actionText.trim()" @click="sendAction">
              Submit action
            </UiButton>
            <UiButton
              variant="ghost"
              :disabled="busy"
              @pointerdown.prevent="startHoldToSpeak"
              @pointerup.prevent="stopHoldToSpeak"
              @pointerleave.prevent="stopHoldToSpeak"
              @pointercancel.prevent="stopHoldToSpeak"
            >
              {{ recording ? 'Release to send…' : 'Hold to speak' }}
            </UiButton>
          </div>
          <p v-if="voiceHint" class="mt-2 text-sm text-muted">{{ voiceHint }}</p>
          <p v-if="lastNarration" class="mt-4 text-text leading-relaxed">
            <span class="block text-xs uppercase tracking-wider text-gold mb-1">GM</span>
            {{ lastNarration }}
          </p>
          <div v-if="lastNarration" class="mt-3 flex flex-wrap gap-2 items-center">
            <UiButton size="sm" variant="ghost" @click="speakNarration(lastNarration, { force: true })">
              Narrar em voz alta
            </UiButton>
            <UiButton
              size="sm"
              variant="ghost"
              @click="browserTtsEnabled = !browserTtsEnabled; if (!browserTtsEnabled) stopBrowserSpeech()"
            >
              {{ browserTtsEnabled ? 'Voz do browser: on' : 'Voz do browser: off' }}
            </UiButton>
          </div>
          <p v-if="campaignState?.last_dice" class="mt-2 text-sm text-muted">
            Last dice: {{ campaignState.last_dice.total }}
          </p>
        </UiCard>

        <UiCard v-if="liveEvents.length" class="mb-6" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">Live events</h2>
          <ul class="space-y-1 text-sm text-muted max-h-48 overflow-y-auto">
            <li v-for="(ev, i) in liveEvents.slice().reverse()" :key="ev.event_id || i">
              #{{ ev.seq || '—' }} {{ ev.type }}
            </li>
          </ul>
        </UiCard>

        <p v-if="session.status === 'ENDED'" class="text-sm text-muted">
          This GameSession has ended. Create a new one from the Campaign page.
        </p>
        <p v-else-if="isHost && session.status === 'LOBBY' && !canStart" class="text-sm text-muted">
          Start needs 2–4 players, each with a claimed character and ready.
          <span v-if="(session.characters || []).length < (session.players || []).length">
            Not enough claimable characters for every player — refresh the lobby.
          </span>
        </p>
      </template>
    </main>

    <AppFooter />
  </div>
</template>
