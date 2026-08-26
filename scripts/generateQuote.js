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
    <style>.mono { font-family: 'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace; }</style>
  </defs>

  <!-- Background -->
  <rect width="800" height="${svgH}" fill="#0a0a0a"/>
  <rect x="0.5" y="0.5" width="799" height="${svgH - 1}" fill="none" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="4" height="${svgH}" fill="#e8a33d"/>

  <text x="18" y="24" class="mono" font-size="10" letter-spacing="2" fill="#555555">[ DAILY QUOTE ]</text>

  <!-- Quote text -->
  <text x="60" y="${textStart}" class="mono" font-size="18" fill="#eaeaea" font-weight="bold">
    ${tspans}
  </text>

  <!-- Author -->
  <text x="750" y="${svgH - 22}" class="mono" font-size="14" letter-spacing="1" fill="#e8a33d"
        text-anchor="end">— ${quote.author.replace(/&/g,'&amp;').toUpperCase()}</text>
</svg>`;

// ─── Write output ─────────────────────────────────────────────────────────────
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, svg, 'utf8');
console.log(`✅ Quote SVG generated → ${OUTPUT_PATH}`);
console.log(`   "${quote.text}" — ${quote.author}`);
