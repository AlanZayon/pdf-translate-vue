<script setup>
const partyLevel = defineModel('partyLevel', { type: String, default: '' });
const tone = defineModel('tone', { type: String, default: 'heroic' });
const theme = defineModel('theme', { type: String, default: '' });

const tones = [
  { id: 'heroic', label: 'Heroic' },
  { id: 'gritty', label: 'Gritty' },
  { id: 'horror', label: 'Horror' },
  { id: 'comedy', label: 'Comedy' },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <label class="block text-sm text-muted mb-2">Party level (optional)</label>
      <input
        v-model="partyLevel"
        type="text"
        placeholder="e.g. 3-5"
        class="w-full rounded-xl border border-gold/25 bg-surface-alt px-4 py-3 text-text placeholder:text-muted/60 focus:border-gold focus:outline-none"
      />
    </div>
    <div>
      <label class="block text-sm text-muted mb-2">Tone</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in tones"
          :key="t.id"
          type="button"
          :class="[
            'px-4 py-2 rounded-lg text-sm border transition',
            tone === t.id
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-gold/20 text-muted hover:border-gold/40',
          ]"
          @click="tone = t.id"
        >
          {{ t.label }}
        </button>
      </div>
    </div>
    <div>
      <label class="block text-sm text-muted mb-2">Theme or hook (optional)</label>
      <input
        v-model="theme"
        type="text"
        placeholder="e.g. heist in a floating city"
        class="w-full rounded-xl border border-gold/25 bg-surface-alt px-4 py-3 text-text placeholder:text-muted/60 focus:border-gold focus:outline-none"
      />
    </div>
  </div>
</template>
