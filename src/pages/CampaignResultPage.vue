<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import CampaignManuscript from '../components/result/CampaignManuscript.vue';
import { fetchJobContent } from '../services/campaignApi.js';
import { useToast } from '../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const content = ref('');
const meta = ref(null);
const { toastMessage, toastVisible, showToast } = useToast();

const jobId = computed(() => route.params.jobId);

const COMPLEXITY_LABELS = { simples: 'Simple', mediana: 'Medium', complexa: 'Complex' };

const complexityInfo = computed(() => ({
  name: COMPLEXITY_LABELS[meta.value?.complexity] || meta.value?.complexity || 'Campaign',
}));

const campaignResult = computed(() => ({
  job_id: jobId.value,
  book_signals: meta.value?.book_signals,
  quality_score: meta.value?.quality_score,
  meta: meta.value,
}));

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchJobContent(jobId.value);
    content.value = data.content;
    meta.value = data.meta;
  } catch {
    error.value = 'Campaign not found or unavailable.';
  } finally {
    loading.value = false;
  }
}

function onCopy(message, isError = false) {
  showToast(message, isError ? 5000 : 3000);
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-10 flex-1 max-w-6xl">
      <p v-if="loading" class="text-muted text-center">Loading your campaign...</p>
      <p v-else-if="error" class="text-danger text-center">{{ error }}</p>
      <CampaignManuscript
        v-else
        :campaign-result="campaignResult"
        :campaign-content="content"
        :complexity-info="complexityInfo"
        :language-name="meta?.language || 'en'"
        :processing-time="0"
        :format-time="() => '—'"
        :job-id="jobId"
        forge-label="Your Campaign"
        @new-campaign="router.push('/app')"
        @copy="onCopy"
      />
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
