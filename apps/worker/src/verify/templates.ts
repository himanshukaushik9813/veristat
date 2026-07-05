import { CHAINS, type ChainKey, type VerificationResult } from "@veristat/shared";
import type { BuiltQuery, ChainReader, ProbeOutcome, QueryTemplate, ReferenceSource } from "./types.js";
import { madOutliers, median, parseJsonResponse, result, verdictOf, withinBps } from "./util.js";

/**
 * Category query templates (spec §5.2/§7). Data services follow the response
 * convention documented in /methodology: { value, blockNumber?, timestamp? }.
 * Every template randomizes its parameters — there is no fixed basket (§8).
 *
 * Freshness: a data-bearing response must claim a blockNumber within
 * MAX_BLOCK_LAG of the chain head observed at verification time.
 */
export const MAX_BLOCK_LAG = 60n;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomHex(bytes: number): `0x${string}` {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < bytes * 2; i++) s += chars[Math.floor(Math.random() * 16)];
  return s as `0x${string}`;
}

/** Tokens whose metadata/balances serve as Tier-1 ground truth, per chain. */
export const PROBE_TOKENS: Partial<Record<ChainKey, `0x${string}`[]>> = {
  xlayer: [CHAINS.xlayer.stable.address as `0x${string}`],
  xlayerTestnet: [], // filled at runtime from deployment (MockUSDT)
  base: [
    CHAINS.base.stable.address as `0x${string}`,
    "0x4200000000000000000000000000000000000006", // WETH
  ],
};

export function setProbeTokens(chain: ChainKey, tokens: `0x${string}`[]): void {
  PROBE_TOKENS[chain] = tokens;
}

// ---------- shared freshness check ----------

async function freshnessResult(
  chain: ChainKey,
  reader: ChainReader,
  claimedBlock: number | undefined,
  headAtVerify: bigint,
): Promise<VerificationResult> {
  if (claimedBlock === undefined) {
    return result({
      tier: 1,
      dimension: "freshness",
      verdict: "inconclusive",
      expected: `blockNumber within ${MAX_BLOCK_LAG} of head`,
      actual: "no blockNumber claimed",
      groundTruth: { expected: Number(headAtVerify), chain },
      detail: "response carries no block reference",
    });
  }
  const lag = headAtVerify - BigInt(claimedBlock);
  const fresh = lag <= MAX_BLOCK_LAG && lag >= -2n; // small tolerance for RPC head skew
  return result({
    tier: 1,
    dimension: "freshness",
    verdict: verdictOf(fresh),
    expected: `>= block ${(headAtVerify - MAX_BLOCK_LAG).toString()}`,
    actual: claimedBlock,
    groundTruth: { expected: Number(headAtVerify), pinnedBlock: Number(headAtVerify), chain },
    detail: `claimed block lags head by ${lag.toString()} blocks (max ${MAX_BLOCK_LAG})`,
  });
}

// ---------- Tier 1: token metadata ----------

export const tokenMetaTemplate: QueryTemplate = {
  id: "defi.token-meta",
  category: "defi-rates",
  isHoneypot: false,
  async build(chain) {
    const tokens = PROBE_TOKENS[chain] ?? [];
    if (tokens.length === 0) throw new Error(`no probe tokens configured for ${chain}`);
    const token = pick(tokens);
    return {
      path: `/query?kind=token-meta&chain=${chain}&token=${token}`,
      params: { kind: "token-meta", chain, token },
      context: { token },
    };
  },
  async verify(chain, reader, built, outcome) {
    const body = parseJsonResponse(outcome.rawResponse);
    const head = await reader.blockNumber(chain);
    const results: VerificationResult[] = [];
    const token = built.context.token as `0x${string}`;

    const claimedBlock = typeof body?.blockNumber === "number" ? body.blockNumber : undefined;
    const pinned = claimedBlock !== undefined ? BigInt(claimedBlock) : head;
    const truth = await reader.erc20Metadata(chain, token, pinned);
    const expected = {
      name: truth.name,
      symbol: truth.symbol,
      decimals: truth.decimals,
      totalSupply: truth.totalSupply.toString(),
    };
    const value = (body?.value ?? null) as Record<string, unknown> | null;
    const pass =
      value !== null &&
      value.name === expected.name &&
      value.symbol === expected.symbol &&
      Number(value.decimals) === expected.decimals &&
      String(value.totalSupply) === expected.totalSupply;

    results.push(
      result({
        tier: 1,
        dimension: "accuracy",
        verdict: verdictOf(pass),
        expected,
        actual: value,
        groundTruth: {
          chain,
          pinnedBlock: Number(pinned),
          contractReads: [{ address: token, fn: "name/symbol/decimals/totalSupply", args: [], result: expected }],
          expected,
        },
        detail: pass
          ? `token metadata matches contract reads at block ${pinned}`
          : `token metadata mismatch vs contract reads at block ${pinned}`,
      }),
    );
    results.push(await freshnessResult(chain, reader, claimedBlock, head));
    return results;
  },
};

// ---------- Tier 1: balance at pinned block ----------

export const balanceTemplate: QueryTemplate = {
  id: "defi.balance",
  category: "defi-rates",
  isHoneypot: false,
  async build(chain, reader) {
    const tokens = PROBE_TOKENS[chain] ?? [];
    if (tokens.length === 0) throw new Error(`no probe tokens configured for ${chain}`);
    const token = pick(tokens);
    // A recent (but randomized) pinned block — no fixed pattern to learn.
    const head = await reader.blockNumber(chain);
    const block = head - BigInt(Math.floor(Math.random() * 10));
    const holder = randomHex(20);
    return {
      path: `/query?kind=balance&chain=${chain}&token=${token}&holder=${holder}&block=${block}`,
      params: { kind: "balance", chain, token, holder, block: Number(block) },
      context: { token, holder, block: block.toString() },
    };
  },
  async verify(chain, reader, built, outcome) {
    const body = parseJsonResponse(outcome.rawResponse);
    const head = await reader.blockNumber(chain);
    const token = built.context.token as `0x${string}`;
    const holder = built.context.holder as `0x${string}`;
    const block = BigInt(built.context.block as string);
    const truth = await reader.erc20BalanceOf(chain, token, holder, block);
    const actual = body?.value !== undefined ? String(body.value) : null;
    const pass = actual !== null && actual === truth.toString();
    return [
      result({
        tier: 1,
        dimension: "accuracy",
        verdict: verdictOf(pass),
        expected: truth.toString(),
        actual,
        groundTruth: {
          chain,
          pinnedBlock: Number(block),
          contractReads: [{ address: token, fn: "balanceOf", args: [holder], result: truth.toString() }],
          expected: truth.toString(),
        },
        detail: `balanceOf(${holder}) at block ${block}: expected ${truth}, got ${actual}`,
      }),
      // pinned-block queries: freshness measured against requested block being honored
      await freshnessResult(
        chain,
        reader,
        typeof body?.blockNumber === "number" ? body.blockNumber : Number(block),
        head,
      ),
    ];
  },
};

// ---------- Tier 1 honeypot: obscure deterministic answer (spec §8) ----------

export const honeypotBalanceTemplate: QueryTemplate = {
  ...balanceTemplate,
  id: "honeypot.balance",
  isHoneypot: true,
  async build(chain, reader) {
    // Random unknown address at a deeper historical block: a caching or
    // hardcoding service fails this; an honest chain-reader answers trivially (0).
    const tokens = PROBE_TOKENS[chain] ?? [];
    if (tokens.length === 0) throw new Error(`no probe tokens configured for ${chain}`);
    const token = pick(tokens);
    const head = await reader.blockNumber(chain);
    const depth = BigInt(500 + Math.floor(Math.random() * 4500));
    const block = head > depth ? head - depth : head;
    const holder = randomHex(20);
    return {
      path: `/query?kind=balance&chain=${chain}&token=${token}&holder=${holder}&block=${block}`,
      params: { kind: "balance", chain, token, holder, block: Number(block) },
      context: { token, holder, block: block.toString() },
    };
  },
};

// ---------- Tier 1: block timestamp ----------

export const blockTimestampTemplate: QueryTemplate = {
  id: "defi.block-timestamp",
  category: "defi-rates",
  isHoneypot: false,
  async build(chain, reader) {
    const head = await reader.blockNumber(chain);
    const block = head - BigInt(Math.floor(Math.random() * 50));
    return {
      path: `/query?kind=block-timestamp&chain=${chain}&block=${block}`,
      params: { kind: "block-timestamp", chain, block: Number(block) },
      context: { block: block.toString() },
    };
  },
  async verify(chain, reader, built, outcome) {
    const body = parseJsonResponse(outcome.rawResponse);
    const block = BigInt(built.context.block as string);
    const truth = await reader.blockTimestamp(chain, block);
    const actual = body?.value !== undefined ? Number(body.value) : null;
    const pass = actual !== null && BigInt(actual) === truth;
    return [
      result({
        tier: 1,
        dimension: "accuracy",
        verdict: verdictOf(pass),
        expected: Number(truth),
        actual,
        groundTruth: { chain, pinnedBlock: Number(block), expected: Number(truth) },
        detail: `block ${block} timestamp: expected ${truth}, got ${actual}`,
      }),
    ];
  },
};

// ---------- Tier 2: price vs reference consensus ----------

export interface PriceTemplateDeps {
  references: ReferenceSource[];
  symbols: string[];
}

export function makePriceTemplate(deps: PriceTemplateDeps): QueryTemplate {
  return {
    id: "price.spot",
    category: "price",
    isHoneypot: false,
    async build(chain) {
      const symbol = pick(deps.symbols);
      return {
        path: `/query?kind=price&symbol=${symbol}`,
        params: { kind: "price", symbol },
        context: { symbol },
      };
    },
    async verify(chain, reader, built, outcome) {
      const body = parseJsonResponse(outcome.rawResponse);
      const head = await reader.blockNumber(chain);
      const symbol = built.context.symbol as string;
      const refs: Array<{ name: string; value: number }> = [];
      for (const ref of deps.references) {
        try {
          const v = await ref.priceUsd(symbol);
          if (v !== null && Number.isFinite(v)) refs.push({ name: ref.name, value: v });
        } catch {
          // reference unavailable — consensus degrades gracefully
        }
      }
      const actual = typeof body?.value === "number" ? body.value : null;
      if (refs.length < 2) {
        return [
          result({
            tier: 2,
            dimension: "accuracy",
            verdict: "inconclusive",
            expected: null,
            actual,
            groundTruth: {
              references: refs.map((r) => ({ ...r, fetchedAt: new Date().toISOString() })),
              expected: null,
            },
            detail: `only ${refs.length} references reachable — need >=2 for consensus`,
          }),
        ];
      }
      const expected = median(refs.map((r) => r.value));
      // Tolerance by liquidity tier (majors tight, long-tail loose) — spec §7.
      const toleranceBps = ["BTC", "ETH", "OKB"].includes(symbol) ? 100 : 300;
      const pass = actual !== null && withinBps(expected, actual, toleranceBps);
      const results: VerificationResult[] = [
        result({
          tier: 2,
          dimension: "accuracy",
          verdict: verdictOf(pass),
          expected,
          actual,
          toleranceBps,
          groundTruth: {
            references: refs.map((r) => ({ ...r, fetchedAt: new Date().toISOString() })),
            expected,
            toleranceBps,
          },
          detail: `median of ${refs.length} refs = ${expected}; got ${actual} (tolerance ${toleranceBps}bps)`,
        }),
      ];
      const claimedTs = typeof body?.timestamp === "number" ? body.timestamp : undefined;
      if (claimedTs !== undefined) {
        const age = Date.now() / 1000 - claimedTs;
        results.push(
          result({
            tier: 2,
            dimension: "freshness",
            verdict: verdictOf(age < 300),
            expected: "timestamp within 300s",
            actual: claimedTs,
            groundTruth: { expected: Math.floor(Date.now() / 1000) },
            detail: `claimed data age ${Math.round(age)}s`,
          }),
        );
      }
      void head;
      return results;
    },
  };
}

/** Cross-service consensus (spec §5.3 Tier 2): same question to all services in a category. */
export function crossServiceOutliers(
  answers: Array<{ serviceId: number; value: number }>,
): number[] {
  if (answers.length < 3) return [];
  const flagged = madOutliers(answers.map((a) => a.value));
  return answers.filter((_, i) => flagged[i]).map((a) => a.serviceId);
}

// ---------- Tier 3: operational only ----------

export const genericTemplate: QueryTemplate = {
  id: "generic.ping",
  category: "generic",
  isHoneypot: false,
  async build() {
    const nonce = randomHex(8);
    return {
      path: `/query?kind=echo&nonce=${nonce}`,
      params: { kind: "echo", nonce },
      context: { nonce },
    };
  },
  async verify(_chain, _reader, _built, outcome) {
    const body = parseJsonResponse(outcome.rawResponse);
    // Tier 3 never fabricates accuracy — schema validity only (spec §5.3).
    return [
      result({
        tier: 3,
        dimension: "accuracy",
        verdict: "unverifiable",
        expected: null,
        actual: null,
        groundTruth: null,
        detail: "output cannot be objectively verified; operational scoring only",
      }),
      result({
        tier: 3,
        dimension: "integrity",
        verdict: verdictOf(body !== null),
        expected: "valid JSON response",
        actual: body === null ? "invalid/empty" : "valid",
        groundTruth: null,
        detail: body === null ? "response is not valid JSON" : "response schema valid",
      }),
    ];
  },
};

export const TEMPLATES_BY_CATEGORY: Record<string, QueryTemplate[]> = {
  "defi-rates": [tokenMetaTemplate, balanceTemplate, blockTimestampTemplate],
  price: [], // populated with makePriceTemplate at startup (needs references)
  "security-score": [genericTemplate], // known-answer set is a post-hackathon private asset
  "swap-quote": [genericTemplate],
  generic: [genericTemplate],
};

/** Honeypots are mixed into rotation with this probability (spec §8). */
export const HONEYPOT_RATE = 0.15;
export const HONEYPOTS: QueryTemplate[] = [honeypotBalanceTemplate];
