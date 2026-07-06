import { notFound } from "next/navigation";
import { CHAINS, type ChainKey } from "@veristat/shared";
import {
  getService,
  latestScore,
  listDisputes,
  listIncidents,
  recentProbes,
  scoreHistory,
  verificationsForProbes,
} from "@veristat/db";
import { ensureDb, fmt, gradeBand } from "@/lib/data";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

function txLink(chain: string | null, hash: string | null) {
  if (!hash) return null;
  const cfg = chain && chain in CHAINS ? CHAINS[chain as ChainKey] : null;
  return cfg ? cfg.explorerTxUrl(hash) : null;
}

const DIMENSIONS = [
  ["accuracy", "Accuracy"],
  ["reliability", "Reliability"],
  ["latency", "Latency"],
  ["integrity", "Integrity"],
  ["freshness", "Freshness"],
] as const;

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const service = await getService(Number(id));
  if (!service) notFound();

  const [score, history, probes, incidents, disputes] = await Promise.all([
    latestScore(service.id),
    scoreHistory(service.id, 60),
    recentProbes(service.id, 15),
    listIncidents(service.id, 25),
    listDisputes(service.id),
  ]);
  const verifications = await verificationsForProbes(probes.map((p) => p.id));

  return (
    <main>
      <h1>
        {service.name}{" "}
        {service.isSelf && <span className="badge-coi">Veristat itself — scored by the same methodology (conflict of interest disclosed)</span>}
      </h1>
      <p className="sub">
        <code>{service.endpoint}</code> · {service.category} · {service.chain} ·{" "}
        {service.declaredPriceUsd !== null && `listed $${service.declaredPriceUsd}/call · `}
        status {service.status}
      </p>

      {score ? (
        <>
          <div className="cards">
            <div className="card">
              <div className="k">Composite</div>
              <div className="v">
                <span className="grade" data-band={gradeBand(score.grade)}>{score.grade}</span>{" "}
                {fmt(score.composite)}
              </div>
            </div>
            <div className="card">
              <div className="k">Confidence</div>
              <div className="v">
                {Math.round(score.confidence * 100)}% <small>{score.sampleCount} verdicts</small>
              </div>
            </div>
            <div className="card">
              <div className="k">Verification tier</div>
              <div className="v">
                T{score.dominantTier}{" "}
                <small>
                  {score.dominantTier === 1
                    ? "deterministic on-chain truth"
                    : score.dominantTier === 2
                      ? "consensus cross-reference"
                      : "operational only"}
                </small>
              </div>
            </div>
            <div className="card">
              <div className="k">Score history</div>
              <div className="v">
                <Sparkline values={history.map((h) => h.composite).reverse()} width={160} height={36} />
              </div>
            </div>
          </div>

          <h2>Dimensions</h2>
          {DIMENSIONS.map(([key, label]) => {
            const value = score[key];
            return (
              <div className="dim" key={key}>
                <span className="name">{label}</span>
                <span className="track">
                  <span className="fill" style={{ width: `${value ?? 0}%` }} />
                </span>
                {value === null ? (
                  <span className="val na" title="Tier 3: never fabricated">n/a</span>
                ) : (
                  <span className="val">{value.toFixed(0)}</span>
                )}
              </div>
            );
          })}
          {score.accuracy === null && (
            <p className="confidence">
              Accuracy not verified: this service’s output cannot be objectively checked, so it
              receives an operational score only. Veristat never fabricates an accuracy number.
            </p>
          )}
        </>
      ) : (
        <p className="sub">No score yet — probing in progress.</p>
      )}

      {incidents.length > 0 && (
        <>
          <h2>Incident log</h2>
          {incidents.map((incident) => (
            <div className="incident" key={incident.id}>
              <span className="kind">{incident.kind}</span> ·{" "}
              <time>{new Date(incident.createdAt).toISOString()}</time>
              <div>{incident.summary}</div>
            </div>
          ))}
        </>
      )}

      {disputes.length > 0 && (
        <>
          <h2>Disputes</h2>
          {disputes.map((d) => (
            <div className="incident" key={d.id} style={{ borderLeftColor: "var(--warning)" }}>
              <span className="kind">{d.status}</span> · <time>{new Date(d.openedAt).toISOString()}</time>
              <div>{d.reason}</div>
              {d.outcome && <div className="confidence">{d.outcome}</div>}
            </div>
          ))}
        </>
      )}

      <h2>Sample evidence</h2>
      <p className="sub">
        Each probe links its payment transaction, the raw response hash, the ground truth used
        (pinned block, contract reads, references) and the verdicts derived from it.
      </p>
      {probes.map((probe) => {
        const link = txLink(probe.paymentChain, probe.paymentTxHash);
        const rows = verifications.filter((v) => v.probeId === probe.id);
        return (
          <details className="evidence" key={probe.id}>
            <summary>
              #{probe.id} · {probe.templateId}
              {probe.isHoneypot && " · honeypot"} ·{" "}
              {rows.map((v) => (
                <span className="verdict" data-v={v.verdict} key={v.id} style={{ marginRight: 4 }}>
                  {v.dimension}:{v.verdict}
                </span>
              ))}
            </summary>
            <dl className="kv">
              <dt>request</dt>
              <dd>{probe.requestUrl}</dd>
              <dt>latency</dt>
              <dd>{probe.latencyMs}ms</dd>
              <dt>quoted / charged</dt>
              <dd>
                ${probe.quotedUsd ?? "0"} / ${probe.chargedUsd ?? "0"}
              </dd>
              <dt>payment tx</dt>
              <dd>{link ? <a href={link}>{probe.paymentTxHash}</a> : (probe.paymentTxHash ?? "free/unpaid")}</dd>
              <dt>response sha256</dt>
              <dd>{probe.responseHash ?? "—"}</dd>
              <dt>probed at</dt>
              <dd>{new Date(probe.startedAt).toISOString()}</dd>
            </dl>
            {rows.map((v) => (
              <dl className="kv" key={v.id}>
                <dt>
                  <span className="verdict" data-v={v.verdict}>T{v.tier} {v.dimension}</span>
                </dt>
                <dd>
                  expected {JSON.stringify(v.expected)} · got {JSON.stringify(v.actual)} — {v.detail}
                </dd>
              </dl>
            ))}
          </details>
        );
      })}

      <h2>Embed this score</h2>
      <p className="sub">
        Providers may display their live badge — it always reflects the current verified score
        and links back to this evidence page.
      </p>
      <div className="embed">
        <div className="k">Badge preview</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/badge/${service.id}`} alt={`Veristat score badge for ${service.name}`} height={28} />
        <div className="k" style={{ marginTop: 12 }}>HTML snippet</div>
        <code>
          {`<a href="${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/service/${service.id}"><img src="${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/badge/${service.id}" alt="Veristat verified score" /></a>`}
        </code>
      </div>
    </main>
  );
}
