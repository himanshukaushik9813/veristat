import type { VerificationResult, Verdict } from "@veristat/shared";
import { VERIFIER_VERSION } from "./types.js";

export function result(
  partial: Omit<VerificationResult, "verifierVersion" | "toleranceBps"> &
    Partial<Pick<VerificationResult, "toleranceBps">>,
): VerificationResult {
  return { toleranceBps: null, verifierVersion: VERIFIER_VERSION, ...partial };
}

/** |actual-expected| within tolerance (basis points of expected). */
export function withinBps(expected: number, actual: number, bps: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / Math.abs(expected) <= bps / 10_000;
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Median absolute deviation — used for cross-service outlier flagging (Tier 2). */
export function madOutliers(values: number[], threshold = 3.5): boolean[] {
  const med = median(values);
  const deviations = values.map((v) => Math.abs(v - med));
  const mad = median(deviations);
  if (mad === 0) return values.map((v) => v !== med);
  // 0.6745 = consistency constant for normal distributions
  return values.map((v) => (0.6745 * Math.abs(v - med)) / mad > threshold);
}

export function parseJsonResponse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function verdictOf(pass: boolean): Verdict {
  return pass ? "pass" : "fail";
}
