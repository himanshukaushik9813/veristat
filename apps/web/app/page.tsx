import Link from "next/link";
import { globalStats, leaderboard, recentActivity, scoreHistory } from "@veristat/db";
import { CHAINS, type ChainKey } from "@veristat/shared";
import { ensureDb, fmt, gradeBand } from "@/lib/data";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

function txLink(chain: string | null, hash: string): string | null {
  const c = chain && chain in CHAINS ? CHAINS[chain as ChainKey] : null;
  return c ? c.explorerTxUrl(hash) : null;
}

export default async function Leaderboard() {
  await ensureDb();
  const [rows, stats, activity] = await Promise.all([leaderboard(), globalStats(), recentActivity(10)]);
  const categories = [...new Set(rows.map((r) => r.service.category))];

  const histories = new Map<number, number[]>();
  for (const row of rows) {
    const h = await scoreHistory(row.service.id, 40);
    histories.set(
      row.service.id,
      h.map((s) => s.composite).reverse(),
    );
  }

  return (
    <main>
      <section className="hero">
        <h1>Trust, verified with money.</h1>
        <p className="sub">
          Veristat pays agent services real x402 payments, checks every answer against on-chain
          ground truth, and anchors the evidence on XLayer. Providers can never pay to change a
          score — only be more accurate.
        </p>
        <div className="cards">
          <div className="card">
            <div className="k">Paid probes</div>
            <div className="v">{stats.probes.toLocaleString()} <small>{stats.paymentTxs} on-chain payments</small></div>
          </div>
          <div className="card">
            <div className="k">Verified verdicts</div>
            <div className="v">{stats.verdicts.toLocaleString()} <small>{stats.anchoredLeaves} Merkle-anchored</small></div>
          </div>
          <div className="card">
            <div className="k">Incidents caught</div>
            <div className="v">{stats.incidents.toLocaleString()} <small>wrong, stale &amp; overcharges</small></div>
          </div>
          <div className="card">
            <div className="k">Spent probing</div>
            <div className="v">${stats.usdSpent.toFixed(3)} <small>{stats.servicesScored} services scored</small></div>
          </div>
        </div>
      </section>

      <h1>Agent service leaderboard</h1>
      <p className="sub">
        Live paid agent services, adversarially probed and verified against on-chain ground
        truth. Every score links to its evidence.
      </p>

      {categories.map((category) => (
        <section key={category}>
          <h2>{category}</h2>
          <table className="list">
            <thead>
              <tr>
                <th>#</th>
                <th>Service</th>
                <th>Grade</th>
                <th className="num">Score</th>
                <th>Trend</th>
                <th className="num">Accuracy</th>
                <th className="num">Confidence</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => r.service.category === category)
                .map((r, i) => (
                  <tr key={r.service.id}>
                    <td className="num">{i + 1}</td>
                    <td>
                      <Link href={`/service/${r.service.id}`}>{r.service.name}</Link>{" "}
                      {r.service.isSelf && <span className="badge-coi">Veristat itself — COI</span>}
                    </td>
                    <td>
                      {r.score ? (
                        <span className="grade" data-band={gradeBand(r.score.grade)}>
                          {r.score.grade}
                        </span>
                      ) : (
                        <span className="confidence">unscored</span>
                      )}
                    </td>
                    <td className="num">{fmt(r.score?.composite)}</td>
                    <td>
                      <Sparkline values={histories.get(r.service.id) ?? []} />
                    </td>
                    <td className="num">
                      {r.score?.accuracy === null ? (
                        <span className="confidence" title="Tier 3: output cannot be objectively verified">
                          not verified
                        </span>
                      ) : (
                        fmt(r.score?.accuracy, 0)
                      )}
                    </td>
                    <td className="num">{r.score ? `${Math.round(r.score.confidence * 100)}%` : "—"}</td>
                    <td>{r.score && <span className="tier">T{r.score.dominantTier}</span>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
      {rows.length === 0 && (
        <p className="sub">
          Catalog is empty — run <code>pnpm --filter @veristat/worker crawl</code> to discover services.
        </p>
      )}

      {activity.length > 0 && (
        <section>
          <h2>Live probe activity</h2>
          <p className="sub">Latest adversarial probes — every row paid for on-chain and independently verifiable.</p>
          <table className="list">
            <thead>
              <tr>
                <th>When</th>
                <th>Service</th>
                <th>Probe</th>
                <th>Verdicts</th>
                <th className="num">Paid</th>
                <th className="num">Latency</th>
                <th>Payment tx</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a) => {
                const link = a.paymentTxHash ? txLink(a.paymentChain, a.paymentTxHash) : null;
                return (
                  <tr key={a.probeId}>
                    <td className="confidence">
                      {new Date(a.startedAt).toLocaleTimeString("en-US", { hour12: false })}
                    </td>
                    <td>
                      <Link href={`/service/${a.serviceId}`}>{a.serviceName}</Link>
                    </td>
                    <td>
                      <code>{a.templateId}</code>
                    </td>
                    <td>
                      {a.verdicts.map((v, i) => (
                        <span key={i} className="verdict" data-v={v.verdict} title={v.dimension} style={{ marginRight: 4 }}>
                          {v.dimension.slice(0, 3)}:{v.verdict === "pass" ? "✓" : v.verdict === "fail" ? "✗" : "–"}
                        </span>
                      ))}
                    </td>
                    <td className="num">{a.chargedUsd != null ? `$${a.chargedUsd.toFixed(4)}` : "—"}</td>
                    <td className="num">{a.latencyMs != null ? `${a.latencyMs} ms` : "—"}</td>
                    <td>
                      {link && a.paymentTxHash ? (
                        <a href={link} target="_blank" rel="noreferrer">
                          <code>{a.paymentTxHash.slice(0, 10)}…</code>
                        </a>
                      ) : (
                        <span className="confidence">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
