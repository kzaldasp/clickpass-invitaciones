import { createClient } from '@libsql/client/web';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from 'astro:env/server';
import * as schema from './schema';

/**
 * Cliente HTTP de Turso: el unico que funciona en Workers (no hay sockets ni
 * disco). En local apunta al servidor de `npm run db:dev`.
 */
let instancia: LibSQLDatabase<typeof schema> | undefined;

export function db(): LibSQLDatabase<typeof schema> {
  instancia ??= drizzle(createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN }), {
    schema,
  });
  return instancia;
}
