import { describe, it, expect } from 'vitest';
import {
  parseCampaign,
  extractTitle,
  countSessions,
  getNavGroups,
  sessionTitle,
} from '../utils/campaignParser.js';

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

const RICH = `# RPG Campaign — MEDIUM

**Duration**: 3-4 sessions

## Inspired by your book
- Setting
- Excerpt

# The Shattered Oath: A Campaign of Broken Covenants

## Overview
A sacred pact has fractured between sun and root.

## Starting Hook: The Fracture
The sky splits with a wound of green light.

## Session 1: Gathering Storm
**Session Objectives:**
- Meet the council
- Survive the ambush

### Scene 1: Arrival at Goldleaf Crossing
Alderman Thorne intercepts you at the gate.

> "Thank the gods. You have arrived at a critical moment."

### Encounter 1A: The Council of Conflicting Truths (Roleplay/Negotiation)
Sister Meridith presents first.

### Encounter 1B: Ambush on the Road (Combat)
Bandits loyal to neither side.

## Session 2: Fractured Truths
### Investigation Path A: The Sunspire Shrine
The altar is cracked.

## Important NPCs
### Sister Meridith
**Role:** Temple Representative, Ally
A human cleric in her 40s with silver-streaked hair.

### Spoke-Antler
**Role:** Druidic Ally
A half-elf druid marked with ritual scars.

## Enemies and Creatures
### Combat Encounter Statistics
| Creature | AC | HP |
| --- | --- | --- |
| Bandit | 13 | 22 |

## Possible Endings
### Ending 1: Combat Victory
The nexus is destroyed.

### Ending 2: Negotiated Peace
Both sides stand down.

## Maps and Locations
### Map 1: Goldleaf Crossing
A trading town at three roads.
`;

describe('campaignParser', () => {
  it('extracts title from H1', () => {
    expect(extractTitle(SAMPLE)).toBe('The Shattered Crown of Valdris');
  });

  it('prefers the literary title over the wrapper heading', () => {
    expect(extractTitle(RICH)).toBe('The Shattered Oath: A Campaign of Broken Covenants');
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

  it('parses rich H3 sessions, NPC roles, and extra section types', () => {
    const parsed = parseCampaign(RICH);
    expect(parsed.title).toBe('The Shattered Oath: A Campaign of Broken Covenants');
    expect(parsed.sections.some((s) => s.type === 'inspired')).toBe(false);

    const session = parsed.sections.find((s) => s.type === 'session' && s.number === 1);
    expect(sessionTitle(session.heading)).toBe('Gathering Storm');
    expect(session.beats.length).toBeGreaterThanOrEqual(3);
    expect(session.beats[0].kind).toBe('scene');
    expect(session.beats.some((b) => b.tags.includes('Combat'))).toBe(true);
    expect(session.beats.some((b) => b.kind === 'encounter')).toBe(true);
    expect(session.objectives).toContain('Meet the council');
    expect(session.tags).toContain('Roleplay');

    const npcs = parsed.sections.find((s) => s.type === 'npcs');
    expect(npcs.npcs.map((n) => n.name)).toEqual(['Sister Meridith', 'Spoke-Antler']);
    expect(npcs.npcs[0].role).toMatch(/Temple Representative/i);

    const types = parsed.sections.map((s) => s.type);
    expect(types).toContain('enemies');
    expect(types).toContain('endings');
    expect(types).toContain('maps');
    expect(parsed.sections.find((s) => s.type === 'endings').blocks).toHaveLength(2);
  });

  it('recognizes Spanish, German, and Japanese section headings', () => {
    const es = parseCampaign(
      '# Título\n\n## Visión general\nTexto.\n\n## Sesión 1: Inicio\nGo.\n\n## PNJs importantes\n### Ana\nHola.\n',
    );
    expect(es.sections.map((s) => s.type)).toEqual(['overview', 'session', 'npcs']);
    expect(es.sections.find((s) => s.type === 'session').number).toBe(1);

    const de = parseCampaign(
      '# Titel\n\n## Überblick\nText.\n\n## Sitzung 2: Nacht\nGo.\n\n## Wichtige NSCs\nMira.\n',
    );
    expect(de.sections.map((s) => s.type)).toContain('overview');
    expect(de.sections.find((s) => s.type === 'session').number).toBe(2);

    const ja = parseCampaign(
      '# 題\n\n## 概要\n本文。\n\n## セッション 1: 始まり\nGo.\n\n## 重要NPC\nミラ。\n',
    );
    expect(ja.sections.map((s) => s.type)).toEqual(['overview', 'session', 'npcs']);
  });
});
