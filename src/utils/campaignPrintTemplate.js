const PRINT_CSS = `
@page { margin: 2cm; }
body {
  font-family: Georgia, 'Times New Roman', serif;
  color: #1a1520;
  line-height: 1.55;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}
.cover {
  text-align: center;
  padding: 40px 20px;
  border-bottom: 3px double #9a7b1c;
  margin-bottom: 32px;
}
.cover-label {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #8a8494;
}
.cover h1 { color: #7a5c10; font-size: 28px; margin: 12px 0; }
.cover-meta { color: #6b6570; font-size: 14px; }
.cover-stats { margin-top: 16px; font-size: 12px; color: #4a4450; }
.cover-stats span { margin: 0 8px; }
h2.section-heading {
  color: #9a7b1c;
  font-size: 18px;
  border-bottom: 1px solid #e0d8c8;
  padding-bottom: 4px;
  margin-top: 28px;
}
h2.session-heading {
  color: #7a5c10;
  font-size: 16px;
  border-left: 4px solid #9a7b1c;
  padding-left: 12px;
  margin-top: 24px;
}
.session-card { margin-bottom: 20px; }
.session-tags { font-size: 10px; text-transform: uppercase; color: #8a8494; margin-bottom: 8px; }
.session-tags span { background: #f5f0e6; padding: 2px 8px; margin-right: 6px; border-radius: 3px; }
.objectives {
  background: #faf7f0;
  border-left: 3px solid #9a7b1c;
  padding: 8px 12px;
  margin: 10px 0;
}
.scene { margin: 14px 0; padding-left: 12px; border-left: 3px solid #d4c4a0; }
.scene h3 { color: #7a5c10; font-size: 14px; margin: 0 0 6px; }
blockquote { border-left: 3px solid #9a7b1c; padding: 8px 12px; margin: 10px 0; font-style: italic; background: #faf7f0; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #e0d8c8; }
.npc-role { font-size: 11px; color: #6b5b95; }
.npc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
.npc-card { padding: 10px 12px; background: #faf7f0; border-radius: 4px; }
.npc-name { font-weight: bold; color: #7a5c10; }
.footer-note { margin-top: 40px; font-size: 10px; color: #8a8494; text-align: center; }
@media print { body { padding: 0; } }
`;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSession(section) {
  const tags = (section.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join('');
  let body = '';
  if (section.beats?.length) {
    body = `${
      section.objectives
        ? `<div class="objectives"><strong>Objectives:</strong> ${escapeHtml(section.objectives).replace(/\n/g, '<br>')}</div>`
        : ''
    }${section.introHtml || ''}${section.beats
      .map((b) => `<div class="scene"><h3>${escapeHtml(b.heading)}</h3>${b.html || ''}</div>`)
      .join('')}`;
  } else {
    body = section.html || `<p>${escapeHtml(section.content)}</p>`;
  }

  return `
    <div class="session-card">
      <h2 class="session-heading">${escapeHtml(section.heading)}</h2>
      ${tags ? `<div class="session-tags">${tags}</div>` : ''}
      ${body}
    </div>`;
}

function renderNpcs(section) {
  const cards = (section.npcs || [])
    .map(
      (n) =>
        `<div class="npc-card"><div class="npc-name">${escapeHtml(n.name)}</div>${
          n.role ? `<div class="npc-role">${escapeHtml(n.role)}</div>` : ''
        }${n.html || `<div>${escapeHtml(n.description)}</div>`}</div>`,
    )
    .join('');
  return `
    <h2 class="section-heading">${escapeHtml(section.heading)}</h2>
    <div class="npc-grid">${cards || section.html || ''}</div>`;
}

function renderGeneric(section) {
  return `
    <h2 class="section-heading">${escapeHtml(section.heading)}</h2>
    <div>${section.html || `<p>${escapeHtml(section.content)}</p>`}</div>`;
}

export function buildPrintHtml(parsed, meta = {}) {
  const title = parsed.title || meta.title || 'Campaign';
  const stats = parsed.stats || {};
  const signals = meta.book_signals || [];
  const body = (parsed.sections || [])
    .map((section) => {
      if (section.type === 'inspired') return '';
      if (section.type === 'session') return renderSession(section);
      if (section.type === 'npcs') return renderNpcs(section);
      return renderGeneric(section);
    })
    .join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>${PRINT_CSS}</style></head><body>
<div class="cover">
  <div class="cover-label">Campaign Manuscript</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="cover-meta">Arcane Forge${meta.language ? ` · ${escapeHtml(meta.language.toUpperCase())}` : ''}${meta.complexity ? ` · ${escapeHtml(meta.complexity)}` : ''}</p>
  <div class="cover-stats">
    ${stats.sessionCount ? `<span>${stats.sessionCount} sessions</span>` : ''}
    ${stats.wordCount ? `<span>${stats.wordCount} words</span>` : ''}
    ${meta.quality_score != null ? `<span>Quality ${meta.quality_score}/100</span>` : ''}
  </div>
  ${signals.length ? `<p class="cover-meta">Inspired by: ${signals.map(escapeHtml).join(', ')}</p>` : ''}
</div>
${body}
<p class="footer-note">Generated with Arcane Forge — for personal tabletop use.</p>
</body></html>`;
}
