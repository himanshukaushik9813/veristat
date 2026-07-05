import type { ChainKey } from "./types.js";

export interface ChainConfig {
  key: ChainKey;
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerTxUrl: (hash: string) => string;
  explorerAddressUrl: (addr: string) => string;
  nativeSymbol: string;
  /** Stablecoin used for x402 probe payments on this chain. */
  stable: { symbol: string; address: string; decimals: number };
  multicall3: string;
  testnet: boolean;
}

/** Multicall3 is deployed at the canonical address on all supported chains. */
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

export const CHAINS: Record<ChainKey, ChainConfig> = {
  xlayer: {
    key: "xlayer",
    chainId: 196,
    name: "X Layer",
    rpcUrl: process.env.XLAYER_RPC_URL ?? "https://rpc.xlayer.tech",
    explorerTxUrl: (h) => `https://www.oklink.com/xlayer/tx/${h}`,
    explorerAddressUrl: (a) => `https://www.oklink.com/xlayer/address/${a}`,
    nativeSymbol: "OKB",
    stable: {
      symbol: "USDT",
      address: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
      decimals: 6,
    },
    multicall3: MULTICALL3,
    testnet: false,
  },
  xlayerTestnet: {
    key: "xlayerTestnet",
    chainId: 195,
    name: "X Layer Testnet",
    rpcUrl: process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech",
    explorerTxUrl: (h) => `https://www.oklink.com/xlayer-test/tx/${h}`,
    explorerAddressUrl: (a) => `https://www.oklink.com/xlayer-test/address/${a}`,
    nativeSymbol: "OKB",
    // Filled in after we deploy MockUSDT on testnet (see contracts/); overridable by env.
    stable: {
      symbol: "tUSDT",
      address: process.env.XLAYER_TESTNET_USDT ?? "0x0000000000000000000000000000000000000000",
      decimals: 6,
    },
    multicall3: MULTICALL3,
    testnet: true,
  },
  base: {
    key: "base",
    chainId: 8453,
    name: "Base",
    rpcUrl: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
    explorerTxUrl: (h) => `https://basescan.org/tx/${h}`,
    explorerAddressUrl: (a) => `https://basescan.org/address/${a}`,
    nativeSymbol: "ETH",
    stable: {
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    multicall3: MULTICALL3,
    testnet: false,
  },
  baseSepolia: {
    key: "baseSepolia",
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
    explorerTxUrl: (h) => `https://sepolia.basescan.org/tx/${h}`,
    explorerAddressUrl: (a) => `https://sepolia.basescan.org/address/${a}`,
    nativeSymbol: "ETH",
    stable: {
      symbol: "USDC",
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      decimals: 6,
    },
    multicall3: MULTICALL3,
    testnet: true,
  },
};

export function chain(key: ChainKey): ChainConfig {
  return CHAINS[key];
}
