import type { Manifiesto } from './tipos';
import { manifiesto as aracnido } from './aracnido/manifiesto';
import { manifiesto as jardin } from './jardin/manifiesto';

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
const MANIFIESTOS: Manifiesto[] = [jardin, aracnido];

export function plantillas(): Manifiesto[] {
  return MANIFIESTOS;
}

export function plantillasPublicas(): Manifiesto[] {
  return MANIFIESTOS.filter((m) => m.visibilidad === 'publica');
}

export function manifiestoDe(slug: string): Manifiesto | undefined {
  return MANIFIESTOS.find((m) => m.slug === slug);
}
