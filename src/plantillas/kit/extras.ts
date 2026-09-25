import type { CampoExtra } from '../tipos';

/** Campos extra que usan las secciones del kit (regalos, historia, cierre). */
export const EXTRAS_COMUNES: CampoExtra[] = [
  { clave: 'historia', etiqueta: 'Unas palabras (junto a la segunda foto)', tipo: 'texto_largo' },
  { clave: 'hashtag', etiqueta: 'Hashtag', tipo: 'texto', ayuda: 'Sin el #.' },
  { clave: 'regalosTexto', etiqueta: 'Regalos · mensaje', tipo: 'texto_largo' },
  { clave: 'regalosLink', etiqueta: 'Regalos · link de la mesa', tipo: 'texto', ayuda: 'Opcional. Link completo, con https://' },
  { clave: 'datosBancarios', etiqueta: 'Datos para transferencia', tipo: 'texto_largo' },
  { clave: 'lluviaSobres', etiqueta: 'Habrá lluvia de sobres', tipo: 'si_no' },
];

/** Texto de un extra o undefined si viene vacio. */
export function extraTexto(extras: Record<string, unknown>, clave: string): string | undefined {
  const v = extras[clave];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Lista de un extra texto_largo: una entrada por linea. */
export function extraLista(extras: Record<string, unknown>, clave: string): string[] {
  return (extraTexto(extras, clave) ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}
