/**
 * Crea (o actualiza la clave de) un admin.
 *   npm run admin:crear -- correo@dominio.com "Nombre" "clave-segura"
 */
import { eq } from 'drizzle-orm';
import { usuarios } from '../src/db/schema';
import { hashClave } from '../src/lib/claves';
import { db } from './db';

const [email, nombre, clave] = process.argv.slice(2);
if (!email || !nombre || !clave || clave.length < 10) {
  console.error('Uso: npm run admin:crear -- correo "Nombre" "clave (min. 10 caracteres)"');
  process.exit(1);
}

const correo = email.trim().toLowerCase();
const claveHash = await hashClave(clave);
const existente = await db.query.usuarios.findFirst({ where: eq(usuarios.email, correo) });

if (existente) {
  await db.update(usuarios).set({ rol: 'admin', nombre, claveHash }).where(eq(usuarios.id, existente.id));
  console.log(`Admin actualizado: ${correo}`);
} else {
  await db.insert(usuarios).values({ rol: 'admin', nombre, email: correo, claveHash });
  console.log(`Admin creado: ${correo}`);
}
