import { PAISES, POR_DEFECTO } from './config';

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

// --- Formato para mostrar ---------------------------------------------------
// Todo se formatea con la zona del evento. El locale sale de la config.

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function formato(instante: Date, zona: string, opciones: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(POR_DEFECTO.locale, { ...opciones, timeZone: zona }).format(instante);
}

/** "Sábado, 14 de noviembre de 2026" */
export function fechaLarga(instante: Date, zona: string): string {
  return capitalizar(
    formato(instante, zona, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );
}

/** Partes sueltas para bloques grandes de fecha en las plantillas. */
export function fechaPartes(instante: Date, zona: string) {
  return {
    diaSemana: capitalizar(formato(instante, zona, { weekday: 'long' })),
    dia: formato(instante, zona, { day: '2-digit' }),
    mes: capitalizar(formato(instante, zona, { month: 'long' })),
    anio: formato(instante, zona, { year: 'numeric' }),
    hora: formato(instante, zona, { hour: 'numeric', minute: '2-digit' }),
  };
}

/** "14 nov 2026, 20:00" para tablas del admin y el panel. */
export function fechaCorta(instante: Date, zona: string): string {
  return formato(instante, zona, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

/** "16:00" (hora local del evento) -> "4:00 p. m." */
export function horaLegible(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return formato(new Date(Date.UTC(2000, 0, 1, h, m)), 'UTC', { hour: 'numeric', minute: '2-digit' });
}

/** "America/Guayaquil" -> "hora de Ecuador". Para zonas sin pais, la ciudad. */
export function etiquetaZona(zona: string): string {
  const pais = PAISES.find((p) => p.zona === zona);
  if (pais) return pais.etiqueta;
  const ciudad = zona.split('/').pop()?.replace(/_/g, ' ') ?? zona;
  return `hora de ${ciudad}`;
}

/** "miércoles 28 de octubre de 2026 (11:59 p. m.)", para usar dentro de una frase. */
export function fechaEnFrase(instante: Date, zona: string): string {
  const dia = formato(instante, zona, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${dia.replace(',', '')} (${formato(instante, zona, { hour: 'numeric', minute: '2-digit' })})`;
}
