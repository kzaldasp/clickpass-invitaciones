import type { APIRoute } from 'astro';
import { leerMedio } from '../../lib/medios';

/** Sirve fotos y musica desde R2. Las claves son inmutables: cache de un ano. */
export const GET: APIRoute = async ({ params, request }) => {
  const objeto = await leerMedio(params.clave ?? '');
  if (!objeto) return new Response('No encontrado', { status: 404 });

  if (request.headers.get('if-none-match') === objeto.httpEtag) return new Response(null, { status: 304 });

  const headers = new Headers();
  objeto.writeHttpMetadata(headers);
  headers.set('etag', objeto.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(objeto.body, { headers });
};
