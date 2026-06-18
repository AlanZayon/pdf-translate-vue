import { createRouter, createWebHistory } from 'vue-router';
import { applyRouteMeta } from '../composables/usePageMeta.js';

const LandingPage = () => import('../pages/LandingPage.vue');
const PricingPage = () => import('../pages/PricingPage.vue');
const LegalPage = () => import('../pages/LegalPage.vue');
const CampaignGenerator = () => import('../components/CampaignGenerator.vue');
const CampaignResultPage = () => import('../pages/CampaignResultPage.vue');
const DashboardPage = () => import('../pages/DashboardPage.vue');
const SharePage = () => import('../pages/SharePage.vue');
const CheckoutSuccessPage = () => import('../pages/CheckoutSuccessPage.vue');
const CheckoutCancelPage = () => import('../pages/CheckoutCancelPage.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingPage, meta: { title: 'Arcane Forge — RPG Campaign Generator' } },
    { path: '/pricing', name: 'pricing', component: PricingPage, meta: { title: 'Pricing — Arcane Forge', description: 'Arcane Forge pricing — Free, Pro, and Studio plans plus credit packs.' } },
    { path: '/terms', name: 'terms', component: LegalPage, props: { doc: 'terms' }, meta: { title: 'Terms of Service' } },
    { path: '/privacy', name: 'privacy', component: LegalPage, props: { doc: 'privacy' }, meta: { title: 'Privacy Policy' } },
    { path: '/upload-consent', name: 'upload-consent', component: LegalPage, props: { doc: 'upload' }, meta: { title: 'Upload Consent' } },
    { path: '/app', name: 'app', component: CampaignGenerator, meta: { requiresAuth: true, title: 'Forge — Arcane Forge' } },
    { path: '/app/result/:jobId', name: 'campaign-result', component: CampaignResultPage, meta: { requiresAuth: true, title: 'Your Campaign — Arcane Forge' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true, title: 'Dashboard — Arcane Forge' } },
    { path: '/c/:slug', name: 'share', component: SharePage, meta: { title: 'Shared Campaign — Arcane Forge', description: 'A shared RPG campaign generated with Arcane Forge.' } },
    { path: '/checkout/success', name: 'checkout-success', component: CheckoutSuccessPage, meta: { title: 'Subscription Active' } },
    { path: '/checkout/cancel', name: 'checkout-cancel', component: CheckoutCancelPage, meta: { title: 'Checkout Cancelled' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  applyRouteMeta(to);

  if (!to.meta.requiresAuth) return true;

  const { ensureAuthReady, isSignedIn, isDevAuth } = await import('../composables/useAuth.js');
  await ensureAuthReady();
  if (isSignedIn.value || isDevAuth) return true;
  return { name: 'landing', query: { signin: '1', redirect: to.fullPath } };
});

export default router;
