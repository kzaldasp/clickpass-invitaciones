const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Token aleatorio para links de invitado y del panel. Con 10 caracteres base62
 * hay ~8e17 combinaciones: no se adivina ni se recorre.
 *
 * Se descartan los bytes >= 248 para que todos los caracteres salgan con la
 * misma probabilidad (256 no es multiplo de 62).
 */
export function tokenSeguro(largo = 10): string {
  let token = '';
  while (token.length < largo) {
    const bytes = crypto.getRandomValues(new Uint8Array(largo * 2));
    for (const b of bytes) {
      if (b < 248 && token.length < largo) token += BASE62[b % 62];
    }
  }
  return token;
}
