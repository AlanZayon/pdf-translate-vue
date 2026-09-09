<script setup>
import { Users } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  partySize: { type: Number, default: 3 },
});

const emit = defineEmits(['update:modelValue', 'update:partySize']);

function onToggle() {
  emit('update:modelValue', !props.modelValue);
}

function onPartySizeInput(event) {
  const raw = parseInt(event.target.value, 10);
  const clamped = Math.max(1, Math.min(5, Number.isNaN(raw) ? 3 : raw));
  emit('update:partySize', clamped);
}
</script>

<template>
  <div class="rounded-2xl border border-muted/20 bg-surface-alt p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Users class="w-5 h-5 text-gold mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <h4 class="font-medium text-text">Character Sheets</h4>
          <p class="text-sm text-muted mt-1">
            Upload PDF character sheets so the campaign is tailored to your party.
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :class="[
          'relative w-12 h-7 rounded-full transition-colors shrink-0',
          modelValue ? 'bg-gold' : 'bg-muted/40',
        ]"
        @click="onToggle"
      >
        <span
          :class="[
            'absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform',
            modelValue ? 'translate-x-5' : '',
          ]"
        />
      </button>
    </div>

    <div v-if="modelValue" class="mt-4 flex items-center gap-3">
      <label for="party-size" class="text-sm text-muted">Players</label>
      <input
        id="party-size"
        type="number"
        min="1"
        max="5"
        :value="partySize"
        class="w-16 px-2 py-1 rounded-lg bg-surface border border-muted/30 text-text text-center"
        @input="onPartySizeInput"
      />
      <span class="text-xs text-muted">max 5</span>
    </div>
  </div>
</template>
