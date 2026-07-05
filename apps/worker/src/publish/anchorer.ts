import { parseAbi } from "viem";
import {
  canonicalize,
  createLogger,
  deployment,
  hex,
  leafHash,
  merkleRoot,
  type ChainKey,
} from "@veristat/shared";
import { publicClient, treasuryAccount, walletClient } from "@veristat/chain";
import { insertAnchor, lastAnchor, markAnchor, verificationsAfter } from "@veristat/db";

const log = createLogger("anchorer");

const ANCHOR_ABI = parseAbi([
  "function anchor(bytes32 merkleRoot, uint64 fromId, uint64 toId, uint64 leafCount, string uri) returns (uint256)",
]);

const CHAIN: ChainKey = (process.env.ANCHOR_CHAIN as ChainKey) ?? "xlayerTestnet";
const MIN_LEAVES = Number(process.env.ANCHOR_MIN_LEAVES ?? 5);

/** Canonical leaf: the exact fields any third party can recompute from published evidence. */
export function anchorLeaf(v: {
  id: number;
  probeId: number;
  serviceId: number;
  tier: number;
  dimension: string;
  verdict: string;
  expected: unknown;
  actual: unknown;
  groundTruth: unknown;
  createdAt: Date | string;
}): Buffer {
  return leafHash({
    id: v.id,
    probeId: v.probeId,
    serviceId: v.serviceId,
    tier: v.tier,
    dimension: v.dimension,
    verdict: v.verdict,
    expected: v.expected ?? null,
    actual: v.actual ?? null,
    groundTruth: v.groundTruth ?? null,
    createdAt: new Date(v.createdAt).toISOString(),
  });
}

/**
 * Merkle-anchor all verification rows since the previous anchor (spec §5.4).
 * The root is recorded locally even when the contract isn't deployed yet, so
 * the ledger's tamper-evidence chain has no gaps once anchoring goes live.
 */
export async function runAnchorer(): Promise<void> {
  const prev = await lastAnchor();
  const fromId = (prev?.toVerificationId ?? 0) + 1;
  const rows = await verificationsAfter(fromId - 1);
  if (rows.length < MIN_LEAVES) return;

  const leaves = rows.map((r) => anchorLeaf(r as never));
  const root = hex(merkleRoot(leaves));
  const toId = rows[rows.length - 1]!.id;
  const anchorId = await insertAnchor({
    merkleRoot: root,
    fromVerificationId: fromId,
    toVerificationId: toId,
    leafCount: rows.length,
    chain: CHAIN,
  });

  const anchorAddress = deployment(CHAIN).evidenceAnchor;
  if (!anchorAddress || !process.env.PROBE_MNEMONIC) {
    await markAnchor(anchorId, { status: "local" });
    log.info("anchor recorded locally (contract not deployed yet)", { root, fromId, toId });
    return;
  }

  try {
    const account = treasuryAccount();
    const wallet = walletClient(CHAIN, account);
    const uri = `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/anchors/${anchorId}`;
    const txHash = await wallet.writeContract({
      address: anchorAddress,
      abi: ANCHOR_ABI,
      functionName: "anchor",
      args: [root, BigInt(fromId), BigInt(toId), BigInt(rows.length), uri],
      chain: wallet.chain,
      account,
    });
    const receipt = await publicClient(CHAIN).waitForTransactionReceipt({ hash: txHash });
    await markAnchor(anchorId, {
      txHash,
      blockNumber: Number(receipt.blockNumber),
      status: "confirmed",
    });
    log.info("evidence anchored on-chain", { root, tx: txHash, leaves: rows.length });
  } catch (err) {
    await markAnchor(anchorId, { status: "failed" });
    log.error("anchor tx failed", { err: String(err) });
  }
}

export { canonicalize };
