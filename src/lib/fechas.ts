/**
 * Conversion entre la hora local de un evento y el instante UTC que se guarda.
 *
 * Regla: la base solo guarda instantes UTC. Lo que escribe el admin o el
 * cliente ("2026-11-14T20:00" en un <input type="datetime-local">) es hora
 * local DEL EVENTO, no del servidor (UTC) ni del navegador de quien edita.
 */

/** Offset de una zona en un instante dado, en minutos (Guayaquil -> -300). */
function offsetMinutos(instante: Date, zona: string): number {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(instante)
      .map((p) => [p.type, p.value]),
  );

  const comoUTC = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second),
  );

  return Math.round((comoUTC - instante.getTime()) / 60_000);
}

/**
 * "2026-11-14T20:00" en "America/Guayaquil" -> 2026-11-15T01:00:00Z.
 *
 * Se calcula el offset dos veces: la primera estimacion puede caer del otro
 * lado de un cambio de horario (Madrid, Chile, EE. UU.).
 */
export function localAInstante(fechaHoraLocal: string, zona: string): Date {
  const m = fechaHoraLocal.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error(`Fecha local invalida: "${fechaHoraLocal}"`);

  const [, a, mes, d, h, min, s = '0'] = m;
  const ingenuo = Date.UTC(+a, +mes - 1, +d, +h, +min, +s);

  const primero = ingenuo - offsetMinutos(new Date(ingenuo), zona) * 60_000;
  const ajustado = ingenuo - offsetMinutos(new Date(primero), zona) * 60_000;
  return new Date(ajustado);
}

/** Inverso: instante UTC -> "2026-11-14T20:00", listo para un datetime-local. */
export function instanteALocal(instante: Date, zona: string): string {
  const local = new Date(instante.getTime() + offsetMinutos(instante, zona) * 60_000);
  return local.toISOString().slice(0, 16);
}
