/**
 * Budget governor (spec §5.2): per-service and global daily spend caps so a
 * mispriced or malicious endpoint cannot drain probe funds. Tracked in-memory
 * per UTC day; caps are conservative and env-configurable.
 */
export const PER_SERVICE_DAILY_USD = Number(process.env.PER_SERVICE_DAILY_USD ?? 0.05);
export const GLOBAL_DAILY_USD = Number(process.env.GLOBAL_DAILY_USD ?? 2);
/** Hard per-probe ceiling passed to payAndFetch — quotes above it are refused. */
export const MAX_PER_PROBE_USD = Number(process.env.MAX_PER_PROBE_USD ?? 0.01);

interface DayLedger {
  day: string;
  global: number;
  perService: Map<number, number>;
}

let ledger: DayLedger = { day: today(), global: 0, perService: new Map() };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function roll(): void {
  const d = today();
  if (ledger.day !== d) ledger = { day: d, global: 0, perService: new Map() };
}

export function remainingBudget(serviceId: number): number {
  roll();
  const serviceSpent = ledger.perService.get(serviceId) ?? 0;
  return Math.max(
    0,
    Math.min(
      PER_SERVICE_DAILY_USD - serviceSpent,
      GLOBAL_DAILY_USD - ledger.global,
      MAX_PER_PROBE_USD,
    ),
  );
}

export function recordSpend(serviceId: number, usd: number): void {
  roll();
  ledger.global += usd;
  ledger.perService.set(serviceId, (ledger.perService.get(serviceId) ?? 0) + usd);
}

/** Test hook. */
export function resetBudget(): void {
  ledger = { day: today(), global: 0, perService: new Map() };
}
