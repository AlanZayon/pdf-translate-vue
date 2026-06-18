import { marked } from 'marked';
import DOMPurify from 'dompurify';

const SESSION_HEADING = /^(?:session|sessão|sessao)\s*#?\s*(\d+)/i;
const OVERVIEW_HEADING = /overview|visão geral|visao geral|sinopse/i;
const HOOK_HEADING = /starting hook|gancho|hook inicial|opening hook/i;
const NPC_HEADING = /important npcs?|npcs?|personagens|pnjs?/i;
const REWARDS_HEADING = /rewards?|recompensas?|treasure|tesouro/i;
const INSPIRED_HEADING = /inspired by|inspirado/i;
const NPC_LINE = /^[-*]\s+\*\*(.+?)\*\*[:\s—–-]+(.+)$/gm;
const OBJECTIVES = /\*\*(?:objectives?|objetivos?)[:\s]*\*\*[:\s]*([\s\S]+?)(?=\n\*\*|\n##|$)/i;
const SCENE = /\*\*(?:scene|scena|cena)\s*([A-Z0-9])?[:\s—–-]*\*\*[:\s—–-]*([\s\S]+?)(?=\n\*\*(?:scene|scena|cena|combat|puzzle|boss)|\n##|$)/gi;
const COMBAT = /\*\*(?:combat|combate|boss)[:\s]*\*\*[:\s]*([\s\S]+?)(?=\n\*\*|\n##|$)/i;
const PUZZLE = /\*\*(?:puzzle|quebra-cabeça|enigma)[:\s]*\*\*[:\s]*([\s\S]+?)(?=\n\*\*|\n##|$)/i;

export function wordCount(text) {
  return (text.match(/\w+/g) || []).length;
}

export function countSessions(text) {
  const matches = [...text.matchAll(/(?:session|sessão|sessao)\s*#?\s*(\d+)/gi)];
  if (matches.length) {
    return Math.max(...matches.map((m) => parseInt(m[1], 10)));
  }
  return (text.match(/##\s*(?:Session|Sessão|Sessao)\s*\d/gi) || []).length;
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

export function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Campaign';
}

function classifyHeading(heading) {
  if (SESSION_HEADING.test(heading)) return 'session';
  if (OVERVIEW_HEADING.test(heading)) return 'overview';
  if (HOOK_HEADING.test(heading)) return 'hook';
  if (NPC_HEADING.test(heading)) return 'npcs';
  if (REWARDS_HEADING.test(heading)) return 'rewards';
  if (INSPIRED_HEADING.test(heading)) return 'inspired';
  return 'generic';
}

function parseSessionBody(body) {
  const objectivesMatch = body.match(OBJECTIVES);
  const scenes = [];
  let sceneMatch;
  const sceneRe = new RegExp(SCENE.source, SCENE.flags);
  while ((sceneMatch = sceneRe.exec(body)) !== null) {
    scenes.push({ label: (sceneMatch[1] || '').trim(), text: sceneMatch[2].trim() });
  }
  const combatMatch = body.match(COMBAT);
  const puzzleMatch = body.match(PUZZLE);
  const tags = [];
  if (scenes.length || /social|investigation|talk/i.test(body)) tags.push('Social');
  if (combatMatch) tags.push('Combat');
  if (puzzleMatch) tags.push('Puzzle');
  return {
    objectives: objectivesMatch ? objectivesMatch[1].trim() : '',
    scenes,
    combat: combatMatch ? combatMatch[1].trim() : '',
    puzzle: puzzleMatch ? puzzleMatch[1].trim() : '',
    tags,
  };
}

function parseNpcs(body) {
  const npcs = [];
  let match;
  const re = new RegExp(NPC_LINE.source, NPC_LINE.flags);
  while ((match = re.exec(body)) !== null) {
    npcs.push({
      name: match[1].trim().replace(/:$/, ''),
      description: match[2].trim(),
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
          });
        }
      } else if (text.includes(':')) {
        const [name, ...rest] = text.split(':');
        npcs.push({ name: name.replace(/^\*\*|\*\*$/g, '').trim().replace(/:$/, ''), description: rest.join(':').trim() });
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
    const heading = parts[i].trim();
    const body = parts[i + 1].trim();
    const type = classifyHeading(heading);
    const section = {
      type,
      heading,
      content: body,
      html: markdownToHtml(body),
      id: `sec-${sections.length}`,
    };

    if (type === 'session') {
      const numMatch = heading.match(SESSION_HEADING);
      section.number = numMatch ? parseInt(numMatch[1], 10) : sections.filter((s) => s.type === 'session').length + 1;
      Object.assign(section, parseSessionBody(body));
    } else if (type === 'npcs') {
      section.npcs = parseNpcs(body);
    }
    sections.push(section);
  }

  const wc = wordCount(content);
  const sc = countSessions(content);

  return {
    title,
    preamble,
    preambleHtml: markdownToHtml(preamble.replace(/^#\s+.+$/m, '').trim()),
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
  const overview = parsed.sections.filter((s) => ['overview', 'hook', 'inspired'].includes(s.type));
  const npcs = parsed.sections.filter((s) => s.type === 'npcs');
  const extras = parsed.sections.filter((s) => ['rewards', 'generic'].includes(s.type));

  if (overview.length) groups.push({ id: 'overview', label: 'Overview', sectionIds: overview.map((s) => s.id) });
  if (sessions.length) groups.push({ id: 'sessions', label: 'Sessions', sectionIds: sessions.map((s) => s.id) });
  if (npcs.length) groups.push({ id: 'npcs', label: 'NPCs', sectionIds: npcs.map((s) => s.id) });
  if (extras.length) groups.push({ id: 'extras', label: 'Extras', sectionIds: extras.map((s) => s.id) });
  return groups;
}
