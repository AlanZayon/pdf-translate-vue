/**
 * Choose Stripe price_key based on quota/paywall API payload.
 */
export function resolveUpgradePriceKey(payload) {
  if (!payload) return 'pro_monthly';
  if (payload.error === 'insufficient_credits') return 'credits_5';
  if (payload.error === 'plan_restriction') return 'pro_monthly';
  return 'pro_monthly';
}

export function isInsufficientCredits(payload) {
  return payload?.error === 'insufficient_credits';
}
