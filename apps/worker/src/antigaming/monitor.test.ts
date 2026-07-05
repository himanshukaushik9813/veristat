import { describe, expect, it } from "vitest";
import { twoProportionZ } from "./monitor.js";

describe("twoProportionZ", () => {
  it("returns null under minimum sample size", () => {
    expect(twoProportionZ({ pass: 3, total: 5 }, { pass: 1, total: 5 })).toBeNull();
  });

  it("flags a service that special-cases established wallets", () => {
    // established wallets: 58/60 pass; fresh wallets: 20/40 pass
    const z = twoProportionZ({ pass: 58, total: 60 }, { pass: 20, total: 40 });
    expect(z).not.toBeNull();
    expect(z!).toBeGreaterThan(2.33);
  });

  it("does not flag statistically similar cohorts", () => {
    const z = twoProportionZ({ pass: 55, total: 60 }, { pass: 36, total: 40 });
    expect(z).not.toBeNull();
    expect(Math.abs(z!)).toBeLessThan(2.33);
  });
});
