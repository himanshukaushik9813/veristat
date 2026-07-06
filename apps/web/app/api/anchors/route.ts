import { listAnchors } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

/** All evidence anchors, newest first — entry point for independent proof verification. */
export async function GET() {
  await ensureDb();
  const anchors = await listAnchors(500);
  return Response.json({
    anchors: anchors.map((a) => ({
      id: a.id,
      merkleRoot: a.merkleRoot,
      fromVerificationId: a.fromVerificationId,
      toVerificationId: a.toVerificationId,
      leafCount: a.leafCount,
      chain: a.chain,
      txHash: a.txHash,
      blockNumber: a.blockNumber,
      status: a.status,
      createdAt: a.createdAt,
    })),
  });
}
