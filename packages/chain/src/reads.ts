import { parseAbi } from "viem";
import type { ChainKey } from "@veristat/shared";
import { publicClient } from "./clients.js";

/**
 * Pinned-block read helpers for Tier-1 verification: every ground-truth value
 * is computed at an explicit block number so any third party can recompute it.
 */

export async function pinnedBlock(chain: ChainKey): Promise<bigint> {
  return publicClient(chain).getBlockNumber();
}

export async function blockTimestamp(chain: ChainKey, blockNumber: bigint): Promise<bigint> {
  const block = await publicClient(chain).getBlock({ blockNumber });
  return block.timestamp;
}

export async function nativeBalance(
  chain: ChainKey,
  address: `0x${string}`,
  blockNumber?: bigint,
): Promise<bigint> {
  return publicClient(chain).getBalance({ address, blockNumber });
}

export async function gasPrice(chain: ChainKey): Promise<bigint> {
  return publicClient(chain).getGasPrice();
}

// Uniswap V2-style pair reads for DEX-median pricing.
export const UNIV2_PAIR_ABI = parseAbi([
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
]);

export async function pairReserves(
  chain: ChainKey,
  pair: `0x${string}`,
  blockNumber?: bigint,
): Promise<{ reserve0: bigint; reserve1: bigint; token0: `0x${string}`; token1: `0x${string}` }> {
  const client = publicClient(chain);
  const [reserves, token0, token1] = await Promise.all([
    client.readContract({ address: pair, abi: UNIV2_PAIR_ABI, functionName: "getReserves", blockNumber }),
    client.readContract({ address: pair, abi: UNIV2_PAIR_ABI, functionName: "token0", blockNumber }),
    client.readContract({ address: pair, abi: UNIV2_PAIR_ABI, functionName: "token1", blockNumber }),
  ]);
  return { reserve0: reserves[0], reserve1: reserves[1], token0, token1 };
}
