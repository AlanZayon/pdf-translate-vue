<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SiteHeader from './layout/SiteHeader.vue';
import StepIndicator from './layout/StepIndicator.vue';
import LanguageSelector from './configure/LanguageSelector.vue';
import ComplexitySelector from './configure/ComplexitySelector.vue';
import SystemPresetSelector from './configure/SystemPresetSelector.vue';
import UploadZone from './upload/UploadZone.vue';
import ProcessingRitual from './processing/ProcessingRitual.vue';
import CampaignManuscript from './result/CampaignManuscript.vue';
import AppFooter from './layout/AppFooter.vue';
import UiCard from './shared/UiCard.vue';
import UiButton from './shared/UiButton.vue';
import { useCampaignJob } from '../composables/useCampaignJob.js';
import { useFileUpload } from '../composables/useFileUpload.js';
import { useMetadata } from '../composables/useMetadata.js';
import { useToast } from '../composables/useToast.js';
import CampaignPreferences from './configure/CampaignPreferences.vue';
import CharacterSheetsToggle from './configure/CharacterSheetsToggle.vue';
import CharacterSheetUpload from './sheets/CharacterSheetUpload.vue';
import { fetchExampleCampaign, fetchMe, fetchSystemPresets, fetchDetectSystem, COMPLEXITY_MAP } from '../services/campaignApi.js';
import { trackEvent } from '../composables/useAnalytics.js';
import { ChevronLeft, ChevronRight, Sparkles } from '@lucide/vue';

const router = useRouter();
const fileInputRef = ref(null);
const resultRef = ref(null);
const currentStep = ref(1);
const maxReached = ref(1);
const uploadConsent = ref(false);
const selectedPreset = ref('generic');
const systemPresets = ref({});
const account = ref(null);
const partyLevel = ref('');
const tone = ref('heroic');
const theme = ref('');
const detectedPreset = ref(null);
const useCharacterSheets = ref(false);
const partySize = ref(3);
const sheetFiles = ref([]);

const {
  complexities,
  languages,
  selectedLanguage,
  selectedComplexity,
  getComplexityInfo,
  getLanguageName,
} = useMetadata();

const {
  selectedFile,
  dragOver,
  fileError,
  handleFileChange,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  clearFile,
} = useFileUpload();

const {
  jobId,
  isLoading,
  isPolling,
  errorMessage,
  jobStatus,
  campaignResult,
  campaignContent,
  processingTime,
  pollingMessage,
  pollingElapsedTime,
  pollingProgressPercentage,
  submitCampaign,
  retryPolling,
  resetJob,
  resumeFromSession,
  formatTime,
  getLastCompletedJob,
} = useCampaignJob();

const { toastMessage, toastVisible, showToast } = useToast();

const complexityInfo = computed(() => getComplexityInfo(selectedComplexity.value));

const showWizard = computed(
  () => !isPolling.value && !(campaignResult.value && campaignContent.value),
);

const showResult = computed(
  () => campaignResult.value && !isPolling.value && campaignContent.value,
);

const lastCompletedJob = ref(null);

watch([campaignResult, campaignContent], ([result, content]) => {
  if (result && content) {
    currentStep.value = resultStep.value;
    maxReached.value = Math.max(maxReached.value, resultStep.value);
    trackEvent('generate_complete', { complexity: selectedComplexity.value });
  }
});

watch(isPolling, (polling) => {
  if (polling) maxReached.value = Math.max(maxReached.value, 2);
});

const maxWizardStep = computed(() => (useCharacterSheets.value ? 3 : 2));
const resultStep = computed(() => (useCharacterSheets.value ? 4 : 3));
const allSheetsFilled = computed(() => {
  if (!useCharacterSheets.value) return true;
  return sheetFiles.value.filter(Boolean).length >= partySize.value;
});

watch(partySize, (n) => {
  const size = Math.max(1, Math.min(5, Number(n) || 3));
  const current = [...sheetFiles.value];
  while (current.length < size) current.push(null);
  sheetFiles.value = current.slice(0, size);
}, { immediate: true });

watch(useCharacterSheets, (on) => {
  if (!on) {
    sheetFiles.value = [];
  }
});

watch(selectedFile, async (file) => {
  if (!file) return;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const data = await fetchDetectSystem(fd);
    if (data.preset) {
      detectedPreset.value = data.preset;
      selectedPreset.value = data.preset;
    }
  } catch {
    /* optional */
  }
});

watch(currentStep, (step) => {
  if (step === 1) trackEvent('step_configure');
});

function selectFile() {
  if (!uploadConsent.value) {
    showToast('Please accept the upload consent first.', 4000);
    return;
  }
  fileInputRef.value?.click();
}

function onClearFile() {
  clearFile(fileInputRef);
}

function goToStep(step) {
  if (step <= maxReached.value) currentStep.value = step;
}

function nextStep() {
  if (currentStep.value < maxWizardStep.value) {
    currentStep.value += 1;
    maxReached.value = Math.max(maxReached.value, currentStep.value);
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value -= 1;
}

async function onGenerate() {
  if (!uploadConsent.value) {
    showToast('Please accept the upload consent.', 4000);
    return;
  }
  trackEvent('upload_start', { complexity: selectedComplexity.value });
  await submitCampaign(
    selectedFile.value,
    selectedLanguage.value,
    selectedComplexity.value,
    selectedPreset.value,
    {
      partyLevel: partyLevel.value,
      tone: tone.value,
      theme: theme.value,
      useCharacterSheets: useCharacterSheets.value,
      partySize: partySize.value,
      sheetFiles: sheetFiles.value.filter(Boolean),
    },
  );
  try {
    account.value = await fetchMe();
  } catch {
    /* ignore */
  }
}

async function onLoadExample() {
  isLoading.value = true;
  errorMessage.value = '';
  campaignResult.value = null;
  campaignContent.value = '';

  try {
    const data = await fetchExampleCampaign(
      COMPLEXITY_MAP[selectedComplexity.value] || 'mediana',
      selectedLanguage.value,
    );
    if (data.success) {
      campaignResult.value = { content: data.content };
      campaignContent.value = data.content || '';
      currentStep.value = resultStep.value;
      maxReached.value = resultStep.value;
    }
  } catch {
    errorMessage.value = 'Error loading example campaign.';
  } finally {
    isLoading.value = false;
  }
}

function onNewCampaign() {
  resetJob();
  onClearFile();
  currentStep.value = 1;
  maxReached.value = 1;
  uploadConsent.value = false;
  useCharacterSheets.value = false;
  partySize.value = 3;
  sheetFiles.value = [];
}

function clearError() {
  errorMessage.value = '';
}

function onCopy(message, isError = false) {
  showToast(message, isError ? 4000 : 3000);
}

function continueViewingLast() {
  if (lastCompletedJob.value) {
    router.push(`/app/result/${lastCompletedJob.value}`);
  }
}

onMounted(async () => {
  resumeFromSession();
  lastCompletedJob.value = getLastCompletedJob();
  if (isPolling.value) maxReached.value = 2;
  try {
    systemPresets.value = await fetchSystemPresets();
    account.value = await fetchMe();
  } catch {
    /* dev or offline */
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 pb-16 flex-1">
      <div class="mx-auto pt-8" :class="showResult ? 'max-w-6xl' : 'max-w-4xl'">
        <div class="text-center mb-8">
          <h1 class="font-display text-2xl md:text-3xl text-gold">Campaign Forge</h1>
          <p class="text-muted text-sm mt-2">Configure, upload, and generate your adventure</p>
        </div>

        <StepIndicator
          v-if="showWizard || isPolling || showResult"
          :current-step="isPolling ? (useCharacterSheets ? 3 : 2) : currentStep"
          :max-reached="maxReached"
          :use-character-sheets="useCharacterSheets"
          @go-to="goToStep"
        />

        <UiCard
          v-if="showWizard && !isPolling && lastCompletedJob && !campaignResult"
          class="mb-6"
          padding="p-4"
        >
          <p class="text-sm text-muted mb-3">You have a recently completed campaign.</p>
          <UiButton variant="secondary" size="sm" @click="continueViewingLast">
            Continue viewing last campaign
          </UiButton>
        </UiCard>

        <Transition name="forge-complete" mode="out-in">
          <ProcessingRitual
            v-if="isPolling && jobId"
            key="processing"
          :job-id="jobId"
          :polling-message="pollingMessage"
          :polling-progress-percentage="pollingProgressPercentage"
          :polling-elapsed-time="pollingElapsedTime"
          :format-time="formatTime"
          :job-status="jobStatus"
          :complexity-id="selectedComplexity"
          />
        </Transition>

        <Transition name="fade-slide" mode="out-in">
          <UiCard v-if="showWizard && currentStep === 1" key="step1" glow>
            <h3 class="font-display text-xl text-gold mb-6">Forge Settings</h3>
            <div class="space-y-8">
              <LanguageSelector v-model="selectedLanguage" :languages="languages" />
              <ComplexitySelector
                v-model="selectedComplexity"
                :complexities="complexities"
              />
              <SystemPresetSelector v-model="selectedPreset" :presets="systemPresets" />
              <p v-if="detectedPreset" class="text-sm text-gold">
                Detected from your PDF: {{ systemPresets[detectedPreset]?.name || detectedPreset }}
              </p>
              <CampaignPreferences v-model:party-level="partyLevel" v-model:tone="tone" v-model:theme="theme" />
              <CharacterSheetsToggle
                v-model="useCharacterSheets"
                v-model:party-size="partySize"
              />
            </div>
            <div class="flex justify-end mt-8">
              <UiButton variant="primary" @click="nextStep">
                Continue to Upload
                <ChevronRight class="w-5 h-5" aria-hidden="true" />
              </UiButton>
            </div>
          </UiCard>

          <UiCard v-else-if="showWizard && currentStep === 2" key="step2" glow>
            <h3 class="font-display text-xl text-gold mb-2">Tome Upload</h3>
            <p class="text-muted text-sm mb-6">
              {{ getLanguageName(selectedLanguage) }} · {{ complexityInfo.name }}
            </p>

            <UploadZone
              v-model:consent-accepted="uploadConsent"
              :selected-file="selectedFile"
              :drag-over="dragOver"
              :file-error="fileError"
              :disabled="isLoading || isPolling"
              @select-file="selectFile"
              @drop="handleDrop"
              @drag-over="handleDragOver"
              @drag-leave="handleDragLeave"
              @clear-file="onClearFile"
            />

            <input
              ref="fileInputRef"
              type="file"
              accept=".pdf,application/pdf"
              class="hidden"
              @change="handleFileChange"
            />

            <div class="flex flex-col sm:flex-row gap-3 mt-4">
              <UiButton variant="ghost" @click="prevStep">
                <ChevronLeft class="w-5 h-5" aria-hidden="true" />
                Back
              </UiButton>
              <UiButton
                v-if="useCharacterSheets"
                variant="primary"
                size="lg"
                block
                class="flex-1"
                :disabled="!selectedFile || !uploadConsent"
                @click="nextStep"
              >
                Continue to Character Sheets
                <ChevronRight class="w-5 h-5" aria-hidden="true" />
              </UiButton>
              <UiButton
                v-else
                variant="primary"
                size="lg"
                block
                class="flex-1"
                :disabled="!selectedFile || !uploadConsent || isLoading || isPolling"
                :loading="isLoading || isPolling"
                @click="onGenerate"
              >
                <Sparkles class="w-5 h-5" aria-hidden="true" />
                Begin the Ritual
              </UiButton>
            </div>

            <p v-if="!useCharacterSheets" class="text-center mt-6">
              <button
                type="button"
                class="text-muted hover:text-gold text-sm underline-offset-4 hover:underline transition"
                :disabled="isLoading || isPolling"
                @click="onLoadExample"
              >
                Or preview an example campaign
              </button>
            </p>
          </UiCard>

          <UiCard v-else-if="showWizard && currentStep === 3 && useCharacterSheets" key="step3" glow>
            <h3 class="font-display text-xl text-gold mb-2">Character Sheets</h3>
            <p class="text-muted text-sm mb-6">
              Upload {{ partySize }} character sheet PDF{{ partySize > 1 ? 's' : '' }} for your party.
            </p>

            <CharacterSheetUpload
              :party-size="partySize"
              :sheets="sheetFiles"
              :disabled="isLoading || isPolling"
              @update:sheets="sheetFiles = $event"
            />

            <div class="flex flex-col sm:flex-row gap-3 mt-4">
              <UiButton variant="ghost" @click="prevStep">
                <ChevronLeft class="w-5 h-5" aria-hidden="true" />
                Back
              </UiButton>
              <UiButton
                variant="primary"
                size="lg"
                block
                class="flex-1"
                :disabled="!selectedFile || !allSheetsFilled || isLoading || isPolling"
                :loading="isLoading || isPolling"
                @click="onGenerate"
              >
                <Sparkles class="w-5 h-5" aria-hidden="true" />
                Begin the Ritual
              </UiButton>
            </div>
          </UiCard>
        </Transition>

        <Transition name="forge-complete">
          <CampaignManuscript
            v-if="showResult"
            key="result"
            ref="resultRef"
            :campaign-result="campaignResult"
            :campaign-content="campaignContent"
            :complexity-info="complexityInfo"
            :language-name="getLanguageName(selectedLanguage)"
            :processing-time="processingTime"
            :format-time="formatTime"
            :job-id="jobId"
            @new-campaign="onNewCampaign"
            @copy="onCopy"
          />
        </Transition>

        <UiCard v-if="errorMessage" class="mt-8 border-danger/40" padding="p-6" role="alert">
          <h3 class="font-display text-lg text-danger mb-2">The Ritual Failed</h3>
          <p class="text-muted">{{ errorMessage }}</p>
          <div class="mt-4 flex gap-3">
            <UiButton v-if="jobId" variant="danger" size="sm" @click="retryPolling">
              Try Again
            </UiButton>
            <UiButton variant="ghost" size="sm" @click="clearError">Dismiss</UiButton>
          </div>
        </UiCard>
      </div>
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

.forge-complete-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.forge-complete-leave-active {
  transition: opacity 0.3s ease;
}
.forge-complete-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.forge-complete-leave-to {
  opacity: 0;
}
</style>
