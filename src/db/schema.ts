import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ConfigConfirmacion, ContenidoEvento, RespuestasExtra } from '../lib/contenido';
import { POR_DEFECTO } from '../lib/config';

/**
 * Convenciones:
 *  - ids: UUID en texto.
 *  - fechas: instantes UTC (integer, modo timestamp). La zona para mostrarlas
 *    es `eventos.zona_horaria`, nunca la del servidor ni la del navegador.
 *  - dinero: centavos enteros. Nada de floats.
 *  - JSON: validado con zod (src/lib/contenido.ts) antes de escribir.
 *
 * Las plantillas NO estan aqui: viven en codigo (src/plantillas) y
 * `eventos.plantilla` apunta a su slug.
 */

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const creadoEn = () =>
  integer('creado_en', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`);

/** Admins (1-3, todos iguales) y clientes. */
export const usuarios = sqliteTable('usuarios', {
  id: id(),
  rol: text('rol', { enum: ['admin', 'cliente'] }).notNull(),
  nombre: text('nombre').notNull(),
  /** Opcional: un cliente puede entrar solo con el link privado de su panel. */
  email: text('email').unique(),
  telefono: text('telefono'),
  /** Solo admins: PBKDF2 (src/lib/claves.ts). Los clientes entran por link o codigo. */
  claveHash: text('clave_hash'),
  creadoEn: creadoEn(),
});

/** Codigos de un solo uso para entrar por correo. Se guarda el hash, no el codigo. */
export const codigosAcceso = sqliteTable(
  'codigos_acceso',
  {
    id: id(),
    email: text('email').notNull(),
    codigoHash: text('codigo_hash').notNull(),
    expiraEn: integer('expira_en', { mode: 'timestamp' }).notNull(),
    /** Se invalida al pasar de 5: frena la fuerza bruta sobre 6 digitos. */
    intentos: integer('intentos').notNull().default(0),
    creadoEn: creadoEn(),
  },
  (t) => [index('codigos_acceso_email_idx').on(t.email)],
);

/** Sesion por cookie. El id es el hash del token que lleva la cookie. */
export const sesiones = sqliteTable(
  'sesiones',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    expiraEn: integer('expira_en', { mode: 'timestamp' }).notNull(),
    creadoEn: creadoEn(),
  },
  (t) => [index('sesiones_usuario_idx').on(t.usuarioId)],
);

export const eventos = sqliteTable(
  'eventos',
  {
    id: id(),
    /** Primera parte de la URL: /ana-y-luis. */
    slug: text('slug').notNull().unique(),
    clienteId: text('cliente_id')
      .notNull()
      .references(() => usuarios.id),

    plantilla: text('plantilla').notNull(),
    /** Version de la plantilla con la que se creo. Un cambio incompatible sube la version; este evento no se entera. */
    plantillaVersion: integer('plantilla_version').notNull().default(1),
    /** Paleta alternativa del manifiesto de la plantilla. Null -> la original. */
    preset: text('preset'),

    /**
     * borrador   -> el cliente edita y ve vista previa; los links de invitado aun no abren.
     * publicado  -> el admin lo libero (normalmente tras el pago); links activos.
     * finalizado -> invitados y confirmaciones borrados; queda el link general.
     */
    estado: text('estado', { enum: ['borrador', 'publicado', 'finalizado'] })
      .notNull()
      .default('borrador'),

    /** Instante UTC del inicio. */
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
    /** Zona IANA del lugar del evento. Toda fecha del evento se muestra en esta zona. */
    zonaHoraria: text('zona_horaria').notNull().default(POR_DEFECTO.zonaHoraria),
    /** ISO-2. Sugiere zona y prefijo al crear; no se usa para calcular nada. */
    pais: text('pais').notNull().default(POR_DEFECTO.pais),

    contenido: text('contenido', { mode: 'json' }).$type<ContenidoEvento>().notNull(),
    configConfirmacion: text('config_confirmacion', { mode: 'json' })
      .$type<ConfigConfirmacion>()
      .notNull(),
    /** Instante UTC. Hasta entonces el invitado puede confirmar o cambiar su respuesta. */
    fechaLimiteConfirmacion: integer('fecha_limite_confirmacion', { mode: 'timestamp' }),

    /** Tope de invitados (links) segun lo que pago. Importar no lo puede superar. */
    limiteInvitados: integer('limite_invitados').notNull(),
    /** Texto para WhatsApp con {nombre} y {link}. Null -> texto por defecto. */
    mensajeWhatsapp: text('mensaje_whatsapp'),
    /** Codigo de pais para normalizar telefonos del Excel: "0991234567" -> "593991234567". */
    prefijoTelefono: text('prefijo_telefono').notNull().default(POR_DEFECTO.prefijoTelefono),

    /** Link privado del panel: /panel/{token}. Regenerable si se filtra. */
    tokenPanel: text('token_panel').notNull().unique(),

    /** Centavos. */
    precio: integer('precio').notNull().default(0),
    moneda: text('moneda').notNull().default(POR_DEFECTO.moneda),

    creadoEn: creadoEn(),
    actualizadoEn: integer('actualizado_en', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdateFn(() => new Date()),
    finalizadoEn: integer('finalizado_en', { mode: 'timestamp' }),
  },
  (t) => [index('eventos_cliente_idx').on(t.clienteId), index('eventos_fecha_idx').on(t.fecha)],
);

/**
 * Un invitado es un link. Su confirmacion vive en la misma fila: hay una sola
 * respuesta por invitado y cambiarla la sobrescribe (gana la ultima).
 */
export const invitados = sqliteTable(
  'invitados',
  {
    id: id(),
    eventoId: text('evento_id')
      .notNull()
      .references(() => eventos.id, { onDelete: 'cascade' }),
    /** Segunda parte de la URL: /ana-y-luis/k3x9p2Qa7Z. Aleatorio, nunca el nombre. */
    token: text('token').notNull().unique(),
    nombre: text('nombre').notNull(),
    /** Normalizado con prefijo de pais, solo digitos. Null -> sin boton de WhatsApp. */
    telefono: text('telefono'),
    pases: integer('pases').notNull().default(1),
    /** Linea extra solo para este invitado. */
    nota: text('nota'),

    /** Primera vez que abrio su link. Distingue "no lo ha visto" de "lo vio y no responde". */
    abiertoEn: integer('abierto_en', { mode: 'timestamp' }),

    respuesta: text('respuesta', { enum: ['pendiente', 'asiste', 'no_asiste'] })
      .notNull()
      .default('pendiente'),
    /** <= pases. 0 si no asiste. */
    pasesConfirmados: integer('pases_confirmados').notNull().default(0),
    mensaje: text('mensaje'),
    respuestasExtra: text('respuestas_extra', { mode: 'json' }).$type<RespuestasExtra>(),
    respondidoEn: integer('respondido_en', { mode: 'timestamp' }),

    /** Check-in con el QR del pase en la entrada. */
    ingresadoEn: integer('ingresado_en', { mode: 'timestamp' }),

    creadoEn: creadoEn(),
  },
  (t) => [index('invitados_evento_idx').on(t.eventoId)],
);

/** Abonos de un evento. Saldo = eventos.precio - suma(pagos.monto). */
export const pagos = sqliteTable(
  'pagos',
  {
    id: id(),
    eventoId: text('evento_id')
      .notNull()
      .references(() => eventos.id, { onDelete: 'cascade' }),
    /** Centavos, en la moneda del evento. */
    monto: integer('monto').notNull(),
    metodo: text('metodo', { enum: ['transferencia', 'efectivo', 'otro'] }).notNull(),
    nota: text('nota'),
    /** Cuando se recibio el pago (puede ser anterior a cuando se registra). */
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
    registradoPor: text('registrado_por').references(() => usuarios.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
  },
  (t) => [index('pagos_evento_idx').on(t.eventoId)],
);

export type Usuario = typeof usuarios.$inferSelect;
export type Evento = typeof eventos.$inferSelect;
export type EventoNuevo = typeof eventos.$inferInsert;
export type Invitado = typeof invitados.$inferSelect;
export type InvitadoNuevo = typeof invitados.$inferInsert;
export type Pago = typeof pagos.$inferSelect;
