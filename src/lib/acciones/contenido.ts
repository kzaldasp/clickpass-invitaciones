import { eq } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { eventos, type Evento } from '../../db/schema';
import { manifiestoDe } from '../../plantillas';
import { contenidoEvento, type ContenidoEvento } from '../contenido';
import { instanteALocal, localAInstante } from '../fechas';
import { filas, opcional, texto } from '../formularios';

/**
 * Editor de la invitacion (panel). Cliente y admin editan textos y datos; las
 * fotos y la musica se gestionan aparte (src/lib/medios.ts, solo admin).
 */

export interface ValoresContenido {
  contenido: ContenidoEvento;
  fechaLocal: string;
}

export function valoresContenido(e: Evento): ValoresContenido {
  return { contenido: e.contenido, fechaLocal: instanteALocal(e.fecha, e.zonaHoraria) };
}

type Resultado = { ok: true } | { ok: false; error: string; valores: ValoresContenido };

export async function guardarContenido(e: Evento, form: FormData): Promise<Resultado> {
  const m = manifiestoDe(e.plantilla);
  const edad = texto(form, 'edad', 3);
  const nombresAnfitriones = texto(form, 'anfitriones', 1000)
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const extras: Record<string, unknown> = { ...e.contenido.extras };
  for (const campo of m?.extras ?? []) {
    const v = texto(form, `extras.${campo.clave}`, 2000);
    extras[campo.clave] =
      campo.tipo === 'si_no' ? form.get(`extras.${campo.clave}`) === 'on' : campo.tipo === 'numero' ? (v ? Number(v) : undefined) : v || undefined;
  }

  const crudo = {
    tipo: texto(form, 'tipo', 120),
    festejado: { nombre: texto(form, 'festejado', 120), edad: edad ? Number(edad) : undefined },
    frase: opcional(form, 'frase', 300),
    anfitriones: nombresAnfitriones.length
      ? { titulo: texto(form, 'anfitrionesTitulo', 120) || 'Con la bendición de', nombres: nombresAnfitriones }
      : undefined,
    lugares: filas(form, 'lugares').map((l) => ({
      titulo: l.titulo ?? '',
      hora: l.hora ?? '',
      nombre: l.nombre ?? '',
      direccion: l.direccion ?? '',
      mapa: l.mapa || undefined,
    })),
    dressCode: texto(form, 'dressTitulo', 120)
      ? { titulo: texto(form, 'dressTitulo', 120), nota: opcional(form, 'dressNota', 300) }
      : undefined,
    despedida: opcional(form, 'despedida', 300),
    galeria: e.contenido.galeria,
    musica: e.contenido.musica,
    extras,
  };
  const fechaLocal = texto(form, 'fechaLocal', 20);
  const valores = { contenido: crudo as ContenidoEvento, fechaLocal };

  const r = contenidoEvento.safeParse(crudo);
  if (!r.success) {
    const problema = r.error.issues[0];
    const ruta = problema.path.join('.');
    const legible: Record<string, string> = {
      tipo: 'Escribe el tipo de evento.',
      'festejado.nombre': 'Escribe el nombre del festejado.',
      lugares: 'Agrega al menos un lugar.',
    };
    const lugar = ruta.match(/^lugares\.(\d+)\.(\w+)/);
    const error =
      legible[ruta] ??
      (lugar
        ? `Revisa el lugar ${Number(lugar[1]) + 1}: ${lugar[2] === 'hora' ? 'la hora debe tener formato HH:MM' : lugar[2] === 'mapa' ? 'el link del mapa no es válido' : `falta "${lugar[2]}"`}.`
        : `Revisa el campo "${ruta}".`);
    return { ok: false, error, valores };
  }

  let fecha = e.fecha;
  if (fechaLocal) {
    try {
      fecha = localAInstante(fechaLocal, e.zonaHoraria);
    } catch {
      return { ok: false, error: 'La fecha no es válida.', valores };
    }
  }

  await db().update(eventos).set({ contenido: r.data, fecha }).where(eq(eventos.id, e.id));
  return { ok: true };
}
