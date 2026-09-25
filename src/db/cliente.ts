import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * En local: TURSO_DATABASE_URL=file:local.db (sin token).
 * En produccion: la URL libsql:// de Turso mas TURSO_AUTH_TOKEN.
 *
 * Al pasar a Cloudflare (fase 1) esto se lee con `astro:env/server` y el
 * cliente se importa de `@libsql/client/web`: los Workers no tienen sockets.
 */
const url = import.meta.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error('Falta TURSO_DATABASE_URL (ver .env.example)');

export const db = drizzle(createClient({ url, authToken }), { schema });
