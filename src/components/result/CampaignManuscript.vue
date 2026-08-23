<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { RotateCcw, LayoutDashboard, Sparkles } from '@lucide/vue';
import UiCard from '../shared/UiCard.vue';
import UiButton from '../shared/UiButton.vue';
import CampaignHero from './CampaignHero.vue';
import CampaignNav from './CampaignNav.vue';
import SessionCard from './SessionCard.vue';
import NpcRoster from './NpcRoster.vue';
import CampaignSection from './CampaignSection.vue';
import ExportMenu from './ExportMenu.vue';
import CampaignReveal from './CampaignReveal.vue';
import { parseCampaign, getNavGroups } from '../../utils/campaignParser.js';
import { useCampaignDownload } from '../../composables/useCampaignDownload.js';
import { createShareLink, regenerateSection, fetchJobContent } from '../../services/campaignApi.js';
import { trackEvent } from '../../composables/useAnalytics.js';

const props = defineProps({
  campaignResult: { type: Object, required: true },
  campaignContent: { type: String, default: '' },
  complexityInfo: { type: Object, default: () => ({ name: '' }) },
  languageName: { type: String, default: '' },
  processingTime: { type: Number, default: 0 },
  formatTime: { type: Function, default: (s) => `${s}s` },
  userPlan: { type: String, default: 'free' },
  jobId: { type: String, default: '' },
  forgeLabel: { type: String, default: 'Campaign Complete' },
});

const emit = defineEmits(['new-campaign', 'copy', 'upgrade', 'content-updated']);

const router = useRouter();
const activeSectionId = ref('');
const actionLoading = ref(false);
const localContent = ref(props.campaignContent);

const { downloadMarkdown, downloadPdf, printCampaign, copyMarkdown } = useCampaignDownload();

watch(
  () => props.campaignContent,
  (v) => {
    localContent.value = v;
  },
);

const isPro = computed(() => ['pro', 'studio'].includes(props.userPlan));
const isShared = computed(() => props.userPlan === 'shared');
const showUpsell = computed(() => props.userPlan === 'free');

const bookSignals = computed(() => {
  const signals = props.campaignResult?.book_signals;
  if (Array.isArray(signals)) return signals;
  if (typeof signals === 'string') {
    try {
      return JSON.parse(signals);
    } catch {
      return [];
    }
  }
  return [];
});

const qualityScore = computed(() => {
  const q = props.campaignResult?.quality_score ?? props.campaignResult?.meta?.quality_score;
  if (q == null || q === '') return null;
  const n = Number(q);
  return Number.isFinite(n) ? Math.round(n) : null;
});

const parsed = computed(() => parseCampaign(localContent.value));
const navGroups = computed(() => getNavGroups(parsed.value));

const metaForExport = computed(() => ({
  title: parsed.value.title,
  language: props.languageName,
  complexity: props.complexityInfo?.name,
  quality_score: qualityScore.value,
  book_signals: bookSignals.value,
}));

const hasStructuredSections = computed(
  () => parsed.value.sections.some((s) => ['session', 'overview', 'npcs'].includes(s.type)),
);

async function onDownloadMd() {
  if (!props.jobId) return;
  actionLoading.value = true;
  try {
    await downloadMarkdown(props.jobId, parsed.value.title);
    emit('copy', 'Markdown downloaded!');
  } catch (e) {
    emit('copy', e.message || 'Download failed.', true);
  } finally {
    actionLoading.value = false;
  }
}

async function onDownloadPdf() {
  if (!props.jobId) return;
  actionLoading.value = true;
  try {
    await downloadPdf(props.jobId, parsed.value.title);
    emit('copy', 'PDF downloaded!');
  } catch (e) {
    if (e.message?.includes('402') || e.message?.includes('Pro')) {
      emit('upgrade');
    } else {
      emit('copy', e.message || 'PDF export failed — try Print instead.', true);
    }
  } finally {
    actionLoading.value = false;
  }
}

function onPrint() {
  try {
    printCampaign(parsed.value, metaForExport.value);
  } catch (e) {
    emit('copy', e.message || 'Print failed.', true);
  }
}

async function onCopy() {
  try {
    await copyMarkdown(localContent.value);
    emit('copy', 'Campaign copied to clipboard!');
  } catch {
    emit('copy', 'Error copying to clipboard.', true);
  }
}

async function onShare() {
  if (!props.jobId) return;
  actionLoading.value = true;
  try {
    const data = await createShareLink(props.jobId);
    if (data.share_url) {
      await navigator.clipboard.writeText(data.share_url);
      emit('copy', 'Share link copied!');
    }
  } catch {
    emit('upgrade');
  } finally {
    actionLoading.value = false;
  }
}

function onUpsellClick() {
  trackEvent('result_upsell_click');
  emit('upgrade');
}

async function onExpandSessions() {
  if (!props.jobId) return;
  actionLoading.value = true;
  try {
    await regenerateSection(props.jobId, 'sessions', 'Add 2 more detailed sessions');
    const data = await fetchJobContent(props.jobId);
    localContent.value = data.content;
    emit('content-updated', data.content);
    emit('copy', 'Sessions expanded — manuscript updated.');
    trackEvent('regenerate_section', { section: 'sessions' });
  } catch {
    emit('copy', 'Could not expand sessions.', true);
  } finally {
    actionLoading.value = false;
  }
}

function onNavigate(id) {
  activeSectionId.value = id;
}

defineExpose({ parsed, onCopy, onPrint });
</script>

<template>
  <CampaignReveal>
    <UiCard class="mt-8" padding="p-0" glow>
      <CampaignHero
        :title="parsed.title"
        :complexity-name="complexityInfo.name"
        :language-name="languageName"
        :processing-time="processingTime"
        :format-time="formatTime"
        :stats="parsed.stats"
        :quality-score="qualityScore"
        :book-signals="bookSignals"
        :forge-label="forgeLabel"
      />

      <div class="p-4 md:p-7 lg:p-10">
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <aside v-if="hasStructuredSections && navGroups.length" class="lg:w-56 shrink-0">
            <CampaignNav
              :groups="navGroups"
              :sections="parsed.sections"
              :active-id="activeSectionId"
              @navigate="onNavigate"
            />
          </aside>

          <div class="flex-1 min-w-0">
            <template v-if="hasStructuredSections">
              <template v-for="section in parsed.sections" :key="section.id">
                <CampaignSection
                  v-if="['overview', 'hook', 'rewards', 'generic', 'enemies', 'puzzles', 'endings', 'maps', 'checklist'].includes(section.type)"
                  :section="section"
                  :variant="section.type"
                />
                <SessionCard
                  v-else-if="section.type === 'session'"
                  :section="section"
                  :default-expanded="true"
                  :show-watermark="showUpsell && section.number > 1"
                />
                <NpcRoster v-else-if="section.type === 'npcs'" :section="section" />
              </template>
            </template>

            <div v-else class="rounded-xl border border-gold/20 campaign-folio p-6 md:p-8 relative">
              <div
                v-if="showUpsell"
                class="pointer-events-none absolute inset-0 flex items-center justify-center z-10 opacity-[0.08] rotate-[-18deg]"
                aria-hidden="true"
              >
                <span class="text-4xl font-display text-gold whitespace-nowrap">Arcane Forge Preview</span>
              </div>
              <div class="campaign-prose" v-html="parsed.fallbackHtml" />
            </div>
          </div>
        </div>
      </div>

      <UiCard v-if="showUpsell" class="mx-6 md:mx-8 mb-4" padding="p-4">
        <p class="text-sm text-text mb-2">Unlock Medium & Complex campaigns, PDF export, and share links.</p>
        <UiButton variant="primary" size="sm" @click="onUpsellClick">Upgrade to Pro</UiButton>
      </UiCard>

      <div class="p-6 md:p-8 pt-0 flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center">
        <ExportMenu
          :job-id="jobId"
          :is-pro="isPro"
          :is-shared="isShared"
          :loading="actionLoading"
          :title="parsed.title"
          @download-md="onDownloadMd"
          @download-pdf="onDownloadPdf"
          @print="onPrint"
          @copy="onCopy"
          @share="onShare"
        />

        <UiButton variant="ghost" size="lg" @click="router.push('/dashboard')">
          <LayoutDashboard class="w-5 h-5" /> Dashboard
        </UiButton>
        <UiButton variant="ghost" size="lg" @click="emit('new-campaign')">
          <RotateCcw class="w-5 h-5" /> Forge Another
        </UiButton>
        <UiButton
          v-if="jobId && isPro && !isShared"
          variant="ghost"
          size="sm"
          :loading="actionLoading"
          @click="onExpandSessions"
        >
          <Sparkles class="w-4 h-4" /> Expand sessions (1 credit)
        </UiButton>
      </div>
    </UiCard>
  </CampaignReveal>
</template>
