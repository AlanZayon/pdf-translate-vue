<script setup>
const model = defineModel({ type: String, default: 'generic' });

defineProps({
  presets: { type: Object, default: () => ({}) },
});
</script>

<template>
  <div>
    <label class="block text-sm text-muted mb-2">System preset</label>
    <div class="grid sm:grid-cols-2 gap-3">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        :class="[
          'text-left p-4 rounded-xl border transition',
          model === preset.id
            ? 'border-gold bg-gold/10 text-text'
            : 'border-gold/20 bg-surface-alt/50 text-muted hover:border-gold/40',
        ]"
        @click="model = preset.id"
      >
        <span class="font-medium text-text block">{{ preset.name }}</span>
        <span class="text-xs mt-1 block">{{ preset.description }}</span>
      </button>
    </div>
  </div>
</template>
