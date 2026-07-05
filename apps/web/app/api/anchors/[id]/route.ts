import { listAnchors } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Anchor metadata — the URI stored on-chain with each EvidenceAnchor entry. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const anchors = await listAnchors(500);
  const anchor = anchors.find((a) => a.id === Number(id));
  if (!anchor) return Response.json({ error: "unknown anchor" }, { status: 404 });
  return Response.json({
    ...anchor,
    note: "leaves are sha256 of canonicalized verification rows fromVerificationId..toVerificationId; see packages/shared/src/merkle.ts",
  });
}
