import type { AstroCookies } from 'astro';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../db/cliente';
import { sesiones, usuarios, type Usuario } from '../db/schema';
import { sha256 } from './claves';
import { tokenSeguro } from './tokens';

/**
 * Sesion por cookie. La cookie lleva un token aleatorio; la base guarda solo su
 * hash, asi que un volcado de la base no sirve para entrar.
 */
const COOKIE = 'cp_sesion';
const DURACION_MS = 30 * 86_400_000;

export async function iniciarSesion(cookies: AstroCookies, usuarioId: string, seguro: boolean): Promise<void> {
  const token = tokenSeguro(32);
  const expiraEn = new Date(Date.now() + DURACION_MS);
  await db().insert(sesiones).values({ id: await sha256(token), usuarioId, expiraEn });
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: seguro,
    expires: expiraEn,
  });
}

export async function usuarioDeSesion(cookies: AstroCookies): Promise<Usuario | null> {
  const token = cookies.get(COOKIE)?.value;
  if (!token) return null;

  const fila = await db()
    .select({ usuario: usuarios })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(and(eq(sesiones.id, await sha256(token)), gt(sesiones.expiraEn, new Date())))
    .get();

  return fila?.usuario ?? null;
}

export async function cerrarSesion(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(COOKIE)?.value;
  if (token) await db().delete(sesiones).where(eq(sesiones.id, await sha256(token)));
  cookies.delete(COOKIE, { path: '/' });
}
