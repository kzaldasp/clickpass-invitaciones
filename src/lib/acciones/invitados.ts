import { and, eq } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { eventos, invitados, type Evento } from '../../db/schema';
import { totalInvitados, invitadosDe } from '../../db/consultas';
import { entero, texto } from '../formularios';
import { leerLista } from '../lista';
import { normalizarTelefono } from '../telefonos';
import { normalizarNombre } from '../texto';
import { tokenSeguro } from '../tokens';

/**
 * Gestion de la lista de invitados desde el panel (cliente o admin). Toda
 * funcion devuelve un texto para el aviso; `error: true` si no se hizo nada.
 */
type Resultado = { texto: string; error?: boolean };

const MAX_PASES = 50;

function bloqueado(e: Evento): Resultado | null {
  return e.estado === 'finalizado' ? { texto: 'El evento ya finalizó; la lista no se puede cambiar.', error: true } : null;
}

export async function agregarInvitado(e: Evento, form: FormData): Promise<Resultado> {
  const b = bloqueado(e);
  if (b) return b;
  const nombre = texto(form, 'nombre', 120);
  if (!nombre) return { texto: 'Escribe el nombre del invitado.', error: true };
  if ((await totalInvitados(e.id)) >= e.limiteInvitados) {
    return { texto: `Llegaste al límite de ${e.limiteInvitados} invitados de tu plan.`, error: true };
  }
  const crudo = texto(form, 'telefono', 30);
  const telefono = normalizarTelefono(crudo, e.prefijoTelefono);
  const pases = Math.min(Math.max(entero(form, 'pases') ?? 1, 1), MAX_PASES);

  await db()
    .insert(invitados)
    .values({ eventoId: e.id, token: tokenSeguro(), nombre, pases, telefono, nota: texto(form, 'nota', 200) || null });

  return {
    texto: crudo && !telefono ? `${nombre} agregado, pero el teléfono no es válido: se guardó sin WhatsApp.` : `${nombre} agregado.`,
  };
}

export async function editarInvitado(e: Evento, form: FormData): Promise<Resultado> {
  const b = bloqueado(e);
  if (b) return b;
  const id = texto(form, 'id', 64);
  const actual = await db().query.invitados.findFirst({ where: and(eq(invitados.id, id), eq(invitados.eventoId, e.id)) });
  if (!actual) return { texto: 'Ese invitado ya no existe.', error: true };

  const nombre = texto(form, 'nombre', 120);
  if (!nombre) return { texto: 'El nombre no puede quedar vacío.', error: true };
  const crudo = texto(form, 'telefono', 30);
  const telefono = normalizarTelefono(crudo, e.prefijoTelefono);
  const pases = Math.min(Math.max(entero(form, 'pases') ?? actual.pases, 1), MAX_PASES);

  await db()
    .update(invitados)
    .set({
      nombre,
      pases,
      telefono,
      nota: texto(form, 'nota', 200) || null,
      // Si se le quitan pases, lo confirmado no puede quedar por encima.
      pasesConfirmados: Math.min(actual.pasesConfirmados, pases),
    })
    .where(eq(invitados.id, id));

  return { texto: crudo && !telefono ? 'Guardado, pero el teléfono no es válido.' : 'Invitado actualizado.' };
}

export async function borrarInvitado(e: Evento, form: FormData): Promise<Resultado> {
  const b = bloqueado(e);
  if (b) return b;
  const borrado = await db()
    .delete(invitados)
    .where(and(eq(invitados.id, texto(form, 'id', 64)), eq(invitados.eventoId, e.id)))
    .returning({ nombre: invitados.nombre });
  return borrado.length
    ? { texto: `${borrado[0].nombre} eliminado. Su link ya no funciona.` }
    : { texto: 'Ese invitado ya no existe.', error: true };
}

/**
 * Importa una lista y AGREGA: los que ya existen (mismo telefono o mismo nombre
 * normalizado) se ignoran, asi no se pierden links enviados ni respuestas.
 */
export async function importarInvitados(e: Evento, form: FormData): Promise<Resultado> {
  const b = bloqueado(e);
  if (b) return b;
  const { filas, descartadas } = leerLista(texto(form, 'lista', 400_000), MAX_PASES);
  if (!filas.length) return { texto: 'No encontré nombres en la lista. Revisa que tenga una columna "Nombre".', error: true };

  const existentes = await invitadosDe(e.id);
  const nombres = new Set(existentes.map((i) => normalizarNombre(i.nombre)));
  const telefonos = new Set(existentes.map((i) => i.telefono).filter(Boolean));
  let libres = e.limiteInvitados - existentes.length;

  const nuevos: (typeof invitados.$inferInsert)[] = [];
  let duplicados = 0;
  let fueraDeLimite = 0;
  let sinTelefono = 0;

  for (const f of filas) {
    const telefono = normalizarTelefono(f.telefono, e.prefijoTelefono);
    const nombre = normalizarNombre(f.nombre);
    if (nombres.has(nombre) || (telefono && telefonos.has(telefono))) {
      duplicados++;
      continue;
    }
    if (libres <= 0) {
      fueraDeLimite++;
      continue;
    }
    if (f.telefono && !telefono) sinTelefono++;
    nombres.add(nombre);
    if (telefono) telefonos.add(telefono);
    libres--;
    nuevos.push({ eventoId: e.id, token: tokenSeguro(), nombre: f.nombre, pases: f.pases, telefono, nota: f.nota || null });
  }

  // Turso limita el tamano de cada sentencia: se inserta por lotes.
  for (let i = 0; i < nuevos.length; i += 100) {
    await db().insert(invitados).values(nuevos.slice(i, i + 100));
  }

  const partes = [`${nuevos.length} invitados agregados`];
  if (duplicados) partes.push(`${duplicados} ya estaban en la lista`);
  if (fueraDeLimite) partes.push(`${fueraDeLimite} quedaron fuera por el límite de ${e.limiteInvitados}`);
  if (sinTelefono) partes.push(`${sinTelefono} con teléfono no válido (sin WhatsApp)`);
  if (descartadas) partes.push(`${descartadas} filas sin nombre ignoradas`);
  return { texto: `${partes.join(' · ')}.`, error: nuevos.length === 0 };
}

export async function guardarMensaje(e: Evento, form: FormData): Promise<Resultado> {
  const mensaje = texto(form, 'mensaje', 1000);
  if (!mensaje.includes('{link}')) return { texto: 'El mensaje debe incluir {link}: sin él, el invitado no recibe su invitación.', error: true };
  await db().update(eventos).set({ mensajeWhatsapp: mensaje }).where(eq(eventos.id, e.id));
  return { texto: 'Mensaje guardado.' };
}
