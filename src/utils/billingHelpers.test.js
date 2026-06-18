import { describe, expect, it } from 'vitest';
import { isInsufficientCredits, resolveUpgradePriceKey } from './billingHelpers.js';

describe('resolveUpgradePriceKey', () => {
  it('returns pro_monthly for plan restriction', () => {
    expect(resolveUpgradePriceKey({ error: 'plan_restriction' })).toBe('pro_monthly');
  });

  it('returns credits_5 for insufficient credits', () => {
    expect(
      resolveUpgradePriceKey({
        error: 'insufficient_credits',
        credits_required: 2,
        credits_available: 0,
      }),
    ).toBe('credits_5');
  });

  it('defaults to pro_monthly', () => {
    expect(resolveUpgradePriceKey(null)).toBe('pro_monthly');
  });
});

describe('isInsufficientCredits', () => {
  it('detects insufficient credits payload', () => {
    expect(isInsufficientCredits({ error: 'insufficient_credits' })).toBe(true);
    expect(isInsufficientCredits({ error: 'plan_restriction' })).toBe(false);
  });
});
