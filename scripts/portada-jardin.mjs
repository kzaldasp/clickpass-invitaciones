// Portada 1200x630 de la plantilla "jardin" (catalogo + vista previa de WhatsApp).
//   node scripts/portada-jardin.mjs
import sharp from 'sharp';

const foto = await sharp('public/demo/jardin/pareja-jardin.jpg').resize(470, 630, { fit: 'cover' }).toBuffer();

const hoja = (x, y, r, s, c) =>
  `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0,0 C7,-9 24,-11 34,0 C24,11 7,9 0,0Z" fill="${c}" fill-opacity=".6"/>`;
const rama = (x, y, r) => {
  let h = '';
  for (let i = 0; i < 9; i++) h += hoja(i * 14, -i * 16, (i % 2 ? -1 : 1) * 45 - 50, 1 + Math.sin(i / 3) * 0.3, i % 3 ? '#8a9a78' : '#a9b596');
  return `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0,0 Q60,-60 120,-140" stroke="#56654a" stroke-width="2" fill="none"/>${h}</g>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f6f3ec"/>
  ${rama(1215, 95, 235)}
  ${rama(560, 640, 10)}
  <circle cx="835" cy="120" r="44" fill="none" stroke="#8e2b2b" stroke-width="1.5"/>
  <text x="835" y="136" text-anchor="middle" font-family="'URW Chancery L', 'Z003', cursive" font-size="40" fill="#8e2b2b">V&amp;H</text>
  <text x="835" y="235" text-anchor="middle" font-family="'URW Chancery L', 'Z003', cursive" font-size="64" fill="#56654a">Nuestra boda</text>
  <text x="835" y="320" text-anchor="middle" font-family="'DejaVu Serif', Georgia, serif" font-size="44" letter-spacing="8" fill="#3a3833">VICTORIA</text>
  <text x="835" y="370" text-anchor="middle" font-family="'URW Chancery L', 'Z003', cursive" font-size="44" fill="#8a9a78">&amp;</text>
  <text x="835" y="420" text-anchor="middle" font-family="'DejaVu Serif', Georgia, serif" font-size="44" letter-spacing="8" fill="#3a3833">HASSAN</text>
  <line x1="715" y1="470" x2="955" y2="470" stroke="#8a9a78" stroke-width="1"/>
  <text x="835" y="510" text-anchor="middle" font-family="'DejaVu Serif', Georgia, serif" font-size="22" letter-spacing="6" fill="#7a766c">SAVE THE DATE</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: foto, left: 0, top: 0 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile('public/ilustraciones/jardin/portada.jpg');
console.log('public/ilustraciones/jardin/portada.jpg');
