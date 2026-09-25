import { manifiestoDe } from './index';
import Aracnido from './aracnido/Plantilla.astro';
import Jardin from './jardin/Plantilla.astro';
import Rosa from './rosa/Plantilla.astro';

/**
 * Registro de COMPONENTES por version. Solo lo importan las rutas que dibujan
 * una invitacion (link general, link personal, vista previa, demo).
 *
 * Cuando una plantilla cambia de forma incompatible, su version vieja se queda
 * aqui y los eventos que nacieron con ella la siguen usando.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Componente = (props: any) => any;

const VERSIONES: Record<string, Record<number, Componente>> = {
  aracnido: { 1: Aracnido },
  jardin: { 1: Jardin },
  rosa: { 1: Rosa },
};

/** El componente para la version del evento; si ya no existe, la ultima. */
export function componenteDe(slug: string, version: number): Componente | undefined {
  const v = VERSIONES[slug];
  const m = manifiestoDe(slug);
  if (!v || !m) return undefined;
  return v[version] ?? v[m.version];
}
