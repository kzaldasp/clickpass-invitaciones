import { and, eq } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { pagos, type Evento } from '../../db/schema';
import { localAInstante } from '../fechas';
import { centavos, texto } from '../formularios';

export async function registrarPago(e: Evento, form: FormData, usuarioId: string): Promise<string | null> {
  const monto = centavos(form, 'monto');
  if (!monto || monto <= 0) return 'Monto no válido. Usa números, por ejemplo 20.00';
  const metodo = texto(form, 'metodo', 20);
  if (metodo !== 'transferencia' && metodo !== 'efectivo' && metodo !== 'otro') return 'Elige el método de pago.';
  const dia = texto(form, 'fecha', 10);
  // Un pago es de un dia, no de una hora: mediodia en la zona del evento.
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(dia) ? localAInstante(`${dia}T12:00`, e.zonaHoraria) : new Date();

  await db()
    .insert(pagos)
    .values({ eventoId: e.id, monto, metodo, fecha, nota: texto(form, 'nota', 200) || null, registradoPor: usuarioId });
  return null;
}

export async function borrarPago(e: Evento, pagoId: string): Promise<void> {
  await db().delete(pagos).where(and(eq(pagos.id, pagoId), eq(pagos.eventoId, e.id)));
}
