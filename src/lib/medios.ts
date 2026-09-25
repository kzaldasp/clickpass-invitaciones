import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { db } from '../db/cliente';
import { eventos, type Evento } from '../db/schema';
import { tokenSeguro } from './tokens';

/**
 * Fotos y musica de cada evento en R2 (binding MEDIOS). Solo el admin sube.
 * Se sirven desde /medios/{clave}; la clave lleva un sufijo aleatorio, asi que
 * el archivo es inmutable y se cachea para siempre.
 */
const TIPOS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
} as const;

const MAX_IMAGEN = 5 * 1024 * 1024;
const MAX_AUDIO = 12 * 1024 * 1024;

const prefijo = (e: Evento) => `eventos/${e.id}/`;
const claveDe = (url: string) => (url.startsWith('/medios/') ? url.slice('/medios/'.length) : null);

export async function subirMedio(e: Evento, archivo: File, tituloMusica?: string): Promise<{ error?: string; texto?: string }> {
  const ext = TIPOS[archivo.type as keyof typeof TIPOS];
  if (!ext) return { error: 'Formato no admitido. Usa JPG, PNG, WebP o AVIF para fotos y MP3 o M4A para música.' };

  const esAudio = archivo.type.startsWith('audio/');
  if (archivo.size > (esAudio ? MAX_AUDIO : MAX_IMAGEN)) {
    return { error: `El archivo pesa demasiado (máximo ${esAudio ? '12' : '5'} MB).` };
  }

  const clave = `${prefijo(e)}${tokenSeguro(10)}.${ext}`;
  await env.MEDIOS.put(clave, archivo.stream(), { httpMetadata: { contentType: archivo.type } });
  const url = `/medios/${clave}`;

  const contenido = { ...e.contenido };
  if (esAudio) {
    // Una sola cancion: la anterior se borra del bucket.
    const vieja = e.contenido.musica?.archivo && claveDe(e.contenido.musica.archivo);
    if (vieja) await env.MEDIOS.delete(vieja);
    contenido.musica = { archivo: url, titulo: tituloMusica || undefined };
  } else {
    contenido.galeria = [...e.contenido.galeria, url];
  }
  await db().update(eventos).set({ contenido }).where(eq(eventos.id, e.id));
  return { texto: esAudio ? 'Música actualizada.' : 'Foto agregada a la galería.' };
}

export async function quitarMedio(e: Evento, url: string): Promise<void> {
  const clave = claveDe(url);
  if (clave?.startsWith(prefijo(e))) await env.MEDIOS.delete(clave);

  const contenido = { ...e.contenido, galeria: e.contenido.galeria.filter((g) => g !== url) };
  if (e.contenido.musica?.archivo === url) contenido.musica = undefined;
  await db().update(eventos).set({ contenido }).where(eq(eventos.id, e.id));
}

/** La primera foto de la galeria es tambien la imagen del link en WhatsApp. */
export async function fotoPrincipal(e: Evento, url: string): Promise<void> {
  if (!e.contenido.galeria.includes(url)) return;
  const galeria = [url, ...e.contenido.galeria.filter((g) => g !== url)];
  await db().update(eventos).set({ contenido: { ...e.contenido, galeria } }).where(eq(eventos.id, e.id));
}

/** Al eliminar un evento se borran todos sus archivos. */
export async function borrarMediosDe(e: Evento): Promise<void> {
  let cursor: string | undefined;
  do {
    const lista = await env.MEDIOS.list({ prefix: prefijo(e), cursor });
    if (lista.objects.length) await env.MEDIOS.delete(lista.objects.map((o) => o.key));
    cursor = lista.truncated ? lista.cursor : undefined;
  } while (cursor);
}

export async function leerMedio(clave: string) {
  if (!clave.startsWith('eventos/')) return null;
  return env.MEDIOS.get(clave);
}
