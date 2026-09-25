// Portadas 1200x630 (catalogo + vista previa de WhatsApp) de las plantillas
// que no tienen generador propio. Foto a la izquierda y panel con la paleta
// del tema a la derecha.   node scripts/portadas.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const serif = "'DejaVu Serif', Georgia, serif";
const sans = "'DejaVu Sans', Arial, sans-serif";
const script = "'URW Chancery L', 'Z003', cursive";

const temas = {
  castillo: { foto: 'castillo/pastel.jpg', fondo: '#f7f1fb', acento: '#6f4f9c', texto: '#3f3350', linea: '#d4af6a', antes: 'Cumpleaños de cuento', titulo: 'Castillo', fuente: serif, deco: 'estrellas' },
  heroico: { foto: 'heroico/pastel.jpg', fondo: '#ffd23f', acento: '#e63946', texto: '#111', linea: '#111', antes: '¡Súper cumpleaños!', titulo: 'HEROICO', fuente: "Impact, 'DejaVu Sans', sans-serif", deco: 'puntos' },
  sakura: { foto: 'sakura/calle.jpg', fondo: '#fff5f7', acento: '#d94f5c', texto: '#1f2240', linea: '#f29bb2', antes: 'Estilo anime', titulo: 'Sakura', fuente: sans, deco: 'sol' },
  galaxia: { foto: 'galaxia/velas.jpg', fondo: '#0b1026', acento: '#4fd1c5', texto: '#eef1ff', linea: '#6d5dfc', antes: 'Misión cumpleaños', titulo: 'GALAXIA', fuente: sans, deco: 'estrellas' },
  jurasico: { foto: 'jurasico/pastel.jpg', fondo: '#f4ead5', acento: '#2f6b3a', texto: '#243024', linea: '#f28c28', antes: '¡Dino cumpleaños!', titulo: 'Jurásico', fuente: sans, deco: 'puntos' },
  neon: { foto: 'neon/confeti.jpg', fondo: '#0a0a12', acento: '#ff3ea5', texto: '#ffffff', linea: '#29e7ff', antes: 'Fiesta de noche', titulo: 'Neón', fuente: script, deco: 'brillo' },
  marmol: { foto: 'marmol/ceremonia-bn.jpg', fondo: '#f4f2ee', acento: '#141414', texto: '#141414', linea: '#b89a5a', antes: 'Boda moderna', titulo: 'Mármol', fuente: serif, deco: 'linea', gris: true },
  mediterraneo: { foto: 'mediterraneo/playa-abrazo.jpg', fondo: '#fdfcf8', acento: '#1f4e8c', texto: '#22324a', linea: '#f4d35e', antes: 'Boda junto al mar', titulo: 'Mediterráneo', fuente: script, deco: 'azulejo' },
  gala: { foto: 'gala/ramo-rojo.jpg', fondo: '#0e0e0e', acento: '#c9a45c', texto: '#f0dfb1', linea: '#c9a45c', antes: 'Boda art déco', titulo: 'GALA', fuente: serif, deco: 'abanico' },
  lucha: { foto: 'lucha/ring.jpg', fondo: '#000000', acento: '#d0021b', texto: '#ffffff', linea: '#ffffff', antes: 'La pelea del año', titulo: 'LUCHA', fuente: "Impact, 'DejaVu Sans', sans-serif", deco: 'brillo' },
  bohemia: { foto: 'bohemia/pareja.jpg', fondo: '#f3ebe0', acento: '#8e4c30', texto: '#4a3a30', linea: '#c0714f', antes: 'Boda boho', titulo: 'Bohemia', fuente: script, deco: 'sol', calido: true },
};

const decoraciones = {
  estrellas: (c) => [[560, 80], [1120, 120], [1080, 520], [620, 540], [900, 70]].map(([x, y], i) => `<path transform="translate(${x} ${y}) scale(${0.8 + (i % 3) * 0.3})" d="M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3Z" fill="${c.linea}"/>`).join(''),
  puntos: (c) => `<pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="${c.texto}" fill-opacity=".12"/></pattern><rect x="470" width="730" height="630" fill="url(#p)"/>`,
  sol: (c) => `<circle cx="1080" cy="130" r="70" fill="${c.linea}" fill-opacity=".55"/>`,
  brillo: (c) => `<rect x="520" y="60" width="630" height="510" rx="30" fill="none" stroke="${c.acento}" stroke-width="3" opacity=".9"/><rect x="530" y="70" width="610" height="490" rx="24" fill="none" stroke="${c.linea}" stroke-width="1.5" opacity=".7"/>`,
  linea: (c) => `<line x1="835" y1="120" x2="835" y2="200" stroke="${c.linea}" stroke-width="2"/>`,
  azulejo: (c) => `<rect x="470" y="590" width="730" height="40" fill="${c.acento}"/><rect x="470" y="0" width="730" height="20" fill="${c.acento}"/>`,
  abanico: (c) => `<g fill="none" stroke="${c.linea}" stroke-width="2"><path d="M735 190 A100 100 0 0 1 935 190"/><path d="M765 190 A70 70 0 0 1 905 190"/>${Array.from({ length: 9 }, (_, i) => { const a = Math.PI - (i * Math.PI) / 8; return `<line x1="${835 + 70 * Math.cos(a)}" y1="${190 - 70 * Math.sin(a)}" x2="${835 + 100 * Math.cos(a)}" y2="${190 - 100 * Math.sin(a)}"/>`; }).join('')}</g>`,
};

for (const [slug, c] of Object.entries(temas)) {
  let foto = sharp(`public/demo/${c.foto}`).resize(470, 630, { fit: 'cover', position: 'attention' });
  if (c.gris) foto = foto.grayscale();
  if (c.calido) foto = foto.modulate({ saturation: 0.9 }).tint({ r: 255, g: 235, b: 215 });
  const fotoBuf = await foto.toBuffer();

  const neon = slug === 'neon' ? `filter="url(#g)"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><filter id="g"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width="1200" height="630" fill="${c.fondo}"/>
    ${decoraciones[c.deco](c)}
    <text x="835" y="270" text-anchor="middle" font-family="${sans}" font-size="24" letter-spacing="8" fill="${c.texto}" opacity=".75">${c.antes.toUpperCase()}</text>
    <text x="835" y="380" text-anchor="middle" font-family="${c.fuente}" font-size="${c.titulo.length > 9 ? 88 : 110}" fill="${c.acento}" ${neon}>${c.titulo}</text>
    <line x1="735" y1="430" x2="935" y2="430" stroke="${c.linea}" stroke-width="2"/>
    <text x="835" y="480" text-anchor="middle" font-family="${sans}" font-size="20" letter-spacing="6" fill="${c.texto}" opacity=".7">INVITACIÓN DIGITAL</text>
  </svg>`;

  mkdirSync(`public/ilustraciones/${slug}`, { recursive: true });
  await sharp(Buffer.from(svg)).composite([{ input: fotoBuf, left: 0, top: 0 }]).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/ilustraciones/${slug}/portada.jpg`);
  console.log(slug);
}
