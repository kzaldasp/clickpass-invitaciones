/**
 * Normaliza un telefono del Excel a formato internacional solo digitos, que es
 * lo que pide wa.me: "099 123 4567" + prefijo 593 -> "593991234567".
 *
 * Devuelve null si no parece un telefono: el invitado se guarda igual, pero
 * sin boton de WhatsApp.
 */
export function normalizarTelefono(crudo: string | number | null | undefined, prefijo: string): string | null {
  if (crudo === null || crudo === undefined) return null;
  const texto = String(crudo).trim();
  if (!texto) return null;

  let digitos = texto.replace(/\D/g, '');
  if (!digitos) return null;

  if (texto.startsWith('+')) {
    // Ya es internacional.
  } else if (digitos.startsWith('00')) {
    digitos = digitos.slice(2);
  } else if (digitos.startsWith(prefijo) && digitos.length > prefijo.length + 7) {
    // Ya trae el prefijo del pais, sin "+".
  } else {
    // Numero local: fuera el 0 troncal y se antepone el pais.
    digitos = prefijo + digitos.replace(/^0+/, '');
  }

  // E.164: maximo 15 digitos. Menos de 8 no es un movil de ningun pais.
  return digitos.length >= 8 && digitos.length <= 15 ? digitos : null;
}

/** "593991234567" -> "+593 99 123 4567" (aprox, solo para mostrar). */
export function telefonoLegible(tel: string, prefijo: string): string {
  if (!tel.startsWith(prefijo)) return `+${tel}`;
  const local = tel.slice(prefijo.length);
  return `+${prefijo} ${local.replace(/(\d{2})(\d{3})(\d+)/, '$1 $2 $3')}`;
}
