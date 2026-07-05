import type { ChainKey, VerificationResult } from "@veristat/shared";
import type { BuiltQuery, ChainReader, ProbeOutcome, QueryTemplate } from "./types.js";
import { result, verdictOf } from "./util.js";

/**
 * The verification engine (spec §5.3): operational verdicts computed for every
 * probe, plus the template's tier-specific accuracy/freshness verdicts when the
 * service actually answered.
 */
export async function verifyProbe(
  template: QueryTemplate,
  chain: ChainKey,
  reader: ChainReader,
  built: BuiltQuery,
  outcome: ProbeOutcome,
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // Reliability: service reachable, protocol-correct, settlement not wasted.
  const answered =
    outcome.httpStatus !== null && outcome.httpStatus >= 200 && outcome.httpStatus < 300;
  const settlementWasted = outcome.x402Status === "settled" && !answered;
  results.push(
    result({
      tier: 3,
      dimension: "reliability",
      verdict: verdictOf(answered && !settlementWasted),
      expected: "2xx response to a settled request",
      actual: { httpStatus: outcome.httpStatus, x402Status: outcome.x402Status, error: outcome.error },
      groundTruth: null,
      detail: settlementWasted
        ? "payment settled on-chain but service failed to deliver"
        : answered
          ? "request served"
          : `request failed: ${outcome.error ?? `http ${outcome.httpStatus}`}`,
    }),
  );

  // Latency observation (score computed against category baseline later).
  results.push(
    result({
      tier: 3,
      dimension: "latency",
      verdict: "pass",
      expected: null,
      actual: outcome.latencyMs,
      groundTruth: null,
      detail: `end-to-end latency ${outcome.latencyMs}ms`,
    }),
  );

  // Integrity: charged must equal quoted, and not exceed the catalog-declared
  // price — a 402 quote above the listed price is itself an overcharge.
  if (outcome.quotedUsd !== null && outcome.chargedUsd !== null) {
    const ceiling = Math.min(outcome.quotedUsd, outcome.declaredUsd ?? Infinity);
    const overcharged = outcome.chargedUsd > ceiling * 1.001;
    results.push(
      result({
        tier: 1, // billing is verified against the on-chain transfer — deterministic truth
        dimension: "integrity",
        verdict: verdictOf(!overcharged),
        expected: ceiling,
        actual: outcome.chargedUsd,
        groundTruth: { expected: ceiling },
        detail: overcharged
          ? `charged $${outcome.chargedUsd} vs listed/quoted $${ceiling}`
          : "charged amount matches quote and listed price",
      }),
    );
  }

  // Accuracy / freshness only make sense when the service answered.
  if (answered && outcome.rawResponse) {
    try {
      results.push(...(await template.verify(chain, reader, built, outcome)));
    } catch (err) {
      results.push(
        result({
          tier: 3,
          dimension: "accuracy",
          verdict: "inconclusive",
          expected: null,
          actual: null,
          groundTruth: null,
          detail: `verifier error: ${err instanceof Error ? err.message : String(err)}`,
        }),
      );
    }
  }

  return results;
}
