import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (!key || initialized) return;
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: 'localStorage+cookie',
  });
  initialized = true;
}

export function trackEvent(name, props = {}) {
  if (!initialized) return;
  posthog.capture(name, props);
}

export function hasAnalyticsConsent() {
  try {
    return localStorage.getItem('arcane-cookie-consent') === 'accepted';
  } catch {
    return false;
  }
}

export function acceptAnalyticsConsent() {
  try {
    localStorage.setItem('arcane-cookie-consent', 'accepted');
  } catch {
    /* ignore */
  }
  initAnalytics();
}

export function declineAnalyticsConsent() {
  try {
    localStorage.setItem('arcane-cookie-consent', 'declined');
  } catch {
    /* ignore */
  }
}

export { posthog };
