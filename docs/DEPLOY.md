# Infrastructure setup — Arcane Forge

This checklist covers everything **you** must configure outside the codebase. Complete these before running [SMOKE_TEST.md](./SMOKE_TEST.md).

## 1. Accounts to create

| Service | Purpose | URL |
|---------|---------|-----|
| Clerk | User authentication | https://clerk.com |
| Stripe | Billing (test → live) | https://stripe.com |
| Vercel | Frontend hosting | https://vercel.com |
| Railway or Render | Backend API + worker | https://railway.app or https://render.com |
| Upstash | Redis | https://upstash.com |
| AWS | S3 file storage | https://aws.amazon.com |
| Google AI Studio | Gemini API key | https://aistudio.google.com |
| Sentry | Error tracking | https://sentry.io |
| PostHog | Product analytics | https://posthog.com |
| Resend (optional) | Transactional email | https://resend.com |

## 2. Clerk

1. Create application (production instance)
2. Copy **Publishable key** → Vercel `VITE_CLERK_PUBLISHABLE_KEY`
3. Copy **JWKS URL** and **Issuer** → backend `CLERK_JWKS_URL`, `CLERK_ISSUER`
4. Add allowed redirect URLs: `https://arcaneforge.app/app`, `http://localhost:5173/app`

## 3. Stripe

1. Create products:
   - Pro Monthly ($12/mo)
   - Studio Monthly ($29/mo)
   - Credit pack 5 ($7 one-time)
   - Credit pack 20 ($24 one-time)
2. Copy price IDs → backend env vars `STRIPE_PRICE_*`
3. Copy **Secret key** → `STRIPE_SECRET_KEY`
4. Create webhook endpoint: `https://api.arcaneforge.app/billing/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
5. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

## 4. Railway / Render (backend)

Create **two services** from `python-gerador-inteligente-RPG`:

| Service | Start command | Procfile line |
|---------|---------------|---------------|
| API | `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120` | `web` |
| Worker | `python worker.py` | `worker` |

Attach **PostgreSQL** addon → auto-sets `DATABASE_URL`.

Set environment variables (see backend `.env.example`):

```
FLASK_ENV=production
AUTH_DEV_MODE=false
REDIS_URL=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
AWS_REGION=us-east-1
GEMINI_API_KEY=...
CLERK_JWKS_URL=...
CLERK_ISSUER=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_PRO_MONTHLY=...
STRIPE_PRICE_STUDIO_MONTHLY=...
STRIPE_PRICE_CREDITS_5=...
STRIPE_PRICE_CREDITS_20=...
CORS_ORIGINS=https://arcaneforge.app,https://www.arcaneforge.app
FRONTEND_URL=https://arcaneforge.app
SENTRY_DSN=...
USE_GHA_WORKER=false
```

## 5. AWS S3

1. Create bucket (e.g. `arcaneforge-prod`)
2. Create IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
3. Configure bucket CORS:

```json
[
  {
    "AllowedOrigins": ["https://arcaneforge.app", "http://localhost:5173"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

## 6. Vercel (frontend)

Environment variables:

```
VITE_API_URL=https://api.arcaneforge.app
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_AUTH_DEV_MODE=false
VITE_POSTHOG_KEY=phc_...
VITE_SENTRY_DSN=https://...@sentry.io/...
```

Connect custom domain `arcaneforge.app`.

## 7. DNS

| Record | Target |
|--------|--------|
| `arcaneforge.app` | Vercel |
| `api.arcaneforge.app` | Railway/Render API service |

## 8. Marketing assets (public launch)

- [ ] Export `public/og-image.png` (1200×630) from `public/og-image.svg`
- [ ] 4+ product screenshots
- [ ] 15–30s demo video
- [ ] Product Hunt listing
- [ ] Email `hello@arcaneforge.app` monitored

## 9. Deploy order

1. Backend API + Postgres + Redis + S3 + Gemini
2. Worker service (same env vars)
3. Verify `GET https://api.../health/ready` → `ready: true`
4. Frontend Vercel deploy
5. Configure Stripe webhook URL
6. Run [SMOKE_TEST.md](./SMOKE_TEST.md)

## 10. Switch to live billing

1. Stripe Dashboard → activate account
2. Replace test price IDs with live price IDs in backend env
3. Update webhook to live mode endpoint
4. Run one real micro-transaction to validate E2E
