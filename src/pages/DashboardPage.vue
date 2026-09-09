<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import UiCard from '../components/shared/UiCard.vue';
import { useToast } from '../composables/useToast.js';
import { useCampaignDownload } from '../composables/useCampaignDownload.js';
import {
  fetchMe,
  fetchDashboardJobs,
  generateApiKey,
  createShareLink,
  fetchJobContent,
} from '../services/campaignApi.js';
import { BACKEND_TO_FRONTEND_COMPLEXITY } from '../services/campaignApi.js';

const router = useRouter();
const { downloadMarkdown, downloadPdf } = useCampaignDownload();
const { toastMessage, toastVisible, showToast } = useToast();

const me = ref(null);
const jobs = ref([]);
const loading = ref(true);
const apiKey = ref('');
const actionLoading = ref(null);

onMounted(async () => {
  try {
    me.value = await fetchMe();
    jobs.value = await fetchDashboardJobs();
  } catch {
    router.push('/app');
  } finally {
    loading.value = false;
  }
});

function viewCampaign(job) {
  router.push(`/app/result/${job.id}`);
}

async function downloadMd(job) {
  actionLoading.value = job.id;
  try {
    const data = await fetchJobContent(job.id);
    await downloadMarkdown(job.id, data.meta?.title || job.filename);
    showToast('Markdown downloaded!');
  } catch (e) {
    showToast(e.message || 'Download failed.', 4000);
  } finally {
    actionLoading.value = null;
  }
}

async function share(job) {
  actionLoading.value = `share-${job.id}`;
  try {
    const data = await createShareLink(job.id);
    if (data.share_url) {
      await navigator.clipboard.writeText(data.share_url);
      showToast('Share link copied!');
    }
  } catch (e) {
    showToast(e.response?.data?.error || 'Share failed.', 4000);
  } finally {
    actionLoading.value = null;
  }
}

async function downloadPdfJob(job) {
  actionLoading.value = `pdf-${job.id}`;
  try {
    await downloadPdf(job.id, job.filename);
    showToast('PDF downloaded!');
  } catch (e) {
    showToast(e.message || 'PDF export unavailable.', 4000);
  } finally {
    actionLoading.value = null;
  }
}

async function createApiKey() {
  try {
    const data = await generateApiKey();
    apiKey.value = data.api_key;
  } catch (e) {
    showToast(e.response?.data?.error || 'Could not generate API key.', 4000);
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-4xl">
      <h1 class="font-display text-3xl text-gold mb-8">Dashboard</h1>

      <div v-if="loading" class="text-muted">Loading...</div>

      <template v-else-if="me">
        <UiCard class="mb-10" padding="p-4">
          <p class="text-sm text-muted mb-1">Account</p>
          <p class="text-text">{{ me.email || 'Signed in' }}</p>
        </UiCard>

        <UiCard class="mb-10" padding="p-6">
          <h2 class="font-display text-lg text-gold mb-3">API access</h2>
          <p class="text-muted text-sm mb-4">Generate an API key for programmatic access.</p>
          <UiButton variant="primary" size="sm" @click="createApiKey">Generate API key</UiButton>
          <p v-if="apiKey" class="mt-4 text-xs font-mono break-all bg-surface-alt p-3 rounded-lg">{{ apiKey }}</p>
        </UiCard>

        <h2 class="font-display text-xl text-gold mb-4">Your campaigns</h2>
        <div v-if="!jobs.length" class="text-muted">
          No campaigns yet. <RouterLink to="/app" class="text-gold">Forge one</RouterLink>.
        </div>
        <div v-else class="space-y-3">
          <UiCard v-for="job in jobs" :key="job.id" padding="p-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p class="font-medium text-text">{{ job.filename || 'Campaign' }}</p>
                <p class="text-sm text-muted">
                  {{ BACKEND_TO_FRONTEND_COMPLEXITY[job.complexity] || job.complexity }}
                  · {{ job.status }}
                  · {{ formatDate(job.created_at) }}
                </p>
              </div>
              <div v-if="job.status === 'completed'" class="flex flex-wrap gap-2">
                <UiButton variant="primary" size="sm" @click="viewCampaign(job)">View</UiButton>
                <UiButton variant="ghost" size="sm" :loading="actionLoading === job.id" @click="downloadMd(job)">
                  Download
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :loading="actionLoading === `share-${job.id}`"
                  @click="share(job)"
                >
                  Share
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :loading="actionLoading === `pdf-${job.id}`"
                  @click="downloadPdfJob(job)"
                >
                  PDF
                </UiButton>
              </div>
            </div>
          </UiCard>
        </div>
      </template>
    </main>

    <AppFooter />

    <Transition name="fade-slide">
      <div
        v-if="toastVisible"
        class="fixed bottom-6 right-6 bg-surface border border-gold/40 text-text px-6 py-3 rounded-xl shadow-gold z-50"
        role="status"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.shadow-gold {
  box-shadow: var(--shadow-gold);
}
</style>
