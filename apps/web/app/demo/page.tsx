import type { Metadata } from "next";
import Link from "next/link";
import { leaderboard } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Demo — would your agent pay this service?",
  description:
    "Watch an agent call guard() and refuse to pay a low-scoring service, live against the Veristat score API.",
};

/** Free pre-purchase gate on the live score API. Same policy the SDK guard() runs. */
interface GuardResponse {
  allow: boolean;
  reason: string;
  failures?: string[];
  service: { id: number; name: string; endpoint: string } | null;
  score: { composite: number; grade: string; confidence: number; integrity: number; sampleCount: number } | null;
  policy: { minScore: number; minIntegrity: number; minConfidence: number; requireVerifiedAccuracy: boolean };
}

function apiBase() {
  return (process.env.VERISTAT_API_URL ?? "http://localhost:4020").replace(/\/$/, "");
}

async function callGuard(serviceId: number): Promise<GuardResponse | null> {
  try {
    const res = await fetch(`${apiBase()}/v1/guard?serviceId=${serviceId}`, {
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as GuardResponse;
  } catch {
    return null;
  }
}

function Decision({ agent, g }: { agent: string; g: GuardResponse }) {
  const allow = g.allow;
  return (
    <div
      className="card"
      style={{
        borderLeft: `3px solid ${allow ? "var(--accent)" : "var(--critical)"}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
        <strong style={{ color: "var(--text-primary)" }}>{agent}</strong> is about to pay{" "}
        <code>{g.service?.name ?? "a service"}</code> via x402…
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 15,
            color: allow ? "var(--accent)" : "var(--critical)",
          }}
        >
          {allow ? "✓ guard() → PAY" : "✕ guard() → DO NOT PAY"}
        </span>
        {g.score && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Veristat {Math.round(g.score.composite)}/100 · grade {g.score.grade} · {g.score.sampleCount} verified verdicts
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: allow ? "var(--text-muted)" : "var(--critical)", fontFamily: "var(--font-mono)" }}>
        {g.reason}
      </div>
      {g.service && (
        <Link href={`/service/${g.service.id}`} style={{ fontSize: 12 }}>
          See the evidence behind this verdict →
        </Link>
      )}
    </div>
  );
}

export default async function DemoPage() {
  await ensureDb();
  const board = (await leaderboard()).filter((r) => r.score);
  const best = board[0];
  const worst = board.length > 1 ? board[board.length - 1] : undefined;

  const [gBest, gWorst] = await Promise.all([
    best ? callGuard(best.service.id) : Promise.resolve(null),
    worst ? callGuard(worst.service.id) : Promise.resolve(null),
  ]);

  const policy = gBest?.policy ?? gWorst?.policy ?? { minScore: 70, minIntegrity: 60, minConfidence: 0.3, requireVerifiedAccuracy: false };

  return (
    <main>
      <h1>Would your agent pay this service?</h1>
      <p className="sub" style={{ maxWidth: 680 }}>
        Veristat isn’t just a dashboard — it’s the pre-purchase gate other agents call before
        spending money. One line, <code>guard()</code>, turns Veristat’s verified track record into
        a go/no-go decision. Below is that gate running <strong>live</strong> against this deployment,
        with the same policy an agent would set: <code>minScore ≥ {policy.minScore}</code>,{" "}
        <code>integrity ≥ {policy.minIntegrity}</code>.
      </p>

      <div className="embed" style={{ margin: "18px 0" }}>
        <div className="k">The one line every agent adds before it pays</div>
        <code>
          {`const gate = await veristat.guard(serviceUrl, { minScore: ${policy.minScore} });\nif (gate.allow) await payForService(); else refuse(gate.reason);`}
        </code>
      </div>

      <div className="cards" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {gBest ? (
          <Decision agent="TradingBot" g={gBest} />
        ) : (
          <div className="card sub">No trustworthy service scored yet — probing in progress.</div>
        )}
        {gWorst && worst?.service.id !== best?.service.id ? (
          <Decision agent="TradingBot" g={gWorst} />
        ) : (
          <div className="card sub">
            No failing service caught yet — the worker is still probing. Refresh in a minute.
          </div>
        )}
      </div>

      <p className="sub" style={{ marginTop: 18, fontSize: 12.5 }}>
        The decision is free (an agent shouldn’t pay to find out whether to pay); the detailed score
        and full evidence behind it are the paid x402 endpoints. This page calls{" "}
        <code>GET /v1/guard</code> on the live score API each time it loads — refresh to re-run it.{" "}
        <Link href="/docs#sdk">SDK docs →</Link>
      </p>
    </main>
  );
}
