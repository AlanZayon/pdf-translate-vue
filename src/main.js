import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import { initThemeEarly } from './composables/useTheme.js';
import { initAnalytics, hasAnalyticsConsent } from './composables/useAnalytics.js';
import { createApp } from 'vue';
import { clerkPlugin } from '@clerk/vue';
import { initSentry } from './composables/useSentry.js';
import './style.css';
import App from './App.vue';
import router from './router/index.js';

initThemeEarly();

if (hasAnalyticsConsent()) {
  initAnalytics();
}

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = createApp(App);
app.use(router);
initSentry(app, router);

if (clerkKey) {
  app.use(clerkPlugin, {
    publishableKey: clerkKey,
    signInFallbackRedirectUrl: '/app',
    signUpFallbackRedirectUrl: '/app',
  });
}

app.mount('#app');
