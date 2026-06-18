<script setup>
import { computed } from 'vue';
import SiteHeader from '../components/layout/SiteHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';

const DOCS = {
  terms: {
    title: 'Terms of Service',
    updated: 'June 16, 2026',
    sections: [
      {
        heading: '1. Service',
        body: 'Arcane Forge ("we", "the Service") provides AI-assisted RPG campaign generation from user-uploaded PDF documents. By using the Service you agree to these Terms.',
      },
      {
        heading: '2. Accounts',
        body: 'You must provide accurate account information. You are responsible for activity under your account and for keeping credentials secure.',
      },
      {
        heading: '3. Acceptable use',
        body: 'You may not abuse the API, attempt to bypass credit limits, upload malware, or use the Service to generate illegal content. We may suspend accounts that violate these rules.',
      },
      {
        heading: '4. Uploaded content',
        body: 'You represent that you have the right to upload and process each PDF. You grant us a limited license to process uploads solely to provide the Service. Input PDFs are deleted from storage after processing.',
      },
      {
        heading: '5. Generated content',
        body: 'Generated campaigns are licensed for personal tabletop use. Commercial redistribution requires a Studio subscription. See our Content License for details.',
      },
      {
        heading: '6. Billing',
        body: 'Paid plans renew automatically unless cancelled via the Stripe Customer Portal. Credit packs are non-refundable except where required by law or for system failures per our refund policy.',
      },
      {
        heading: '7. Disclaimer',
        body: 'The Service is provided "as is". AI output may contain errors. Always review campaigns before play.',
      },
      {
        heading: '8. Contact',
        body: 'Questions: hello@arcaneforge.app',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'June 16, 2026',
    sections: [
      {
        heading: 'Data we collect',
        body: 'Account email (via Clerk), usage analytics (PostHog, if consented), uploaded PDFs (temporarily), generated campaigns, billing metadata (via Stripe).',
      },
      {
        heading: 'How we use data',
        body: 'To provide the Service, enforce quotas, improve reliability, and communicate about your account. We do not sell personal data.',
      },
      {
        heading: 'Retention',
        body: 'Input PDFs are deleted after processing (typically within 24 hours). Campaign outputs are retained per your plan tier (7 days Free, 90 days Pro+).',
      },
      {
        heading: 'Third parties',
        body: 'We use Clerk (auth), Stripe (billing), AWS S3 (storage), Redis (queue), Google Gemini (generation), PostHog (analytics), and Sentry (errors).',
      },
      {
        heading: 'Your rights',
        body: 'You may request account deletion by contacting hello@arcaneforge.app.',
      },
      {
        heading: 'Cookies',
        body: 'We use essential cookies for authentication and optional analytics cookies with your consent.',
      },
    ],
  },
  upload: {
    title: 'Upload Consent',
    updated: 'June 16, 2026',
    sections: [
      {
        heading: 'Your confirmation',
        body: 'Before uploading a PDF to Arcane Forge, you must confirm that:',
      },
      {
        heading: 'Rights to use',
        body: 'You own the PDF, have purchased a legitimate copy, or otherwise have legal permission to use it for personal campaign preparation. You will not upload pirated or unlawfully distributed material.',
      },
      {
        heading: 'Publisher terms',
        body: "Some publishers restrict AI processing or third-party tools. You are responsible for complying with the original work's license and terms of use.",
      },
      {
        heading: 'No warranty on source material',
        body: 'Arcane Forge does not verify the legality of uploaded files. We may remove content and suspend accounts reported for copyright infringement.',
      },
      {
        heading: 'Processing',
        body: 'Uploaded PDFs are processed by our systems and AI providers solely to generate your campaign, then deleted from input storage per our retention policy.',
      },
    ],
  },
};

const props = defineProps({
  doc: { type: String, default: 'terms' },
});

const content = computed(() => DOCS[props.doc] || DOCS.terms);
</script>

<template>
  <div class="min-h-screen flex flex-col text-text bg-void">
    <SiteHeader />

    <main class="container mx-auto px-4 py-16 max-w-3xl flex-1">
      <h1 class="font-display text-3xl text-gold mb-2">{{ content.title }}</h1>
      <p class="text-muted text-sm mb-10">Last updated: {{ content.updated }}</p>

      <article v-for="section in content.sections" :key="section.heading" class="mb-8">
        <h2 class="font-display text-lg text-text mb-3">{{ section.heading }}</h2>
        <p class="text-muted leading-relaxed">{{ section.body }}</p>
      </article>
    </main>

    <AppFooter />
  </div>
</template>
