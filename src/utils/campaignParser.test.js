import { describe, it, expect } from 'vitest';
import { parseCampaign, extractTitle, countSessions, getNavGroups } from '../utils/campaignParser.js';

const SAMPLE = `# The Shattered Crown of Valdris

## Overview
The kingdom fractures after the Crown shatters.

## Session 1: Thornwall Intrigue
**Objectives:** Secure the first shard clue.

**Scene A — The dying knight:** Social encounter.

**Combat:** 4 thugs + 1 mage.

## Session 2: The Ashen Gate
**Objectives:** Navigate the cursed ruin.

## Important NPCs
- **Seraphine Merrow:** Claimant; charismatic.
- **Brother Aldric:** Shard scholar.

## Rewards
Shard-touched weapons (+1), 800 gp.
`;

describe('campaignParser', () => {
  it('extracts title from H1', () => {
    expect(extractTitle(SAMPLE)).toBe('The Shattered Crown of Valdris');
  });

  it('counts sessions', () => {
    expect(countSessions(SAMPLE)).toBe(2);
  });

  it('parses structured sections', () => {
    const parsed = parseCampaign(SAMPLE);
    expect(parsed.title).toBe('The Shattered Crown of Valdris');
    const types = parsed.sections.map((s) => s.type);
    expect(types).toContain('overview');
    expect(types).toContain('session');
    expect(types).toContain('npcs');
    expect(types).toContain('rewards');
  });

  it('extracts session objectives and tags', () => {
    const parsed = parseCampaign(SAMPLE);
    const session = parsed.sections.find((s) => s.type === 'session' && s.number === 1);
    expect(session.objectives).toContain('Secure the first shard');
    expect(session.tags).toContain('Combat');
  });

  it('parses NPC roster', () => {
    const parsed = parseCampaign(SAMPLE);
    const npcs = parsed.sections.find((s) => s.type === 'npcs');
    expect(npcs.npcs.length).toBe(2);
    expect(npcs.npcs[0].name).toBe('Seraphine Merrow');
  });

  it('builds nav groups', () => {
    const parsed = parseCampaign(SAMPLE);
    const groups = getNavGroups(parsed);
    expect(groups.some((g) => g.id === 'sessions')).toBe(true);
    expect(groups.some((g) => g.id === 'npcs')).toBe(true);
  });
});
