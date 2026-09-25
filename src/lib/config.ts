/**
 * Valores por defecto de la plataforma. Operamos desde Ecuador; cada evento
 * puede sobrescribir zona, pais, prefijo y moneda.
 */
export const POR_DEFECTO = {
  pais: 'EC',
  zonaHoraria: 'America/Guayaquil',
  prefijoTelefono: '593',
  moneda: 'USD',
  locale: 'es-EC',
} as const;

/**
 * Paises que ofrece el admin al crear un evento. Elegir el pais sugiere la
 * zona y el prefijo; la zona se puede cambiar a mano (paises con varias zonas).
 */
export const PAISES = [
  { codigo: 'EC', nombre: 'Ecuador', zona: 'America/Guayaquil', prefijo: '593', etiqueta: 'hora de Ecuador' },
  { codigo: 'CO', nombre: 'Colombia', zona: 'America/Bogota', prefijo: '57', etiqueta: 'hora de Colombia' },
  { codigo: 'PE', nombre: 'Perú', zona: 'America/Lima', prefijo: '51', etiqueta: 'hora de Perú' },
  { codigo: 'MX', nombre: 'México', zona: 'America/Mexico_City', prefijo: '52', etiqueta: 'hora del centro de México' },
  { codigo: 'CL', nombre: 'Chile', zona: 'America/Santiago', prefijo: '56', etiqueta: 'hora de Chile' },
  { codigo: 'AR', nombre: 'Argentina', zona: 'America/Argentina/Buenos_Aires', prefijo: '54', etiqueta: 'hora de Argentina' },
  { codigo: 'ES', nombre: 'España', zona: 'Europe/Madrid', prefijo: '34', etiqueta: 'hora de España' },
  { codigo: 'US', nombre: 'Estados Unidos', zona: 'America/New_York', prefijo: '1', etiqueta: 'hora del este de EE. UU.' },
] as const;

/** Tipos de evento: filtran el catalogo y ordenan las plantillas. */
export const TIPOS_EVENTO = {
  boda: 'Boda',
  xv: 'XV años',
  cumpleanos: 'Cumpleaños',
  infantil: 'Fiesta infantil',
  bautizo: 'Bautizo',
  baby_shower: 'Baby shower',
  graduacion: 'Graduación',
  aniversario: 'Aniversario',
  corporativo: 'Corporativo',
} as const;

export type TipoEvento = keyof typeof TIPOS_EVENTO;

/**
 * Mensaje de WhatsApp por defecto. Se rellenan por invitado:
 * {nombre}, {festejado}, {pases} y {link}.
 */
export const MENSAJE_WHATSAPP = '¡Hola {nombre}! Tienes una invitación de {festejado} ✨\nÁbrela aquí y confirma tu asistencia: {link}';

/** Slugs que no puede tomar un evento: son rutas de la plataforma. */
export const SLUGS_RESERVADOS = [
  'admin',
  'panel',
  'catalogo',
  'api',
  'entrar',
  'salir',
  'aviso',
  'medios',
  'ilustraciones',
  'audio',
  'favicon.ico',
  'favicon.svg',
  'robots.txt',
  '_actions',
  '_astro',
  '_server-islands',
];

/** Zonas seleccionables. Incluye las de EE. UU. y Mexico que no son la principal. */
export const ZONAS = [
  ...new Set([
    ...PAISES.map((p) => p.zona),
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Cancun',
    'America/Tijuana',
    'Pacific/Galapagos',
  ]),
];
