import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';

/** Conexion para scripts de Node. Misma URL que drizzle.config.ts. */
export const db = drizzle(
  createClient({
    url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8880',
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
  { schema },
);
