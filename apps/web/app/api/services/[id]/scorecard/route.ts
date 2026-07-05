import { getService, latestScore, listIncidents, recentProbes, scoreHistory } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Machine-readable scorecard — the evidence URI referenced by Veristat's
 * ERC-8004 Validation Registry attestations.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const service = await getService(Number(id));
  if (!service) return Response.json({ error: "unknown service" }, { status: 404 });
  const [score, history, probes, incidents] = await Promise.all([
    latestScore(service.id),
    scoreHistory(service.id, 50),
    recentProbes(service.id, 10),
    listIncidents(service.id, 25),
  ]);
  return Response.json({
    service: {
      id: service.id,
      name: service.name,
      endpoint: service.endpoint,
      category: service.category,
      chain: service.chain,
      status: service.status,
      conflictOfInterest: service.isSelf,
    },
    score,
    history: history.map((h) => ({ composite: h.composite, grade: h.grade, computedAt: h.computedAt })),
    incidents,
    sampleEvidence: probes.map((p) => ({
      probeId: p.id,
      paymentTxHash: p.paymentTxHash,
      responseHash: p.responseHash,
      quotedUsd: p.quotedUsd,
      chargedUsd: p.chargedUsd,
      latencyMs: p.latencyMs,
      startedAt: p.startedAt,
    })),
    methodology: "/methodology",
    neutrality: "providers can never pay to change a score",
  });
}
