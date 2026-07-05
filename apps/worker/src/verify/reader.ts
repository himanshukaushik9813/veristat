import type { ChainKey } from "@veristat/shared";
import {
  blockTimestamp,
  erc20BalanceOf,
  erc20Metadata,
  gasPrice,
  pinnedBlock,
  withRetry,
} from "@veristat/chain";
import type { ChainReader } from "./types.js";

/** Live ChainReader backed by viem public clients; retried against RPC head skew. */
export const liveReader: ChainReader = {
  blockNumber: (chain: ChainKey) => withRetry(() => pinnedBlock(chain)),
  blockTimestamp: (chain, block) => withRetry(() => blockTimestamp(chain, block)),
  erc20Metadata: async (chain, token, block) => {
    const m = await withRetry(() => erc20Metadata(chain, token, block));
    return { name: m.name, symbol: m.symbol, decimals: m.decimals, totalSupply: m.totalSupply };
  },
  erc20BalanceOf: (chain, token, owner, block) => withRetry(() => erc20BalanceOf(chain, token, owner, block)),
  gasPrice: (chain) => withRetry(() => gasPrice(chain)),
};
