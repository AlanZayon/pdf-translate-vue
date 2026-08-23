import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  SESSION_HEADING,
  SESSION_COUNT,
  OVERVIEW_HEADING,
  HOOK_HEADING,
  NPC_HEADING,
  ENEMIES_HEADING,
  PUZZLES_HEADING,
  ENDINGS_HEADING,
  MAPS_HEADING,
  REWARDS_HEADING,
  INSPIRED_HEADING,
  CHECKLIST_HEADING,
  KNOWN_SECTION_TITLE,
  OBJECTIVES,
  ROLE_LINE,
  sessionNumber,
} from './campaignI18n.js';

const WRAPPER_TITLE = /^RPG Campaign\b/i;
const NPC_LINE = /^[-*]\s+\*\*(.+?)\*\*[:\s—–-]+(.+)$/gm;
const TAG_FROM_HEADING = /\(([^)]+)\)\s*$/;

export function wordCount(text) {
  return (text.match(/\w+/g) || []).length;
}

export function countSessions(text) {
  const nums = [...(text || '').matchAll(new RegExp(SESSION_COUNT.source, 'gi'))]
    .map((m) => parseInt(m[1] || m[2] || m[3], 10))
    .filter((n) => Number.isFinite(n));
  if (nums.length) {
    return Math.max(...nums);
  }
  return 0;
}

export function slugifyTitle(title, maxLen = 60) {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, maxLen) || 'campaign'
  );
}

export function cleanHeadingText(raw) {
  return String(raw || '')
    .trim()
    .replace(/^\*{1,2}(.+?)\*{1,2}$/, '$1')
    .replace(/^`(.+?)`$/, '$1')
    .trim();
}

export function extractTitle(content) {
  const matches = [...(content || '').matchAll(/^#\s+(.+)$/gm)].map((m) =>
    cleanHeadingText(m[1]),
  );
  const literary = matches.filter(
    (t) => !WRAPPER_TITLE.test(t) && !KNOWN_SECTION_TITLE.test(t),
  );
  return literary[0] || matches.find((t) => !WRAPPER_TITLE.test(t)) || 'Campaign';
}

export function sessionTitle(heading) {
  return cleanHeadingText(heading)
    .replace(
      /^(?:session|sessão|sessao|sesión|sesion|séance|sitzung|sessione|セッション|세션|сессия|回合)\s*\d+\s*(?:\([^)]+\))?\s*[:.\-—–]?\s*/i,
      '',
    )
    .replace(/^(?:第)\s*\d+\s*(?:セッション|話|回|节|節|幕)?\s*[:.\-—–]?\s*/i, '')
    .replace(/^(?:제)\s*\d+\s*세션?\s*[:.\-—–]?\s*/i, '')
    .trim();
}

function classifyHeading(heading) {
  if (SESSION_HEADING.test(heading)) return 'session';
  if (OVERVIEW_HEADING.test(heading)) return 'overview';
  if (HOOK_HEADING.test(heading)) return 'hook';
  if (NPC_HEADING.test(heading)) return 'npcs';
  if (ENEMIES_HEADING.test(heading)) return 'enemies';
  if (PUZZLES_HEADING.test(heading)) return 'puzzles';
  if (ENDINGS_HEADING.test(heading)) return 'endings';
  if (MAPS_HEADING.test(heading)) return 'maps';
  if (REWARDS_HEADING.test(heading)) return 'rewards';
  if (CHECKLIST_HEADING.test(heading)) return 'checklist';
  if (INSPIRED_HEADING.test(heading)) return 'inspired';
  return 'generic';
}

function inferTagsFromText(text) {
  const tags = [];
  const lower = text.toLowerCase();
  if (/\bcombat\b|combate|battle|batalha/.test(lower)) tags.push('Combat');
  if (/roleplay|interpretação|interpretacao|negotiation|social/.test(lower)) tags.push('Roleplay');
  if (/puzzle|enigma|quebra-cabeça/.test(lower)) tags.push('Puzzle');
  if (/investigation|investigação|investigacao/.test(lower)) tags.push('Investigation');
  return tags;
}

function classifyBeat(heading) {
  const h = heading.toLowerCase();
  if (/encounter|encontro|encuentro|rencontre|begegnung|incontro|遭遇|조우|遭遇|столкновение/i.test(h))
    return 'encounter';
  if (/scene|cena|escena|scène|szene|scena|シーン|장면|场景|сцена/i.test(h)) return 'scene';
  if (/treasure|loot|tesouro|recompensa/.test(h)) return 'treasure';
  if (/investigation path|path [a-z]|caminho/.test(h)) return 'path';
  if (/puzzle|enigma/.test(h)) return 'puzzle';
  if (/ending|final\b/.test(h)) return 'ending';
  if (/map\b|mapa/.test(h)) return 'map';
  return 'beat';
}

function tagsFromHeading(heading) {
  const match = heading.match(TAG_FROM_HEADING);
  if (!match) return inferTagsFromText(heading);
  return inferTagsFromText(match[1]);
}

export function splitSubheadings(body) {
  const parts = (body || '').split(/^###\s+(.+)$/m);
  const intro = (parts[0] || '').trim();
  const blocks = [];
  for (let i = 1; i < parts.length - 1; i += 2) {
    const heading = cleanHeadingText(parts[i]);
    const content = (parts[i + 1] || '').trim();
    blocks.push({
      heading,
      content,
      html: markdownToHtml(content),
      kind: classifyBeat(heading),
      tags: tagsFromHeading(heading),
    });
  }
  return { intro, blocks };
}

function parseSessionBody(body) {
  const { intro, blocks } = splitSubheadings(body);
  const objectivesMatch = body.match(OBJECTIVES);
  let objectives = objectivesMatch ? objectivesMatch[1].trim() : '';
  if (objectives && /^[-*]/m.test(objectives)) {
    objectives = objectives
      .split('\n')
      .map((line) => line.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)
      .join('\n');
  }
  const introWithoutObjectives = objectivesMatch
    ? intro.replace(objectivesMatch[0], '').replace(/^---\s*/, '').trim()
    : intro;
  const tags = [...new Set(blocks.flatMap((b) => b.tags).concat(inferTagsFromText(body)))];
  return {
    objectives,
    beats: blocks,
    intro,
    introHtml: markdownToHtml(introWithoutObjectives),
    tags,
  };
}

function parseNpcsFromBlocks(blocks, body) {
  if (blocks.length) {
    return blocks.map((block) => {
      const roleMatch = block.content.match(ROLE_LINE);
      const firstPara = block.content
        .replace(ROLE_LINE, '')
        .replace(/^#{1,3}.*$/m, '')
        .trim()
        .split('\n\n')[0]
        .replace(/\*\*/g, '')
        .slice(0, 220);
      return {
        name: block.heading,
        role: roleMatch ? roleMatch[1].trim() : '',
        description: firstPara,
        html: block.html,
      };
    });
  }

  const npcs = [];
  let match;
  const re = new RegExp(NPC_LINE.source, NPC_LINE.flags);
  while ((match = re.exec(body)) !== null) {
    npcs.push({
      name: match[1].trim().replace(/:$/, ''),
      description: match[2].trim(),
      role: '',
      html: '',
    });
  }
  if (!npcs.length) {
    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('-') && !trimmed.startsWith('*')) continue;
      const text = trimmed.replace(/^[-*]\s+/, '');
      if (text.includes('**')) {
        const parts = text.split('**');
        if (parts.length >= 3) {
          npcs.push({
            name: parts[1].trim().replace(/:$/, ''),
            description: parts[2].replace(/^[:—–-\s]+/, '').trim(),
            role: '',
            html: '',
          });
        }
      } else if (text.includes(':')) {
        const [name, ...rest] = text.split(':');
        npcs.push({
          name: name.replace(/^\*\*|\*\*$/g, '').trim().replace(/:$/, ''),
          description: rest.join(':').trim(),
          role: '',
          html: '',
        });
      }
    }
  }
  return npcs;
}

function markdownToHtml(content) {
  marked.setOptions({ breaks: true, gfm: true });
  const html = marked.parse(content || '');
  if (typeof DOMPurify?.sanitize === 'function') {
    return DOMPurify.sanitize(html);
  }
  return html;
}

export function parseCampaign(content) {
  if (!content) {
    return {
      title: 'Campaign',
      preamble: '',
      sections: [],
      stats: { wordCount: 0, sessionCount: 0, estimatedReadMinutes: 1 },
      fallbackHtml: '',
    };
  }

  const title = extractTitle(content);
  const parts = content.split(/^##\s+(.+)$/m);
  const preamble = parts[0]?.trim() || '';
  const sections = [];

  for (let i = 1; i < parts.length - 1; i += 2) {
    const heading = cleanHeadingText(parts[i]);
    const body = parts[i + 1].trim();
    const type = classifyHeading(heading);
    if (type === 'inspired') continue;

    const { intro, blocks } = splitSubheadings(body);
    const section = {
      type,
      heading,
      content: body,
      html: markdownToHtml(body),
      introHtml: markdownToHtml(intro),
      blocks,
      id: `sec-${sections.length}`,
    };

    if (type === 'session') {
      section.number =
        sessionNumber(heading) || sections.filter((s) => s.type === 'session').length + 1;
      Object.assign(section, parseSessionBody(body));
    } else if (type === 'npcs') {
      section.npcs = parseNpcsFromBlocks(blocks, body);
    }
    sections.push(section);
  }

  const wc = wordCount(content);
  const sc = countSessions(content);

  return {
    title,
    preamble,
    preambleHtml: markdownToHtml(
      preamble.replace(/^#\s+.+$/m, '').replace(WRAPPER_TITLE, '').trim(),
    ),
    sections,
    stats: {
      wordCount: wc,
      sessionCount: sc,
      estimatedReadMinutes: Math.max(1, Math.floor(wc / 200)),
    },
    fallbackHtml: markdownToHtml(content),
  };
}

export function getNavGroups(parsed) {
  const groups = [];
  const sessions = parsed.sections.filter((s) => s.type === 'session');
  const overview = parsed.sections.filter((s) => ['overview', 'hook'].includes(s.type));
  const npcs = parsed.sections.filter((s) => s.type === 'npcs');
  const table = parsed.sections.filter((s) =>
    ['enemies', 'puzzles', 'maps', 'rewards'].includes(s.type),
  );
  const aftermath = parsed.sections.filter((s) =>
    ['endings', 'checklist', 'generic'].includes(s.type),
  );

  if (overview.length) groups.push({ id: 'overview', label: 'Overview', sectionIds: overview.map((s) => s.id) });
  if (sessions.length) groups.push({ id: 'sessions', label: 'Sessions', sectionIds: sessions.map((s) => s.id) });
  if (npcs.length) groups.push({ id: 'npcs', label: 'NPCs', sectionIds: npcs.map((s) => s.id) });
  if (table.length) groups.push({ id: 'table', label: 'Table', sectionIds: table.map((s) => s.id) });
  if (aftermath.length) groups.push({ id: 'extras', label: 'Extras', sectionIds: aftermath.map((s) => s.id) });
  return groups;
}
