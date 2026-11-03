#!/usr/bin/env node
/**
 * build-assets.js — generates the hand-designed profile SVGs.
 *
 *   assets/hero.svg               name, role, typing line, agent-flow diagram
 *   assets/animations/focus.svg   "what I do" cards
 *   assets/animations/skills.svg  grouped tech stack
 *
 * Every SVG is drawn at 840px wide — the real width of the README column —
 * so text is never scaled down below ~11px. Edit the content constants below
 * and run:  npm run build-assets
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const W = 840;

const C = {
  bg: '#0a0a0a', panel: '#0f0f0f', chip: '#141414',
  line: '#262626', lineSoft: '#1a1a1a',
  text: '#f2f2f2', body: '#b8b8b8', dim: '#7a7a7a', mute: '#5a5a5a',
  accent: '#e8a33d', live: '#4af626',
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Consolas, 'Liberation Mono', 'DejaVu Sans Mono', monospace";
const MONO_CH = 0.6; // advance width of one monospace glyph, in em

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const style = (extra = '') => `  <defs>
    <style>
      .sans { font-family: ${SANS}; }
      .mono { font-family: ${MONO}; }
      ${extra}
    </style>
  </defs>`;
const frame = (h) => `  <rect width="${W}" height="${h}" fill="${C.bg}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" fill="none" stroke="${C.line}"/>`;
const write = (rel, svg) => {
  fs.writeFileSync(path.join(ROOT, rel), svg.trim() + '\n');
  console.log('wrote', rel);
};

// ───────────────────────────── hero ─────────────────────────────
const NAME = 'KAARTHIC RAJA';
const ROLE = 'AI & Automation Engineer';
const ROLE_2 = ' · Full-Stack Developer';
const TYPING = [
  'building LLM agents that do real work',
  'automating workflows end to end',
  'shipping Next.js + TypeScript apps',
  'self-hosting on Linux with Docker',
];
// Abstract node graph for the hero's right side. Deliberately label-free:
// it must not describe any real (private) product's pipeline.
const NODES = [
  [628, 92], [704, 72], [786, 98], [652, 158], [736, 150], [800, 168],
  [624, 226], [700, 236], [776, 228],
];
const HUB = 4;
const EDGES = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [2, 5],
  [3, 6], [3, 7], [4, 7], [4, 8], [5, 8], [6, 7], [7, 8],
];
const PULSES = [[0, 3, 4], [2, 4, 7], [6, 7, 4], [1, 4, 8], [5, 4, 3]]; // node paths

function hero() {
  const H = 300;
  const cycle = TYPING.length * 4; // seconds
  const fs15 = 15, ch = fs15 * MONO_CH, tx = 54;

  const typing = TYPING.map((t, i) => {
    const w = +(t.length * ch).toFixed(1);
    const a = i / TYPING.length, slot = 1 / TYPING.length;
    const k = (n) => +n.toFixed(4);
    const typed = k(a + slot * 0.3), hold = k(a + slot * 0.92), out = k(a + slot);
    return `
  <clipPath id="tp${i}"><rect x="${tx}" y="206" height="26" width="0">
    <animate attributeName="width" dur="${cycle}s" repeatCount="indefinite"
      keyTimes="0;${k(a)};${typed};1" values="0;0;${w};${w}"/>
  </rect></clipPath>
  <g opacity="0">
    <animate attributeName="opacity" dur="${cycle}s" repeatCount="indefinite"
      keyTimes="0;${k(a)};${k(a + 0.0001)};${hold};${out === 1 ? 0.9999 : out};1" values="0;0;1;1;0;0"/>
    <text x="${tx}" y="224" class="mono" font-size="${fs15}" fill="${C.text}" textLength="${w}" lengthAdjust="spacingAndGlyphs" clip-path="url(#tp${i})">${esc(t)}</text>
    <rect class="cur" y="210" width="9" height="18" fill="${C.accent}" x="${tx}">
      <animate attributeName="x" dur="${cycle}s" repeatCount="indefinite"
        keyTimes="0;${k(a)};${typed};1" values="${tx};${tx};${tx + w + 3};${tx + w + 3}"/>
    </rect>
  </g>`;
  }).join('');

  const edges = EDGES.map(([a, b]) => {
    const hot = a === HUB || b === HUB;
    return `
  <line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="${hot ? '#3a2c14' : C.line}"/>`;
  }).join('');
  const pulses = PULSES.map((p, i) => {
    const d = 'M' + p.map((n) => NODES[n].join(',')).join(' L');
    return `
  <circle r="2.5" fill="${C.accent}" opacity="0">
    <animateMotion path="${d}" dur="2.4s" begin="${i * 0.7}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="${i * 0.7}s" repeatCount="indefinite"/>
  </circle>`;
  }).join('');
  const nodes = NODES.map(([x, y], i) => i === HUB
    ? `
  <circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${C.accent}" opacity="0.35">
    <animate attributeName="r" values="9;20;9" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${x}" cy="${y}" r="7" fill="${C.accent}"/>`
    : `
  <circle cx="${x}" cy="${y}" r="4" fill="${C.panel}" stroke="#4a4a4a"/>`).join('');
  const graph = edges + pulses + nodes;

  write('assets/hero.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${style(`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      .cur { animation: blink 0.9s step-end infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
      .live { animation: pulse 1.8s ease-in-out infinite; }`)}
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
    <path d="M24 0H0V24" fill="none" stroke="${C.lineSoft}" stroke-width="1"/>
  </pattern>
${frame(H)}
  <rect x="1" y="47" width="${W - 2}" height="210" fill="url(#grid)" opacity="0.6"/>

  <text x="32" y="30" class="mono" font-size="12" letter-spacing="2" fill="${C.dim}">PROFILE / KAARTHICRAJA</text>
  <circle class="live" cx="720" cy="26" r="4" fill="${C.live}"/>
  <text x="${W - 32}" y="30" class="mono" font-size="12" letter-spacing="2" fill="${C.text}" text-anchor="end">BUILDING</text>
  <line x1="1" y1="46" x2="${W - 1}" y2="46" stroke="${C.line}"/>

  <text x="30" y="122" class="sans" font-size="54" font-weight="800" letter-spacing="-1.5" fill="${C.text}">${NAME}</text>
  <rect x="32" y="138" height="3" width="0" fill="${C.accent}">
    <animate attributeName="width" values="0;132;132" keyTimes="0;0.25;1" dur="8s" repeatCount="indefinite"/>
  </rect>
  <text x="32" y="178" class="sans" font-size="21" font-weight="600" fill="${C.accent}">${esc(ROLE)}<tspan fill="${C.body}" font-weight="400">${esc(ROLE_2)}</tspan></text>

  <text x="32" y="224" class="mono" font-size="15" fill="${C.accent}">$</text>${typing}
${graph}

  <line x1="1" y1="258" x2="${W - 1}" y2="258" stroke="${C.line}"/>
  <text x="32" y="284" class="mono" font-size="12" letter-spacing="2" fill="${C.dim}">INDIA · TAMIL / ENGLISH</text>
  <text x="${W - 32}" y="284" class="mono" font-size="12" letter-spacing="1" fill="${C.dim}" text-anchor="end">github.com/kaarthicraja</text>
</svg>`);
}

// ───────────────────────────── focus cards ─────────────────────────────
const FOCUS = [
  {
    title: 'AI Engineering',
    points: ['LLM agents with tool calling', 'Structured data extraction', 'Speech-to-text with Whisper'],
    tags: 'CLAUDE · OPENAI · OLLAMA',
  },
  {
    title: 'Workflow Automation',
    points: ['WhatsApp bots & assistants', 'API integrations & webhooks', 'n8n pipelines & job queues'],
    tags: 'WHATSAPP · N8N · BULLMQ',
  },
  {
    title: 'Full-Stack Development',
    points: ['Next.js & React frontends', 'Node, NestJS & FastAPI APIs', 'Postgres + Prisma, self-hosted'],
    tags: 'TYPESCRIPT · PYTHON · DOCKER',
  },
];

function focus() {
  const top = 34, cw = 268, gap = (W - cw * 3) / 2, chH = 204, H = top + chH + 2;
  const cards = FOCUS.map((c, i) => {
    const x = i * (cw + gap);
    const pts = c.points.map((p, j) => `
    <rect x="20" y="${100 + j * 26}" width="5" height="5" fill="${C.accent}"/>
    <text x="34" y="${106 + j * 26}" class="sans" font-size="14" fill="${C.body}">${esc(p)}</text>`).join('');
    return `
  <g transform="translate(${x + 0.5},${top + 0.5})">
    <rect width="${cw - 1}" height="${chH - 1}" fill="${C.panel}" stroke="${C.line}"/>
    <rect width="0" height="3" fill="${C.accent}">
      <animate attributeName="width" values="0;${cw - 1};${cw - 1}" keyTimes="0;0.2;1" dur="9s" begin="${i * 0.6}s" repeatCount="indefinite"/>
    </rect>
    <text x="20" y="34" class="mono" font-size="13" font-weight="700" fill="${C.accent}">0${i + 1}</text>
    <text x="20" y="62" class="sans" font-size="18" font-weight="700" fill="${C.text}">${esc(c.title)}</text>
    <line x1="20" y1="78" x2="${cw - 20}" y2="78" stroke="${C.lineSoft}"/>${pts}
    <text x="20" y="${chH - 18}" class="mono" font-size="11" letter-spacing="1" fill="${C.mute}">${esc(c.tags)}</text>
  </g>`;
  }).join('');

  write('assets/animations/focus.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${style()}
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <text x="2" y="18" class="mono" font-size="12" letter-spacing="2" fill="${C.dim}">[ WHAT I DO ]</text>${cards}
</svg>`);
}

// ───────────────────────────── stack ─────────────────────────────
const STACK = [
  ['AI', ['Claude', 'OpenAI', 'Gemini', 'Groq', 'Ollama', 'Whisper']],
  ['AUTOMATION', ['WhatsApp bots', 'n8n', 'BullMQ', 'Puppeteer', 'Playwright']],
  ['FRONTEND', ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Three.js']],
  ['BACKEND', ['Node.js', 'NestJS', 'Fastify', 'FastAPI', 'Flask']],
  ['DATA', ['PostgreSQL', 'Prisma', 'Redis', 'SQLite']],
  ['OPS', ['Docker', 'PM2', 'Coolify', 'GitHub Actions', 'Linux']],
];

function stack() {
  const head = 44, rowH = 50, H = head + STACK.length * rowH + 1;
  const fsz = 13, ch = fsz * MONO_CH, pad = 12, gap = 8, x0 = 168;
  const rows = STACK.map(([label, items], r) => {
    const y = head + r * rowH;
    let x = x0;
    const chips = items.map((t) => {
      const tw = +(t.length * ch).toFixed(1), w = tw + pad * 2;
      const g = `
    <rect x="${x}" y="${y + 11}" width="${w}" height="28" fill="${C.chip}" stroke="${C.line}"/>
    <text x="${x + pad}" y="${y + 30}" class="mono" font-size="${fsz}" fill="${C.text}" textLength="${tw}" lengthAdjust="spacingAndGlyphs">${esc(t)}</text>`;
      x += w + gap;
      return g;
    }).join('');
    const sep = r ? `\n    <line x1="1" y1="${y}" x2="${W - 1}" y2="${y}" stroke="${C.lineSoft}"/>` : '';
    return `${sep}
    <text x="24" y="${y + 30}" class="mono" font-size="12" letter-spacing="2" fill="${C.accent}">${label}</text>${chips}`;
  }).join('');

  write('assets/animations/skills.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${style()}
${frame(H)}
  <text x="24" y="27" class="mono" font-size="12" letter-spacing="2" fill="${C.dim}">[ STACK ]</text>
  <text x="${W - 24}" y="27" class="mono" font-size="12" letter-spacing="2" fill="${C.mute}" text-anchor="end">TOOLS I SHIP WITH</text>
  <line x1="1" y1="${head - 1}" x2="${W - 1}" y2="${head - 1}" stroke="${C.line}"/>
  <line x1="148" y1="${head}" x2="148" y2="${H - 1}" stroke="${C.lineSoft}"/>
  <g>${rows}
  </g>
</svg>`);
}

hero();
focus();
stack();
