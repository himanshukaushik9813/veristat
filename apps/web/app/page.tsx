import Link from "next/link";
import { leaderboard, scoreHistory } from "@veristat/db";
import { ensureDb, fmt, gradeBand } from "@/lib/data";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  await ensureDb();
  const rows = await leaderboard();
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
    </main>
  );
}
