<script setup>
import { RouterLink } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader :show-nav="false" />
    <main class="flex-1 flex items-center justify-center px-4 py-20 text-center">
      <div class="max-w-md">
        <h1 class="font-display text-3xl text-gold mb-4">Checkout cancelled</h1>
        <p class="text-muted mb-8">No charges were made. You can upgrade anytime from the pricing page.</p>
        <RouterLink to="/pricing"><UiButton variant="primary">Back to pricing</UiButton></RouterLink>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
