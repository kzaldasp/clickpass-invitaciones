// Genera la portada 1200x630 (catalogo + vista previa de WhatsApp) de la
// plantilla aracnido a partir de SVG. WhatsApp no acepta SVG como og:image.
//   node scripts/portada-aracnido.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const heroe = readFileSync('public/ilustraciones/aracnido/heroe-colgado.svg', 'utf8')
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '');

const tela = (x, y, rot) => {
  const radios = [0, 15, 30, 45, 60, 75, 90]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<line x1="0" y1="0" x2="${260 * Math.cos(r)}" y2="${260 * Math.sin(r)}"/>`;
    })
    .join('');
  const anillos = [60, 110, 160, 210]
    .map((d) => {
      const pts = [0, 15, 30, 45, 60, 75, 90].map((a) => [d * Math.cos((a * Math.PI) / 180), d * Math.sin((a * Math.PI) / 180)]);
      let p = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2];
        p += ` Q${m[0] * 0.9},${m[1] * 0.9} ${pts[i][0]},${pts[i][1]}`;
      }
      return `<path d="${p}"/>`;
    })
    .join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot})" stroke="rgba(243,240,234,0.35)" stroke-width="2" fill="none">${radios}${anillos}</g>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="60%"><stop offset="0" stop-color="#2e4da7" stop-opacity=".55"/><stop offset="1" stop-color="#2e4da7" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="85%" cy="80%" r="55%"><stop offset="0" stop-color="#9c1d1d" stop-opacity=".5"/><stop offset="1" stop-color="#9c1d1d" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0a14"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  ${tela(0, 0, 0)}
  ${tela(1200, 0, 90)}
  <line x1="880" y1="0" x2="880" y2="150" stroke="rgba(243,240,234,.6)" stroke-width="3"/>
  <g transform="translate(750 140)">${heroe}</g>
  <text x="90" y="300" font-family="Impact, 'Arial Black', sans-serif" font-size="120" fill="#f3f0ea" letter-spacing="2">ARÁCNIDO</text>
  <text x="94" y="370" font-family="'DejaVu Sans', Arial, sans-serif" font-size="34" fill="#f5c451" font-weight="bold">Invitación para fiestas de héroes</text>
  <text x="94" y="420" font-family="'DejaVu Sans', Arial, sans-serif" font-size="26" fill="rgba(243,240,234,.75)">Toca para abrir y confirmar tu asistencia</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile('public/ilustraciones/aracnido/portada.jpg');
console.log('public/ilustraciones/aracnido/portada.jpg');
