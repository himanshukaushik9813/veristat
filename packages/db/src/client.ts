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
    const pool = new pg.Pool({ connectionString: url });
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
