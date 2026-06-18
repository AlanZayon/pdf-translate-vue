<script setup>
defineProps({
  languages: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-muted mb-3 uppercase tracking-wider">
      Campaign Language
    </label>
    <div
      role="listbox"
      aria-label="Select campaign language"
      class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        type="button"
        role="option"
        :aria-selected="modelValue === lang.code"
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
          modelValue === lang.code
            ? 'border-gold bg-gold/15 text-gold shadow-gold'
            : 'border-muted/30 bg-surface-alt text-muted hover:border-gold/40 hover:text-text',
        ]"
        @click="emit('update:modelValue', lang.code)"
      >
        <span class="font-semibold">{{ lang.code.toUpperCase() }}</span>
        <span class="hidden sm:inline text-muted ml-1.5">· {{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.shadow-gold {
  box-shadow: var(--shadow-gold);
}
</style>
