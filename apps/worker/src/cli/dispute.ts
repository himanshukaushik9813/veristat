import { createLogger, type ServiceCategory } from "@veristat/shared";
import {
  closeDb,
  getService,
  latestScore,
  openDispute,
  resolveDispute,
  runMigrations,
} from "@veristat/db";
import { probeService, recomputeScore, type ServiceRow } from "../probe/runner.js";

const log = createLogger("dispute");

/**
 * Dispute process (spec §9): any provider can contest a score. A contest
 * triggers a re-probe batch with fresh wallets; the dispute and its outcome
 * are published regardless of result.
 *
 * Usage: pnpm --filter @veristat/worker dispute <serviceId> "<reason>"
 */
async function main(): Promise<void> {
  const serviceId = Number(process.argv[2]);
  const reason = process.argv[3] ?? "provider contested score";
  if (!Number.isInteger(serviceId)) {
    console.error('usage: dispute <serviceId> "<reason>"');
    process.exit(1);
  }
  await runMigrations();
  const service = await getService(serviceId);
  if (!service) throw new Error(`service ${serviceId} not found`);

  const before = await latestScore(serviceId);
  const disputeId = await openDispute(serviceId, reason, before?.id);
  log.info("dispute opened", { disputeId, service: service.name, reason });

  // Re-probe with fresh wallets: MAX_PROBES_PER_WALLET=0 forces rotation each draw.
  process.env.MAX_PROBES_PER_WALLET = "0";
  const REPROBES = Number(process.env.DISPUTE_REPROBES ?? 5);
  const probeIds: number[] = [];
  for (let i = 0; i < REPROBES; i++) {
    const res = await probeService(service as unknown as ServiceRow);
    if (res) probeIds.push(res.probeId);
  }
  await recomputeScore(serviceId, service.category as ServiceCategory);
  const after = await latestScore(serviceId);

  const beforeComposite = before?.composite ?? 0;
  const afterComposite = after?.composite ?? 0;
  const overturned = Math.abs(afterComposite - beforeComposite) > 5;
  const outcome =
    `re-probed ${probeIds.length}x with fresh wallets: composite ` +
    `${beforeComposite.toFixed(1)} -> ${afterComposite.toFixed(1)}; ` +
    (overturned ? "contested score materially changed" : "original score upheld");
  await resolveDispute(disputeId, overturned ? "overturned" : "upheld", outcome, probeIds);
  log.info("dispute resolved and published", { disputeId, outcome });
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
