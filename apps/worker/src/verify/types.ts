import type {
  ChainKey,
  ServiceCategory,
  VerificationResult,
} from "@veristat/shared";

/**
 * Chain access used by verifiers, injected so tests can fake it and so every
 * ground-truth read is pinned to an explicit block (spec §5.3 Tier 1).
 */
export interface ChainReader {
  blockNumber(chain: ChainKey): Promise<bigint>;
  blockTimestamp(chain: ChainKey, block: bigint): Promise<bigint>;
  erc20Metadata(
    chain: ChainKey,
    token: `0x${string}`,
    block?: bigint,
  ): Promise<{ name: string; symbol: string; decimals: number; totalSupply: bigint }>;
  erc20BalanceOf(
    chain: ChainKey,
    token: `0x${string}`,
    owner: `0x${string}`,
    block?: bigint,
  ): Promise<bigint>;
  gasPrice(chain: ChainKey): Promise<bigint>;
}

/** External price references for Tier-2 consensus (injected, ≥3 in production). */
export interface ReferenceSource {
  name: string;
  priceUsd(symbol: string): Promise<number | null>;
}

export interface BuiltQuery {
  /** Path + query string appended to the service endpoint. */
  path: string;
  params: Record<string, unknown>;
  /** Context captured at build time and needed again at verify time. */
  context: Record<string, unknown>;
}

export interface ProbeOutcome {
  httpStatus: number | null;
  x402Status: string;
  /** Price listed in the service's catalog entry (what the 402 quote is checked against). */
  declaredUsd?: number | null;
  quotedUsd: number | null;
  chargedUsd: number | null;
  rawResponse: string | null;
  latencyMs: number;
  error: string | null;
}

export interface QueryTemplate {
  id: string;
  category: ServiceCategory;
  isHoneypot: boolean;
  /** Chain the ground truth lives on; templates randomize params per call. */
  build(chain: ChainKey, reader: ChainReader): Promise<BuiltQuery>;
  /** Accuracy/freshness verdicts. Operational verdicts are added by the engine. */
  verify(
    chain: ChainKey,
    reader: ChainReader,
    built: BuiltQuery,
    outcome: ProbeOutcome,
  ): Promise<VerificationResult[]>;
}

export const VERIFIER_VERSION = "veristat-verifier/0.1.0";
