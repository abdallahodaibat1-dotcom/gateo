/* eslint-disable */
// Generates the default placeholder images referenced by the fashion-1 template.
// Output: public/uploads/placeholder.jpg + accessories-1..6.jpg
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'uploads');

// Champagne / ivory / gold palette matching the fashion-1 theme.
const variants = [
  { c1: '#f7f1e7', c2: '#e6d4b8', accent: '#bda06a' }, // crowns
  { c1: '#f6ecec', c2: '#e7cfd2', accent: '#c2a06e' }, // jewelry
  { c1: '#f4efe9', c2: '#ddc9b4', accent: '#b8965f' }, // shoes
  { c1: '#f7f2ea', c2: '#e8dcc4', accent: '#c4a874' }, // bouquets
  { c1: '#f3eee9', c2: '#dccbb8', accent: '#b39563' }, // bags
  { c1: '#f7f0ea', c2: '#e9d6c2', accent: '#c0a06a' }, // misc
];

// Simple, font-independent line icons (centered in a 200x200 box at 200,160).
const icons = [
  // crown
  'M150 250 L160 200 L185 225 L200 185 L215 225 L240 200 L250 250 Z',
  // diamond / ring
  'M200 180 L235 215 L200 265 L165 215 Z',
  // heel shoe
  'M160 215 L235 215 Q250 215 250 232 L250 248 L175 248 Q160 248 160 233 Z M235 248 L242 268',
  // bouquet (handled separately with circles)
  '',
  // handbag
  'M168 220 L232 220 L240 262 L160 262 Z M182 220 Q182 198 200 198 Q218 198 218 220',
  // gift / sparkle
  'M200 180 L210 210 L240 210 L216 228 L226 258 L200 240 L174 258 L184 228 L160 210 L190 210 Z',
];

function svgFor({ c1, c2, accent }, iconPath, idx) {
  const bouquet =
    idx === 3
      ? `<g stroke="${accent}" stroke-width="6" fill="none">
           <line x1="200" y1="262" x2="185" y2="222"/>
           <line x1="200" y1="262" x2="200" y2="218"/>
           <line x1="200" y1="262" x2="215" y2="222"/>
         </g>
         <g fill="${accent}">
           <circle cx="185" cy="212" r="14"/>
           <circle cx="200" cy="205" r="14"/>
           <circle cx="215" cy="212" r="14"/>
         </g>`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 400 440">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="440" fill="url(#g)"/>
    <rect x="22" y="22" width="356" height="396" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.55"/>
    ${iconPath ? `<path d="${iconPath}" fill="${accent}" opacity="0.92"/>` : ''}
    ${bouquet}
    <line x1="150" y1="320" x2="250" y2="320" stroke="${accent}" stroke-width="2" opacity="0.7"/>
  </svg>`;
}

// Generic placeholder: taller, neutral, no specific icon (a soft frame + monogram diamond).
function genericSvg() {
  const c1 = '#f6f0e6', c2 = '#e7d6bd', accent = '#bda06a';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#g)"/>
    <rect x="48" y="48" width="704" height="904" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>
    <path d="M400 430 L470 500 L400 600 L330 500 Z" fill="none" stroke="${accent}" stroke-width="4" opacity="0.85"/>
    <path d="M400 470 L437 507 L400 560 L363 507 Z" fill="${accent}" opacity="0.85"/>
    <line x1="300" y1="660" x2="500" y2="660" stroke="${accent}" stroke-width="3" opacity="0.7"/>
  </svg>`;
}

async function main() {
  await sharp(Buffer.from(genericSvg()))
    .jpeg({ quality: 86 })
    .toFile(path.join(OUT, 'placeholder.jpg'));
  console.log('wrote placeholder.jpg');

  for (let i = 0; i < 6; i++) {
    const file = `accessories-${i + 1}.jpg`;
    await sharp(Buffer.from(svgFor(variants[i], icons[i], i)))
      .jpeg({ quality: 86 })
      .toFile(path.join(OUT, file));
    console.log('wrote', file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
