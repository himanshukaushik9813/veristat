import { parseAbi, type Account } from "viem";
import type { ChainKey } from "@veristat/shared";
import { publicClient, walletClient } from "./clients.js";

export const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

export async function erc20BalanceOf(
  chain: ChainKey,
  token: `0x${string}`,
  owner: `0x${string}`,
  blockNumber?: bigint,
): Promise<bigint> {
  return publicClient(chain).readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [owner],
    blockNumber,
  });
}

export async function erc20Metadata(chain: ChainKey, token: `0x${string}`, blockNumber?: bigint) {
  const client = publicClient(chain);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({ address: token, abi: ERC20_ABI, functionName: "name", blockNumber }),
    client.readContract({ address: token, abi: ERC20_ABI, functionName: "symbol", blockNumber }),
    client.readContract({ address: token, abi: ERC20_ABI, functionName: "decimals", blockNumber }),
    client.readContract({ address: token, abi: ERC20_ABI, functionName: "totalSupply", blockNumber }),
  ]);
  return { name, symbol, decimals, totalSupply };
}

export async function erc20Transfer(
  chain: ChainKey,
  account: Account,
  token: `0x${string}`,
  to: `0x${string}`,
  amount: bigint,
): Promise<`0x${string}`> {
  const wallet = walletClient(chain, account);
  const hash = await wallet.writeContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
    chain: wallet.chain,
    account,
  });
  await publicClient(chain).waitForTransactionReceipt({ hash });
  return hash;
}
