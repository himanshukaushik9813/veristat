import { parseAbi } from "viem";
import {
  canonicalVerificationRow,
  deployment,
  hex,
  leafHash,
  merkleProof,
  merkleRoot,
  verifyProof,
  CHAINS,
  type AnchoredVerificationRow,
  type ChainKey,
} from "@veristat/shared";
import { publicClient, withRetry } from "@veristat/chain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Independent evidence-proof verifier as a public API (spec §5.4 "anyone can
 * recompute"), the web twin of `pnpm --filter @veristat/worker verify-proof`.
 * Uses ONLY public inputs — the published /api/anchors evidence and the XLayer
 * RPC — never Veristat's database, so the result is trustless. Returns the
 * step-by-step checks so the UI can render the recomputation live.
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

type Step = { label: string; ok: boolean; detail?: string };

function base(req: Request): string {
  return (process.env.PUBLIC_BASE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return (await res.json()) as T;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const verificationId = Number(id);
  const steps: Step[] = [];
  if (!Number.isInteger(verificationId) || verificationId <= 0) {
    return Response.json({ error: "invalid verification id" }, { status: 400 });
  }

  const api = base(req);
  try {
    // 1. find the anchor covering this verification row (public evidence API)
    const { anchors } = await getJson<{ anchors: PublishedAnchor[] }>(`${api}/api/anchors`);
    const anchor = anchors.find(
      (a) => verificationId >= a.fromVerificationId && verificationId <= a.toVerificationId,
    );
    if (!anchor) {
      return Response.json(
        { verificationId, anchored: false, steps, message: "This verdict is not anchored on-chain yet." },
        { status: 200 },
      );
    }
    steps.push({
      label: `Found anchor #${anchor.id} covering rows ${anchor.fromVerificationId}–${anchor.toVerificationId}`,
      ok: true,
      detail: `${anchor.leafCount} leaves · published root ${anchor.merkleRoot}`,
    });

    // 2. recompute every leaf from the published canonical rows
    const { leaves: rows } = await getJson<{ leaves: AnchoredVerificationRow[] }>(
      `${api}/api/anchors/${anchor.id}/leaves`,
    );
    const leafBufs = rows.map((r) => leafHash(canonicalVerificationRow(r)));
    const index = rows.findIndex((r) => r.id === verificationId);
    if (index === -1 || rows.length !== anchor.leafCount) {
      steps.push({ label: "Recompute published evidence leaves", ok: false, detail: "published rows do not match the anchor" });
      return Response.json({ verificationId, anchored: true, valid: false, steps }, { status: 200 });
    }
    steps.push({ label: `Recomputed ${rows.length} leaf hashes from published evidence`, ok: true });

    // 3. rebuild the Merkle tree, compare against the published root
    const recomputedRoot = hex(merkleRoot(leafBufs));
    const rootMatches = recomputedRoot.toLowerCase() === anchor.merkleRoot.toLowerCase();
    steps.push({
      label: "Rebuilt Merkle root matches the published root",
      ok: rootMatches,
      detail: recomputedRoot,
    });
    if (!rootMatches) return Response.json({ verificationId, anchored: true, valid: false, steps }, { status: 200 });

    // 4. inclusion proof for the target row
    const leaf = leafBufs[index]!;
    const proof = merkleProof(leafBufs, index);
    const localOk = verifyProof(leaf, proof, merkleRoot(leafBufs));
    steps.push({ label: `Inclusion proof (${proof.length} siblings) verifies locally`, ok: localOk });
    if (!localOk) return Response.json({ verificationId, anchored: true, valid: false, steps }, { status: 200 });

    // 5. check against the on-chain EvidenceAnchor contract
    const anchorAddress = deployment(anchor.chain).evidenceAnchor;
    const chainCfg = anchor.chain in CHAINS ? CHAINS[anchor.chain] : null;
    if (!anchorAddress || !anchor.txHash) {
      steps.push({ label: "On-chain check skipped (no on-chain anchor for this row)", ok: true });
      return Response.json({ verificationId, anchored: true, valid: true, onChain: false, steps }, { status: 200 });
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
      steps.push({ label: "Published root found among on-chain anchors", ok: false });
      return Response.json({ verificationId, anchored: true, valid: false, steps }, { status: 200 });
    }
    const onchainOk = await withRetry(() =>
      client.readContract({
        address: anchorAddress,
        abi: ANCHOR_ABI,
        functionName: "verifyLeaf",
        args: [onchainIndex, hex(leaf), proof.map(hex)],
      }),
    );
    steps.push({
      label: onchainOk
        ? "EvidenceAnchor.verifyLeaf() → PROOF VALID ON-CHAIN"
        : "EvidenceAnchor.verifyLeaf() → PROOF REJECTED",
      ok: Boolean(onchainOk),
      detail: `contract ${anchorAddress} · anchor index ${onchainIndex}`,
    });

    return Response.json(
      {
        verificationId,
        anchored: true,
        valid: Boolean(onchainOk),
        onChain: true,
        steps,
        anchor: {
          id: anchor.id,
          chain: anchor.chain,
          txHash: anchor.txHash,
          contract: anchorAddress,
          merkleRoot: anchor.merkleRoot,
          txUrl: chainCfg ? chainCfg.explorerTxUrl(anchor.txHash) : null,
          contractUrl: chainCfg ? chainCfg.explorerAddressUrl(anchorAddress) : null,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      { verificationId, error: err instanceof Error ? err.message : String(err), steps },
      { status: 200 },
    );
  }
}
