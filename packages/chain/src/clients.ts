import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
  type Account,
} from "viem";
import { CHAINS, type ChainKey } from "@veristat/shared";

function toViemChain(key: ChainKey): Chain {
  const c = CHAINS[key];
  return defineChain({
    id: c.chainId,
    name: c.name,
    nativeCurrency: { name: c.nativeSymbol, symbol: c.nativeSymbol, decimals: 18 },
    rpcUrls: { default: { http: [c.rpcUrl] } },
    contracts: { multicall3: { address: c.multicall3 as `0x${string}` } },
    testnet: c.testnet,
  });
}

const publicClients = new Map<ChainKey, PublicClient>();

export function publicClient(key: ChainKey): PublicClient {
  let client = publicClients.get(key);
  if (!client) {
    client = createPublicClient({ chain: toViemChain(key), transport: http() });
    publicClients.set(key, client);
  }
  return client;
}

export function walletClient(key: ChainKey, account: Account): WalletClient {
  return createWalletClient({ chain: toViemChain(key), transport: http(), account });
}

export { toViemChain };
