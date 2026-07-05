import { z } from "zod";

/** Where a catalog entry was discovered. */
export const ServiceSource = z.enum([
  "okx_asp",
  "bazaar",
  "x402scan",
  "curated",
  "demo",
]);
export type ServiceSource = z.infer<typeof ServiceSource>;

/** Probe/verification categories — each maps to a query-template family and a verifier. */
export const ServiceCategory = z.enum([
  "defi-rates",
  "price",
  "security-score",
  "swap-quote",
  "generic", // Tier 3 only: research, analysis, creative, unknown
]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const ServiceStatus = z.enum(["active", "inactive", "dead"]);
export type ServiceStatus = z.infer<typeof ServiceStatus>;

export const ChainKey = z.enum(["xlayer", "xlayerTestnet", "base", "baseSepolia"]);
export type ChainKey = z.infer<typeof ChainKey>;

export const PaymentScheme = z.enum(["exact", "aggr_deferred", "none"]);
export type PaymentScheme = z.infer<typeof PaymentScheme>;

/** Verdict of one verification. `unverifiable` is Tier 3's accuracy verdict — never faked. */
export const Verdict = z.enum(["pass", "fail", "inconclusive", "unverifiable"]);
export type Verdict = z.infer<typeof Verdict>;

export const VerificationTier = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type VerificationTier = z.infer<typeof VerificationTier>;

export const IncidentKind = z.enum([
  "wrong_answer",
  "stale_data",
  "overcharge",
  "schema_break",
  "settlement_failure",
  "uptime_gap",
  "quote_above_cap",
  "gaming_suspected",
  "honeypot_failure",
]);
export type IncidentKind = z.infer<typeof IncidentKind>;

export const WalletStatus = z.enum(["active", "retired"]);
export type WalletStatus = z.infer<typeof WalletStatus>;

export const DisputeStatus = z.enum(["open", "reprobing", "upheld", "overturned"]);
export type DisputeStatus = z.infer<typeof DisputeStatus>;

/** Normalized catalog record produced by every registry source. */
export const CatalogEntry = z.object({
  source: ServiceSource,
  sourceId: z.string(), // stable id within the source
  name: z.string(),
  endpoint: z.string().url(),
  category: ServiceCategory,
  chain: ChainKey,
  paymentScheme: PaymentScheme,
  declaredPriceUsd: z.number().nonnegative().nullable(),
  metadata: z.record(z.unknown()).default({}),
});
export type CatalogEntry = z.infer<typeof CatalogEntry>;

/** Everything captured about a single paid probe (spec §5.2). */
export interface ProbeResult {
  serviceId: number;
  templateId: string;
  walletAddress: string;
  requestParams: Record<string, unknown>;
  requestUrl: string;
  httpStatus: number | null;
  x402Status: "settled" | "free" | "payment_failed" | "no_payment_required" | "error";
  paymentTxHash: string | null;
  quotedUsd: number | null;
  chargedUsd: number | null;
  rawResponse: string | null;
  responseHash: string | null;
  latencyMs: number;
  error: string | null;
  startedAt: Date;
}

/** Ground-truth context recorded with every verification (spec §5.4). */
export interface GroundTruth {
  pinnedBlock?: number;
  chain?: ChainKey;
  contractReads?: Array<{ address: string; fn: string; args: unknown[]; result: unknown }>;
  references?: Array<{ name: string; value: unknown; fetchedAt: string }>;
  expected: unknown;
  toleranceBps?: number;
}

export interface VerificationResult {
  tier: VerificationTier;
  verdict: Verdict;
  dimension: ScoreDimension;
  expected: unknown;
  actual: unknown;
  toleranceBps: number | null;
  groundTruth: GroundTruth | null;
  detail: string;
  verifierVersion: string;
}

export const SCORE_DIMENSIONS = [
  "accuracy",
  "reliability",
  "latency",
  "integrity",
  "freshness",
] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export interface DimensionScores {
  accuracy: number | null; // null = "accuracy not verified" (Tier 3)
  reliability: number;
  latency: number;
  integrity: number;
  freshness: number | null;
}

export interface ComputedScore {
  dimensions: DimensionScores;
  composite: number;
  grade: string;
  confidence: number; // 0..1
  sampleCount: number;
  tier: VerificationTier; // dominant tier of underlying evidence
}
