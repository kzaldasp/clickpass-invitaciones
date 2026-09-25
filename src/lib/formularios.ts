/** Lectura tolerante de FormData: todo lo que llega es texto o nada. */

export function texto(form: FormData, nombre: string, max = 500): string {
  const v = form.get(nombre);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function opcional(form: FormData, nombre: string, max = 500): string | undefined {
  return texto(form, nombre, max) || undefined;
}

export function entero(form: FormData, nombre: string): number | null {
  const v = texto(form, nombre, 20);
  if (!/^-?\d+$/.test(v)) return null;
  return Number(v);
}

export function marcado(form: FormData, nombre: string): boolean {
  const v = form.get(nombre);
  return v === 'on' || v === 'true' || v === '1';
}

/** "45", "45.5", "45,50" -> 4550 centavos. */
export function centavos(form: FormData, nombre: string): number | null {
  const v = texto(form, nombre, 20).replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(Number(v) * 100);
}

/**
 * Filas repetibles con nombres "lugares.0.titulo", "lugares.1.titulo"...
 * Devuelve las filas en orden; las que vienen completamente vacias se omiten.
 */
export function filas(form: FormData, prefijo: string): Record<string, string>[] {
  const porIndice = new Map<number, Record<string, string>>();
  for (const [clave, valor] of form.entries()) {
    const m = clave.match(new RegExp(`^${prefijo}\\.(\\d+)\\.(\\w+)$`));
    if (!m || typeof valor !== 'string') continue;
    const i = Number(m[1]);
    const fila = porIndice.get(i) ?? {};
    fila[m[2]] = valor.trim();
    porIndice.set(i, fila);
  }
  return [...porIndice.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, f]) => f)
    .filter((f) => Object.values(f).some((v) => v && v !== 'on' && v !== 'texto'));
}

/** Solo rutas internas: evita redirecciones abiertas con ?volver=https://... */
export function rutaSegura(v: string | null | undefined, porDefecto: string): string {
  return v && v.startsWith('/') && !v.startsWith('//') ? v : porDefecto;
}
