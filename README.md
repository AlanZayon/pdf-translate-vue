# Arcane Forge — RPG Campaign Generator

Vue 3 SPA for uploading RPG PDF rulebooks and generating ready-to-play campaigns via the Flask API.

## Stack

- Vue 3 + Vite + Vue Router
- Tailwind CSS v4
- Clerk (auth), Stripe (billing via backend)
- PostHog (analytics), Sentry (errors)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to your Flask API (default `http://127.0.0.1:5000`).

For local dev without Clerk, leave `VITE_CLERK_PUBLISHABLE_KEY` empty and set `VITE_AUTH_DEV_MODE=true` (matches backend `AUTH_DEV_MODE=true`).

Start the backend and worker from [python-gerador-inteligente-RPG](../python-gerador-inteligente-RPG):

```bash
python app.py          # terminal 1
python worker.py       # terminal 2
```

## Production (Vercel)

1. Import this repo in Vercel
2. Set environment variables (see `.env.example`):
   - `VITE_API_URL` — production API URL
   - `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
   - `VITE_AUTH_DEV_MODE=false` — **required**
   - `VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN` — recommended
3. Deploy — `vercel.json` handles SPA routing and security headers

Ensure backend `CORS_ORIGINS` includes your Vercel domain and S3 bucket CORS allows browser fetch of campaign markdown.

See [docs/DEPLOY.md](docs/DEPLOY.md) for the full infrastructure checklist and [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for post-deploy validation.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run Vitest unit tests |

## Auth

Authentication uses **Clerk JWT** sent as `Authorization: Bearer <token>` on API requests. There is no frontend API key.

## Project structure

```
src/
├── pages/              # Landing, pricing, dashboard, legal, checkout
├── components/         # Wizard, billing, result manuscript
├── composables/        # Auth, analytics, theme, Sentry
├── services/           # campaignApi.js (axios client)
└── utils/              # Campaign parser, billing helpers
```
