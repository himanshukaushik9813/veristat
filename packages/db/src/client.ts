import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "./schema.js";

// Single Drizzle type regardless of driver: the PGlite database is
// API-compatible, and a union of the two collapses Drizzle's overloads.
export type Db = ReturnType<typeof drizzlePg<typeof schema>>;

let db: Db | null = null;
let pglite: PGlite | null = null;

/**
 * DATABASE_URL set → real Postgres (Neon/local). Otherwise an embedded PGlite
 * instance persisted at .pgdata/ so local dev needs zero infrastructure.
 */
export function getDb(): Db {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (url) {
    // pglite-socket serves one client at a time — default to a single pooled
    // connection released quickly when idle, so worker/api/web can share the
    // socket server in turns. On real Postgres set DATABASE_POOL_MAX higher.
    const max = Number(process.env.DATABASE_POOL_MAX ?? 1);
    const pool = new pg.Pool({
      connectionString: url,
      max,
      idleTimeoutMillis: max === 1 ? 250 : 30_000,
      allowExitOnIdle: max === 1,
    });
    db = drizzlePg(pool, { schema });
  } else {
    const dataDir = process.env.PGLITE_DIR ?? ".pgdata";
    pglite = new PGlite(dataDir);
    db = drizzlePglite(pglite, { schema }) as unknown as Db;
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (pglite) await pglite.close();
  pglite = null;
  db = null;
}

export { schema };
