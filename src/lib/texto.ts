/** "  José   PÉREZ " -> "jose perez". Para detectar invitados duplicados. */
export function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Ana y Luis 2027!" -> "ana-y-luis-2027". Para sugerir el slug de un evento. */
export function slugificar(texto: string): string {
  return normalizarNombre(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Rellena {nombre} y {link} (y cualquier otra clave) en el mensaje de WhatsApp. */
export function rellenar(plantilla: string, valores: Record<string, string>): string {
  return plantilla.replace(/\{(\w+)\}/g, (todo, clave: string) => valores[clave] ?? todo);
}

/** Centavos -> "$150.00". */
export function dinero(centavos: number, moneda: string, locale = 'es-EC'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: moneda }).format(centavos / 100);
}
