import { MENSAJE_RECORDATORIO, MENSAJE_WHATSAPP } from './config';
import { instanteALocal, localAInstante } from './fechas';
import { rellenar } from './texto';
import type { Evento, Invitado } from '../db/schema';
import type { ConfirmacionVista, EventoVista, InvitadoVista, Manifiesto } from '../plantillas/tipos';

/** Filas de la base -> props del contrato de plantilla. */

export function eventoVista(e: Evento): EventoVista {
  return {
    slug: e.slug,
    contenido: e.contenido,
    fecha: e.fecha,
    zonaHoraria: e.zonaHoraria,
    estado: e.estado,
    preset: e.preset,
  };
}

export function invitadoVista(i: Invitado): InvitadoVista {
  return { token: i.token, nombre: i.nombre, pases: i.pases, nota: i.nota, ingresado: !!i.ingresadoEn };
}

/** Sin fecha limite, se puede responder hasta que empiece el evento. */
export function fechaLimite(e: Evento): Date {
  return e.fechaLimiteConfirmacion ?? e.fecha;
}

export function puedeResponder(e: Evento, ahora = new Date()): boolean {
  return e.estado === 'publicado' && ahora < fechaLimite(e);
}

export function confirmacionVista(e: Evento, i?: Invitado): ConfirmacionVista {
  if (!i) {
    return { modo: 'general', config: e.configConfirmacion, abierta: false, fechaLimite: fechaLimite(e), respuesta: null };
  }
  return {
    modo: 'invitado',
    config: e.configConfirmacion,
    abierta: puedeResponder(e),
    fechaLimite: fechaLimite(e),
    respuesta: {
      estado: i.respuesta,
      pasesConfirmados: i.pasesConfirmados,
      mensaje: i.mensaje,
      extras: i.respuestasExtra ?? {},
    },
  };
}

/**
 * Vista previa sin guardar nada: la demo del catalogo o el "asi lo vera tu
 * invitado" del panel. El invitado es ficticio y el formulario no envia.
 */
export function vistaDemo(
  m: Manifiesto,
  base?: Pick<Evento, 'slug' | 'contenido' | 'fecha' | 'zonaHoraria' | 'configConfirmacion' | 'preset'>,
  invitadoDemo = m.demo.invitado,
) {
  // Demo: N dias desde hoy, a la hora del primer lugar (no a la hora actual).
  const zonaDemo = m.demo.zonaHoraria;
  const dia = instanteALocal(new Date(Date.now() + m.demo.diasHastaEvento * 86_400_000), zonaDemo).slice(0, 10);
  const fecha = base?.fecha ?? localAInstante(`${dia}T${m.demo.contenido.lugares[0]?.hora ?? '17:00'}`, zonaDemo);
  const evento: EventoVista = {
    slug: base?.slug ?? `demo-${m.slug}`,
    contenido: base?.contenido ?? m.demo.contenido,
    fecha,
    zonaHoraria: base?.zonaHoraria ?? m.demo.zonaHoraria,
    estado: 'publicado',
    preset: base?.preset ?? null,
  };
  const invitado: InvitadoVista = {
    token: 'demo',
    nombre: invitadoDemo.nombre,
    pases: invitadoDemo.pases,
    nota: invitadoDemo.nota ?? null,
    ingresado: false,
  };
  const confirmacion: ConfirmacionVista = {
    modo: 'demo',
    config: base?.configConfirmacion ?? m.demo.confirmacion,
    abierta: true,
    fechaLimite: fecha,
    respuesta: null,
  };
  return { evento, invitado, confirmacion };
}

/**
 * Link personal absoluto y mensaje de WhatsApp de un invitado. Con
 * `recordatorio`, el texto es el de recordar a quien aun no responde.
 */
export function envioDe(
  e: Evento,
  i: Pick<Invitado, 'nombre' | 'token' | 'pases' | 'telefono'>,
  origen: string,
  recordatorio = false,
) {
  const link = `${origen}/${e.slug}/${i.token}`;
  const plantilla = recordatorio ? MENSAJE_RECORDATORIO : (e.mensajeWhatsapp ?? MENSAJE_WHATSAPP);
  const mensaje = rellenar(plantilla, {
    nombre: i.nombre,
    festejado: e.contenido.festejado.nombre,
    pases: i.pases === 1 ? '1 pase' : `${i.pases} pases`,
    link,
  });
  // Sin telefono, wa.me abre el selector de contactos con el texto listo.
  const whatsapp = `https://wa.me/${i.telefono ?? ''}?text=${encodeURIComponent(mensaje)}`;
  return { link, mensaje, whatsapp };
}
