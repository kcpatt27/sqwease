/*
 * Rebuild tickets/INDEX.md from the ticket files.
 *
 *   node scripts/build-ticket-index.js
 *
 * Reads tickets/T-*.md frontmatter and writes grouped tables. No dependencies.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'tickets');
const files = fs.readdirSync(dir).filter((f) => /^T-\d+\.md$/.test(f));

function field(fm, name) {
  const re = new RegExp('^' + name + ':\\s*(.*)$', 'm');
  const m = fm.match(re);
  return m ? m[1].trim() : '';
}
function list(fm, name) {
  const v = field(fm, name);
  return v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
}

const tickets = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) continue;
  const fm = m[1];
  tickets.push({
    id: field(fm, 'id'),
    title: field(fm, 'title').replace(/^"|"$/g, ''),
    severity: field(fm, 'severity'),
    priority: field(fm, 'priority'),
    type: list(fm, 'type'),
    area: field(fm, 'area'),
    source: list(fm, 'source')
  });
}

const order = ['critical', 'high', 'medium', 'low', 'nit'];
const bySev = {};
order.forEach((s) => { bySev[s] = []; });
for (const t of tickets) {
  (bySev[t.severity] || (bySev[t.severity] = [])).push(t);
}
for (const s of Object.keys(bySev)) {
  bySev[s].sort((a, b) => a.id.localeCompare(b.id));
}

const lines = [];
lines.push('# SQWease Ticket Backlog');
lines.push('');
lines.push(`Maintainer view. ${tickets.length} tickets. Regenerate with \`node scripts/build-ticket-index.js\`.`);
lines.push('');
lines.push('Severity: `critical` blocks shipping · `high` next · `medium` soon · `low`/`nit` cleanup. Priority: `P0` immediate · `P1` next · `P2` scheduled · `P3` opportunistic.');
lines.push('');
for (const sev of order) {
  const rows = bySev[sev] || [];
  lines.push(`## ${sev.charAt(0).toUpperCase() + sev.slice(1)} (${rows.length})`);
  lines.push('');
  lines.push('| ID | Title | Area | Type | Source |');
  lines.push('|----|-------|------|------|--------|');
  for (const t of rows) {
    lines.push(`| [${t.id}](./${t.id}.md) | ${t.title} | ${t.area} | ${t.type.join(', ')} | ${t.source.join(', ')} |`);
  }
  lines.push('');
}
fs.writeFileSync(path.join(dir, 'INDEX.md'), lines.join('\n'), 'utf8');
console.log('Wrote tickets/INDEX.md with ' + tickets.length + ' tickets.');
