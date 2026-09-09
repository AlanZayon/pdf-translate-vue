import { createRouter, createWebHistory } from 'vue-router';
import { applyRouteMeta } from '../composables/usePageMeta.js';

const LandingPage = () => import('../pages/LandingPage.vue');
const LegalPage = () => import('../pages/LegalPage.vue');
const CampaignGenerator = () => import('../components/CampaignGenerator.vue');
const CampaignResultPage = () => import('../pages/CampaignResultPage.vue');
const DashboardPage = () => import('../pages/DashboardPage.vue');
const SharePage = () => import('../pages/SharePage.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingPage, meta: { title: 'Arcane Forge — RPG Campaign Generator' } },
    { path: '/terms', name: 'terms', component: LegalPage, props: { doc: 'terms' }, meta: { title: 'Terms of Service' } },
    { path: '/privacy', name: 'privacy', component: LegalPage, props: { doc: 'privacy' }, meta: { title: 'Privacy Policy' } },
    { path: '/upload-consent', name: 'upload-consent', component: LegalPage, props: { doc: 'upload' }, meta: { title: 'Upload Consent' } },
    { path: '/app', name: 'app', component: CampaignGenerator, meta: { requiresAuth: true, title: 'Forge — Arcane Forge' } },
    { path: '/app/result/:jobId', name: 'campaign-result', component: CampaignResultPage, meta: { requiresAuth: true, title: 'Your Campaign — Arcane Forge' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true, title: 'Dashboard — Arcane Forge' } },
    { path: '/campaigns/:campaignId', name: 'campaign', component: () => import('../pages/CampaignPage.vue'), meta: { requiresAuth: true, title: 'Campaign — Arcane Forge' } },
    { path: '/sessions/:sessionId', name: 'lobby', component: () => import('../pages/LobbyPage.vue'), meta: { requiresAuth: true, title: 'Lobby — Arcane Forge' } },
    { path: '/join', name: 'join', component: () => import('../pages/JoinSessionPage.vue'), meta: { requiresAuth: true, title: 'Join Session — Arcane Forge' } },
    { path: '/c/:slug', name: 'share', component: SharePage, meta: { title: 'Shared Campaign — Arcane Forge', description: 'A shared RPG campaign generated with Arcane Forge.' } },
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
