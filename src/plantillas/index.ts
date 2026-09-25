import type { Manifiesto } from './tipos';
import { manifiesto as aracnido } from './aracnido/manifiesto';
import { manifiesto as jardin } from './jardin/manifiesto';
import { manifiesto as rosa } from './rosa/manifiesto';
import { manifiesto as castillo } from './castillo/manifiesto';
import { manifiesto as heroico } from './heroico/manifiesto';
import { manifiesto as sakura } from './sakura/manifiesto';
import { manifiesto as galaxia } from './galaxia/manifiesto';
import { manifiesto as jurasico } from './jurasico/manifiesto';
import { manifiesto as neon } from './neon/manifiesto';
import { manifiesto as marmol } from './marmol/manifiesto';
import { manifiesto as mediterraneo } from './mediterraneo/manifiesto';
import { manifiesto as gala } from './gala/manifiesto';
import { manifiesto as bohemia } from './bohemia/manifiesto';
import { manifiesto as lucha } from './lucha/manifiesto';

/**
 * Registro de MANIFIESTOS (solo datos). Lo usan admin, panel y catalogo.
 *
 * No importa componentes a proposito: importar un .astro arrastra su CSS a la
 * pagina que lo importa, y el admin no debe cargar el CSS de las invitaciones.
 * Los componentes estan en ./componentes.ts, que solo importan las rutas que
 * dibujan una invitacion.
 *
 * Sumar una plantilla = una linea aqui y otra en ./componentes.ts.
 */
// Orden del catalogo: bodas, XV, cumpleanos de adultos, infantiles.
const MANIFIESTOS: Manifiesto[] = [
  jardin,
  marmol,
  mediterraneo,
  gala,
  bohemia,
  rosa,
  neon,
  sakura,
  castillo,
  heroico,
  lucha,
  galaxia,
  jurasico,
  aracnido,
];

export function plantillas(): Manifiesto[] {
  return MANIFIESTOS;
}

export function plantillasPublicas(): Manifiesto[] {
  return MANIFIESTOS.filter((m) => m.visibilidad === 'publica');
}

export function manifiestoDe(slug: string): Manifiesto | undefined {
  return MANIFIESTOS.find((m) => m.slug === slug);
}
