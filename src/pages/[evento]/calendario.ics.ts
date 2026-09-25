import type { APIRoute } from 'astro';
import { eventoPorSlug } from '../../db/consultas';

/** Archivo .ics del evento (iPhone, Outlook). Instantes en UTC. */
export const GET: APIRoute = async ({ params, url }) => {
  const e = await eventoPorSlug(params.evento!);
  if (!e) return new Response('No encontrado', { status: 404 });

  const c = e.contenido;
  const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  // RFC 5545: escapar comas, punto y coma y saltos de linea.
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const lugar = c.lugares[0] ? `${c.lugares[0].nombre}, ${c.lugares[0].direccion}` : '';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClickPass//Invitaciones//ES',
    'BEGIN:VEVENT',
    `UID:${e.id}@clickpass`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(e.fecha)}`,
    `DTEND:${utc(new Date(e.fecha.getTime() + 5 * 3_600_000))}`,
    `SUMMARY:${esc(`${c.tipo} · ${c.festejado.nombre}`)}`,
    `LOCATION:${esc(lugar)}`,
    `URL:${url.origin}/${e.slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${e.slug}.ics"`,
    },
  });
};
