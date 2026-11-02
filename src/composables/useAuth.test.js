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

  it('does not call useAuth (router/async inject has no context) and still sees sign-in', async () => {
    vi.doMock('@clerk/vue', () => ({
      useAuth: () => {
        throw new Error('useAuth() requires setup/inject context');
      },
      useClerk: () => {
        throw new Error('useClerk() requires setup/inject context');
      },
    }));

    const auth = await import('./useAuth.js');
    expect(auth.isDevAuth).toBe(false);

    const isLoaded = ref(true);
    const isSignedInClerk = ref(false);
    auth.bindClerkAuth({ isLoaded, isSignedIn: isSignedInClerk });

    await auth.ensureAuthReady();
    expect(auth.authReady.value).toBe(true);
    expect(auth.isSignedIn.value).toBe(false);

    isSignedInClerk.value = true;
    await auth.ensureAuthReady();
    expect(auth.isSignedIn.value).toBe(true);
  });

  it('keeps isSignedIn in sync when Clerk session changes after bind', async () => {
    const auth = await import('./useAuth.js');
    const isLoaded = ref(true);
    const isSignedInClerk = ref(false);
    auth.bindClerkAuth({ isLoaded, isSignedIn: isSignedInClerk });

    await auth.ensureAuthReady();
    expect(auth.isSignedIn.value).toBe(false);

    isSignedInClerk.value = true;
    expect(auth.isSignedIn.value).toBe(true);
  });
});
