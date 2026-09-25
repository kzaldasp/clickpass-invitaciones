import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { codigosAcceso, usuarios, type Usuario } from '../../db/schema';
import { iguales, sha256 } from '../claves';
import { enviarCorreo } from '../correo';

/**
 * Login del cliente por correo: codigo de 6 digitos, 10 minutos, 5 intentos.
 * Se guarda el hash del codigo, nunca el codigo.
 */
const VIGENCIA_MS = 10 * 60_000;
const MAX_INTENTOS = 5;
const MAX_CODIGOS_15_MIN = 3;

function codigoAleatorio(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, '0');
}

/**
 * Siempre responde lo mismo exista o no el correo: asi no se puede averiguar
 * quien es cliente. Devuelve false solo si hubo demasiados intentos.
 */
export async function solicitarCodigo(email: string): Promise<{ ok: boolean; error?: string }> {
  const recientes = await db().query.codigosAcceso.findMany({
    where: and(eq(codigosAcceso.email, email), gt(codigosAcceso.creadoEn, new Date(Date.now() - 15 * 60_000))),
  });
  if (recientes.length >= MAX_CODIGOS_15_MIN) {
    return { ok: false, error: 'Pediste varios códigos seguidos. Espera unos minutos e intenta de nuevo.' };
  }

  const usuario = await db().query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  if (!usuario || usuario.rol !== 'cliente') return { ok: true };

  const codigo = codigoAleatorio();
  await db()
    .insert(codigosAcceso)
    .values({ email, codigoHash: await sha256(`${email}:${codigo}`), expiraEn: new Date(Date.now() + VIGENCIA_MS) });

  const enviado = await enviarCorreo(
    email,
    `Tu código de ClickPass: ${codigo}`,
    `Hola ${usuario.nombre.split(' ')[0]},\n\nTu código para entrar a tu panel de ClickPass es:\n\n    ${codigo}\n\nVence en 10 minutos. Si no lo pediste, ignora este correo.`,
  );
  return enviado ? { ok: true } : { ok: false, error: 'No pudimos enviar el correo. Usa el link de tu panel o escríbenos.' };
}

export async function verificarCodigo(email: string, codigo: string): Promise<{ usuario?: Usuario; error?: string }> {
  const ultimo = await db().query.codigosAcceso.findFirst({
    where: and(eq(codigosAcceso.email, email), gt(codigosAcceso.expiraEn, new Date())),
    orderBy: [desc(codigosAcceso.creadoEn)],
  });
  if (!ultimo || ultimo.intentos >= MAX_INTENTOS) return { error: 'El código venció. Pide uno nuevo.' };

  if (!iguales(await sha256(`${email}:${codigo.trim()}`), ultimo.codigoHash)) {
    await db().update(codigosAcceso).set({ intentos: ultimo.intentos + 1 }).where(eq(codigosAcceso.id, ultimo.id));
    const quedan = MAX_INTENTOS - ultimo.intentos - 1;
    return { error: quedan > 0 ? `Código incorrecto. Te quedan ${quedan} intentos.` : 'Demasiados intentos. Pide un código nuevo.' };
  }

  // Un codigo sirve una sola vez.
  await db().delete(codigosAcceso).where(eq(codigosAcceso.email, email));
  const usuario = await db().query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  return usuario?.rol === 'cliente' ? { usuario } : { error: 'Esta cuenta no tiene panel de cliente.' };
}
