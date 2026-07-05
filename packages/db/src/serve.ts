import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

/**
 * Zero-infra multi-process mode: serve the embedded PGlite database over the
 * Postgres wire protocol so worker, score-api, and web can all connect via
 * DATABASE_URL=postgres://localhost:5433/postgres while PGlite remains the
 * single writer process. For production use a real Postgres (Neon etc.).
 */
async function main(): Promise<void> {
  const dataDir = process.env.PGLITE_DIR ?? ".pgdata";
  const port = Number(process.env.PGLITE_PORT ?? 5433);
  const db = await PGlite.create(dataDir);
  const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
  await server.start();
  console.log(`pglite serving ${dataDir} on postgres://127.0.0.1:${port}/postgres`);
  process.on("SIGINT", async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
