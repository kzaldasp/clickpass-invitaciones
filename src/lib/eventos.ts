import { getCollection, type CollectionEntry } from 'astro:content';
import { POR_DEFECTO } from './config';

export type Evento = CollectionEntry<'eventos'>;
export type DatosEvento = Evento['data'];
export type Invitado = Extract<
  DatosEvento['pases'],
  { modo: 'lista' }
>['invitados'][number];

/** Un archivado ya paso: su link deja de existir en el proximo build. */
export async function eventosVivos(): Promise<Evento[]> {
  return getCollection('eventos', ({ data }) => data.estado !== 'archivado');
}

/** Eventos con lista nominal: los unicos que generan rutas por invitado. */
export async function eventosConLista(): Promise<Evento[]> {
  const vivos = await eventosVivos();
  return vivos.filter((e) => e.data.pases.modo === 'lista');
}

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "sábado 14 de noviembre de 2026" -> "Sábado 14 de noviembre de 2026" */
export function fechaLarga(fecha: Date, zonaHoraria: string): string {
  return capitalizar(
    new Intl.DateTimeFormat(POR_DEFECTO.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: zonaHoraria,
    }).format(fecha),
  );
}

/** Partes sueltas para el bloque grande de fecha de la portada. */
export function fechaPartes(fecha: Date, zonaHoraria: string) {
  const parte = (opciones: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(POR_DEFECTO.locale, { ...opciones, timeZone: zonaHoraria }).format(fecha);

  return {
    diaSemana: capitalizar(parte({ weekday: 'long' })),
    dia: parte({ day: '2-digit' }),
    mes: capitalizar(parte({ month: 'long' })),
    anio: parte({ year: 'numeric' }),
  };
}

/** Texto de pases segun el modo del evento y el invitado que abre el link. */
export function textoPases(datos: DatosEvento, invitado?: Invitado): string | null {
  const cantidad = invitado?.pases ?? (datos.pases.modo === 'generico' ? datos.pases.cantidad : null);

  if (!cantidad) return null;
  return cantidad === 1 ? '1 pase' : `${cantidad} pases`;
}

/** Busca un invitado por su slug dentro de un evento con lista. */
export function buscarInvitado(datos: DatosEvento, slug: string): Invitado | undefined {
  if (datos.pases.modo !== 'lista') return undefined;
  return datos.pases.invitados.find((i) => i.slug === slug);
}
