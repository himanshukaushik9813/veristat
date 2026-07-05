import { createLogger } from "@veristat/shared";
import {
  finishCrawlRun,
  insertSnapshot,
  markMissingServices,
  startCrawlRun,
  upsertService,
} from "@veristat/db";
import type { RegistrySource } from "./sources.js";

const log = createLogger("crawler");

/**
 * One crawl pass over a source: upsert every discovered entry, snapshot diffs
 * (silent price/endpoint changes feed Integrity), and bump the dead-counter of
 * listings that vanished — inactive after N consecutive misses, never deleted.
 */
export async function crawl(source: RegistrySource): Promise<void> {
  const runId = await startCrawlRun(source.name);
  try {
    const entries = await source.discover();
    let added = 0;
    let changed = 0;
    for (const entry of entries) {
      const res = await upsertService(entry);
      if (res.added) added += 1;
      if (res.changed) {
        changed += 1;
        await insertSnapshot(res.id, runId, entry, { changed: true });
      }
    }
    const markedInactive = await markMissingServices(
      source.name,
      entries.map((e) => e.sourceId),
    );
    await finishCrawlRun(runId, { found: entries.length, added, changed, markedInactive });
    log.info("crawl finished", { source: source.name, found: entries.length, added, changed, markedInactive });
  } catch (err) {
    await finishCrawlRun(runId, {
      found: 0,
      added: 0,
      changed: 0,
      markedInactive: 0,
      error: err instanceof Error ? err.message : String(err),
    });
    log.error("crawl failed", { source: source.name, err: String(err) });
  }
}
