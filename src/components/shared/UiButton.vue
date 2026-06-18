<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
});

const variantClasses = {
  primary:
    'bg-gold text-void hover:bg-[#dbb42e] shadow-gold hover:shadow-gold-lg hover:scale-[1.02] font-semibold',
  secondary:
    'border border-gold/50 text-gold bg-transparent hover:bg-gold/10 hover:border-gold',
  ghost: 'text-muted hover:text-text hover:bg-surface-alt/80',
  danger: 'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      variantClasses[variant],
      sizeClasses[size],
      block ? 'w-full' : '',
    ]"
  >
    <svg
      v-if="loading"
      class="w-5 h-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
      />
    </svg>
    <slot />
  </button>
</template>

<style scoped>
.shadow-gold {
  box-shadow: var(--shadow-gold);
}
.shadow-gold-lg {
  box-shadow: var(--shadow-gold-lg);
}
</style>
