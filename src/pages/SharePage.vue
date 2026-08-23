<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import CampaignManuscript from '../components/result/CampaignManuscript.vue';
import { fetchSharedCampaign } from '../services/campaignApi.js';
import { useToast } from '../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const content = ref('');
const meta = ref(null);
const { toastMessage, toastVisible, showToast } = useToast();

onMounted(async () => {
  try {
    const data = await fetchSharedCampaign(route.params.slug);
    content.value = data.content;
    meta.value = data;
  } catch {
    error.value = 'This shared campaign is unavailable or has been removed.';
  } finally {
    loading.value = false;
  }
});

function onCopy(message, isError = false) {
  showToast(message, isError ? 4000 : 3000);
}
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-6xl">
      <p v-if="loading" class="text-muted text-center">Loading campaign...</p>
      <p v-else-if="error" class="text-danger text-center">{{ error }}</p>
      <template v-else>
        <p class="text-sm text-muted mb-6 text-center">Shared campaign · read only</p>
        <CampaignManuscript
          :campaign-result="{ content, meta }"
          :campaign-content="content"
          :complexity-info="{ name: meta?.complexity || 'Campaign' }"
          :language-name="meta?.language || 'en'"
          :processing-time="0"
          :format-time="() => '—'"
          user-plan="shared"
          forge-label="Shared Adventure"
          @new-campaign="router.push('/app')"
          @copy="onCopy"
        />
      </template>
    </main>

    <div v-if="!loading && !error" class="text-center pb-8">
      <p class="text-sm text-muted">
        Made with
        <RouterLink to="/" class="text-gold hover:underline">Arcane Forge</RouterLink>
        — turn any RPG PDF into a playable campaign
      </p>
    </div>

    <AppFooter />

    <Transition name="fade-slide">
      <div
        v-if="toastVisible"
        class="fixed bottom-6 right-6 bg-surface border border-gold/40 text-text px-6 py-3 rounded-xl z-50"
        role="status"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>
