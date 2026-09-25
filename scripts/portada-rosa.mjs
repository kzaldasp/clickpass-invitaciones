// Portada 1200x630 de la plantilla "rosa" (XV anos): catalogo + WhatsApp.
//   node scripts/portada-rosa.mjs
import sharp from 'sharp';

const foto = await sharp('public/demo/xv/tiara.jpg').resize(470, 630, { fit: 'cover', position: 'attention' }).toBuffer();

const flor = (x, y, r, c) => {
  let p = '';
  for (let g = 0; g < 360; g += 72)
    p += `<path transform="translate(${x} ${y}) rotate(${g}) scale(${r / 19})" d="M0,0 C-7,-6 -6,-17 0,-19 C6,-17 7,-6 0,0Z" fill="${c}" fill-opacity=".8"/>`;
  return p + `<circle cx="${x}" cy="${y}" r="${r / 5}" fill="#bf9d62"/>`;
};
const destello = (x, y, s) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2Z" fill="#bf9d62"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="70%" cy="100%" r="70%"><stop offset="0" stop-color="#f4e3e1"/><stop offset="1" stop-color="#fbf6f4"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="500" y="24" width="676" height="582" fill="none" stroke="#bf9d62" stroke-opacity=".7"/>
  <rect x="507" y="31" width="662" height="568" fill="none" stroke="#bf9d62" stroke-opacity=".3"/>
  ${flor(1150, 60, 22, '#d7a1a6')}${flor(1118, 92, 14, '#f1cfd0')}${flor(530, 585, 20, '#f1cfd0')}${flor(560, 560, 13, '#d7a1a6')}
  ${destello(640, 150, 1)}${destello(1040, 470, 0.8)}${destello(1070, 170, 0.6)}
  <circle cx="838" cy="125" r="44" fill="none" stroke="#bf9d62" stroke-width="1.4"/>
  <path d="M818 108 L822 96 L830 103 L838 90 L846 103 L854 96 L858 108 Z" fill="none" stroke="#bf9d62" stroke-width="1.4"/>
  <text x="838" y="150" text-anchor="middle" font-family="'URW Chancery L', 'Z003', cursive" font-size="44" fill="#a2626b">V</text>
  <text x="838" y="245" text-anchor="middle" font-family="'URW Chancery L', 'Z003', cursive" font-size="70" fill="#a2626b">Mis XV años</text>
  <text x="838" y="340" text-anchor="middle" font-family="'DejaVu Serif', Georgia, serif" font-size="58" letter-spacing="12" fill="#4a3a3d">VALENTINA</text>
  <line x1="728" y1="385" x2="948" y2="385" stroke="#bf9d62"/>
  <text x="838" y="430" text-anchor="middle" font-family="'DejaVu Serif', Georgia, serif" font-size="22" letter-spacing="8" fill="#8b7b7d">RESERVA LA FECHA</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: foto, left: 0, top: 0 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile('public/ilustraciones/rosa/portada.jpg');
console.log('public/ilustraciones/rosa/portada.jpg');
