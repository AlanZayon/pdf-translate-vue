import { describe, it, expect } from 'vitest';
import { COMPLEXITY_MAP, BACKEND_TO_FRONTEND_COMPLEXITY } from './campaignApi.js';

describe('campaignApi constants', () => {
  it('maps frontend complexity ids to backend codes', () => {
    expect(COMPLEXITY_MAP.simple).toBe('simples');
    expect(COMPLEXITY_MAP.medium).toBe('mediana');
    expect(COMPLEXITY_MAP.complex).toBe('complexa');
  });

  it('maps backend complexity codes to frontend ids', () => {
    expect(BACKEND_TO_FRONTEND_COMPLEXITY.mediana).toBe('medium');
    expect(BACKEND_TO_FRONTEND_COMPLEXITY.complexa).toBe('complex');
  });
});
