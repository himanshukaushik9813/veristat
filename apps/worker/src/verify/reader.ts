import type { ChainKey } from "@veristat/shared";
import {
  blockTimestamp,
  erc20BalanceOf,
  erc20Metadata,
  gasPrice,
  pinnedBlock,
} from "@veristat/chain";
import type { ChainReader } from "./types.js";

/** Live ChainReader backed by viem public clients. */
export const liveReader: ChainReader = {
  blockNumber: (chain: ChainKey) => pinnedBlock(chain),
  blockTimestamp: (chain, block) => blockTimestamp(chain, block),
  erc20Metadata: async (chain, token, block) => {
    const m = await erc20Metadata(chain, token, block);
    return { name: m.name, symbol: m.symbol, decimals: m.decimals, totalSupply: m.totalSupply };
  },
  erc20BalanceOf: (chain, token, owner, block) => erc20BalanceOf(chain, token, owner, block),
  gasPrice: (chain) => gasPrice(chain),
};
