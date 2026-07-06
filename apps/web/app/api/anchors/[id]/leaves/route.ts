import { canonicalVerificationRow } from "@veristat/shared";
import { listAnchors, verificationsInRange } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Published evidence for an anchor: the canonical verification rows covered by
 * its leaf range, in leaf order. Any third party can recompute
 * sha256(canonicalize(row)) per row, rebuild the sorted-pair Merkle tree, and
 * check the root against the on-chain EvidenceAnchor entry — no trust in
 * Veristat's database required. See `pnpm verify-proof` in apps/worker.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const anchors = await listAnchors(500);
  const anchor = anchors.find((a) => a.id === Number(id));
  if (!anchor) return Response.json({ error: "unknown anchor" }, { status: 404 });
  const rows = await verificationsInRange(anchor.fromVerificationId, anchor.toVerificationId);
  return Response.json({
    anchor: {
      id: anchor.id,
      merkleRoot: anchor.merkleRoot,
      fromVerificationId: anchor.fromVerificationId,
      toVerificationId: anchor.toVerificationId,
      leafCount: anchor.leafCount,
      chain: anchor.chain,
      txHash: anchor.txHash,
      status: anchor.status,
    },
    leaves: rows.map((r) => canonicalVerificationRow(r as never)),
  });
}
