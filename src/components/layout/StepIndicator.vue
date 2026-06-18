<script setup>
const props = defineProps({
  currentStep: { type: Number, default: 1 },
  maxReached: { type: Number, default: 1 },
});

const emit = defineEmits(['go-to']);

const steps = [
  { id: 1, label: 'Forge Settings' },
  { id: 2, label: 'Tome Upload' },
  { id: 3, label: 'Your Campaign' },
];

function canNavigate(stepId) {
  return stepId <= props.maxReached && stepId !== props.currentStep;
}
</script>

<template>
  <nav aria-label="Campaign creation steps" class="mb-8">
    <ol class="flex items-center justify-center gap-2 md:gap-0">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="flex items-center"
      >
        <button
          type="button"
          :disabled="!canNavigate(step.id)"
          :aria-current="currentStep === step.id ? 'step' : undefined"
          :class="[
            'flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all',
            currentStep === step.id
              ? 'text-gold'
              : step.id <= maxReached
                ? 'text-muted hover:text-text cursor-pointer'
                : 'text-muted/50 cursor-default',
          ]"
          @click="canNavigate(step.id) && emit('go-to', step.id)"
        >
          <span
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
              currentStep === step.id
                ? 'border-gold bg-gold/20 text-gold animate-pulse-glow'
                : step.id < currentStep
                  ? 'border-gold/60 bg-gold/10 text-gold'
                  : 'border-muted/30 bg-surface-alt text-muted',
            ]"
          >
            <svg
              v-if="step.id < currentStep"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else>{{ step.id }}</span>
          </span>
          <span class="text-xs sm:text-sm font-medium hidden sm:inline">{{ step.label }}</span>
        </button>
        <div
          v-if="index < steps.length - 1"
          class="hidden md:block w-12 lg:w-20 h-px mx-1"
          :class="step.id < currentStep ? 'bg-gold/50' : 'bg-muted/20'"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
