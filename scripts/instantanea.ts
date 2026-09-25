/**
 * Instantanea estatica para GitHub Pages: sirve para mostrar el avance a los
 * socios sin servidor ni base. Incluye catalogo, demos, invitaciones
 * generales y una vista de solo lectura del panel y del admin con los datos
 * de la semilla.
 *
 * Requisitos: `npm run db:dev` corriendo y la semilla cargada.
 *   npm run build && npx tsx scripts/instantanea.ts
 * Sale en .instantanea/ (lista para publicar en la rama gh-pages).
 */
import { execSync, spawn } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createClient } from '@libsql/client';
import { plantillasPublicas } from '../src/plantillas';

const BASE = process.env.BASE ?? '/clickpass-invitaciones';
const PUERTO = 4331;
const ORIGEN = `http://localhost:${PUERTO}`;
const SALIDA = '.instantanea';
const ADMIN = { email: 'admin@clickpass.test', clave: 'clickpass-dev' };

// --- 1. Servidor de produccion (workerd) --------------------------------
// astro preview queda como proceso de fondo: se detiene antes y despues.
const detenerPreview = () => {
  try {
    execSync('npx astro preview stop', { stdio: 'ignore' });
  } catch {
    /* no habia ninguno */
  }
};
detenerPreview();
const servidor = spawn('npx', ['astro', 'preview', '--port', String(PUERTO)], { stdio: 'ignore' });
const esperar = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${ORIGEN}/catalogo`)).ok) return;
    } catch {
      /* aun arrancando */
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error('astro preview no arranco');
};

try {
  await esperar();

  // --- 2. Sesion de admin -----------------------------------------------
  const login = await fetch(`${ORIGEN}/admin/entrar`, {
    method: 'POST',
    redirect: 'manual',
    headers: { origin: ORIGEN, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(ADMIN),
  });
  const cookie = (login.headers.get('set-cookie') ?? '').match(/cp_sesion=[^;]+/)?.[0];
  if (!cookie) throw new Error('No se pudo entrar como admin (corre npm run db:seed)');

  // --- 3. Paginas ---------------------------------------------------------
  const db = createClient({ url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8880' });
  const eventos = (await db.execute('select id, slug, token_panel from eventos')).rows as unknown as {
    id: string;
    slug: string;
    token_panel: string;
  }[];

  const paginas = ['/catalogo', '/entrar', '/404', '/admin', '/admin/clientes', '/admin/plantillas', '/admin/eventos/nuevo'];
  for (const m of plantillasPublicas()) paginas.push(`/catalogo/${m.slug}`, `/catalogo/${m.slug}/demo`);
  for (const e of eventos) {
    paginas.push(`/${e.slug}`, `/admin/eventos/${e.id}`, `/admin/eventos/${e.id}/editar`);
    for (const p of ['', '/invitacion', '/invitados', '/entrada', '/vista-previa']) paginas.push(`/panel/${e.token_panel}${p}`);
  }

  // Paletas de cada plantilla: en estatico, ?preset= se aplica en el navegador.
  const presets = Object.fromEntries(
    plantillasPublicas().map((m) => [m.slug, Object.fromEntries((m.presets ?? []).map((p) => [p.id, p.variables]))]),
  );

  rmSync(SALIDA, { recursive: true, force: true });
  mkdirSync(SALIDA, { recursive: true });

  const reescribir = (html: string) =>
    html
      // Cualquier atributo con ruta absoluta interna: href, src, action, data-*…
      .replace(/(\s[\w:-]+=")\/(?!\/)/g, `$1${BASE}/`)
      .replace(/url\(\/(?!\/)/g, `url(${BASE}/`)
      // El WhatsApp de ventas de desarrollo es ficticio: fuera el boton.
      .replace(/<a[^>]*href="https:\/\/wa\.me\/593990000000[^"]*"[^>]*>[\s\S]*?<\/a>/g, '');

  const AVISO = `
<div style="position:fixed;inset:auto 0 0;z-index:9999;padding:.55rem 1rem;background:#141a16;color:#ddd8ce;font:500 12px/1.4 Inter,system-ui,sans-serif;text-align:center;letter-spacing:.02em">
  Vista de demostración · datos de ejemplo · los cambios no se guardan
</div>
<script>
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    alert('Esta es una vista de demostración: aquí no se guardan cambios.');
  }, true);
</script>`;

  const PALETAS = (slug: string) => `
<script>
  (function () {
    var p = new URLSearchParams(location.search).get('preset');
    var v = (${JSON.stringify(presets)})[${JSON.stringify(slug)}][p];
    if (v) for (var k in v) document.documentElement.style.setProperty(k, v[k]);
  })();
</script>`;

  for (const ruta of paginas) {
    const res = await fetch(`${ORIGEN}${ruta}`, { headers: { cookie }, redirect: 'manual' });
    if (!res.ok && ruta !== '/404') {
      console.warn(`  ${res.status} ${ruta} (omitida)`);
      continue;
    }
    let html = reescribir(await res.text());
    const privada = ruta.startsWith('/admin') || ruta.startsWith('/panel') || ruta === '/entrar';
    if (privada) html = html.replace('</body>', `${AVISO}</body>`);
    const demo = ruta.match(/^\/catalogo\/([^/]+)\/demo$/);
    if (demo) html = html.replace('</head>', `${PALETAS(demo[1])}</head>`);

    const archivo = ruta === '/404' ? join(SALIDA, '404.html') : join(SALIDA, ruta, 'index.html');
    mkdirSync(dirname(archivo), { recursive: true });
    writeFileSync(archivo, html);
    console.log(`  ok ${ruta}`);
  }

  // La raiz lleva al catalogo.
  writeFileSync(
    join(SALIDA, 'index.html'),
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${BASE}/catalogo/"><link rel="canonical" href="${BASE}/catalogo/"><title>ClickPass</title>`,
  );

  // --- 4. Archivos estaticos del build -------------------------------------
  for (const f of readdirSync('dist/client')) {
    if (f !== '_headers') cpSync(join('dist/client', f), join(SALIDA, f), { recursive: true });
  }
  // El precargador de Vite arma rutas desde la raiz del dominio.
  for (const f of readdirSync(join(SALIDA, '_astro'))) {
    if (!f.startsWith('preload-helper')) continue;
    const p = join(SALIDA, '_astro', f);
    writeFileSync(p, readFileSync(p, 'utf8').replace('return`/`+e', `return\`${BASE}/\`+e`));
  }
  // Sin Jekyll: si no, GitHub Pages ignora la carpeta _astro.
  writeFileSync(join(SALIDA, '.nojekyll'), '');

  console.log(`\nInstantanea lista en ${SALIDA}/ (${paginas.length} paginas)`);
} finally {
  servidor.kill();
  detenerPreview();
}
