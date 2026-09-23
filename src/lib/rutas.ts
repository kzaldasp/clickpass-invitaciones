/**
 * Prefija una ruta absoluta con el base del sitio.
 *
 * En local y en el dominio propio el base es "/" y esto no cambia nada. En
 * GitHub Pages el sitio cuelga de /clickpass-invitaciones/, y sin este prefijo
 * todos los links y las ilustraciones apuntarian a la raiz del dominio.
 */
export function ruta(camino: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${camino.replace(/^\//, '')}`;
}
