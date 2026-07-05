import { parseAbi } from "viem";
import { createLogger, deployment } from "@veristat/shared";
import { deriveAccount, publicClient, walletClient } from "@veristat/chain";
import { activeWallets, closeDb, runMigrations } from "@veristat/db";
import { ensurePool } from "../probe/walletPool.js";

const log = createLogger("fund-testnet");

const FAUCET_ABI = parseAbi(["function faucet(uint256 amount)"]);

/**
 * One-time testnet setup: ensure the probe wallet pool exists on XLayer
 * testnet (gas funded from the treasury by ensurePool), then each wallet
 * self-mints tUSDT from the MockUSDT public faucet so paid probes can settle.
 */
async function main(): Promise<void> {
  await runMigrations();
  const chain = "xlayerTestnet" as const;
  const usdt = deployment(chain).mockUsdt;
  if (!usdt) throw new Error("XLAYER_TESTNET_USDT not set");

  await ensurePool(chain);
  const wallets = await activeWallets(chain);
  const client = publicClient(chain);
  for (const w of wallets) {
    const account = deriveAccount(w.hdIndex);
    const wc = walletClient(chain, account);
    const hash = await wc.writeContract({
      address: usdt,
      abi: FAUCET_ABI,
      functionName: "faucet",
      args: [500_000_000n], // 500 tUSDT
      chain: wc.chain,
      account,
    });
    await client.waitForTransactionReceipt({ hash });
    log.info("minted tUSDT to probe wallet", { address: account.address, tx: hash });
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
