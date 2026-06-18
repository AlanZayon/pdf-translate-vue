<script setup>
import { BookOpen } from '@lucide/vue';
import { RouterLink } from 'vue-router';

defineProps({
  selectedFile: { type: Object, default: null },
  dragOver: { type: Boolean, default: false },
  fileError: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  consentAccepted: { type: Boolean, default: false },
});

const emit = defineEmits([
  'select-file',
  'drop',
  'drag-over',
  'drag-leave',
  'clear-file',
  'update:consentAccepted',
]);
</script>

<template>
  <div>
    <div
      role="button"
      tabindex="0"
      aria-label="Upload PDF rulebook"
      :class="[
        'relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300',
        dragOver
          ? 'border-gold bg-gold/10 scale-[1.01] animate-pulse-glow'
          : 'border-gold/30 bg-surface-alt/50 hover:border-gold/60 hover:bg-surface-alt',
        disabled || !consentAccepted ? 'opacity-50 pointer-events-none' : '',
      ]"
      @click="emit('select-file')"
      @keydown.enter="emit('select-file')"
      @drop="emit('drop', $event)"
      @dragover="emit('drag-over', $event)"
      @dragleave="emit('drag-leave')"
    >
      <div
        class="w-20 h-20 mx-auto mb-5 rounded-2xl border border-gold/30 flex items-center justify-center bg-surface transition-transform duration-300"
        :class="dragOver ? 'scale-110' : ''"
      >
        <BookOpen class="w-10 h-10 text-gold" aria-hidden="true" />
      </div>

      <h3 class="font-display text-xl font-semibold text-text mb-2">
        {{ selectedFile ? selectedFile.name : 'Drop Your Tome Here' }}
      </h3>
      <p class="text-muted mb-1">
        {{ selectedFile ? 'PDF ready for the ritual' : 'Drag a PDF or click to browse' }}
      </p>
      <p v-if="!selectedFile" class="text-muted/70 text-sm">PDF only · max 50 MB</p>

      <button
        v-if="selectedFile && !disabled"
        type="button"
        class="mt-4 px-4 py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition"
        @click.stop="emit('clear-file')"
      >
        Remove file
      </button>
    </div>

    <label class="flex items-start gap-3 mt-6 cursor-pointer text-sm text-muted">
      <input
        type="checkbox"
        class="mt-1 accent-gold"
        :checked="consentAccepted"
        @change="emit('update:consentAccepted', $event.target.checked)"
      />
      <span>
        I confirm I have the legal right to upload and process this PDF for personal campaign
        preparation.
        <RouterLink to="/upload-consent" class="text-gold underline underline-offset-2" @click.stop>
          Upload Consent
        </RouterLink>
      </span>
    </label>

    <p v-if="fileError" class="mt-3 text-danger text-sm text-center" role="alert">
      {{ fileError }}
    </p>
  </div>
</template>
