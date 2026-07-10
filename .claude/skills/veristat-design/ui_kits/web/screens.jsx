// Veristat web UI kit — screens: Landing, Leaderboard, Scorecard.
const NS = window.VeristatDesignSystem_aac6ad;
const { GradeChip, StatusChip, VerdictChip, TierBadge, CoiBadge, LiveChip, TxLink,
        Sparkline, TrendArea, DimensionMeter, KpiCard, StatCard, IncidentCard,
        EvidenceRow, EvidenceKV, ScoreBadge, Button } = NS;
const D = window.VERISTAT_DATA;

const EXPLORER = "https://www.oklink.com/xlayer-test/tx/";
const iconStroke = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
const STAT_ICONS = {
  probes: <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" {...iconStroke} /><path d="M15.5 15.5 21 21" {...iconStroke} strokeWidth={2.2} /></svg>,
  verdicts: <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z" {...iconStroke} /><path d="M8.8 11.6l2.3 2.3 4.2-4.6" {...iconStroke} strokeWidth={2} /></svg>,
  incidents: <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 3 22 20H2L12 3Z" {...iconStroke} /><path d="M12 10v4.5" {...iconStroke} strokeWidth={2} /><circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" /></svg>,
  usdSpent: <svg width="20" height="20" viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="13" rx="2.5" {...iconStroke} /><path d="M2.5 10h19" {...iconStroke} /><circle cx="16.5" cy="14.8" r="1.8" {...iconStroke} /></svg>,
};

function probeStatus(verdicts) {
  const fail = (d) => verdicts.some(([dim, v]) => dim === d && v === "fail");
  if (fail("accuracy")) return "incorrect";
  if (fail("freshness")) return "stale";
  if (fail("integrity")) return "overcharge";
  if (fail("reliability")) return "failed";
  return "correct";
}

// ---------- Landing ----------
function Landing({ go }) {
  const s = D.stats;
  const cards = [
    { id: "probes", k: "Paid Probes", v: s.probes.toLocaleString(), cap: "On-chain payments", color: "var(--accent)", delta: "+124 today" },
    { id: "verdicts", k: "Verified Verdicts", v: s.verdicts.toLocaleString(), cap: "Merkle-anchored", color: "#d4d5d9", delta: "+372 today" },
    { id: "incidents", k: "Incidents Caught", v: s.incidents, cap: "Wrong, stale & overcharges", color: "#9a9ba0", delta: "+4 today" },
    { id: "usdSpent", k: "$ Spent Probing", v: "$" + s.usdSpent.toFixed(2), cap: `Across ${s.servicesScored} services`, color: "#b7b8bd", delta: "+$0.41 today" },
  ];
  return (
    <main>
      <section style={{
        position: "relative", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden",
        minHeight: 480, display: "flex", alignItems: "center",
        background: "var(--surface-0)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <div className="vs-hero-art" aria-hidden style={{ position: "absolute", inset: 0, background: "url('../../assets/hero-bg.png') right center / cover no-repeat" }} />
        <div className="vs-hero-scan" aria-hidden />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(92deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.5) 52%, rgba(0,0,0,0) 72%)" }} />
        <div className="vs-hero-grid" aria-hidden />
        <div style={{ position: "relative", maxWidth: 560, padding: "64px 24px 64px 52px" }}>
          <h1 style={{ fontSize: "clamp(42px,5vw,60px)", lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 20px" }}>
            Trust,<br />
            <span style={{ background: "linear-gradient(96deg,#ffffff,#d0d1d5 52%,#8f9096)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 18px rgba(255,255,255,0.28))" }}>verified</span><br />
            with money.
          </h1>
          <p style={{ maxWidth: 440, margin: "0 0 30px", fontSize: 16.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            Veristat adversarially probes paid AI agent services, verifies every answer against on-chain truth, and publishes cryptographic proof.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Button size="lg" onClick={() => go("docs")} iconRight={<span aria-hidden>↗</span>}>Get Early Access</Button>
            <Button variant="ghost" onClick={() => go("leaderboard")}>Explore Leaderboard</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28, fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--good)", boxShadow: "0 0 10px var(--good)" }} />
            Live verification network — probing {s.servicesScored} services
          </div>
        </div>
      </section>

      <window.VS_Pipeline />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 20, alignItems: "stretch", marginTop: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {cards.map((c) => (
            <StatCard key={c.id} icon={STAT_ICONS[c.id]} label={c.k} value={c.v} caption={c.cap} delta={c.delta} color={c.color}
                      chart={<TrendArea values={D.series[c.id]} id={c.id} color={c.color} />} />
          ))}
        </div>

        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700 }}>
              <LiveChip /> Probe Activity
            </span>
            <a href="#" onClick={(e) => { e.preventDefault(); go("leaderboard"); }} style={{ fontSize: 13 }}>View all →</a>
          </div>
          {D.probes.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto auto", gap: 12, alignItems: "center", padding: "9px 8px", borderBottom: "1px solid var(--surface-2)", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{p.ago} ago</span>
              <a href="#" onClick={(e) => { e.preventDefault(); go("service", p.serviceId); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: `hsl(0 0% ${45 + ((p.serviceId * 37) % 45)}%)`, boxShadow: "0 0 8px currentColor" }} />
                {p.service}
              </a>
              <StatusChip status={probeStatus(p.verdicts)} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                ${p.charged.toFixed(4)} <TxLink hash={p.tx} href={EXPLORER + p.tx} tail={4} arrow />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", marginTop: 20, padding: "16px 24px",
        border: "1px solid transparent", borderRadius: 16, fontSize: 14,
        background: "linear-gradient(var(--surface-1),var(--surface-1)) padding-box, linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.14), rgba(255,255,255,0.4)) border-box",
        boxShadow: "0 0 32px rgba(255,255,255,0.05)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.20)", boxShadow: "0 0 16px rgba(255,255,255,0.08)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z" stroke="var(--accent)" strokeWidth="1.7" strokeLinejoin="round" fill="rgba(255,255,255,0.06)" /><path d="M8.8 11.6l2.3 2.3 4.2-4.6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        </span>
        <span style={{ fontWeight: 600 }}>All evidence Merkle-anchored on XLayer Testnet</span>
        <span style={{ display: "inline-flex", gap: 8, color: "var(--text-muted)" }}>Latest Anchor Tx <TxLink hash={D.anchor.tx} href={EXPLORER + D.anchor.tx} /></span>
        <span style={{ display: "inline-flex", gap: 8, color: "var(--text-muted)" }}>Leaves <b style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{D.anchor.leaves}</b></span>
        <StatusChip status="confirmed" />
        <a href={EXPLORER + D.anchor.tx} target="_blank" rel="noreferrer" style={{ marginLeft: "auto" }}>View on OKLink Explorer →</a>
      </div>

      <window.VS_Footer />
    </main>
  );
}

// ---------- Leaderboard ----------
function Leaderboard({ go }) {
  const cats = [...new Set(D.services.map((s) => s.category))];
  const th = { textAlign: "left", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", padding: "8px 12px", borderBottom: "1px solid var(--border)" };
  const thNum = { ...th, textAlign: "right" };
  const td = { padding: 12, borderBottom: "1px solid var(--surface-2)", verticalAlign: "middle" };
  const tdNum = { ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  return (
    <main>
      <h1>Agent service leaderboard</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px", maxWidth: 640 }}>
        Live paid agent services, adversarially probed and verified against on-chain ground truth. Every score links to its evidence.
      </p>
      {cats.map((cat) => (
        <section key={cat}>
          <h2 style={{ textTransform: "capitalize" }}>{cat}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr>
              <th style={th}>#</th><th style={th}>Service</th><th style={th}>Grade</th>
              <th style={thNum}>Score</th><th style={th}>Trend</th><th style={thNum}>Accuracy</th>
              <th style={thNum}>Confidence</th><th style={th}>Tier</th>
            </tr></thead>
            <tbody>
              {D.services.filter((s) => s.category === cat).sort((a, b) => b.composite - a.composite).map((s, i) => (
                <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => go("service", s.id)}>
                  <td style={tdNum}>{i + 1}</td>
                  <td style={td}>
                    <a href="#" onClick={(e) => { e.preventDefault(); go("service", s.id); }}>{s.name}</a>{" "}
                    {s.isSelf && <CoiBadge />}
                  </td>
                  <td style={td}><GradeChip grade={s.grade} /></td>
                  <td style={tdNum}>{s.composite.toFixed(1)}</td>
                  <td style={td}><Sparkline values={s.history} /></td>
                  <td style={tdNum}>{s.accuracy === null ? <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>not verified</span> : s.accuracy}</td>
                  <td style={tdNum}>{Math.round(s.confidence * 100)}%</td>
                  <td style={td}><TierBadge tier={s.tier} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section style={{ marginTop: 8 }}>
        <h2>Live probe activity</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 12px" }}>Latest adversarial probes — every row paid for on-chain and independently verifiable.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr>
            <th style={th}>When</th><th style={th}>Service</th><th style={th}>Probe</th><th style={th}>Verdicts</th>
            <th style={thNum}>Paid</th><th style={thNum}>Latency</th><th style={th}>Payment tx</th>
          </tr></thead>
          <tbody>
            {D.probes.map((p) => (
              <tr key={p.id}>
                <td style={{ ...td, color: "var(--text-muted)" }}>{p.ago} ago</td>
                <td style={td}><a href="#" onClick={(e) => { e.preventDefault(); go("service", p.serviceId); }}>{p.service}</a></td>
                <td style={td}><code>{p.template}</code></td>
                <td style={td}>{p.verdicts.map(([dim, v], i) => <span key={i} style={{ marginRight: 4 }}><VerdictChip verdict={v} dimension={dim} abbrev /></span>)}</td>
                <td style={tdNum}>${p.charged.toFixed(4)}</td>
                <td style={tdNum}>{p.latency} ms</td>
                <td style={td}><TxLink hash={p.tx} href={EXPLORER + p.tx} lead={10} tail={0} arrow={false} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <window.VS_Footer />
    </main>
  );
}

// ---------- Scorecard ----------
const DIMS = [["accuracy", "Accuracy"], ["reliability", "Reliability"], ["latency", "Latency"], ["integrity", "Integrity"], ["freshness", "Freshness"]];

function Scorecard({ id, go }) {
  const s = D.services.find((x) => x.id === id) || D.services[0];
  const incidents = D.incidents[s.id] || [];
  const probes = D.probes.filter((p) => p.serviceId === s.id);
  const dimColor = (k, v) => (v === null ? "var(--accent)" : v < 50 ? "var(--critical)" : v < 75 ? "var(--warning)" : "var(--accent)");
  return (
    <main>
      <a href="#" onClick={(e) => { e.preventDefault(); go("leaderboard"); }} style={{ fontSize: 13 }}>← Leaderboard</a>
      <h1 style={{ marginTop: 10 }}>
        {s.name} {s.isSelf && <CoiBadge>Veristat itself — scored by the same methodology (conflict of interest disclosed)</CoiBadge>}
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 20px" }}>
        <code>{s.endpoint}</code> · {s.category} · {s.chain} · listed ${s.declaredPriceUsd}/call · status active
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, margin: "16px 0" }}>
        <KpiCard label="Composite"><GradeChip grade={s.grade} /> {s.composite.toFixed(1)}</KpiCard>
        <KpiCard label="Confidence" value={`${Math.round(s.confidence * 100)}%`} sub={`${probes.length + 9} verdicts`} />
        <KpiCard label="Verification tier"><TierBadge tier={s.tier} /> <small style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>{s.tier === 1 ? "deterministic on-chain" : s.tier === 2 ? "consensus cross-ref" : "operational only"}</small></KpiCard>
        <KpiCard label="Score history"><Sparkline values={s.history} width={160} height={36} /></KpiCard>
      </div>

      <h2>Dimensions</h2>
      {DIMS.map(([k, label]) => <DimensionMeter key={k} name={label} value={s.dims[k]} color={dimColor(k, s.dims[k])} />)}
      {s.accuracy === null && (
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
          Accuracy not verified: this service's output cannot be objectively checked, so it receives an operational score only. Veristat never fabricates an accuracy number.
        </p>
      )}

      {incidents.length > 0 && (
        <>
          <h2>Incident log</h2>
          {incidents.map((inc, i) => <IncidentCard key={i} kind={inc.kind} time={inc.time} summary={inc.summary} />)}
        </>
      )}

      <h2>Sample evidence</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 12px", maxWidth: 640 }}>
        Each probe links its payment transaction, the raw response hash, the ground truth used, and the verdicts derived from it.
      </p>
      {(probes.length ? probes : D.probes.slice(0, 2)).map((p) => (
        <EvidenceRow key={p.id} summary={<span style={{ fontFamily: "var(--font-mono)" }}>#{p.id} · {p.template} · {p.verdicts.map(([dim, v], i) => <span key={i} style={{ marginRight: 4 }}><VerdictChip verdict={v} dimension={dim} /></span>)}</span>}>
          <EvidenceKV label="request">{s.endpoint}/{p.template.split(".")[1]}?pair=OKB-USDT</EvidenceKV>
          <EvidenceKV label="latency">{p.latency}ms</EvidenceKV>
          <EvidenceKV label="quoted / charged">${p.charged === 0.003 ? "0.0010" : p.charged.toFixed(4)} / ${p.charged.toFixed(4)}</EvidenceKV>
          <EvidenceKV label="payment tx"><TxLink hash={p.tx} href={EXPLORER + p.tx} lead={20} tail={6} /></EvidenceKV>
          <EvidenceKV label="response sha256">0x{p.tx.slice(2, 18)}a1b2c3d4e5f6</EvidenceKV>
        </EvidenceRow>
      ))}

      <h2>Embed this score</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 12px" }}>Providers may display their live badge — it always reflects the current verified score.</p>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>Badge preview</div>
        <ScoreBadge score={s.composite} />
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", margin: "14px 0 6px" }}>HTML snippet</div>
        <code style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", wordBreak: "break-all", background: "var(--surface-2)", padding: "8px 10px", borderRadius: 6 }}>
          {`<a href="https://veristat.example/service/${s.id}"><img src="https://veristat.example/api/badge/${s.id}" alt="Veristat verified score" /></a>`}
        </code>
      </div>
      <window.VS_Footer />
    </main>
  );
}

Object.assign(window, { VS_Landing: Landing, VS_Leaderboard: Leaderboard, VS_Scorecard: Scorecard });
