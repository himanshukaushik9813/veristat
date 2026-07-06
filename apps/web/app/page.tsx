import Link from "next/link";
import { dailyLedgerSeries, globalStats, lastAnchor, recentActivity } from "@veristat/db";
import { CHAINS, type ChainKey } from "@veristat/shared";
import { ensureDb } from "@/lib/data";
import { Sparkline } from "@/components/Sparkline";
import { Pipeline } from "@/components/Pipeline";

export const dynamic = "force-dynamic";

function txLink(chain: string | null, hash: string): string | null {
  const c = chain && chain in CHAINS ? CHAINS[chain as ChainKey] : null;
  return c ? c.explorerTxUrl(hash) : null;
}

function ago(date: Date | string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Map a probe's verdicts to a single landing-feed status chip. */
function probeStatus(verdicts: Array<{ dimension: string; verdict: string }>): { s: string; label: string } {
  const fail = (d: string) => verdicts.some((v) => v.dimension === d && v.verdict === "fail");
  if (fail("accuracy")) return { s: "incorrect", label: "Incorrect" };
  if (fail("freshness")) return { s: "stale", label: "Stale" };
  if (fail("integrity")) return { s: "overcharge", label: "Overcharge" };
  if (fail("reliability")) return { s: "failed", label: "Failed" };
  if (verdicts.some((v) => v.verdict === "pass")) return { s: "correct", label: "✓ Correct" };
  return { s: "unverified", label: "Unverified" };
}

/** Normalize a raw count series to the 0–100 domain the Sparkline expects. */
function norm(series: number[]): number[] {
  const max = Math.max(...series, 1);
  return series.map((v) => (v / max) * 100);
}

export default async function Landing() {
  await ensureDb();
  const [stats, activity, anchor, series] = await Promise.all([
    globalStats(),
    recentActivity(5),
    lastAnchor(),
    dailyLedgerSeries(14),
  ]);
  const anchorTx = anchor?.txHash ?? null;
  const anchorLink = anchorTx ? txLink(anchor!.chain, anchorTx) : null;

  return (
    <main className="landing">
      <section className="hero-shot">
        <div className="hero">
          <h1>
            Trust,
            <br />
            <span className="accent">verified</span>
            <br />
            with money.
          </h1>
          <p className="sub">
            Veristat adversarially probes paid AI agent services, verifies every answer against
            on-chain truth, and publishes cryptographic proof.
          </p>
          <div className="cta-row">
            <Link href="/docs" className="btn-primary lg">
              Get Early Access <span aria-hidden>↗</span>
            </Link>
            <Link href="/leaderboard" className="btn-ghost">
              Explore Leaderboard
            </Link>
          </div>
          <div className="live-note">
            <span className="dot" aria-hidden />
            Live verification network — probing {stats.servicesScored} services
          </div>
        </div>
      </section>

      <Pipeline />

      <div className="panels">
        <div className="stat-panel">
          <div className="stat">
            <div className="k">Paid Probes</div>
            <div className="v">{stats.probes.toLocaleString()}</div>
            <div className="cap">On-chain payments</div>
            <div className="spark">
              <Sparkline values={norm(series.probes)} width={150} height={34} />
            </div>
          </div>
          <div className="stat">
            <div className="k">Verified Verdicts</div>
            <div className="v">{stats.verdicts.toLocaleString()}</div>
            <div className="cap">Merkle-anchored</div>
            <div className="spark">
              <Sparkline values={norm(series.verdicts)} width={150} height={34} />
            </div>
          </div>
          <div className="stat">
            <div className="k">Incidents Caught</div>
            <div className="v">{stats.incidents.toLocaleString()}</div>
            <div className="cap">Wrong, stale &amp; overcharges</div>
            <div className="spark">
              <Sparkline values={norm(series.incidents)} width={150} height={34} />
            </div>
          </div>
          <div className="stat">
            <div className="k">$ Spent Probing</div>
            <div className="v">${stats.usdSpent.toFixed(2)}</div>
            <div className="cap">Across {stats.servicesScored} services</div>
            <div className="spark">
              <Sparkline values={norm(series.usdSpent)} width={150} height={34} />
            </div>
          </div>
        </div>

        <div className="activity-panel">
          <div className="head">
            <span className="title">Live Probe Activity</span>
            <Link href="/leaderboard#activity">View all →</Link>
          </div>
          {activity.map((a) => {
            const status = probeStatus(a.verdicts);
            const link = a.paymentTxHash ? txLink(a.paymentChain, a.paymentTxHash) : null;
            return (
              <div className="row" key={a.probeId}>
                <span className="ago">{ago(a.startedAt)}</span>
                <Link className="svc" href={`/service/${a.serviceId}`}>
                  {a.serviceName}
                </Link>
                <span className="tpl">{a.templateId}</span>
                <span className="status-chip" data-s={status.s}>
                  {status.label}
                </span>
                <span className="amt">
                  {a.chargedUsd != null ? `$${a.chargedUsd.toFixed(4)}` : "—"}{" "}
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer" title="payment tx on OKLink">
                      ↗
                    </a>
                  )}
                </span>
              </div>
            );
          })}
          {activity.length === 0 && <p className="sub">No probes yet — start the worker.</p>}
        </div>
      </div>

      <div className="anchor-bar">
        <span className="lead">All evidence Merkle-anchored on XLayer Testnet</span>
        <span className="kv">
          Latest Anchor Tx{" "}
          {anchorTx && anchorLink ? (
            <a href={anchorLink} target="_blank" rel="noreferrer">
              {anchorTx.slice(0, 6)}…{anchorTx.slice(-4)}
            </a>
          ) : (
            <b>pending</b>
          )}
        </span>
        <span className="kv">
          Leaves <b>{anchor?.leafCount ?? 0}</b>
        </span>
        <span className="kv">
          Time <b>{anchor ? ago(anchor.createdAt) : "—"}</b>
        </span>
        {anchorLink && (
          <a className="explorer" href={anchorLink} target="_blank" rel="noreferrer">
            View on OKLink Explorer →
          </a>
        )}
      </div>
    </main>
  );
}
