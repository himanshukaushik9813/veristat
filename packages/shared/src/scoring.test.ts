import { describe, expect, it } from "vitest";
import {
  composite,
  computeScore,
  confidence,
  decayWeight,
  letterGrade,
  type ScoringInput,
} from "./scoring.js";

const obs = (over: Partial<ScoringInput>): ScoringInput => ({
  dimension: "accuracy",
  verdict: "pass",
  tier: 1,
  ageDays: 0,
  ...over,
});

describe("decayWeight", () => {
  it("halves per half-life", () => {
    expect(decayWeight(0)).toBe(1);
    expect(decayWeight(7)).toBeCloseTo(0.5);
    expect(decayWeight(14)).toBeCloseTo(0.25);
  });
});

describe("computeScore", () => {
  it("perfect tier-1 service scores high with A grade", () => {
    const observations: ScoringInput[] = [];
    for (let i = 0; i < 30; i++) {
      observations.push(obs({ dimension: "accuracy" }));
      observations.push(obs({ dimension: "reliability" }));
      observations.push(obs({ dimension: "freshness" }));
      observations.push(obs({ dimension: "integrity" }));
      observations.push(obs({ dimension: "latency", latencyMs: 300 }));
    }
    const s = computeScore(observations, "price");
    expect(s.composite).toBeGreaterThan(95);
    expect(s.grade.startsWith("A")).toBe(true);
    expect(s.confidence).toBeGreaterThan(0.9);
    expect(s.tier).toBe(1);
  });

  it("recent failures dominate old successes (time decay)", () => {
    const observations: ScoringInput[] = [
      ...Array.from({ length: 20 }, () => obs({ ageDays: 28 })), // old passes
      ...Array.from({ length: 5 }, () => obs({ verdict: "fail", ageDays: 0 })), // fresh fails
    ];
    const s = computeScore(observations, "price");
    // Unweighted pass rate would be 80; decay pushes it well below.
    expect(s.dimensions.accuracy).toBeLessThan(55);
  });

  it("never fabricates accuracy for Tier-3 services", () => {
    const observations: ScoringInput[] = [
      obs({ dimension: "reliability", tier: 3 }),
      obs({ dimension: "integrity", tier: 3 }),
      obs({ dimension: "latency", tier: 3, latencyMs: 500 }),
    ];
    const s = computeScore(observations, "generic");
    expect(s.dimensions.accuracy).toBeNull();
    expect(s.dimensions.freshness).toBeNull();
    expect(s.composite).toBeGreaterThan(0); // operational-only composite still computed
    expect(s.tier).toBe(3);
  });

  it("integrity failures hit swap-quote services hardest", () => {
    const base: ScoringInput[] = [
      ...Array.from({ length: 10 }, () => obs({ dimension: "accuracy" })),
      ...Array.from({ length: 10 }, () => obs({ dimension: "reliability" })),
      ...Array.from({ length: 10 }, () => obs({ dimension: "integrity", verdict: "fail" })),
    ];
    const swap = computeScore(base, "swap-quote");
    const price = computeScore(base, "price");
    expect(swap.composite).toBeLessThan(price.composite);
  });

  it("verdict inconclusive/unverifiable are excluded from pass rates", () => {
    const s = computeScore(
      [
        obs({}),
        obs({ verdict: "inconclusive" }),
        obs({ verdict: "unverifiable" }),
      ],
      "price",
    );
    expect(s.dimensions.accuracy).toBe(100);
  });
});

describe("confidence", () => {
  it("tier-1 evidence builds confidence faster than tier-3", () => {
    const t1 = confidence(Array.from({ length: 10 }, () => obs({ tier: 1 })));
    const t3 = confidence(Array.from({ length: 10 }, () => obs({ tier: 3 })));
    expect(t1).toBeGreaterThan(t3);
  });
});

describe("letterGrade", () => {
  it("maps boundaries", () => {
    expect(letterGrade(97)).toBe("A+");
    expect(letterGrade(90)).toBe("A-");
    expect(letterGrade(59)).toBe("F");
  });
});

describe("composite", () => {
  it("renormalizes weights when accuracy is null", () => {
    const c = composite(
      { accuracy: null, reliability: 100, latency: 100, integrity: 100, freshness: null },
      "price",
    );
    expect(c).toBe(100);
  });
});
