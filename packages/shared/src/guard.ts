/**
 * The pre-purchase guard policy — the single source of truth for the go/no-go
 * decision an agent makes before paying an unknown x402 service. The @veristat/sdk
 * `guard()` and the score API's free `/v1/guard` gate both evaluate this exact
 * policy, so the CLI, the SDK, and the live API always agree.
 */

export interface GuardPolicy {
  /** Minimum composite score (default 70). */
  minScore?: number;
  /** Minimum confidence 0..1 (default 0.3). */
  minConfidence?: number;
  /** Require verified accuracy (reject Tier-3 "accuracy not verified") (default false). */
  requireVerifiedAccuracy?: boolean;
  /** Minimum integrity score — billing honesty (default 60). */
  minIntegrity?: number;
}

/** Normalized score inputs the policy reasons over (driver-agnostic). */
export interface GuardScoreInput {
  composite: number;
  confidence: number;
  integrity: number;
  /** false = Tier-3 "accuracy not verified" (never a fabricated number). */
  accuracyVerified: boolean;
  grade: string;
  sampleCount: number;
}

export interface GuardDecision {
  allow: boolean;
  reason: string;
  /** Individual policy failures (empty when allowed). */
  failures: string[];
}

/**
 * Pure policy over verified evidence — never a vibe. Returns a concrete,
 * human-readable reason for every allow and every deny.
 */
export function evaluateGuardPolicy(s: GuardScoreInput, policy: GuardPolicy = {}): GuardDecision {
  const {
    minScore = 70,
    minConfidence = 0.3,
    requireVerifiedAccuracy = false,
    minIntegrity = 60,
  } = policy;

  const checks: Array<[boolean, string]> = [
    [s.composite >= minScore, `composite ${s.composite.toFixed(1)} < required ${minScore}`],
    [s.confidence >= minConfidence, `confidence ${(s.confidence * 100).toFixed(0)}% < required ${minConfidence * 100}%`],
    [s.integrity >= minIntegrity, `integrity ${s.integrity.toFixed(0)} < required ${minIntegrity} (billing risk)`],
    [
      !requireVerifiedAccuracy || s.accuracyVerified,
      "accuracy not verified (Tier 3) but policy requires verified accuracy",
    ],
  ];
  const failures = checks.filter(([ok]) => !ok).map(([, why]) => why);
  if (failures.length > 0) {
    return { allow: false, reason: failures.join("; "), failures };
  }
  return {
    allow: true,
    reason: `grade ${s.grade} (${s.composite.toFixed(1)}), confidence ${(s.confidence * 100).toFixed(0)}%, ${s.sampleCount} verified verdicts`,
    failures: [],
  };
}
