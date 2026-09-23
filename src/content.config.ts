import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Un lugar del evento: misa, recepcion, after. Se renderiza como tarjeta
 * con su hora y su boton de mapa.
 */
const lugar = z.object({
  titulo: z.string(),
  hora: z.string(),
  nombre: z.string(),
  direccion: z.string(),
  /** Link de Google Maps. Se abre en app nativa desde el movil. */
  mapa: z.url().optional(),
});

/**
 * Un invitado con link propio. El slug es la segunda parte de la URL:
 * /mateo-6-anios/familia-lopez
 */
const invitado = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Solo minusculas, numeros y guiones'),
  nombre: z.string(),
  pases: z.number().int().positive(),
  /** Linea extra solo para este invitado, opcional. */
  nota: z.string().optional(),
});

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/eventos' }),
  schema: z.object({
    /** Carpeta de src/themes que dibuja esta invitacion. */
    tema: z.enum(['aracnido']),

    /**
     * borrador  -> se genera, lleva noindex y cinta de aviso. Para que el cliente revise.
     * publicado -> version final, la que se comparte.
     * archivado -> deja de generarse. El link muere.
     */
    estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador'),

    /** "XV Años", "Cumpleaños numero 6", "Nuestra boda"... */
    tipo: z.string(),
    festejado: z.object({
      nombre: z.string(),
      edad: z.number().int().positive().optional(),
    }),

    /** ISO con offset: "2026-11-14T16:00:00-06:00". El offset importa para la cuenta regresiva. */
    fecha: z.coerce.date(),

    /**
     * Zona del evento. Sin esto, un evento a las 8 PM se imprime con la fecha
     * del dia siguiente al buildear en un servidor en UTC.
     */
    zonaHoraria: z.string().default('America/Mexico_City'),

    /** Frase de apertura, la que aparece bajo el nombre en la portada. */
    frase: z.string().optional(),

    /** Quien invita: padres, padrinos, los novios. */
    anfitriones: z
      .object({
        titulo: z.string().default('Con la bendicion de'),
        nombres: z.array(z.string()).min(1),
      })
      .optional(),

    lugares: z.array(lugar).min(1),

    dressCode: z
      .object({
        titulo: z.string(),
        nota: z.string().optional(),
      })
      .optional(),

    /** Rutas dentro de /public. Se muestran en la galeria con scroll horizontal. */
    galeria: z.array(z.string()).default([]),

    /** Audio de fondo. Arranca con el tap de "Abrir invitacion", nunca antes. */
    musica: z
      .object({
        archivo: z.string(),
        titulo: z.string().optional(),
      })
      .optional(),

    /**
     * Modo de pases:
     *  - generico: un solo link para todos. Usa cantidad.
     *  - lista: un link por invitado. Genera /evento/invitado ademas del generico.
     */
    pases: z.discriminatedUnion('modo', [
      z.object({
        modo: z.literal('generico'),
        cantidad: z.number().int().positive().optional(),
      }),
      z.object({
        modo: z.literal('lista'),
        invitados: z.array(invitado).min(1),
      }),
    ]),

    /** Mensaje de cierre, antes del pie. */
    despedida: z.string().optional(),
  }),
});

export const collections = { eventos };
