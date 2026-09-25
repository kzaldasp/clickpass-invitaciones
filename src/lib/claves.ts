/**
 * Hash de claves y tokens con WebCrypto: funciona igual en Workers y en Node
 * (scripts). Workers limita PBKDF2 a 100 000 iteraciones.
 */
const ITERACIONES = 100_000;
const codificar = new TextEncoder();

const aHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

const deHex = (hex: string) => new Uint8Array(hex.match(/../g)!.map((h) => parseInt(h, 16)));

async function derivar(clave: string, sal: Uint8Array, iteraciones: number): Promise<string> {
  const base = await crypto.subtle.importKey('raw', codificar.encode(clave), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: sal as BufferSource, iterations: iteraciones },
    base,
    256,
  );
  return aHex(bits);
}

/** "pbkdf2$100000$<sal>$<hash>" */
export async function hashClave(clave: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERACIONES}$${aHex(sal)}$${await derivar(clave, sal, ITERACIONES)}`;
}

export async function verificarClave(clave: string, guardado: string): Promise<boolean> {
  const [algo, iter, sal, hash] = guardado.split('$');
  if (algo !== 'pbkdf2' || !iter || !sal || !hash) return false;
  return iguales(await derivar(clave, deHex(sal), Number(iter)), hash);
}

/** SHA-256 en hex. Para tokens de sesion y codigos: se guarda el hash, nunca el valor. */
export async function sha256(valor: string): Promise<string> {
  return aHex(await crypto.subtle.digest('SHA-256', codificar.encode(valor)));
}

/** Comparacion en tiempo constante. */
export function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
