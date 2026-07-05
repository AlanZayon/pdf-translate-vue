<script setup>
import { computed } from 'vue';
import { FileText, X } from '@lucide/vue';

const props = defineProps({
  partySize: { type: Number, default: 3 },
  sheets: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:sheets']);

const filledCount = computed(() => props.sheets.filter(Boolean).length);

function triggerUpload(index) {
  if (props.disabled) return;
  const input = document.getElementById(`sheet-input-${index}`);
  input?.click();
}

function onFileChange(index, event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return;
  }
  const next = [...props.sheets];
  while (next.length < props.partySize) next.push(null);
  next[index] = file;
  emit('update:sheets', next.slice(0, props.partySize));
  event.target.value = '';
}

function clearSlot(index) {
  const next = [...props.sheets];
  next[index] = null;
  emit('update:sheets', next);
}
</script>

<template>
  <div>
    <p class="text-sm text-muted mb-4">
      Upload one PDF per player ({{ filledCount }}/{{ partySize }} ready)
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="i in partySize"
        :key="i"
        class="relative rounded-xl border-2 border-dashed p-4 transition-colors"
        :class="sheets[i - 1] ? 'border-gold/50 bg-gold/5' : 'border-muted/25 bg-surface-alt/50'"
      >
        <input
          :id="`sheet-input-${i - 1}`"
          type="file"
          accept=".pdf,application/pdf"
          class="hidden"
          :disabled="disabled"
          @change="onFileChange(i - 1, $event)"
        />

        <button
          type="button"
          class="w-full text-left"
          :disabled="disabled"
          @click="triggerUpload(i - 1)"
        >
          <div class="flex items-center gap-3">
            <FileText class="w-8 h-8 text-gold shrink-0" aria-hidden="true" />
            <div class="min-w-0">
              <p class="font-medium text-text text-sm">Player {{ i }}</p>
              <p class="text-xs text-muted truncate">
                {{ sheets[i - 1]?.name || 'Click to upload PDF' }}
              </p>
            </div>
          </div>
        </button>

        <button
          v-if="sheets[i - 1] && !disabled"
          type="button"
          class="absolute top-2 right-2 p-1 text-muted hover:text-danger transition"
          aria-label="Remove file"
          @click.stop="clearSlot(i - 1)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
