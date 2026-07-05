import { createLogger } from "@veristat/shared";
import {
  freshVsEstablishedAccuracy,
  insertIncident,
  listServices,
  recentGamingIncident,
} from "@veristat/db";

const log = createLogger("anti-gaming");

/**
 * Statistical special-casing detection (spec §8): if a service's accuracy on
 * established probe wallets significantly exceeds its accuracy on fresh
 * wallets, that discrepancy is flagged publicly. Two-proportion z-test,
 * one-sided, alpha 0.01. Being caught gaming is itself a scored incident.
 */
const MIN_SAMPLES = 10;
const Z_CRITICAL = 2.33; // one-sided p < 0.01

export function twoProportionZ(
  a: { pass: number; total: number },
  b: { pass: number; total: number },
): number | null {
  if (a.total < MIN_SAMPLES || b.total < MIN_SAMPLES) return null;
  const p1 = a.pass / a.total;
  const p2 = b.pass / b.total;
  const pooled = (a.pass + b.pass) / (a.total + b.total);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.total + 1 / b.total));
  if (se === 0) return null;
  return (p1 - p2) / se;
}

export async function runGamingMonitor(): Promise<void> {
  const services = await listServices({ status: "active" });
  for (const service of services) {
    const { fresh, established } = await freshVsEstablishedAccuracy(service.id);
    const z = twoProportionZ(established, fresh); // established better than fresh ⇒ z > 0
    if (z === null || z < Z_CRITICAL) continue;
    if (await recentGamingIncident(service.id)) continue; // don't spam
    const summary =
      `accuracy on established wallets ${established.pass}/${established.total} vs ` +
      `fresh wallets ${fresh.pass}/${fresh.total} (z=${z.toFixed(2)}, p<0.01): ` +
      `pattern consistent with probe special-casing`;
    await insertIncident(service.id, "gaming_suspected", summary);
    log.warn("gaming suspected", { service: service.name, z: z.toFixed(2) });
  }
}
