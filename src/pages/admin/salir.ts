import type { APIRoute } from 'astro';
import { cerrarSesion } from '../../lib/sesion';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await cerrarSesion(cookies);
  return redirect('/admin/entrar', 303);
};
