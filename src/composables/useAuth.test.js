import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

describe('ensureAuthReady with Clerk (VITE_AUTH_DEV_MODE=false)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_AUTH_DEV_MODE', 'false');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_xxx');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('@clerk/vue');
  });

  it('updates isSignedIn on later ensureAuthReady after Clerk sign-in', async () => {
    const isLoaded = ref(true);
    const isSignedInClerk = ref(false);
    vi.doMock('@clerk/vue', () => ({
      useAuth: () => ({ isLoaded, isSignedIn: isSignedInClerk }),
      getToken: async () => 'tok',
      useClerk: () => ({ value: { openSignIn: () => {} } }),
    }));

    const auth = await import('./useAuth.js');
    expect(auth.isDevAuth).toBe(false);

    await auth.ensureAuthReady();
    expect(auth.authReady.value).toBe(true);
    expect(auth.isSignedIn.value).toBe(false);

    isSignedInClerk.value = true;
    await auth.ensureAuthReady();
    expect(auth.isSignedIn.value).toBe(true);
  });

  it('keeps isSignedIn in sync when Clerk session changes after first load', async () => {
    const isLoaded = ref(true);
    const isSignedInClerk = ref(false);
    vi.doMock('@clerk/vue', () => ({
      useAuth: () => ({ isLoaded, isSignedIn: isSignedInClerk }),
      getToken: async () => 'tok',
      useClerk: () => ({ value: { openSignIn: () => {} } }),
    }));

    const auth = await import('./useAuth.js');
    await auth.ensureAuthReady();
    expect(auth.isSignedIn.value).toBe(false);

    isSignedInClerk.value = true;
    expect(auth.isSignedIn.value).toBe(true);
  });
});
