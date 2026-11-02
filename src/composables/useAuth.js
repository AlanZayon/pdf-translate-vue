import { ref, computed, watch } from 'vue';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
export const authConfigError = ref('');

function resolveAuthDevMode() {
  if (import.meta.env.PROD) {
    if (import.meta.env.VITE_AUTH_DEV_MODE === 'true') {
      authConfigError.value =
        'VITE_AUTH_DEV_MODE must be false in production. Configure VITE_CLERK_PUBLISHABLE_KEY instead.';
      return false;
    }
    if (!clerkPublishableKey) {
      authConfigError.value =
        'VITE_CLERK_PUBLISHABLE_KEY is required in production. Add it to your Vercel environment variables.';
      return false;
    }
    return false;
  }
  return import.meta.env.VITE_AUTH_DEV_MODE === 'true' || !clerkPublishableKey;
}

export const isDevAuth = resolveAuthDevMode();
export const isSignedIn = ref(isDevAuth);
export const authReady = ref(isDevAuth);

let clerkAuth = null;
let clerkInstance = null;
const clerkBound = ref(false);

function waitFor(predicateRef, timeoutMs = 8000) {
  if (predicateRef.value) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      stop();
      resolve();
    }, timeoutMs);
    const stop = watch(
      predicateRef,
      (value) => {
        if (!value) return;
        clearTimeout(timer);
        stop();
        resolve();
      },
      { flush: 'sync' },
    );
  });
}

function waitUntilClerkLoaded(auth) {
  return new Promise((resolve) => {
    const check = () => {
      if (auth.isLoaded?.value !== false) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

function syncSignedInFromClerk(auth) {
  isSignedIn.value = !!auth.isSignedIn?.value;
}

/**
 * Bind Clerk composables from a Vue setup() context (App.vue).
 * Router guards cannot call useAuth() after await — inject() has no context.
 */
export function bindClerkAuth(auth, clerk = null) {
  clerkAuth = auth;
  clerkInstance = clerk;
  clerkBound.value = true;
  watch(
    () => [auth.isLoaded?.value, auth.isSignedIn?.value],
    () => {
      if (auth.isLoaded?.value === false) return;
      syncSignedInFromClerk(auth);
      authReady.value = true;
    },
    { immediate: true, flush: 'sync' },
  );
}

export async function ensureAuthReady() {
  if (isDevAuth) {
    authReady.value = true;
    isSignedIn.value = true;
    return;
  }
  if (!clerkPublishableKey) {
    authReady.value = true;
    return;
  }
  await waitFor(clerkBound);
  if (!clerkAuth) {
    authReady.value = true;
    return;
  }
  await waitUntilClerkLoaded(clerkAuth);
  syncSignedInFromClerk(clerkAuth);
  authReady.value = true;
}

async function resolveClerkToken() {
  const getToken = clerkAuth?.getToken;
  if (typeof getToken === 'function') {
    return getToken();
  }
  if (typeof getToken?.value === 'function') {
    return getToken.value();
  }
  const clerk = clerkInstance?.value ?? clerkInstance;
  if (clerk?.session?.getToken) {
    return clerk.session.getToken();
  }
  return null;
}

export async function getAuthHeaders() {
  await ensureAuthReady();
  if (isDevAuth) {
    // Homolog: second browser can `localStorage.setItem('devAuthToken','player-2')`
    const token =
      (typeof localStorage !== 'undefined' && localStorage.getItem('devAuthToken')) ||
      'dev-token';
    return { Authorization: `Bearer ${token}` };
  }
  try {
    const token = await resolveClerkToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    /* ignore */
  }
  return {};
}

export async function openSignIn() {
  if (isDevAuth) {
    isSignedIn.value = true;
    return;
  }
  const clerk = clerkInstance?.value ?? clerkInstance;
  clerk?.openSignIn?.();
}

export const showAuthUI = computed(() => !isDevAuth && clerkPublishableKey);
