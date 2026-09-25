import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { invitados, type Evento } from '../../db/schema';

/**
 * Check-in en la entrada. El QR del pase lleva el link personal; de ahi sale
 * el token. Un invitado ingresa una sola vez: el segundo escaneo avisa.
 */
export interface ResultadoIngreso {
  estado: 'ok' | 'repetido' | 'desconocido';
  nombre?: string;
  pases?: number;
  pasesConfirmados?: number;
  respuesta?: 'pendiente' | 'asiste' | 'no_asiste';
  ingresoEn?: string;
}

/** Acepta el link completo o solo el token: es el ultimo segmento de la ruta. */
export function tokenDeQr(texto: string): string | null {
  let ruta = texto.trim();
  try {
    ruta = new URL(ruta).pathname;
  } catch {
    /* No es URL: puede ser el token solo. */
  }
  const ultimo = ruta.split('/').filter(Boolean).pop() ?? '';
  return /^[A-Za-z0-9]{6,40}$/.test(ultimo) ? ultimo : null;
}

export async function registrarIngreso(e: Evento, token: string): Promise<ResultadoIngreso> {
  const i = await db().query.invitados.findFirst({
    where: and(eq(invitados.eventoId, e.id), eq(invitados.token, token)),
  });
  if (!i) return { estado: 'desconocido' };

  const base = { nombre: i.nombre, pases: i.pases, pasesConfirmados: i.pasesConfirmados, respuesta: i.respuesta };
  if (i.ingresadoEn) return { ...base, estado: 'repetido', ingresoEn: i.ingresadoEn.toISOString() };

  // El WHERE con isNull evita que dos celulares en la puerta lo marquen dos veces.
  const marcado = await db()
    .update(invitados)
    .set({ ingresadoEn: new Date() })
    .where(and(eq(invitados.id, i.id), isNull(invitados.ingresadoEn)))
    .returning({ id: invitados.id });
  return marcado.length ? { ...base, estado: 'ok' } : { ...base, estado: 'repetido' };
}

export async function deshacerIngreso(e: Evento, id: string): Promise<void> {
  await db()
    .update(invitados)
    .set({ ingresadoEn: null })
    .where(and(eq(invitados.id, id), eq(invitados.eventoId, e.id)));
}

export async function marcarIngresoManual(e: Evento, id: string): Promise<void> {
  await db()
    .update(invitados)
    .set({ ingresadoEn: new Date() })
    .where(and(eq(invitados.id, id), eq(invitados.eventoId, e.id), isNull(invitados.ingresadoEn)));
}
