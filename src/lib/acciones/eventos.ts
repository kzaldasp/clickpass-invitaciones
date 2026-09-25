import { and, eq, ne } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { eventos, invitados, usuarios, type Evento } from '../../db/schema';
import { manifiestoDe } from '../../plantillas';
import { PAISES, POR_DEFECTO, SLUGS_RESERVADOS, ZONAS } from '../config';
import { configConfirmacion, type ConfigConfirmacion, type PreguntaExtra } from '../contenido';
import { instanteALocal, localAInstante } from '../fechas';
import { centavos, entero, filas, marcado, texto } from '../formularios';
import { normalizarTelefono } from '../telefonos';
import { slugificar } from '../texto';
import { borrarMediosDe } from '../medios';
import { tokenSeguro } from '../tokens';

/**
 * Crear y configurar eventos (admin). La pagina re-renderiza el formulario con
 * `valores` si algo falla, asi no se pierde lo escrito.
 */

export interface PreguntaForm {
  id: string;
  etiqueta: string;
  tipo: PreguntaExtra['tipo'];
  opciones: string;
  obligatoria: boolean;
}

export interface ValoresEvento {
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  slug: string;
  plantilla: string;
  preset: string;
  tipo: string;
  festejado: string;
  pais: string;
  zonaHoraria: string;
  prefijoTelefono: string;
  fechaLocal: string;
  limiteInvitados: string;
  precio: string;
  moneda: string;
  pedirPases: boolean;
  pedirMensaje: boolean;
  fechaLimiteLocal: string;
  preguntas: PreguntaForm[];
}

export function valoresVacios(): ValoresEvento {
  const pais = PAISES.find((p) => p.codigo === POR_DEFECTO.pais)!;
  return {
    clienteId: '',
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    slug: '',
    plantilla: 'aracnido',
    preset: '',
    tipo: '',
    festejado: '',
    pais: pais.codigo,
    zonaHoraria: pais.zona,
    prefijoTelefono: pais.prefijo,
    fechaLocal: '',
    limiteInvitados: '100',
    precio: '',
    moneda: POR_DEFECTO.moneda,
    pedirPases: true,
    pedirMensaje: false,
    fechaLimiteLocal: '',
    preguntas: [],
  };
}

export function valoresDe(e: Evento): ValoresEvento {
  return {
    ...valoresVacios(),
    clienteId: e.clienteId,
    slug: e.slug,
    plantilla: e.plantilla,
    preset: e.preset ?? '',
    tipo: e.contenido.tipo,
    festejado: e.contenido.festejado.nombre,
    pais: e.pais,
    zonaHoraria: e.zonaHoraria,
    prefijoTelefono: e.prefijoTelefono,
    fechaLocal: instanteALocal(e.fecha, e.zonaHoraria),
    limiteInvitados: String(e.limiteInvitados),
    precio: (e.precio / 100).toFixed(2),
    moneda: e.moneda,
    pedirPases: e.configConfirmacion.pedirPases,
    pedirMensaje: e.configConfirmacion.pedirMensaje,
    fechaLimiteLocal: e.fechaLimiteConfirmacion ? instanteALocal(e.fechaLimiteConfirmacion, e.zonaHoraria) : '',
    preguntas: e.configConfirmacion.preguntas.map((p) => ({
      id: p.id,
      etiqueta: p.etiqueta,
      tipo: p.tipo,
      opciones: p.tipo === 'opcion' ? p.opciones.join(', ') : '',
      obligatoria: p.obligatoria,
    })),
  };
}

function leer(form: FormData): ValoresEvento {
  return {
    clienteId: texto(form, 'clienteId', 64),
    clienteNombre: texto(form, 'clienteNombre', 120),
    clienteEmail: texto(form, 'clienteEmail', 200).toLowerCase(),
    clienteTelefono: texto(form, 'clienteTelefono', 30),
    slug: texto(form, 'slug', 80).toLowerCase(),
    plantilla: texto(form, 'plantilla', 60),
    preset: texto(form, 'preset', 60),
    tipo: texto(form, 'tipo', 120),
    festejado: texto(form, 'festejado', 120),
    pais: texto(form, 'pais', 2).toUpperCase(),
    zonaHoraria: texto(form, 'zonaHoraria', 60),
    prefijoTelefono: texto(form, 'prefijoTelefono', 4).replace(/\D/g, ''),
    fechaLocal: texto(form, 'fechaLocal', 20),
    limiteInvitados: texto(form, 'limiteInvitados', 6),
    precio: texto(form, 'precio', 12),
    moneda: texto(form, 'moneda', 3).toUpperCase() || POR_DEFECTO.moneda,
    pedirPases: marcado(form, 'pedirPases'),
    pedirMensaje: marcado(form, 'pedirMensaje'),
    fechaLimiteLocal: texto(form, 'fechaLimiteLocal', 20),
    preguntas: filas(form, 'preguntas')
      .filter((f) => f.etiqueta)
      .map((f) => ({
        id: f.id || slugificar(f.etiqueta).slice(0, 30) || tokenSeguro(6),
        etiqueta: f.etiqueta.slice(0, 160),
        tipo: (['texto', 'si_no', 'opcion'].includes(f.tipo) ? f.tipo : 'texto') as PreguntaExtra['tipo'],
        opciones: f.opciones ?? '',
        obligatoria: f.obligatoria === 'on',
      })),
  };
}

type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string; valores: ValoresEvento };

const SLUG_VALIDO = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

async function validarComun(v: ValoresEvento, idActual?: string) {
  if (!SLUG_VALIDO.test(v.slug)) return 'El link del evento solo admite minúsculas, números y guiones.';
  if (SLUGS_RESERVADOS.includes(v.slug)) return `"${v.slug}" está reservado, elige otro link.`;
  const choque = await db().query.eventos.findFirst({
    where: idActual ? and(eq(eventos.slug, v.slug), ne(eventos.id, idActual)) : eq(eventos.slug, v.slug),
  });
  if (choque) return `Ya existe un evento con el link /${v.slug}.`;

  if (!manifiestoDe(v.plantilla)) return 'Elige una plantilla.';
  if (!ZONAS.includes(v.zonaHoraria)) return 'Zona horaria no válida.';
  if (!/^\d{1,4}$/.test(v.prefijoTelefono)) return 'El prefijo telefónico debe tener de 1 a 4 dígitos.';
  if (!v.fechaLocal) return 'Indica la fecha y hora del evento.';

  const limite = Number(v.limiteInvitados);
  if (!Number.isInteger(limite) || limite < 1 || limite > 5000) return 'El límite de invitados debe estar entre 1 y 5000.';

  for (const p of v.preguntas) {
    if (p.tipo === 'opcion' && p.opciones.split(',').filter((o) => o.trim()).length < 2) {
      return `La pregunta "${p.etiqueta}" necesita al menos dos opciones separadas por comas.`;
    }
  }
  return null;
}

function construirConfig(v: ValoresEvento): ConfigConfirmacion {
  const ids = new Set<string>();
  return configConfirmacion.parse({
    pedirPases: v.pedirPases,
    pedirMensaje: v.pedirMensaje,
    preguntas: v.preguntas.map((p) => {
      // Ids unicos: dos preguntas con la misma etiqueta no comparten respuestas.
      let id = p.id;
      for (let n = 2; ids.has(id); n++) id = `${p.id}-${n}`;
      ids.add(id);
      return p.tipo === 'opcion'
        ? { id, tipo: 'opcion', etiqueta: p.etiqueta, obligatoria: p.obligatoria, opciones: p.opciones.split(',').map((o) => o.trim()).filter(Boolean) }
        : { id, tipo: p.tipo, etiqueta: p.etiqueta, obligatoria: p.obligatoria };
    }),
  });
}

function fechas(v: ValoresEvento) {
  const fecha = localAInstante(v.fechaLocal, v.zonaHoraria);
  const fechaLimiteConfirmacion = v.fechaLimiteLocal ? localAInstante(v.fechaLimiteLocal, v.zonaHoraria) : null;
  if (fechaLimiteConfirmacion && fechaLimiteConfirmacion > fecha) {
    return { error: 'La fecha límite para confirmar no puede ser posterior al evento.' } as const;
  }
  return { fecha, fechaLimiteConfirmacion } as const;
}

export async function crearEvento(form: FormData): Promise<Resultado<Evento>> {
  const v = leer(form);
  const falla = (error: string) => ({ ok: false as const, error, valores: v });

  if (!v.tipo || !v.festejado) return falla('Indica el tipo de evento y el nombre del festejado.');
  const error = await validarComun(v);
  if (error) return falla(error);

  const f = fechas(v);
  if ('error' in f) return falla(f.error!);

  const precio = v.precio ? centavos(form, 'precio') : 0;
  if (precio === null) return falla('Precio no válido. Usa números, por ejemplo 45.00');

  // Cliente existente o nuevo en el mismo paso.
  let clienteId = v.clienteId;
  if (!clienteId || clienteId === 'nuevo') {
    if (!v.clienteNombre) return falla('Elige un cliente o escribe el nombre del cliente nuevo.');
    if (v.clienteEmail) {
      const existe = await db().query.usuarios.findFirst({ where: eq(usuarios.email, v.clienteEmail) });
      if (existe) return falla(`Ya hay un usuario con el correo ${v.clienteEmail}. Elígelo en la lista.`);
    }
    const [c] = await db()
      .insert(usuarios)
      .values({
        rol: 'cliente',
        nombre: v.clienteNombre,
        email: v.clienteEmail || null,
        telefono: normalizarTelefono(v.clienteTelefono, v.prefijoTelefono),
      })
      .returning();
    clienteId = c.id;
  }

  const m = manifiestoDe(v.plantilla)!;
  const [evento] = await db()
    .insert(eventos)
    .values({
      slug: v.slug,
      clienteId,
      plantilla: m.slug,
      plantillaVersion: m.version,
      preset: v.preset || null,
      estado: 'borrador',
      fecha: f.fecha,
      zonaHoraria: v.zonaHoraria,
      pais: v.pais,
      // Nace con el contenido de la demo: la vista previa se ve completa desde
      // el primer minuto y el cliente solo reemplaza textos.
      contenido: { ...m.demo.contenido, tipo: v.tipo, festejado: { nombre: v.festejado } },
      configConfirmacion: construirConfig(v),
      fechaLimiteConfirmacion: f.fechaLimiteConfirmacion,
      limiteInvitados: Number(v.limiteInvitados),
      prefijoTelefono: v.prefijoTelefono,
      tokenPanel: tokenSeguro(12),
      precio,
      moneda: v.moneda,
    })
    .returning();

  return { ok: true, valor: evento };
}

export async function actualizarEvento(e: Evento, form: FormData): Promise<Resultado<Evento>> {
  const v = { ...leer(form), tipo: e.contenido.tipo, festejado: e.contenido.festejado.nombre };
  const falla = (error: string) => ({ ok: false as const, error, valores: v });

  const error = await validarComun(v, e.id);
  if (error) return falla(error);
  const f = fechas(v);
  if ('error' in f) return falla(f.error!);
  const precio = v.precio ? centavos(form, 'precio') : 0;
  if (precio === null) return falla('Precio no válido. Usa números, por ejemplo 45.00');
  if (!v.clienteId) return falla('Elige el cliente.');

  // Bajar el limite por debajo de los invitados actuales no borra a nadie: solo
  // impide agregar mas. Se avisa para que no sea una sorpresa.
  const m = manifiestoDe(v.plantilla)!;
  const cambiaPlantilla = m.slug !== e.plantilla;

  const [actualizado] = await db()
    .update(eventos)
    .set({
      slug: v.slug,
      clienteId: v.clienteId,
      plantilla: m.slug,
      plantillaVersion: cambiaPlantilla ? m.version : e.plantillaVersion,
      preset: m.presets?.some((p) => p.id === v.preset) ? v.preset : null,
      fecha: f.fecha,
      zonaHoraria: v.zonaHoraria,
      pais: v.pais,
      configConfirmacion: construirConfig(v),
      fechaLimiteConfirmacion: f.fechaLimiteConfirmacion,
      limiteInvitados: Number(v.limiteInvitados),
      prefijoTelefono: v.prefijoTelefono,
      precio,
      moneda: v.moneda,
    })
    .where(eq(eventos.id, e.id))
    .returning();

  return { ok: true, valor: actualizado };
}

export async function cambiarEstado(e: Evento, estado: 'borrador' | 'publicado'): Promise<void> {
  await db().update(eventos).set({ estado }).where(eq(eventos.id, e.id));
}

/** Borra invitados y confirmaciones. Pagos y link general se conservan. No se deshace. */
export async function finalizarEvento(e: Evento): Promise<number> {
  const borrados = await db().delete(invitados).where(eq(invitados.eventoId, e.id)).returning({ id: invitados.id });
  await db().update(eventos).set({ estado: 'finalizado', finalizadoEn: new Date() }).where(eq(eventos.id, e.id));
  return borrados.length;
}

export async function regenerarPanel(e: Evento): Promise<string> {
  const tokenPanel = tokenSeguro(12);
  await db().update(eventos).set({ tokenPanel }).where(eq(eventos.id, e.id));
  return tokenPanel;
}

export async function eliminarEvento(e: Evento): Promise<void> {
  await borrarMediosDe(e);
  await db().delete(eventos).where(eq(eventos.id, e.id));
}
