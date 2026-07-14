import Link from "next/link";
import { dailyLedgerSeries, globalStats, lastAnchor, recentActivity } from "@veristat/db";
import { CHAINS, type ChainKey } from "@veristat/shared";
import { ensureDb } from "@/lib/data";
import { Pipeline } from "@/components/Pipeline";
import { TrendArea } from "@/components/TrendArea";
import { AnimatedNumber } from "@/components/AnimatedNumber";

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

const ICON_STROKE = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const STAT_ICONS: Record<string, React.ReactNode> = {
  probes: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="6.5" {...ICON_STROKE} />
      <path d="M15.5 15.5 21 21" {...ICON_STROKE} strokeWidth={2.2} />
    </svg>
  ),
  verdicts: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z" {...ICON_STROKE} />
      <path d="M8.8 11.6l2.3 2.3 4.2-4.6" {...ICON_STROKE} strokeWidth={2} />
    </svg>
  ),
  incidents: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M12 3 22 20H2L12 3Z" {...ICON_STROKE} />
      <path d="M12 10v4.5" {...ICON_STROKE} strokeWidth={2} />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  spend: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="2.5" y="6" width="19" height="13" rx="2.5" {...ICON_STROKE} />
      <path d="M2.5 10h19" {...ICON_STROKE} />
      <circle cx="16.5" cy="14.8" r="1.8" {...ICON_STROKE} />
    </svg>
  ),
};

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
        <div className="hero-art" aria-hidden />
        <div className="hero-scan" aria-hidden />
        <div className="hero">
          <a
            className="okx-badge"
            href="https://www.oklink.com/xlayer/tx/0x42cd8092d851265bfd8978b3ac7fc98696afe11fd2a3a8f1aef66601b1dc84c0"
            target="_blank"
            rel="noreferrer"
            title="Veristat's ERC-8004 agent identity, registered on X Layer"
          >
            <span className="okx-dot" aria-hidden />
            Registered OKX.AI ASP <strong>#5623</strong> on X Layer
            <span aria-hidden>↗</span>
          </a>
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
          {(
            [
              {
                id: "probes",
                k: "Paid Probes",
                v: <AnimatedNumber value={stats.probes} />,
                cap: "On-chain payments",
                series: series.probes,
                color: "var(--accent)",
              },
              {
                id: "verdicts",
                k: "Verified Verdicts",
                v: <AnimatedNumber value={stats.verdicts} />,
                cap: "Merkle-anchored",
                series: series.verdicts,
                color: "#22c55e",
              },
              {
                id: "incidents",
                k: "Incidents Caught",
                v: <AnimatedNumber value={stats.incidents} />,
                cap: "Wrong, stale & overcharges",
                series: series.incidents,
                color: "#ec835a",
              },
              {
                id: "spend",
                k: "$ Spent Probing",
                v: <AnimatedNumber value={stats.usdSpent} decimals={2} prefix="$" />,
                cap: `Across ${stats.servicesScored} services`,
                series: series.usdSpent,
                color: "#8b9cff",
              },
            ] as const
          ).map((s) => {
            const today = s.series[s.series.length - 1] ?? 0;
            return (
              <div className="stat" key={s.id} style={{ ["--stat-c" as string]: s.color }}>
                <div className="stat-head">
                  <span className="stat-icon">{STAT_ICONS[s.id]}</span>
                  <span className="k">{s.k}</span>
                </div>
                <div className="v">{s.v}</div>
                <div className="cap">
                  {s.cap}
                  {today > 0 && (
                    <span className="delta">
                      +{s.id === "spend" ? `$${today.toFixed(2)}` : Math.round(today).toLocaleString()} today
                    </span>
                  )}
                </div>
                <div className="spark">
                  <TrendArea values={s.series} id={s.id} color={s.color} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="activity-panel">
          <div className="head">
            <span className="title">
              <span className="live-chip">
                <span className="dot" aria-hidden />
                LIVE
              </span>
              Probe Activity
            </span>
            <Link href="/leaderboard#activity">View all →</Link>
          </div>
          {activity.map((a, i) => {
            const status = probeStatus(a.verdicts);
            const link = a.paymentTxHash ? txLink(a.paymentChain, a.paymentTxHash) : null;
            return (
              <div className="row" key={a.probeId} style={{ animationDelay: `${i * 90}ms` }}>
                <span className="ago">{ago(a.startedAt)}</span>
                <Link className="svc" href={`/service/${a.serviceId}`}>
                  <span
                    className="svc-dot"
                    style={{ background: `hsl(${(a.serviceId * 67) % 360} 75% 62%)` }}
                    aria-hidden
                  />
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
        <span className="anchor-icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path
              d="M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z"
              stroke="var(--accent)"
              strokeWidth="1.7"
              strokeLinejoin="round"
              fill="rgba(109,126,248,0.10)"
            />
            <path d="M8.8 11.6l2.3 2.3 4.2-4.6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
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
        {anchor?.status === "confirmed" && (
          <span className="status-chip" data-s="correct">
            ✓ Confirmed
          </span>
        )}
        {anchorLink && (
          <a className="explorer" href={anchorLink} target="_blank" rel="noreferrer">
            View on OKLink Explorer →
          </a>
        )}
      </div>
    </main>
  );
}
