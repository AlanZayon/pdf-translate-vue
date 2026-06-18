<template>
  <div class="campaign-reveal">
    <slot />
  </div>
</template>

<style scoped>
.campaign-reveal {
  animation: reveal-in 0.6s ease-out both;
}
@keyframes reveal-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
