import { mnemonicToAccount } from "viem/accounts";
import type { Account } from "viem";

/**
 * Probe wallets are derived from one mnemonic (env: PROBE_MNEMONIC) by HD index.
 * Only indices are persisted (spec §8: rotation without key storage); index 0 is
 * the treasury that funds fresh probe wallets.
 */

export function deriveAccount(hdIndex: number): Account {
  const mnemonic = process.env.PROBE_MNEMONIC;
  if (!mnemonic) throw new Error("PROBE_MNEMONIC env var not set");
  return mnemonicToAccount(mnemonic, { addressIndex: hdIndex });
}

export function treasuryAccount(): Account {
  return deriveAccount(0);
}
