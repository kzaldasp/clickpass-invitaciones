/**
 * Datos de prueba para desarrollo: un admin, dos clientes y dos eventos (uno
 * publicado con invitados y respuestas, otro en borrador). Idempotente: borra
 * los eventos de prueba antes de crearlos.
 *
 *   npm run db:seed
 *   Admin: admin@clickpass.test / clickpass-dev
 */
import { eq, inArray } from 'drizzle-orm';
import { eventos, invitados, pagos, usuarios } from '../src/db/schema';
import { hashClave } from '../src/lib/claves';
import { localAInstante } from '../src/lib/fechas';
import { tokenSeguro } from '../src/lib/tokens';
import { manifiesto as aracnido } from '../src/plantillas/aracnido/manifiesto';
import { db } from './db';

async function usuario(rol: 'admin' | 'cliente', email: string, nombre: string, telefono?: string, clave?: string) {
  const existente = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  if (existente) return existente;
  const [u] = await db
    .insert(usuarios)
    .values({ rol, email, nombre, telefono, claveHash: clave ? await hashClave(clave) : null })
    .returning();
  return u;
}

const admin = await usuario('admin', 'admin@clickpass.test', 'Admin de prueba', undefined, 'clickpass-dev');
const lucia = await usuario('cliente', 'lucia@ejemplo.test', 'Lucía Ramírez', '593991234567');
const ana = await usuario('cliente', 'ana@ejemplo.test', 'Ana Torres', '593987654321');

await db.delete(eventos).where(inArray(eventos.slug, ['mateo-6-anios', 'ana-y-luis']));

// Fecha relativa a hoy: la demo nunca queda en el pasado.
const enDias = (dias: number, hora: string) => {
  const d = new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);
  return localAInstante(`${d}T${hora}`, 'America/Guayaquil');
};

const [mateo] = await db
  .insert(eventos)
  .values({
    slug: 'mateo-6-anios',
    clienteId: lucia.id,
    plantilla: 'aracnido',
    estado: 'publicado',
    fecha: enDias(40, '16:00'),
    contenido: aracnido.demo.contenido,
    configConfirmacion: aracnido.demo.confirmacion,
    fechaLimiteConfirmacion: enDias(33, '23:59'),
    limiteInvitados: 80,
    tokenPanel: 'panelMateo01',
    precio: 4500,
  })
  .returning();

const lista: [string, number, string | null, 'pendiente' | 'asiste' | 'no_asiste', number][] = [
  ['Familia López', 4, '593991112233', 'asiste', 4],
  ['Familia Ramírez', 3, '593992223344', 'asiste', 2],
  ['Tía Sofía', 2, '593993334455', 'pendiente', 0],
  ['Pedro y Carla', 2, '593994445566', 'no_asiste', 0],
  ['Abuela Rosa', 1, null, 'pendiente', 0],
];
await db.insert(invitados).values(
  lista.map(([nombre, pases, telefono, respuesta, pasesConfirmados], n) => ({
    eventoId: mateo.id,
    token: n === 0 ? 'invLopez001' : tokenSeguro(),
    nombre,
    pases,
    telefono,
    respuesta,
    pasesConfirmados,
    nota: n === 2 ? '¡Mateo quiere que llegues temprano!' : null,
    abiertoEn: respuesta !== 'pendiente' || n === 2 ? new Date() : null,
    respondidoEn: respuesta !== 'pendiente' ? new Date() : null,
    mensaje: n === 0 ? '¡Ahí estaremos con los disfraces listos!' : null,
    respuestasExtra: n === 0 ? { disfraz: true } : null,
  })),
);
await db.insert(pagos).values({
  eventoId: mateo.id,
  monto: 2000,
  metodo: 'transferencia',
  nota: 'Anticipo',
  fecha: new Date(),
  registradoPor: admin.id,
});

await db.insert(eventos).values({
  slug: 'ana-y-luis',
  clienteId: ana.id,
  plantilla: 'aracnido',
  estado: 'borrador',
  fecha: enDias(120, '19:00'),
  contenido: {
    ...aracnido.demo.contenido,
    tipo: 'Nuestra boda',
    festejado: { nombre: 'Ana y Luis' },
    frase: 'Este evento sirve para probar el modo borrador',
    dressCode: undefined,
  },
  configConfirmacion: { pedirPases: true, pedirMensaje: true, preguntas: [] },
  limiteInvitados: 150,
  tokenPanel: 'panelAnaLuis1',
  precio: 8000,
});

console.log(`Listo.
  Admin:        http://localhost:4321/admin  (admin@clickpass.test / clickpass-dev)
  Panel Mateo:  http://localhost:4321/panel/panelMateo01
  Invitado:     http://localhost:4321/mateo-6-anios/invLopez001
  Borrador:     http://localhost:4321/ana-y-luis`);
