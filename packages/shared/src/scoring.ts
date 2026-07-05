import type {
  ComputedScore,
  DimensionScores,
  ScoreDimension,
  ServiceCategory,
  Verdict,
  VerificationTier,
} from "./types.js";

/**
 * Scoring model (spec §6): five dimensions 0–100, exponential time decay so
 * recent behavior dominates, category-specific composite weights, letter grade,
 * and a confidence indicator driven by sample count and verification tier.
 * The methodology is public; the moat is the evidence corpus, not the formula.
 */

export const DECAY_HALF_LIFE_DAYS = 7;

export interface ScoringInput {
  dimension: ScoreDimension;
  verdict: Verdict;
  tier: VerificationTier;
  /** For latency observations: milliseconds. Ignored for pass/fail dimensions. */
  latencyMs?: number;
  ageDays: number;
}

export interface LatencyBaseline {
  /** Category median considered "good" (score 100 at or below). */
  goodMs: number;
  /** Latency at or above this scores 0. */
  badMs: number;
}

export const DEFAULT_LATENCY_BASELINE: LatencyBaseline = { goodMs: 800, badMs: 15_000 };

export function decayWeight(ageDays: number, halfLifeDays = DECAY_HALF_LIFE_DAYS): number {
  return Math.pow(0.5, Math.max(0, ageDays) / halfLifeDays);
}

/** Tier weighting for confidence: on-chain truth counts more than consensus, which counts more than operational. */
const TIER_WEIGHT: Record<VerificationTier, number> = { 1: 1.0, 2: 0.75, 3: 0.4 };

function weightedPassRate(obs: ScoringInput[]): number | null {
  let num = 0;
  let den = 0;
  for (const o of obs) {
    if (o.verdict === "unverifiable" || o.verdict === "inconclusive") continue;
    const w = decayWeight(o.ageDays);
    den += w;
    if (o.verdict === "pass") num += w;
  }
  if (den === 0) return null;
  return (num / den) * 100;
}

export function latencyScore(
  obs: ScoringInput[],
  baseline: LatencyBaseline = DEFAULT_LATENCY_BASELINE,
): number {
  const pts = obs.filter((o) => typeof o.latencyMs === "number");
  if (pts.length === 0) return 50; // no data: neutral
  let num = 0;
  let den = 0;
  for (const o of pts) {
    const w = decayWeight(o.ageDays);
    const ms = o.latencyMs!;
    const s =
      ms <= baseline.goodMs
        ? 100
        : ms >= baseline.badMs
          ? 0
          : (100 * (baseline.badMs - ms)) / (baseline.badMs - baseline.goodMs);
    num += w * s;
    den += w;
  }
  return num / den;
}

export function computeDimensions(
  observations: ScoringInput[],
  baseline?: LatencyBaseline,
): DimensionScores {
  const by = (d: ScoreDimension) => observations.filter((o) => o.dimension === d);
  return {
    accuracy: weightedPassRate(by("accuracy")),
    reliability: weightedPassRate(by("reliability")) ?? 50,
    latency: latencyScore(by("latency"), baseline),
    integrity: weightedPassRate(by("integrity")) ?? 50,
    freshness: weightedPassRate(by("freshness")),
  };
}

/** Composite weights per category (spec §6: accuracy-heavy for data, integrity-heavy for execution). */
export const CATEGORY_WEIGHTS: Record<
  ServiceCategory,
  Record<ScoreDimension, number>
> = {
  "defi-rates": { accuracy: 0.45, reliability: 0.15, latency: 0.1, integrity: 0.15, freshness: 0.15 },
  price: { accuracy: 0.45, reliability: 0.15, latency: 0.1, integrity: 0.15, freshness: 0.15 },
  "security-score": { accuracy: 0.5, reliability: 0.15, latency: 0.05, integrity: 0.2, freshness: 0.1 },
  "swap-quote": { accuracy: 0.3, reliability: 0.15, latency: 0.1, integrity: 0.35, freshness: 0.1 },
  // Tier 3: no accuracy/freshness — operational only, explicitly labeled "accuracy not verified"
  generic: { accuracy: 0, reliability: 0.4, latency: 0.25, integrity: 0.35, freshness: 0 },
};

export function composite(
  dims: DimensionScores,
  category: ServiceCategory,
): number {
  const weights = { ...CATEGORY_WEIGHTS[category] };
  // Re-normalize over dimensions we actually have data for; never fabricate accuracy.
  if (dims.accuracy === null) weights.accuracy = 0;
  if (dims.freshness === null) weights.freshness = 0;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let sum = 0;
  sum += (dims.accuracy ?? 0) * weights.accuracy;
  sum += dims.reliability * weights.reliability;
  sum += dims.latency * weights.latency;
  sum += dims.integrity * weights.integrity;
  sum += (dims.freshness ?? 0) * weights.freshness;
  return sum / total;
}

export function letterGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Confidence 0..1 from tier-weighted effective sample size.
 * ~30 tier-1 samples ≈ 0.95; a handful of tier-3 samples stays low.
 */
export function confidence(observations: ScoringInput[]): number {
  let effective = 0;
  for (const o of observations) {
    effective += TIER_WEIGHT[o.tier] * decayWeight(o.ageDays);
  }
  return 1 - Math.exp(-effective / 10);
}

export function dominantTier(observations: ScoringInput[]): VerificationTier {
  const counts: Record<VerificationTier, number> = { 1: 0, 2: 0, 3: 0 };
  for (const o of observations) counts[o.tier] += 1;
  if (counts[1] >= counts[2] && counts[1] >= counts[3] && counts[1] > 0) return 1;
  if (counts[2] >= counts[3] && counts[2] > 0) return 2;
  return 3;
}

export function computeScore(
  observations: ScoringInput[],
  category: ServiceCategory,
  baseline?: LatencyBaseline,
): ComputedScore {
  const dims = computeDimensions(observations, baseline);
  const comp = composite(dims, category);
  return {
    dimensions: dims,
    composite: comp,
    grade: letterGrade(comp),
    confidence: confidence(observations),
    sampleCount: observations.length,
    tier: dominantTier(observations),
  };
}
