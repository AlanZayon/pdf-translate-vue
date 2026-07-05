import { ref, computed, onBeforeUnmount } from 'vue';
import {
  generateCampaign,
  fetchJobStatus,
  fetchCampaignContent,
  COMPLEXITY_MAP,
  QuotaError,
} from '../services/campaignApi.js';

const SESSION_KEY = 'rpg_campaign_job_id';
const LAST_COMPLETED_KEY = 'rpg_last_completed_job';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 450;

export function useCampaignJob(options = {}) {
  const jobId = ref(null);
  const isLoading = ref(false);
  const isPolling = ref(false);
  const errorMessage = ref('');
  const creditsRefunded = ref(false);
  const campaignResult = ref(null);
  const campaignContent = ref('');
  const processingTime = ref(0);
  const pollingMessage = ref('Waiting for processing...');
  const pollingElapsedTime = ref(0);
  const pollingProgressPercentage = ref(0);
  const jobStatus = ref('');

  let pollingInterval = null;
  let pollingStartTime = 0;
  let pollAttempts = 0;

  const pollingProgress = computed(() => `${pollingProgressPercentage.value}%`);

  function saveJobToSession(id) {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function clearJobSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  function getJobFromSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  async function handleCompleted(statusData) {
    stopPolling();
    isPolling.value = false;
    processingTime.value = pollingElapsedTime.value;

    const result = statusData.result || {};
    let campaignUrl = result.campaign_url;

    try {
      campaignContent.value = await fetchCampaignContent(campaignUrl);
    } catch {
      campaignContent.value = result.preview || 'Campaign content not available.';
    }

    campaignResult.value = {
      job_id: jobId.value,
      campaign_url: campaignUrl,
      preview: result.preview,
      book_signals: result.book_signals,
      quality_score: result.quality_score,
      generation_source: result.generation_source,
      word_count: result.word_count,
      session_count: result.session_count,
      filename: result.filename,
      complexity: result.complexity,
      message: 'Campaign generated successfully!',
    };
    try {
      localStorage.setItem(LAST_COMPLETED_KEY, jobId.value);
    } catch {
      /* ignore */
    }
    clearJobSession();
  }

  async function pollOnce() {
    if (!jobId.value) {
      stopPolling();
      return;
    }

    pollingElapsedTime.value = Math.floor((Date.now() - pollingStartTime) / 1000);
    pollAttempts += 1;

    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      stopPolling();
      isPolling.value = false;
      errorMessage.value = 'Processing timeout exceeded. Please try again.';
      clearJobSession();
      return;
    }

    try {
      const statusData = await fetchJobStatus(jobId.value);
      jobStatus.value = statusData.status || '';

      if (statusData.progress) {
        pollingMessage.value = statusData.progress;
      }

      if (typeof statusData.progress_percent === 'number') {
        pollingProgressPercentage.value = Math.min(99, Math.max(5, statusData.progress_percent));
      } else if (statusData.status === 'queued') {
        pollingProgressPercentage.value = 5;
      }

      if (statusData.status === 'completed') {
        await handleCompleted(statusData);
      } else if (statusData.status === 'failed') {
        stopPolling();
        isPolling.value = false;
        const err = statusData.error || 'Processing failed';
        creditsRefunded.value = /refund/i.test(err);
        errorMessage.value = err;
        clearJobSession();
      } else if (statusData.status === 'processing') {
        pollingMessage.value = statusData.progress || 'Processing...';
      } else if (statusData.status === 'queued') {
        pollingMessage.value = statusData.progress || 'Queued for processing...';
      }
    } catch {
      if (pollAttempts >= 10) {
        stopPolling();
        isPolling.value = false;
        errorMessage.value = 'Error checking processing status.';
      }
    }
  }

  function startPolling(id = jobId.value) {
    if (!id) return;
    jobId.value = id;
    saveJobToSession(id);
    stopPolling();
    isPolling.value = true;
    pollAttempts = 0;
    pollingStartTime = Date.now();
    pollingProgressPercentage.value = 5;
    pollingMessage.value = 'Waiting for processing...';
    jobStatus.value = 'queued';
    pollingInterval = setInterval(pollOnce, POLL_INTERVAL_MS);
    pollOnce();
  }

  async function submitCampaign(file, language, complexityId, systemPreset = 'generic', prefs = {}) {
    if (!file) {
      errorMessage.value = 'Please select a PDF file.';
      return;
    }

    isLoading.value = true;
    isPolling.value = false;
    errorMessage.value = '';
    creditsRefunded.value = false;
    campaignResult.value = null;
    campaignContent.value = '';
    jobId.value = null;
    stopPolling();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_language', language);
    formData.append('complexity', COMPLEXITY_MAP[complexityId] || 'mediana');
    formData.append('system_preset', systemPreset);
    if (prefs.partyLevel) formData.append('party_level', prefs.partyLevel);
    if (prefs.tone) formData.append('tone', prefs.tone);
    if (prefs.theme) formData.append('theme', prefs.theme);
    if (prefs.useCharacterSheets) {
      formData.append('use_character_sheets', 'true');
      formData.append('party_size', String(prefs.partySize || 3));
      (prefs.sheetFiles || []).forEach((f) => formData.append('sheet_files', f));
    }

    const idempotencyKey = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

    try {
      const { data, status } = await generateCampaign(formData, idempotencyKey);

      if ((status === 202 || status === 200) && data.job_id) {
        jobId.value = data.job_id;
        isLoading.value = false;
        if (data.status !== 'completed') {
          startPolling(data.job_id);
        }
      } else if (data.success && data.status === 'completed') {
        isLoading.value = false;
        campaignResult.value = data;
        campaignContent.value = data.result?.preview || '';
      } else {
        errorMessage.value = data.error || 'Error starting processing.';
        isLoading.value = false;
      }
    } catch (error) {
      if (error instanceof QuotaError) {
        options.onQuotaError?.(error.payload);
        errorMessage.value = error.message;
      } else {
        errorMessage.value =
          error.response?.data?.error ||
          (error.message?.includes('Network Error')
            ? 'Connection error. Check if the server is running.'
            : 'Error processing request. Please try again.');
      }
      isLoading.value = false;
    }
  }

  function retryPolling() {
    if (jobId.value) {
      errorMessage.value = '';
      creditsRefunded.value = false;
      pollAttempts = 0;
      pollingStartTime = Date.now();
      startPolling(jobId.value);
    }
  }

  function resetJob() {
    stopPolling();
    jobId.value = null;
    isPolling.value = false;
    campaignResult.value = null;
    campaignContent.value = '';
    errorMessage.value = '';
    creditsRefunded.value = false;
    clearJobSession();
  }

  function resumeFromSession() {
    const saved = getJobFromSession();
    if (saved) {
      startPolling(saved);
    }
  }

  function getLastCompletedJob() {
    try {
      return localStorage.getItem(LAST_COMPLETED_KEY);
    } catch {
      return null;
    }
  }

  onBeforeUnmount(stopPolling);

  return {
    jobId,
    isLoading,
    isPolling,
    errorMessage,
    creditsRefunded,
    jobStatus,
    campaignResult,
    campaignContent,
    processingTime,
    pollingMessage,
    pollingElapsedTime,
    pollingProgress,
    pollingProgressPercentage,
    submitCampaign,
    retryPolling,
    resetJob,
    resumeFromSession,
    formatTime,
    stopPolling,
    getLastCompletedJob,
  };
}
