import "server-only";
import { runMigrations } from "@veristat/db";

let migrated: Promise<void> | null = null;

/** Ensure schema exists once per server process (PGlite dev / fresh Postgres). */
export function ensureDb(): Promise<void> {
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
