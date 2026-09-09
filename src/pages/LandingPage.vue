<script setup>
import { onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import UiButton from '../components/shared/UiButton.vue';
import { Sparkles, BookOpen, Wand2, ChevronRight } from '@lucide/vue';
import { trackEvent } from '../composables/useAnalytics.js';
import { openSignIn } from '../composables/useAuth.js';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  trackEvent('landing_view');
  if (route.query.signin === '1') {
    openSignIn().then(() => {
      const redirect = route.query.redirect || '/app';
      router.replace(redirect);
    });
  }
});

const steps = [
  { icon: BookOpen, title: 'Upload your rulebook', desc: 'Drop any RPG PDF — adventures, settings, or core rules.' },
  { icon: Wand2, title: 'Configure the ritual', desc: 'Pick language, complexity, and system preset.' },
  { icon: Sparkles, title: 'Play tonight', desc: 'Get a complete, GM-ready campaign in minutes.' },
];
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main>
      <section class="container mx-auto px-4 py-16 md:py-24 text-center">
        <p class="text-gold text-sm uppercase tracking-widest mb-4">AI-powered tabletop prep</p>
        <h1 class="font-display text-4xl md:text-6xl font-bold text-gold mb-6 max-w-3xl mx-auto leading-tight">
          Forge ready-to-play RPG campaigns from any rulebook PDF
        </h1>
        <p class="text-muted text-lg max-w-2xl mx-auto mb-10">
          Arcane Forge reads your PDF, understands the system, and generates a complete campaign —
          sessions, NPCs, encounters, and hooks included.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/app">
            <UiButton variant="primary" size="lg">
              Open the Forge
              <ChevronRight class="w-5 h-5" />
            </UiButton>
          </RouterLink>
        </div>
      </section>

      <section class="container mx-auto px-4 py-16 border-t border-gold/10">
        <h2 class="font-display text-2xl text-center text-gold mb-12">How it works</h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <article v-for="(step, i) in steps" :key="step.title" class="text-center p-6">
            <div class="w-14 h-14 mx-auto mb-4 rounded-xl border border-gold/30 flex items-center justify-center bg-surface">
              <component :is="step.icon" class="w-7 h-7 text-gold" />
            </div>
            <p class="text-gold/60 text-sm mb-2">Step {{ i + 1 }}</p>
            <h3 class="font-display text-lg text-text mb-2">{{ step.title }}</h3>
            <p class="text-muted text-sm">{{ step.desc }}</p>
          </article>
        </div>
      </section>

      <section class="container mx-auto px-4 py-16 border-t border-gold/10">
        <div class="max-w-3xl mx-auto bg-surface border border-gold/20 rounded-2xl p-8 md:p-10">
          <h2 class="font-display text-2xl text-gold mb-4">Why not just use ChatGPT?</h2>
          <ul class="space-y-3 text-muted">
            <li>✦ Purpose-built wizard — no prompt engineering required</li>
            <li>✦ Reads your actual PDF, not a pasted excerpt</li>
            <li>✦ Structured output: sessions, NPCs, encounters, rewards</li>
            <li>✦ System presets for D&amp;D 5e, Pathfinder 2e, and more</li>
            <li>✦ Save, re-download, and share campaigns from your dashboard</li>
          </ul>
        </div>
      </section>

      <section class="container mx-auto px-4 py-16 border-t border-gold/10 text-center">
        <h2 class="font-display text-2xl text-gold mb-4">Ready to run your next session?</h2>
        <p class="text-muted mb-8">Personal project — generate campaigns from your rulebook PDFs.</p>
        <RouterLink to="/app">
          <UiButton variant="primary" size="lg" @click="trackEvent('signup_start')">
            Open the Forge
          </UiButton>
        </RouterLink>
      </section>
    </main>

    <AppFooter />
  </div>
</template>
