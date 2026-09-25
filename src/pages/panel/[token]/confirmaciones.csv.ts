import type { APIRoute } from 'astro';
import { invitadosDe } from '../../../db/consultas';
import { fechaCorta } from '../../../lib/fechas';
import { envioDe } from '../../../lib/vistas';

/** Lista con respuestas para Excel. BOM al inicio: sin el, Excel rompe las tildes. */
export const GET: APIRoute = async ({ locals, url }) => {
  const e = locals.evento!;
  const lista = await invitadosDe(e.id);
  const preguntas = e.configConfirmacion.preguntas;

  const celda = (v: unknown) => {
    const t = v === null || v === undefined ? '' : String(v);
    // Comillas siempre; y un apostrofo delante de algo que Excel leeria como
    // formula (=, @, o +/- que no abren un numero) evita formulas inyectadas.
    const peligroso = /^[=@\t\r]/.test(t) || /^[+-](?!\d)/.test(t);
    return `"${(peligroso ? `'${t}` : t).replace(/"/g, '""')}"`;
  };
  const respuesta = { asiste: 'Asiste', no_asiste: 'No asiste', pendiente: 'Sin responder' } as const;

  const encabezado = ['Nombre', 'Pases', 'Pases confirmados', 'Respuesta', 'Teléfono', 'Abrió', 'Respondió', 'Mensaje', ...preguntas.map((p) => p.etiqueta), 'Link'];
  const filas = lista.map((i) => [
    i.nombre,
    i.pases,
    i.respuesta === 'asiste' ? i.pasesConfirmados : 0,
    respuesta[i.respuesta],
    i.telefono ? `+${i.telefono}` : '',
    i.abiertoEn ? fechaCorta(i.abiertoEn, e.zonaHoraria) : '',
    i.respondidoEn ? fechaCorta(i.respondidoEn, e.zonaHoraria) : '',
    i.mensaje ?? '',
    ...preguntas.map((p) => {
      const v = i.respuestasExtra?.[p.id];
      return v === true ? 'Sí' : v === false ? 'No' : (v ?? '');
    }),
    envioDe(e, i, url.origin).link,
  ]);

  const csv = '\uFEFF' + [encabezado, ...filas].map((f) => f.map(celda).join(',')).join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="invitados-${e.slug}.csv"`,
    },
  });
};
