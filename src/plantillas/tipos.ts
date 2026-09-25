import type { ConfigConfirmacion, ContenidoEvento, RespuestasExtra } from '../lib/contenido';
import type { TipoEvento } from '../lib/config';

/**
 * Contrato de una plantilla. Es lo UNICO que se le exige: recibir estas props,
 * declarar un manifiesto y colocar <Confirmacion /> en algun lugar. Estructura,
 * fuentes, colores y animacion son libres.
 */

export interface EventoVista {
  slug: string;
  contenido: ContenidoEvento;
  /** Instante UTC. Mostrar SIEMPRE con `zonaHoraria`. */
  fecha: Date;
  zonaHoraria: string;
  estado: 'borrador' | 'publicado' | 'finalizado';
  /** Preset de color elegido por el admin (ver manifiesto.presets). */
  preset: string | null;
}

export interface InvitadoVista {
  token: string;
  nombre: string;
  pases: number;
  nota: string | null;
  /** Hubo check-in con QR en la entrada. */
  ingresado: boolean;
}

export interface RespuestaVista {
  estado: 'pendiente' | 'asiste' | 'no_asiste';
  pasesConfirmados: number;
  mensaje: string | null;
  extras: RespuestasExtra;
}

export interface ConfirmacionVista {
  /**
   * invitado -> link personal, formulario real.
   * general  -> link general: sin formulario, solo el aviso.
   * demo     -> catalogo o vista previa: formulario de muestra que no guarda.
   */
  modo: 'invitado' | 'general' | 'demo';
  config: ConfigConfirmacion;
  /** Se puede responder (o cambiar la respuesta) ahora mismo. */
  abierta: boolean;
  /** Instante UTC hasta el que se puede responder. */
  fechaLimite: Date;
  respuesta: RespuestaVista | null;
}

export interface PropsPlantilla {
  evento: EventoVista;
  invitado?: InvitadoVista;
  confirmacion: ConfirmacionVista;
}

/** Campo propio de una plantilla. El editor del panel lo muestra en "Extras". */
export interface CampoExtra {
  clave: string;
  etiqueta: string;
  tipo: 'texto' | 'texto_largo' | 'numero' | 'si_no';
  ayuda?: string;
}

/** Paleta alternativa sin tocar codigo. Se aplica como variables CSS. */
export interface Preset {
  id: string;
  nombre: string;
  /** Variables CSS que la plantilla lee: { '--c-rojo': '#e23636' }. */
  variables: Record<string, string>;
  /** Color de muestra para el selector del admin. */
  muestra: string;
}

export interface Manifiesto {
  slug: string;
  nombre: string;
  descripcion: string;
  /** Sube con cada cambio incompatible. Los eventos guardan la version con la que nacieron. */
  version: number;
  /** publica -> sale en el catalogo. privada -> hecha a medida, solo el admin la ve. */
  visibilidad: 'publica' | 'privada';
  tiposEvento: TipoEvento[];
  /** Imagen de la tarjeta del catalogo (ruta en /public). */
  portada: string;
  /** Color de la barra del navegador movil. */
  colorTema: string;
  /** Contenido de ejemplo para la demo del catalogo y para nacer un evento nuevo. */
  demo: {
    contenido: ContenidoEvento;
    /** Hora local del evento de demo, relativa a hoy: la cuenta regresiva nunca queda en cero. */
    diasHastaEvento: number;
    zonaHoraria: string;
    confirmacion: ConfigConfirmacion;
    invitado: { nombre: string; pases: number; nota?: string };
  };
  extras?: CampoExtra[];
  presets?: Preset[];
}
