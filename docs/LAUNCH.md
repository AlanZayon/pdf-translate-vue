# Arcane Forge — Product Hunt Launch Checklist

## Pre-launch

- [ ] Legal pages live (`/terms`, `/privacy`, `/upload-consent`) — **done in code**
- [ ] Stripe **live mode** tested end-to-end (Pro, Studio, credit packs) — see [DEPLOY.md](./DEPLOY.md)
- [ ] Clerk production instance configured — see [DEPLOY.md](./DEPLOY.md)
- [ ] Auth + paywall working (`402` → Upgrade modal → Checkout) — **done in code; validate via [SMOKE_TEST.md](./SMOKE_TEST.md)**
- [ ] OG image at `/og-image.png` (1200×630) — export from `public/og-image.svg`
- [ ] 4+ product screenshots prepared
- [ ] 15–30s demo video of the wizard
- [ ] Support email: hello@arcaneforge.app
- [ ] Sentry + PostHog production keys set — Sentry wired in code; set keys in Vercel/Railway
- [ ] Per-user rate limits (not shared API key)
- [ ] Refund policy documented on `/pricing` FAQ

## Launch day

- [ ] Product Hunt listing with tagline: *Turn any RPG PDF into a playable campaign*
- [ ] Monitor Sentry for errors
- [ ] Watch PostHog funnel: `landing_view` → `signup_start` → `generate_complete`
- [ ] Respond to PH comments within 2 hours

## North-star metrics (track weekly)

| Metric | Target |
|--------|--------|
| Activation (first campaign within 24h of signup) | > 40% |
| Free → paid conversion (30 days) | 3–5% |
| Avg cost per job vs credit price | < 30% COGS |
| MRR | Track in Stripe Dashboard |

## Growth loops (post-launch)

- Referral: +2 credits for referrer and referee
- "Made with Arcane Forge" footer on share links (`/c/:slug`)
- Creator affiliate program (20% rev share)

## Assets needed

1. **Logo** — favicon.svg (existing)
2. **OG image** — `public/og-image.png` (1200×630, dark theme + gold typography)
3. **Screenshots** — Landing, wizard step 1, processing, result manuscript
4. **Demo GIF/video** — Upload → configure → generate flow

## Support channel

- Email: hello@arcaneforge.app
- Response SLA: 24h on business days
- Escalation: system failures → auto credit refund (already implemented in worker)
