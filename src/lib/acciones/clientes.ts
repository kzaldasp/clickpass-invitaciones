import { and, eq, ne } from 'drizzle-orm';
import { db } from '../../db/cliente';
import { eventos, usuarios } from '../../db/schema';
import { POR_DEFECTO } from '../config';
import { texto } from '../formularios';
import { normalizarTelefono } from '../telefonos';

/** Alta y edicion de clientes desde el admin. Devuelve un error legible o null. */
export async function guardarCliente(form: FormData): Promise<string | null> {
  const id = texto(form, 'id', 64);
  const nombre = texto(form, 'nombre', 120);
  const email = texto(form, 'email', 200).toLowerCase() || null;
  const telefonoCrudo = texto(form, 'telefono', 30);
  const telefono = normalizarTelefono(telefonoCrudo, POR_DEFECTO.prefijoTelefono);

  if (!nombre) return 'El nombre es obligatorio.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no parece válido.';
  if (telefonoCrudo && !telefono) return 'El WhatsApp no parece un número válido.';

  if (email) {
    const choque = await db().query.usuarios.findFirst({
      where: id ? and(eq(usuarios.email, email), ne(usuarios.id, id)) : eq(usuarios.email, email),
    });
    if (choque) return `Ya hay un usuario con el correo ${email}.`;
  }

  if (id) {
    await db()
      .update(usuarios)
      .set({ nombre, email, telefono })
      .where(and(eq(usuarios.id, id), eq(usuarios.rol, 'cliente')));
  } else {
    await db().insert(usuarios).values({ rol: 'cliente', nombre, email, telefono });
  }
  return null;
}

export async function borrarCliente(id: string): Promise<string | null> {
  const tiene = await db().query.eventos.findFirst({ where: eq(eventos.clienteId, id) });
  if (tiene) return 'No se puede borrar: el cliente tiene eventos. Elimina primero sus eventos.';
  await db().delete(usuarios).where(and(eq(usuarios.id, id), eq(usuarios.rol, 'cliente')));
  return null;
}
