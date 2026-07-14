import { parseAbi, type Account } from "viem";
import { createLogger, deployment, type ChainKey } from "@veristat/shared";
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
/** A rotated-in wallet must hold stablecoin too, or every x402 settlement fails. */
const USDT_TOPUP = BigInt(process.env.PROBE_USDT_TOPUP ?? 500_000_000n); // 500 tUSDT (6dp)
const USDT_MIN = BigInt(process.env.PROBE_USDT_MIN ?? 50_000_000n); // top up below 50 tUSDT

const FAUCET_ABI = parseAbi(["function faucet(uint256 amount)"]);
const ERC20_BALANCE_ABI = parseAbi(["function balanceOf(address) view returns (uint256)"]);

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

/**
 * A rotated-in wallet needs BOTH gas and stablecoin: gas comes from the
 * treasury, tUSDT is self-minted from the MockUSDT public faucet. Funding only
 * gas (as this did originally) leaves the wallet unable to settle any x402
 * payment, so every probe fails with `payment_failed` the moment the pool
 * rotates past its initially hand-funded wallets.
 */
async function fundWallet(chain: ChainKey, walletId: number, account: Account): Promise<void> {
  if (process.env.SKIP_WALLET_FUNDING === "true") return;
  const client = publicClient(chain);

  const balance = await client.getBalance({ address: account.address });
  if (balance < GAS_FUND_WEI) {
    const treasury = treasuryAccount();
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

  await ensureStablecoin(chain, account);
}

/** Self-mint tUSDT from the public faucet so the wallet can actually pay. */
export async function ensureStablecoin(chain: ChainKey, account: Account): Promise<void> {
  if (process.env.SKIP_WALLET_FUNDING === "true") return;
  const usdt = deployment(chain).mockUsdt;
  if (!usdt) return; // no faucet outside testnet — wallets are funded out of band
  const client = publicClient(chain);
  const held = await client.readContract({
    address: usdt,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });
  if (held >= USDT_MIN) return;
  const wc = walletClient(chain, account);
  const hash = await wc.writeContract({
    address: usdt,
    abi: FAUCET_ABI,
    functionName: "faucet",
    args: [USDT_TOPUP],
    chain: wc.chain,
    account,
  });
  await client.waitForTransactionReceipt({ hash });
  log.info("minted tUSDT to probe wallet", { chain, address: account.address, tx: hash });
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
  const account = deriveAccount(row.hdIndex);
  // Self-heal: a wallet that predates faucet-on-funding (or that has spent down)
  // would otherwise fail every settlement with `payment_failed`.
  await ensureStablecoin(chain, account).catch((err) =>
    log.warn("stablecoin top-up failed", { address: account.address, err: String(err) }),
  );
  return {
    id: row.id,
    account,
    hdIndex: row.hdIndex,
    isFresh: row.probeCount < 5,
  };
}

export async function recordWalletUse(walletId: number): Promise<void> {
  await bumpWalletProbeCount(walletId);
}
