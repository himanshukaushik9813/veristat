import type { Account } from "viem";
import { createLogger, type ChainKey } from "@veristat/shared";
import { deriveAccount, treasuryAccount, publicClient, walletClient } from "@veristat/chain";
import {
  activeWallets,
  allWallets,
  bumpWalletProbeCount,
  insertWallet,
  markWalletFunded,
  retireWallet,
} from "@veristat/db";

const log = createLogger("wallet-pool");

/**
 * Probe wallet pool (spec §8): N active wallets per chain, derived from one
 * mnemonic by HD index; a wallet is retired after MAX_PROBES_PER_WALLET uses
 * and replaced by a freshly derived index, funded with gas from the treasury.
 * No reuse patterns: each probe draws a random active wallet.
 */
export const POOL_SIZE = Number(process.env.WALLET_POOL_SIZE ?? 3);
export const MAX_PROBES_PER_WALLET = Number(process.env.MAX_PROBES_PER_WALLET ?? 25);
const GAS_FUND_WEI = BigInt(process.env.GAS_FUND_WEI ?? 2_000_000_000_000_000n); // 0.002 native

export interface PooledWallet {
  id: number;
  account: Account;
  hdIndex: number;
  isFresh: boolean; // < 5 probes — used by the anti-gaming comparison
}

export async function ensurePool(chain: ChainKey): Promise<void> {
  const active = await activeWallets(chain);
  if (active.length >= POOL_SIZE) return;
  const existing = await allWallets(chain);
  let nextIndex = Math.max(0, ...existing.map((w) => w.hdIndex)) + 1;
  for (let i = active.length; i < POOL_SIZE; i++) {
    const account = deriveAccount(nextIndex);
    const id = await insertWallet({ address: account.address, chain, hdIndex: nextIndex });
    log.info("derived new probe wallet", { chain, hdIndex: nextIndex, address: account.address });
    await fundWallet(chain, id, account).catch((err) =>
      log.warn("funding failed (will probe unfunded on free endpoints)", { err: String(err) }),
    );
    nextIndex += 1;
  }
}

async function fundWallet(chain: ChainKey, walletId: number, account: Account): Promise<void> {
  if (process.env.SKIP_WALLET_FUNDING === "true") return;
  const treasury = treasuryAccount();
  const client = publicClient(chain);
  const balance = await client.getBalance({ address: account.address });
  if (balance >= GAS_FUND_WEI) return;
  const wallet = walletClient(chain, treasury);
  const hash = await wallet.sendTransaction({
    to: account.address,
    value: GAS_FUND_WEI,
    chain: wallet.chain,
    account: treasury,
  });
  await client.waitForTransactionReceipt({ hash });
  await markWalletFunded(walletId, hash);
  log.info("funded probe wallet with gas", { chain, address: account.address, tx: hash });
}

/** Draw a random active wallet; rotate it out first if it exceeded its probe budget. */
export async function drawWallet(chain: ChainKey): Promise<PooledWallet> {
  await ensurePool(chain);
  const active = await activeWallets(chain);
  if (active.length === 0) throw new Error(`no active wallets for ${chain}`);
  const row = active[Math.floor(Math.random() * active.length)]!;
  if (row.probeCount >= MAX_PROBES_PER_WALLET) {
    await retireWallet(row.id);
    log.info("retired probe wallet", { address: row.address, probes: row.probeCount });
    await ensurePool(chain);
    return drawWallet(chain);
  }
  return {
    id: row.id,
    account: deriveAccount(row.hdIndex),
    hdIndex: row.hdIndex,
    isFresh: row.probeCount < 5,
  };
}

export async function recordWalletUse(walletId: number): Promise<void> {
  await bumpWalletProbeCount(walletId);
}
