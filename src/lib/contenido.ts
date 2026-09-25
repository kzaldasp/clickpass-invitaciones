import { z } from 'astro/zod';

/**
 * Lo que el cliente (o el admin por el) edita de una invitacion. Se guarda como
 * JSON en `eventos.contenido`.
 *
 * Es el nucleo comun a TODAS las plantillas: por eso un evento puede cambiar de
 * plantilla sin reescribir nada. Lo propio de una plantilla va en `extras` y lo
 * declara su manifiesto.
 *
 * Fecha, zona horaria, estado y plantilla no viven aqui: son columnas de
 * `eventos` porque se usan para ordenar, filtrar y decidir que se muestra.
 */

/** Una parada del evento: misa, recepcion, after. */
export const lugar = z.object({
  titulo: z.string().min(1),
  /** Hora local DEL EVENTO en 24 h: "16:00". Cada plantilla la formatea. */
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  nombre: z.string().min(1),
  direccion: z.string().min(1),
  /** Link de Google Maps. Se abre en la app nativa desde el movil. */
  mapa: z.url().optional(),
});

export const contenidoEvento = z.object({
  /** "XV Años", "Cumpleaños numero 6", "Nuestra boda"... */
  tipo: z.string().min(1),
  festejado: z.object({
    nombre: z.string().min(1),
    edad: z.number().int().positive().optional(),
  }),
  /** Frase de apertura, bajo el nombre en la portada. */
  frase: z.string().optional(),
  /** Quien invita: padres, padrinos, los novios. */
  anfitriones: z
    .object({
      titulo: z.string().default('Con la bendición de'),
      nombres: z.array(z.string().min(1)).min(1),
    })
    .optional(),
  lugares: z.array(lugar).min(1),
  dressCode: z
    .object({
      titulo: z.string().min(1),
      nota: z.string().optional(),
    })
    .optional(),
  /** URLs de fotos. Las sube el admin (R2), el cliente no. */
  galeria: z.array(z.string()).default([]),
  /** Audio de fondo. Arranca con el tap de "Abrir invitacion", nunca antes. */
  musica: z
    .object({
      archivo: z.string(),
      titulo: z.string().optional(),
    })
    .optional(),
  /** Mensaje de cierre, antes del pie. */
  despedida: z.string().optional(),
  /** Campos propios de la plantilla. Los valida su manifiesto, no este schema. */
  extras: z.record(z.string(), z.unknown()).default({}),
});

/** Una pregunta adicional del formulario de confirmacion. */
export const preguntaExtra = z.discriminatedUnion('tipo', [
  z.object({
    id: z.string().min(1),
    tipo: z.literal('texto'),
    etiqueta: z.string().min(1),
    obligatoria: z.boolean().default(false),
  }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal('si_no'),
    etiqueta: z.string().min(1),
    obligatoria: z.boolean().default(false),
  }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal('opcion'),
    etiqueta: z.string().min(1),
    opciones: z.array(z.string().min(1)).min(2),
    obligatoria: z.boolean().default(false),
  }),
]);

/**
 * Que pide el formulario de confirmacion de ESTE evento. Lo configura el admin;
 * la plantilla solo decide como se ve <Confirmacion />, no que pregunta.
 */
export const configConfirmacion = z.object({
  /** Si es false, confirmar "asiste" usa todos los pases del invitado. */
  pedirPases: z.boolean().default(true),
  pedirMensaje: z.boolean().default(false),
  preguntas: z.array(preguntaExtra).default([]),
});

/**
 * Respuestas a las preguntas extra: id de pregunta -> valor. Si se borra una
 * pregunta, su respuesta vieja queda aqui y simplemente se ignora.
 */
export const respuestasExtra = z.record(z.string(), z.union([z.string(), z.boolean()]));

export type ContenidoEvento = z.infer<typeof contenidoEvento>;
export type ConfigConfirmacion = z.infer<typeof configConfirmacion>;
export type PreguntaExtra = z.infer<typeof preguntaExtra>;
export type RespuestasExtra = z.infer<typeof respuestasExtra>;
