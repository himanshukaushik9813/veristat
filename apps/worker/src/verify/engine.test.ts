import { describe, expect, it } from "vitest";
import { verifyProbe } from "./engine.js";
import {
  balanceTemplate,
  blockTimestampTemplate,
  crossServiceOutliers,
  genericTemplate,
  makePriceTemplate,
  setProbeTokens,
  tokenMetaTemplate,
} from "./templates.js";
import type { ChainReader, ProbeOutcome } from "./types.js";

const TOKEN = "0x1111111111111111111111111111111111111111" as const;
setProbeTokens("xlayerTestnet", [TOKEN]);

const HEAD = 1_000_000n;
const META = { name: "Veristat Test USDT", symbol: "tUSDT", decimals: 6, totalSupply: 5_000_000_000n };

const fakeReader: ChainReader = {
  blockNumber: async () => HEAD,
  blockTimestamp: async (_c, block) => 1_700_000_000n + block,
  erc20Metadata: async () => META,
  erc20BalanceOf: async (_c, _t, owner) => (owner.endsWith("aa") ? 42n : 0n),
  gasPrice: async () => 1_000_000n,
};

const okOutcome = (raw: unknown): ProbeOutcome => ({
  httpStatus: 200,
  x402Status: "settled",
  quotedUsd: 0.001,
  chargedUsd: 0.001,
  rawResponse: JSON.stringify(raw),
  latencyMs: 250,
  error: null,
});

describe("verifyProbe — operational verdicts", () => {
  it("flags settlement waste when paid but not served", async () => {
    const built = await genericTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(genericTemplate, "xlayerTestnet", fakeReader, built, {
      httpStatus: 500,
      x402Status: "settled",
      quotedUsd: 0.001,
      chargedUsd: 0.001,
      rawResponse: null,
      latencyMs: 900,
      error: null,
    });
    const rel = rs.find((r) => r.dimension === "reliability")!;
    expect(rel.verdict).toBe("fail");
    expect(rel.detail).toContain("settled on-chain but service failed");
  });

  it("flags overcharge as integrity failure", async () => {
    const built = await genericTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(genericTemplate, "xlayerTestnet", fakeReader, built, {
      ...okOutcome({ value: "ok" }),
      quotedUsd: 0.001,
      chargedUsd: 0.003,
    });
    const integ = rs.filter((r) => r.dimension === "integrity");
    expect(integ.some((r) => r.verdict === "fail")).toBe(true);
  });
});

describe("token-meta template (Tier 1)", () => {
  it("passes when metadata matches contract reads and block is fresh", async () => {
    const built = await tokenMetaTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tokenMetaTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: { name: META.name, symbol: META.symbol, decimals: 6, totalSupply: META.totalSupply.toString() },
      blockNumber: Number(HEAD) - 5,
    }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("pass");
    expect(rs.find((r) => r.dimension === "freshness")!.verdict).toBe("pass");
  });

  it("fails accuracy on wrong totalSupply and freshness on stale block", async () => {
    const built = await tokenMetaTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tokenMetaTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: { name: META.name, symbol: META.symbol, decimals: 6, totalSupply: "999" },
      blockNumber: Number(HEAD) - 1000,
    }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("fail");
    expect(rs.find((r) => r.dimension === "freshness")!.verdict).toBe("fail");
  });

  it("records the pinned block in ground truth (recomputable evidence)", async () => {
    const built = await tokenMetaTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tokenMetaTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: { name: META.name, symbol: META.symbol, decimals: 6, totalSupply: META.totalSupply.toString() },
      blockNumber: Number(HEAD),
    }));
    const acc = rs.find((r) => r.dimension === "accuracy")!;
    expect(acc.groundTruth?.pinnedBlock).toBe(Number(HEAD));
  });
});

describe("balance template (Tier 1)", () => {
  it("verifies balances at the pinned block", async () => {
    const built = await balanceTemplate.build("xlayerTestnet", fakeReader);
    const holder = built.context.holder as string;
    const expected = holder.endsWith("aa") ? "42" : "0";
    const rs = await verifyProbe(balanceTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: expected,
      blockNumber: Number(built.context.block),
    }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("pass");
  });

  it("catches a lying balance", async () => {
    const built = await balanceTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(balanceTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: "123456789",
      blockNumber: Number(built.context.block),
    }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("fail");
  });
});

describe("block-timestamp template (Tier 1)", () => {
  it("exact-matches the chain timestamp", async () => {
    const built = await blockTimestampTemplate.build("xlayerTestnet", fakeReader);
    const block = BigInt(built.context.block as string);
    const rs = await verifyProbe(blockTimestampTemplate, "xlayerTestnet", fakeReader, built, okOutcome({
      value: Number(1_700_000_000n + block),
    }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("pass");
  });
});

describe("price template (Tier 2 consensus)", () => {
  const refs = (values: Array<number | null>) =>
    values.map((v, i) => ({ name: `ref${i}`, priceUsd: async () => v }));

  it("passes within tolerance of reference median", async () => {
    const tpl = makePriceTemplate({ references: refs([100, 101, 99]), symbols: ["OKB"] });
    const built = await tpl.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tpl, "xlayerTestnet", fakeReader, built, okOutcome({ value: 100.5 }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("pass");
  });

  it("fails outside tolerance", async () => {
    const tpl = makePriceTemplate({ references: refs([100, 101, 99]), symbols: ["OKB"] });
    const built = await tpl.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tpl, "xlayerTestnet", fakeReader, built, okOutcome({ value: 110 }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("fail");
  });

  it("returns inconclusive when references are down — never guesses", async () => {
    const tpl = makePriceTemplate({ references: refs([null, null, 100]), symbols: ["OKB"] });
    const built = await tpl.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(tpl, "xlayerTestnet", fakeReader, built, okOutcome({ value: 100 }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("inconclusive");
  });
});

describe("generic template (Tier 3)", () => {
  it("marks accuracy unverifiable and never fabricates a number", async () => {
    const built = await genericTemplate.build("xlayerTestnet", fakeReader);
    const rs = await verifyProbe(genericTemplate, "xlayerTestnet", fakeReader, built, okOutcome({ ok: true }));
    expect(rs.find((r) => r.dimension === "accuracy")!.verdict).toBe("unverifiable");
  });
});

describe("cross-service consensus", () => {
  it("flags the MAD outlier", () => {
    const flagged = crossServiceOutliers([
      { serviceId: 1, value: 100 },
      { serviceId: 2, value: 100.4 },
      { serviceId: 3, value: 99.8 },
      { serviceId: 4, value: 100.1 },
      { serviceId: 5, value: 140 },
    ]);
    expect(flagged).toEqual([5]);
  });

  it("needs at least 3 answers", () => {
    expect(crossServiceOutliers([{ serviceId: 1, value: 1 }, { serviceId: 2, value: 99 }])).toEqual([]);
  });
});
