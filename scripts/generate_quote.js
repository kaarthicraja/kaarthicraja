const fs = require('fs');
const path = require('path');

// Paths
const quotesPath = path.join(__dirname, '../quotes.json');
const outputPath = path.join(__dirname, '../output/quote.svg');

// Read quotes and pick a random one
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

// Function to wrap text to fit inside the SVG
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

// Wrap quote text at 55 characters per line
const wrappedText = wrapText(randomQuote.text, 55);

// Generate <tspan> elements for multiline SVG text
let tspanElements = '';
let yOffset = 0;
wrappedText.forEach((line) => {
  tspanElements += `<tspan x="70" dy="${yOffset === 0 ? 0 : 32}">${line}</tspan>`;
  yOffset += 32;
});

// Dynamic SVG Content
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">
  <defs>
    <style>
      .bg { fill: #1a1b26; rx: 15px; }
      .quote { font-family: 'Courier New', monospace; font-size: 22px; fill: #00f3ff; font-weight: bold; text-shadow: 0 0 5px rgba(0,243,255,0.5); }
      .author { font-family: 'Courier New', monospace; font-size: 18px; fill: #bb9af7; font-style: italic; }
      .quote-mark { font-family: 'Arial', sans-serif; font-size: 120px; fill: #24283b; font-weight: bold; }
    </style>
    <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#00f3ff" opacity="0.05"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect class="bg" width="800" height="200" />
  <rect width="800" height="200" fill="url(#dot-grid)" rx="15" />
  
  <!-- Decorative Left Line -->
  <rect x="0" y="30" width="6" height="140" fill="#bc13fe" rx="3" />
  
  <!-- Giant decorative quote mark in background -->
  <text class="quote-mark" x="20" y="110">"</text>
  
  <!-- Quote Text -->
  <text class="quote" x="70" y="80">
    ${tspanElements}
  </text>
  
  <!-- Author -->
  <text class="author" x="760" y="170" text-anchor="end">~ ${randomQuote.author}</text>
</svg>`;

// Ensure output directory exists and write SVG
fs.mkdirSync(path.join(__dirname, '../output'), { recursive: true });
fs.writeFileSync(outputPath, svgContent);
console.log('Quote SVG generated at output/quote.svg!');
