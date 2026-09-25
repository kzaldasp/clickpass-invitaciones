import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { invitadoPorToken } from '../../db/consultas';
import { invitados } from '../../db/schema';
import { textoResumen, validarRespuesta } from '../../lib/confirmar';
import { puedeResponder } from '../../lib/vistas';

/**
 * Guarda la respuesta de un invitado. Con JS responde JSON; sin JS redirige de
 * vuelta a su invitacion (303, para que recargar no reenvie el formulario).
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const quiereJson = request.headers.get('accept')?.includes('application/json');
  const responder = (status: number, cuerpo: { ok: boolean; error?: string; resumen?: string }, volver?: string) =>
    quiereJson || !volver
      ? Response.json(cuerpo, { status })
      : redirect(volver + (cuerpo.ok ? '?confirmado=1#confirmacion' : '#confirmacion'), 303);

  const form = await request.formData();
  const token = form.get('token');
  if (typeof token !== 'string' || !token) return responder(400, { ok: false, error: 'Link inválido.' });

  const fila = await invitadoPorToken(token);
  if (!fila) return responder(404, { ok: false, error: 'Esta invitación ya no existe.' });

  const { invitado, evento } = fila;
  const volver = `/${evento.slug}/${invitado.token}`;

  if (!puedeResponder(evento)) {
    const error = evento.estado === 'publicado' ? 'El plazo para confirmar ya cerró.' : 'Esta invitación aún no está publicada.';
    return responder(409, { ok: false, error }, volver);
  }

  const r = validarRespuesta(form, evento.configConfirmacion, invitado.pases);
  if (!r.ok) return responder(422, { ok: false, error: r.error }, volver);

  // Una respuesta por invitado: cambiarla la sobrescribe (gana la ultima).
  await db()
    .update(invitados)
    .set({ ...r.datos, respondidoEn: new Date(), abiertoEn: invitado.abiertoEn ?? new Date() })
    .where(eq(invitados.id, invitado.id));

  return responder(200, { ok: true, resumen: textoResumen(r.datos) }, volver);
};
