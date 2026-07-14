import "server-only";
import { runMigrations } from "@veristat/db";

let migrated: Promise<void> | null = null;

/**
 * Ensure schema exists once per server process. Local dev uses embedded PGlite
 * (no DATABASE_URL) and must migrate on boot. In production DATABASE_URL points
 * at a Postgres already migrated out-of-band by the deploy pipeline, so the
 * read-only frontend skips migration (its migration assets aren't bundled into
 * serverless functions anyway).
 */
export function ensureDb(): Promise<void> {
  if (process.env.DATABASE_URL) return Promise.resolve();
  migrated ??= runMigrations().catch((err) => {
    migrated = null;
    throw err;
  });
  return migrated;
}

export function gradeBand(grade: string): string {
  const letter = grade[0]?.toLowerCase() ?? "f";
  return ["a", "b", "c", "d"].includes(letter) ? letter : "f";
}

export function fmt(n: number | null | undefined, digits = 1): string {
  return n === null || n === undefined ? "n/a" : n.toFixed(digits);
}
