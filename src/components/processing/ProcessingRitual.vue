<script setup>
import { computed } from 'vue';
import UiCard from '../shared/UiCard.vue';
import UiBadge from '../shared/UiBadge.vue';
import {
  Hourglass,
  CloudDownload,
  FileCheck,
  ScrollText,
  Sparkles,
  Save,
  Loader2,
  BookOpen,
} from '@lucide/vue';

const props = defineProps({
  jobId: { type: String, required: true },
  pollingMessage: { type: String, default: '' },
  pollingProgressPercentage: { type: Number, default: 0 },
  pollingElapsedTime: { type: Number, default: 0 },
  formatTime: { type: Function, required: true },
  jobStatus: { type: String, default: 'queued' },
  complexityId: { type: String, default: 'medium' },
  isPriority: { type: Boolean, default: false },
});

const etaByComplexity = {
  simple: 'Usually 2–4 min',
  medium: 'Usually 3–6 min',
  complex: 'Usually 5–12 min',
};

const eta = computed(() => etaByComplexity[props.complexityId] || etaByComplexity.medium);

const ritualSteps = [
  { key: 'queued', label: 'Queued for the Forge', icon: Hourglass, match: /queued|aguardando|waiting/i },
  { key: 'download', label: 'Retrieving the Tome', icon: CloudDownload, match: /download|baixando|s3/i },
  { key: 'validate', label: 'Validating Pages', icon: FileCheck, match: /validat|validando/i },
  { key: 'extract', label: 'Extracting Lore', icon: ScrollText, match: /extract|extraindo|texto/i },
  { key: 'analyze', label: 'Reading Your Book', icon: BookOpen, match: /analyz|analis|book/i },
  { key: 'generate', label: 'Weaving the Campaign', icon: Sparkles, match: /generat|gerando|weav|outline/i },
  { key: 'save', label: 'Inscribing to Scroll', icon: Save, match: /sav|salvando|validat/i },
];

const activeIndex = computed(() => {
  const msg = props.pollingMessage || '';
  for (let i = ritualSteps.length - 1; i >= 0; i--) {
    if (ritualSteps[i].match.test(msg)) return i;
  }
  if (/processing|processando/i.test(msg)) return 2;
  return 0;
});
</script>

<template>
  <UiCard class="mt-8" glow padding="p-6 md:p-8">
    <div aria-live="polite" aria-busy="true">
      <div class="text-center mb-6">
        <div class="flex flex-wrap justify-center gap-2 mb-3">
          <UiBadge v-if="isPriority" variant="gold">Priority queue</UiBadge>
          <UiBadge variant="muted">{{ eta }}</UiBadge>
        </div>
        <h3 class="font-display text-2xl font-bold text-gold mb-2">The Ritual Begins</h3>
        <p class="text-muted">{{ pollingMessage || 'Channeling arcane energies...' }}</p>
        <p class="text-muted/70 text-sm mt-2">Safe to close this tab — check your dashboard when ready.</p>
      </div>

      <ol class="space-y-3 mb-8 max-w-md mx-auto">
        <li
          v-for="(step, index) in ritualSteps"
          :key="step.key"
          :class="[
            'flex items-center gap-4 p-3 rounded-xl transition-all',
            index === activeIndex
              ? 'bg-gold/10 border border-gold/40 animate-pulse-glow'
              : index < activeIndex
                ? 'opacity-60'
                : 'opacity-35',
          ]"
        >
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              index === activeIndex
                ? 'bg-gold/20 text-gold'
                : index < activeIndex
                  ? 'bg-gold/10 text-gold/70'
                  : 'bg-surface-alt text-muted',
            ]"
          >
            <Loader2 v-if="index === activeIndex" class="w-5 h-5 animate-spin" />
            <component v-else :is="step.icon" class="w-5 h-5" aria-hidden="true" />
          </div>
          <span :class="['text-sm font-medium', index === activeIndex ? 'text-gold' : 'text-muted']">
            {{ step.label }}
          </span>
        </li>
      </ol>

      <div class="max-w-md mx-auto">
        <div class="flex justify-between text-xs text-muted mb-2">
          <span>{{ pollingProgressPercentage }}%</span>
          <span>Elapsed: {{ formatTime(pollingElapsedTime) }}</span>
        </div>
        <div class="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-gold to-ember transition-all duration-500"
            :style="{ width: pollingProgressPercentage + '%' }"
          />
        </div>
        <p class="text-muted/50 text-xs text-center mt-3 font-mono">Ref: {{ jobId.slice(0, 8) }}…</p>
      </div>
    </div>
  </UiCard>
</template>
