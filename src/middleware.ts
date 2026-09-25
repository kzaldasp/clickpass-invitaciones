import { defineMiddleware } from 'astro:middleware';
import { eventoPorTokenPanel } from './db/consultas';
import { tomarAviso } from './lib/aviso';
import { usuarioDeSesion } from './lib/sesion';

/**
 * Permisos por zona:
 *   /admin/*          -> sesion de admin (salvo /admin/entrar).
 *   /panel/{token}/*  -> el token del link privado ES el permiso. Si el token no
 *                        existe, 404. Un admin tambien entra por aqui ("mismo editor").
 *   /panel            -> lista de eventos del cliente con sesion (login por correo).
 *   resto             -> publico.
 */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const ruta = ctx.url.pathname;
  const privada = ruta.startsWith('/admin') || ruta.startsWith('/panel') || ruta.startsWith('/entrar');

  if (privada) {
    ctx.locals.aviso = tomarAviso(ctx.cookies);
    ctx.locals.usuario = (await usuarioDeSesion(ctx.cookies)) ?? undefined;
  }

  if (ruta.startsWith('/admin') && !ruta.startsWith('/admin/entrar')) {
    if (ctx.locals.usuario?.rol !== 'admin') {
      return ctx.redirect(`/admin/entrar?volver=${encodeURIComponent(ruta + ctx.url.search)}`);
    }
  }

  const panel = ruta.match(/^\/panel\/([A-Za-z0-9]{10,})(?:\/|$)/);
  if (panel) {
    const evento = await eventoPorTokenPanel(panel[1]);
    if (!evento) return ctx.rewrite('/404');
    ctx.locals.evento = evento;
  } else if (ruta === '/panel' || ruta === '/panel/') {
    if (!ctx.locals.usuario) return ctx.redirect('/entrar');
  }

  const respuesta = await next();

  // Nada privado ni personal se cachea: cada link muestra datos vivos.
  if (privada || ctx.url.pathname.split('/').filter(Boolean).length === 2) {
    respuesta.headers.set('Cache-Control', 'private, no-store');
  }
  if (privada) respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return respuesta;
});
