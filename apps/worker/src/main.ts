import { createLogger, deployment } from "@veristat/shared";
import { closeDb, listServices, runMigrations } from "@veristat/db";
import { crawl } from "./crawl/crawler.js";
import { bazaarSource, curatedSource, demoSource, okxAspSource } from "./crawl/sources.js";
import { probeService, type ServiceRow } from "./probe/runner.js";
import { setProbeTokens } from "./verify/templates.js";
import { runAnchorer } from "./publish/anchorer.js";
import { runAttestor } from "./publish/attestor.js";
import { runGamingMonitor } from "./antigaming/monitor.js";

const log = createLogger("worker");

/**
 * The Veristat daemon: crawler + prober + verifier + scorer + attestor +
 * anchorer in one process. Probe timing is jittered — there is no fixed
 * schedule to learn (spec §8) — and probing never pauses (spec §13).
 */

const PROBE_BASE_INTERVAL_MS = Number(process.env.PROBE_INTERVAL_MS ?? 120_000);
const CRAWL_INTERVAL_MS = Number(process.env.CRAWL_INTERVAL_MS ?? 15 * 60_000);
const ANCHOR_INTERVAL_MS = Number(process.env.ANCHOR_INTERVAL_MS ?? 10 * 60_000);
const ATTEST_INTERVAL_MS = Number(process.env.ATTEST_INTERVAL_MS ?? 10 * 60_000);

function jitter(base: number): number {
  return base * (0.6 + Math.random());
}

function configureProbeTokens(): void {
  const dep = deployment("xlayerTestnet");
  if (dep.mockUsdt) setProbeTokens("xlayerTestnet", [dep.mockUsdt]);
}

async function crawlAll(): Promise<void> {
  for (const source of [demoSource(), okxAspSource(), curatedSource(), bazaarSource()]) {
    await crawl(source);
  }
}

async function probeLoop(): Promise<never> {
  for (;;) {
    try {
      const services = (await listServices({ status: "active" })) as unknown as ServiceRow[];
      if (services.length === 0) {
        log.warn("no active services in catalog; waiting for crawl");
      }
      for (const service of services) {
        try {
          await probeService(service);
        } catch (err) {
          log.error("probe error", { service: service.name, err: String(err) });
        }
        // small jittered gap between services within a round
        await sleep(jitter(3_000));
      }
      await runGamingMonitor().catch((err) => log.error("gaming monitor error", { err: String(err) }));
    } catch (err) {
      log.error("probe loop error", { err: String(err) });
    }
    await sleep(jitter(PROBE_BASE_INTERVAL_MS));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function every(intervalMs: number, name: string, fn: () => Promise<void>): Promise<never> {
  for (;;) {
    try {
      await fn();
    } catch (err) {
      log.error(`${name} error`, { err: String(err) });
    }
    await sleep(jitter(intervalMs));
  }
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "daemon";
  await runMigrations();
  configureProbeTokens();

  if (cmd === "crawl") {
    await crawlAll();
    await closeDb();
    return;
  }

  if (cmd === "probe-once") {
    await crawlAll();
    const services = (await listServices({ status: "active" })) as unknown as ServiceRow[];
    const filter = process.argv[3];
    for (const service of services) {
      if (filter && String(service.id) !== filter && service.name !== filter) continue;
      await probeService(service);
    }
    await closeDb();
    return;
  }

  if (cmd === "anchor-once") {
    await runAnchorer();
    await closeDb();
    return;
  }

  if (cmd === "attest-once") {
    await runAttestor();
    await closeDb();
    return;
  }

  // daemon: everything, forever
  log.info("veristat worker starting", {
    probeIntervalMs: PROBE_BASE_INTERVAL_MS,
    crawlIntervalMs: CRAWL_INTERVAL_MS,
  });
  await Promise.all([
    every(CRAWL_INTERVAL_MS, "crawl", crawlAll),
    probeLoop(),
    every(ANCHOR_INTERVAL_MS, "anchorer", runAnchorer),
    every(ATTEST_INTERVAL_MS, "attestor", runAttestor),
  ]);
}

main().catch((err) => {
  log.error("fatal", { err: String(err) });
  process.exit(1);
});
