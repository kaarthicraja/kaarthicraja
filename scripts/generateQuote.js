const fs = require('fs');
const path = require('path');

// ─── Paths ────────────────────────────────────────────────────────────────────
const QUOTES_PATH  = path.join(__dirname, '../quotes.json');
const OUTPUT_DIR   = path.join(__dirname, '../assets/generated');
const OUTPUT_PATH  = path.join(OUTPUT_DIR, 'quote.svg');

// ─── Read & Select ────────────────────────────────────────────────────────────
const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf8'));
const quote  = quotes[Math.floor(Math.random() * quotes.length)];

// ─── Text Wrapping ────────────────────────────────────────────────────────────
function wrapText(text, maxChars = 52) {
  return text.split(' ').reduce((lines, word) => {
    const last = lines[lines.length - 1];
    if (!last || (last + ' ' + word).length > maxChars) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = last + ' ' + word;
    }
    return lines;
  }, []);
}

const lines     = wrapText(quote.text);
const lineH     = 28;
const textH     = lines.length * lineH;
const svgH      = Math.max(140, textH + 90);
const textStart = Math.round((svgH - textH - 30) / 2) + lineH;

// ─── Build tspan elements ─────────────────────────────────────────────────────
const tspans = lines.map((line, i) =>
  `<tspan x="60" dy="${i === 0 ? 0 : lineH}">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</tspan>`
).join('');

// ─── SVG Template ─────────────────────────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${svgH}" width="800" height="${svgH}">
  <defs>
    <style>.mono { font-family: 'Courier New', monospace; }</style>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#00f3ff" opacity="0.06"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="800" height="${svgH}" fill="#0d0f14" rx="12"/>
  <rect width="800" height="${svgH}" fill="url(#dots)" rx="12"/>

  <!-- Neon border -->
  <rect x="2" y="2" width="796" height="${svgH - 4}" rx="11" fill="none"
        stroke="#00f3ff" stroke-width="1.5" filter="url(#glow)" opacity="0.5">
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Left accent bar -->
  <rect x="0" y="20" width="5" height="${svgH - 40}" fill="#bc13fe" rx="2"/>

  <!-- Giant decorative quote mark -->
  <text x="18" y="${svgH * 0.75}" class="mono" font-size="100" fill="#00f3ff" opacity="0.07">"</text>

  <!-- Quote text -->
  <text x="60" y="${textStart}" class="mono" font-size="20" fill="#00f3ff" filter="url(#glow)" font-weight="bold">
    ${tspans}
  </text>

  <!-- Author -->
  <text x="750" y="${svgH - 22}" class="mono" font-size="16" fill="#bb9af7"
        font-style="italic" text-anchor="end">~ ${quote.author.replace(/&/g,'&amp;')}</text>
</svg>`;

// ─── Write output ─────────────────────────────────────────────────────────────
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, svg, 'utf8');
console.log(`✅ Quote SVG generated → ${OUTPUT_PATH}`);
console.log(`   "${quote.text}" — ${quote.author}`);
