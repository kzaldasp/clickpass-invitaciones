import type { AstroCookies } from 'astro';

/**
 * Aviso de un solo uso (flash) que sobrevive a un redirect: la pagina procesa
 * el POST, deja el aviso y redirige; el middleware lo lee, lo borra y el layout
 * lo muestra como toast.
 */
export interface Aviso {
  texto: string;
  tipo: 'exito' | 'error' | 'info';
}

const COOKIE = 'cp_aviso';

export function ponerAviso(cookies: AstroCookies, texto: string, tipo: Aviso['tipo'] = 'exito'): void {
  cookies.set(COOKIE, JSON.stringify({ texto, tipo }), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 });
}

export function tomarAviso(cookies: AstroCookies): Aviso | undefined {
  const crudo = cookies.get(COOKIE)?.value;
  if (!crudo) return undefined;
  cookies.delete(COOKIE, { path: '/' });
  try {
    const a = JSON.parse(crudo) as Aviso;
    return typeof a.texto === 'string' ? a : undefined;
  } catch {
    return undefined;
  }
}
