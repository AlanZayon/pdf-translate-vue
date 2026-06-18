import * as Sentry from '@sentry/vue';

let initialized = false;

export function initSentry(app, router) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || initialized) return;
  initialized = true;

  Sentry.init({
    app,
    dsn,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
    environment: import.meta.env.PROD ? 'production' : 'development',
  });
}

export function captureException(error, context) {
  if (!initialized) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
