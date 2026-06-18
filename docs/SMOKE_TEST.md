# Post-deploy smoke test — Arcane Forge

Run this checklist after deploying frontend (Vercel) and backend (Railway/Render) with production-like configuration.

## Prerequisites

- [ ] `AUTH_DEV_MODE=false` on backend
- [ ] `VITE_AUTH_DEV_MODE=false` on Vercel
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` set
- [ ] Clerk JWT configured on backend (`CLERK_JWKS_URL`, `CLERK_ISSUER`)
- [ ] Worker service running (`python worker.py`)
- [ ] Stripe webhook pointing to `https://<api>/billing/webhook`

## Checklist

### 1. Auth flow
- [ ] Open `/` — landing loads
- [ ] Click sign in — Clerk modal opens
- [ ] Complete signup — redirected to `/app`
- [ ] Refresh `/app` — still authenticated

### 2. Campaign generation
- [ ] Upload a small PDF (< 5 MB)
- [ ] Select Simple complexity + language
- [ ] Submit — processing ritual shows progress
- [ ] Job completes — manuscript renders with sessions/NPCs
- [ ] Export Markdown works

### 3. Paywall (402)
- [ ] As free user, select Medium complexity
- [ ] Generate — Upgrade modal appears
- [ ] "Buy 5 credits" or "Upgrade to Pro" opens Stripe checkout (test mode)

### 4. Billing
- [ ] Complete Stripe test checkout
- [ ] `/checkout/success?session_id=...` confirms payment
- [ ] Dashboard shows updated credits or plan
- [ ] Billing portal opens from dashboard

### 5. Pro features (after upgrade)
- [ ] Medium/Complex generation works
- [ ] PDF export downloads
- [ ] Share link created — `/c/:slug` loads publicly
- [ ] Share page shows "Made with Arcane Forge" footer

### 6. Failure handling
- [ ] Stop worker, submit job — eventually fails or times out
- [ ] Restart worker — new jobs process
- [ ] Failed job refunds credits (check dashboard balance)

### 7. Observability
- [ ] Trigger a test error — appears in Sentry (frontend + backend)
- [ ] PostHog receives `landing_view`, `signup_start`, `generate_complete`

### 8. Health
- [ ] `GET /health/ready` returns `ready: true` with database + redis checks
- [ ] `GET /status` returns queue info

## Stripe webhook replay test

1. In Stripe Dashboard → Webhooks → send test `checkout.session.completed`
2. Send the same event again
3. Verify credits/plan were applied **once** only (check `stripe_events` table or dashboard balance)

## Sign-off

| Check | Pass | Notes |
|-------|------|-------|
| Auth | | |
| Generation | | |
| Paywall | | |
| Billing | | |
| Pro features | | |
| Observability | | |

**Beta GO:** 6/8 sections pass  
**Public launch GO:** all sections pass + Stripe live mode tested
