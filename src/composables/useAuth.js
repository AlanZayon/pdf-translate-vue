import { ref, computed } from 'vue';

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

export async function ensureAuthReady() {
  if (authReady.value) return;
  if (isDevAuth) {
    authReady.value = true;
    isSignedIn.value = true;
    return;
  }
  try {
    const { useAuth } = await import('@clerk/vue');
    const auth = useAuth();
    await new Promise((resolve) => {
      const check = () => {
        if (auth.isLoaded?.value !== false) {
          authReady.value = true;
          isSignedIn.value = auth.isSignedIn?.value ?? false;
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  } catch {
    authReady.value = true;
  }
}

export async function getAuthHeaders() {
  await ensureAuthReady();
  if (isDevAuth) {
    return { Authorization: 'Bearer dev-token' };
  }
  try {
    const { getToken } = await import('@clerk/vue');
    const token = await getToken();
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
  try {
    const { useClerk } = await import('@clerk/vue');
    const clerk = useClerk();
    clerk.value?.openSignIn?.();
  } catch {
    /* ignore */
  }
}

export const showAuthUI = computed(() => !isDevAuth && clerkPublishableKey);
