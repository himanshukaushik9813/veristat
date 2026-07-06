import { parseAbi } from "viem";
import {
  canonicalVerificationRow,
  deployment,
  hex,
  leafHash,
  merkleProof,
  merkleRoot,
  verifyProof,
  type AnchoredVerificationRow,
  type ChainKey,
} from "@veristat/shared";
import { publicClient, withRetry } from "@veristat/chain";

/**
 * Independent evidence-proof verifier (spec §5.4 "anyone can recompute").
 *
 *   pnpm --filter @veristat/worker verify-proof <verificationId> [apiBaseUrl]
 *
 * Uses ONLY public inputs: the published evidence API (/api/anchors) and the
 * XLayer RPC. It does not touch Veristat's database, so a third party can run
 * the same check and catch any tampering:
 *
 *   1. fetch the anchor covering the verification row + all rows in its range
 *   2. recompute every leaf hash from the canonicalized published rows
 *   3. rebuild the Merkle tree, check the root matches the published anchor
 *   4. build the inclusion proof for the target row
 *   5. read the EvidenceAnchor contract on-chain and call verifyLeaf()
 */

const ANCHOR_ABI = parseAbi([
  "struct Anchor { bytes32 merkleRoot; uint64 fromId; uint64 toId; uint64 leafCount; uint64 timestamp; string uri; }",
  "function anchorCount() view returns (uint256)",
  "function getAnchor(uint256 index) view returns (Anchor)",
  "function verifyLeaf(uint256 index, bytes32 leaf, bytes32[] proof) view returns (bool)",
]);

interface PublishedAnchor {
  id: number;
  merkleRoot: string;
  fromVerificationId: number;
  toVerificationId: number;
  leafCount: number;
  chain: ChainKey;
  txHash: string | null;
  status: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  const verificationId = Number(process.argv[2]);
  const api = (process.argv[3] ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  if (!Number.isInteger(verificationId) || verificationId <= 0) {
    console.error("usage: verify-proof <verificationId> [apiBaseUrl]");
    process.exit(2);
  }

  console.log(`veristat proof verifier — verification #${verificationId} via ${api}\n`);

  // 1. find the anchor covering this verification row
  const { anchors } = await getJson<{ anchors: PublishedAnchor[] }>(`${api}/api/anchors`);
  const anchor = anchors.find(
    (a) => verificationId >= a.fromVerificationId && verificationId <= a.toVerificationId,
  );
  if (!anchor) {
    console.error(`✗ no anchor covers verification #${verificationId} (it may not be anchored yet)`);
    process.exit(1);
  }
  console.log(`anchor #${anchor.id}: rows ${anchor.fromVerificationId}..${anchor.toVerificationId} (${anchor.leafCount} leaves)`);
  console.log(`  published root ${anchor.merkleRoot}`);
  console.log(`  chain ${anchor.chain}, tx ${anchor.txHash ?? "(local only)"}\n`);

  // 2. recompute every leaf from published canonical rows
  const { leaves: rows } = await getJson<{ leaves: AnchoredVerificationRow[] }>(
    `${api}/api/anchors/${anchor.id}/leaves`,
  );
  if (rows.length !== anchor.leafCount) {
    console.error(`✗ published rows (${rows.length}) != anchored leafCount (${anchor.leafCount})`);
    process.exit(1);
  }
  const leaves = rows.map((r) => leafHash(canonicalVerificationRow(r)));
  const index = rows.findIndex((r) => r.id === verificationId);
  if (index === -1) {
    console.error(`✗ verification #${verificationId} missing from published evidence`);
    process.exit(1);
  }

  // 3. rebuild the tree, compare against the published root
  const recomputedRoot = hex(merkleRoot(leaves));
  const rootMatches = recomputedRoot === anchor.merkleRoot;
  console.log(`recomputed root  ${recomputedRoot}  ${rootMatches ? "✓ matches published" : "✗ MISMATCH"}`);
  if (!rootMatches) process.exit(1);

  // 4. inclusion proof for the target row
  const leaf = leaves[index]!;
  const proof = merkleProof(leaves, index);
  const localOk = verifyProof(leaf, proof, merkleRoot(leaves));
  console.log(`leaf ${hex(leaf)}`);
  console.log(`proof (${proof.length} siblings) verifies locally: ${localOk ? "✓" : "✗"}`);
  if (!localOk) process.exit(1);

  // 5. check against the on-chain EvidenceAnchor
  const anchorAddress = deployment(anchor.chain).evidenceAnchor;
  if (!anchorAddress || !anchor.txHash) {
    console.log("\n(no on-chain anchor for this row — local verification only)");
    return;
  }
  const client = publicClient(anchor.chain);
  const count = await withRetry(() =>
    client.readContract({ address: anchorAddress, abi: ANCHOR_ABI, functionName: "anchorCount" }),
  );
  let onchainIndex = -1n;
  for (let i = count - 1n; i >= 0n; i--) {
    const a = await withRetry(() =>
      client.readContract({ address: anchorAddress, abi: ANCHOR_ABI, functionName: "getAnchor", args: [i] }),
    );
    if (a.merkleRoot.toLowerCase() === anchor.merkleRoot.toLowerCase()) {
      onchainIndex = i;
      break;
    }
  }
  if (onchainIndex === -1n) {
    console.error(`✗ published root not found among ${count} on-chain anchors at ${anchorAddress}`);
    process.exit(1);
  }
  const onchainOk = await withRetry(() =>
    client.readContract({
      address: anchorAddress,
      abi: ANCHOR_ABI,
      functionName: "verifyLeaf",
      args: [onchainIndex, hex(leaf), proof.map(hex)],
    }),
  );
  console.log(`\non-chain EvidenceAnchor ${anchorAddress} (anchor index ${onchainIndex})`);
  console.log(`contract verifyLeaf(): ${onchainOk ? "✓ PROOF VALID ON-CHAIN" : "✗ PROOF REJECTED"}`);
  process.exit(onchainOk ? 0 : 1);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
