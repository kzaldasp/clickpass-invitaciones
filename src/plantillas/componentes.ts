import { manifiestoDe } from './index';
import Aracnido from './aracnido/Plantilla.astro';
import Jardin from './jardin/Plantilla.astro';
import Rosa from './rosa/Plantilla.astro';
import Castillo from './castillo/Plantilla.astro';
import Heroico from './heroico/Plantilla.astro';
import Sakura from './sakura/Plantilla.astro';
import Galaxia from './galaxia/Plantilla.astro';
import Jurasico from './jurasico/Plantilla.astro';
import Neon from './neon/Plantilla.astro';
import Marmol from './marmol/Plantilla.astro';
import Mediterraneo from './mediterraneo/Plantilla.astro';
import Gala from './gala/Plantilla.astro';
import Bohemia from './bohemia/Plantilla.astro';

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
  castillo: { 1: Castillo },
  heroico: { 1: Heroico },
  sakura: { 1: Sakura },
  galaxia: { 1: Galaxia },
  jurasico: { 1: Jurasico },
  neon: { 1: Neon },
  marmol: { 1: Marmol },
  mediterraneo: { 1: Mediterraneo },
  gala: { 1: Gala },
  bohemia: { 1: Bohemia },
};

/** El componente para la version del evento; si ya no existe, la ultima. */
export function componenteDe(slug: string, version: number): Componente | undefined {
  const v = VERSIONES[slug];
  const m = manifiestoDe(slug);
  if (!v || !m) return undefined;
  return v[version] ?? v[m.version];
}
