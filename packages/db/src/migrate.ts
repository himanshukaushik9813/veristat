import { fileURLToPath } from "node:url";
import path from "node:path";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { getDb, closeDb } from "./client.js";

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export async function runMigrations(): Promise<void> {
  const db = getDb();
  if (process.env.DATABASE_URL) {
    await migratePg(db as never, { migrationsFolder });
  } else {
    await migratePglite(db as never, { migrationsFolder });
  }
}

// Allow `pnpm --filter @veristat/db migrate`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runMigrations()
    .then(async () => {
      console.log("migrations applied");
      await closeDb();
    })
    .catch(async (err) => {
      console.error(err);
      await closeDb();
      process.exit(1);
    });
}
