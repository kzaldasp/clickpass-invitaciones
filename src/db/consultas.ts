import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from './cliente';
import { eventos, invitados, pagos, usuarios, type Evento, type Invitado } from './schema';

/** Lecturas compartidas por invitacion, panel y admin. */

export async function eventoPorSlug(slug: string): Promise<Evento | undefined> {
  return db().query.eventos.findFirst({ where: eq(eventos.slug, slug) });
}

export async function eventoPorId(id: string): Promise<Evento | undefined> {
  return db().query.eventos.findFirst({ where: eq(eventos.id, id) });
}

export async function eventoPorTokenPanel(token: string): Promise<Evento | undefined> {
  return db().query.eventos.findFirst({ where: eq(eventos.tokenPanel, token) });
}

/** El invitado solo vale dentro de SU evento: /otro-evento/{token} da 404. */
export async function invitadoDeEvento(eventoId: string, token: string): Promise<Invitado | undefined> {
  return db().query.invitados.findFirst({
    where: and(eq(invitados.eventoId, eventoId), eq(invitados.token, token)),
  });
}

export async function invitadoPorToken(token: string) {
  const fila = await db()
    .select({ invitado: invitados, evento: eventos })
    .from(invitados)
    .innerJoin(eventos, eq(invitados.eventoId, eventos.id))
    .where(eq(invitados.token, token))
    .get();
  return fila;
}

/** Primera apertura del link. El WHERE evita pisar la fecha original. */
export async function marcarAbierto(id: string): Promise<void> {
  await db()
    .update(invitados)
    .set({ abiertoEn: new Date() })
    .where(and(eq(invitados.id, id), isNull(invitados.abiertoEn)));
}

export async function invitadosDe(eventoId: string): Promise<Invitado[]> {
  return db().query.invitados.findMany({
    where: eq(invitados.eventoId, eventoId),
    orderBy: [asc(invitados.creadoEn), asc(invitados.nombre)],
  });
}

export interface Estadisticas {
  invitados: number;
  pases: number;
  abiertos: number;
  asisten: number;
  pasesConfirmados: number;
  noAsisten: number;
  pendientes: number;
  ingresados: number;
}

export async function estadisticasDe(eventoId: string): Promise<Estadisticas> {
  const f = await db()
    .select({
      invitados: sql<number>`count(*)`,
      pases: sql<number>`coalesce(sum(${invitados.pases}), 0)`,
      abiertos: sql<number>`count(${invitados.abiertoEn})`,
      asisten: sql<number>`coalesce(sum(${invitados.respuesta} = 'asiste'), 0)`,
      pasesConfirmados: sql<number>`coalesce(sum(case when ${invitados.respuesta} = 'asiste' then ${invitados.pasesConfirmados} else 0 end), 0)`,
      noAsisten: sql<number>`coalesce(sum(${invitados.respuesta} = 'no_asiste'), 0)`,
      pendientes: sql<number>`coalesce(sum(${invitados.respuesta} = 'pendiente'), 0)`,
      ingresados: sql<number>`count(${invitados.ingresadoEn})`,
    })
    .from(invitados)
    .where(eq(invitados.eventoId, eventoId))
    .get();

  return {
    invitados: Number(f?.invitados ?? 0),
    pases: Number(f?.pases ?? 0),
    abiertos: Number(f?.abiertos ?? 0),
    asisten: Number(f?.asisten ?? 0),
    pasesConfirmados: Number(f?.pasesConfirmados ?? 0),
    noAsisten: Number(f?.noAsisten ?? 0),
    pendientes: Number(f?.pendientes ?? 0),
    ingresados: Number(f?.ingresados ?? 0),
  };
}

export async function totalInvitados(eventoId: string): Promise<number> {
  const f = await db()
    .select({ n: sql<number>`count(*)` })
    .from(invitados)
    .where(eq(invitados.eventoId, eventoId))
    .get();
  return Number(f?.n ?? 0);
}

/** Lista del admin: evento + cliente + conteos + pagado, en una sola consulta. */
export async function listarEventos() {
  return db()
    .select({
      evento: eventos,
      cliente: { id: usuarios.id, nombre: usuarios.nombre, telefono: usuarios.telefono },
      invitados: sql<number>`(select count(*) from ${invitados} where ${invitados.eventoId} = ${eventos.id})`,
      asisten: sql<number>`(select count(*) from ${invitados} where ${invitados.eventoId} = ${eventos.id} and ${invitados.respuesta} = 'asiste')`,
      pagado: sql<number>`(select coalesce(sum(${pagos.monto}), 0) from ${pagos} where ${pagos.eventoId} = ${eventos.id})`,
    })
    .from(eventos)
    .innerJoin(usuarios, eq(eventos.clienteId, usuarios.id))
    .orderBy(asc(eventos.fecha));
}

export async function pagosDe(eventoId: string) {
  return db().query.pagos.findMany({ where: eq(pagos.eventoId, eventoId), orderBy: [desc(pagos.fecha)] });
}

export async function clientes() {
  return db()
    .select({
      cliente: usuarios,
      eventos: sql<number>`(select count(*) from ${eventos} where ${eventos.clienteId} = ${usuarios.id})`,
    })
    .from(usuarios)
    .where(eq(usuarios.rol, 'cliente'))
    .orderBy(asc(usuarios.nombre));
}

export async function usuarioPorId(id: string) {
  return db().query.usuarios.findFirst({ where: eq(usuarios.id, id) });
}

export async function eventosDeCliente(clienteId: string) {
  return db().query.eventos.findMany({ where: eq(eventos.clienteId, clienteId), orderBy: [desc(eventos.fecha)] });
}

export async function eventosPorPlantilla(): Promise<Record<string, number>> {
  const filas = await db()
    .select({ plantilla: eventos.plantilla, n: sql<number>`count(*)` })
    .from(eventos)
    .groupBy(eventos.plantilla);
  return Object.fromEntries(filas.map((f) => [f.plantilla, Number(f.n)]));
}
