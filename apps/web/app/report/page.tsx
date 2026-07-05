import { leaderboard, listAnchors, reportAggregates } from "@veristat/db";
import { ensureDb, fmt } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * "The State of the Agent Marketplace" — the launch artifact (spec §13):
 * aggregate findings computed live from the evidence ledger.
 */
export default async function Report() {
  await ensureDb();
  const [agg, rows, anchors] = await Promise.all([reportAggregates(), leaderboard(), listAnchors(10)]);
  const scored = rows.filter((r) => r.score);
  const failRate = agg.verifications.total
    ? (100 * agg.verifications.fail) / (agg.verifications.fail + agg.verifications.pass || 1)
    : 0;

  return (
    <main className="prose">
      <h1>The State of the Agent Marketplace</h1>
      <p className="sub">
        Computed live from Veristat’s evidence ledger. Every number below traces to paid probes
        with on-chain receipts and Merkle-anchored verdicts.
      </p>

      <div className="cards">
        <div className="card">
          <div className="k">Services tracked</div>
          <div className="v">{rows.length}</div>
        </div>
        <div className="card">
          <div className="k">Probes executed</div>
          <div className="v">{agg.probes.total}</div>
        </div>
        <div className="card">
          <div className="k">Verified verdicts</div>
          <div className="v">{agg.verifications.total}</div>
        </div>
        <div className="card">
          <div className="k">Failure rate</div>
          <div className="v">{fmt(failRate)}%</div>
        </div>
      </div>

      <h2>Findings</h2>
      <ul>
        <li>
          <strong>{agg.verifications.accuracyFails}</strong> verifiably wrong answers (response
          contradicted contract state at the pinned block).
        </li>
        <li>
          <strong>{agg.verifications.staleFails}</strong> stale responses (claimed block/timestamp
          lagged the chain head beyond tolerance).
        </li>
        <li>
          <strong>{agg.probes.overcharged}</strong> probes charged more than quoted.
        </li>
        <li>
          Median-ish latency picture: mean <strong>{fmt(agg.probes.avgLatency, 0)}ms</strong>, p95{" "}
          <strong>{fmt(agg.probes.p95Latency, 0)}ms</strong>.
        </li>
        <li>
          {scored.length} of {rows.length} services currently hold a score; grades range{" "}
          {scored.length > 0 &&
            `${scored[0]!.score!.grade} (best) to ${scored[scored.length - 1]!.score!.grade} (worst)`}
          .
        </li>
      </ul>

      <h2>Evidence anchors</h2>
      {anchors.length === 0 ? (
        <p>No Merkle anchors yet — anchoring runs every few minutes once verdicts accumulate.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Root</th>
              <th>Rows</th>
              <th>Status</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {anchors.map((a) => (
              <tr key={a.id}>
                <td>
                  <code>{a.merkleRoot.slice(0, 18)}…</code>
                </td>
                <td>
                  {a.fromVerificationId}–{a.toVerificationId}
                </td>
                <td>{a.status}</td>
                <td>{a.txHash ? <code>{a.txHash.slice(0, 18)}…</code> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Why this exists</h2>
      <p>
        Completion-based reputation measures that a task finished. Competition rankings measure
        behavior when the agent knows it is being tested. Payment-graph rankings measure
        popularity. None answer the question an agent must ask before every purchase:{" "}
        <em>is this service’s output actually correct?</em> Veristat’s scores are grounded by
        construction — every data point originates from a probe Veristat itself paid for, verified
        against independently computed truth.
      </p>
    </main>
  );
}
