<script setup>
import { ref } from 'vue';
import { Download, FileText, Printer, Copy, Share2, ChevronDown } from '@lucide/vue';
import UiButton from '../shared/UiButton.vue';

defineProps({
  jobId: { type: String, default: '' },
  isShared: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'campaign' },
});

const emit = defineEmits(['download-md', 'download-pdf', 'print', 'copy', 'share']);

const open = ref(false);

function run(action) {
  open.value = false;
  emit(action);
}
</script>

<template>
  <div class="relative inline-flex">
    <UiButton variant="primary" size="lg" :loading="loading" @click="open = !open">
      <Download class="w-5 h-5" />
      Export
      <ChevronDown class="w-4 h-4 opacity-70" />
    </UiButton>

    <div
      v-if="open"
      class="export-menu absolute top-full left-0 mt-2 z-20 min-w-[200px] rounded-xl border border-gold/25 bg-surface shadow-lg py-1"
      @mouseleave="open = false"
    >
      <button v-if="jobId" type="button" class="export-item" @click="run('download-md')">
        <Download class="w-4 h-4" /> Download Markdown
      </button>
      <button v-if="jobId" type="button" class="export-item" @click="run('download-pdf')">
        <FileText class="w-4 h-4" /> Export PDF
      </button>
      <button type="button" class="export-item" @click="run('print')">
        <Printer class="w-4 h-4" /> Print
      </button>
      <button type="button" class="export-item" @click="run('copy')">
        <Copy class="w-4 h-4" /> Copy Markdown
      </button>
      <button v-if="jobId && !isShared" type="button" class="export-item" @click="run('share')">
        <Share2 class="w-4 h-4" /> Share Link
      </button>
    </div>
  </div>
</template>

<style scoped>
.export-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text);
  transition: background 0.15s;
}
.export-item:hover {
  background: color-mix(in srgb, var(--color-gold) 8%, transparent);
  color: var(--color-gold);
}
</style>
