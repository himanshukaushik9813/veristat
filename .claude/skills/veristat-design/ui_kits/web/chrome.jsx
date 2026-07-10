// Veristat web UI kit — shared chrome: nav, hero pipeline, footer, icons.
const { useState } = React;

const stroke = { stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden style={{ display: "block" }}>
      <path d="M13 1.5 22.5 6v7.2c0 5.4-3.9 9.4-9.5 11.3C7.4 22.6 3.5 18.6 3.5 13.2V6L13 1.5Z" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.8 13.2l2.9 2.9 5.5-5.9" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavBar({ route, go }) {
  const items = [
    ["leaderboard", "Leaderboard"],
    ["report", "Reports"],
    ["api", "API"],
    ["mcp", "MCP Server"],
    ["docs", "Docs"],
    ["about", "About"],
  ];
  const active = (k) => route === k || (k === "leaderboard" && route === "service");
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 60,
      background: "var(--glass-nav)", backdropFilter: "var(--blur-nav)", WebkitBackdropFilter: "var(--blur-nav)",
      borderBottom: "1px solid rgba(109,126,248,0.16)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 28, padding: "12px 32px" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); go("landing"); }}
           style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 800, letterSpacing: "0.14em", color: "var(--text-primary)", textDecoration: "none", filter: "drop-shadow(0 0 10px rgba(109,126,248,0.4))" }}>
          <LogoMark /> VERISTAT
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, margin: "0 auto" }}>
          {items.map(([k, label]) => (
            <a key={k} href="#" onClick={(e) => { e.preventDefault(); go(k === "api" || k === "mcp" || k === "about" ? "docs" : k); }}
               style={{
                 position: "relative", padding: "7px 12px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap",
                 color: active(k) ? "var(--text-primary)" : "var(--text-secondary)",
               }}>
              {label}
              {active(k) && <span style={{ position: "absolute", left: 12, right: 12, bottom: -13, height: 2, background: "var(--accent)", borderRadius: 2, boxShadow: "0 0 8px var(--accent)" }} />}
            </a>
          ))}
        </nav>
        <a href="#" onClick={(e) => { e.preventDefault(); go("docs"); }}
           style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-strong)", color: "#08080a", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 24px rgba(255,255,255,0.14)" }}>
          Get Early Access <span aria-hidden>↗</span>
        </a>
      </div>
    </header>
  );
}

const PIPE_ICONS = {
  discover: { c: "#ffffff", svg: <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="15" cy="15" r="8.5" {...stroke} /><path d="M21.5 21.5 28 28" {...stroke} strokeWidth={2.4} /></svg> },
  pay: { c: "#d6d7db", svg: <svg width="34" height="34" viewBox="0 0 34 34"><rect x="4" y="9" width="26" height="17" rx="3" {...stroke} /><path d="M4 14h26" {...stroke} /><circle cx="23" cy="20.5" r="2.4" {...stroke} /></svg> },
  probe: { c: "#b7b8bd", svg: <svg width="34" height="34" viewBox="0 0 34 34"><path d="M3 18h6l3-9 5 16 4-11 2 4h8" {...stroke} strokeWidth={2.2} /></svg> },
  verify: { c: "#ffffff", svg: <svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 3.5 27.5 8v8c0 6-4.3 10.5-10.5 12.5C10.8 26.5 6.5 22 6.5 16V8L17 3.5Z" {...stroke} /><path d="M12.5 16.5l3.2 3.2 6-6.5" {...stroke} strokeWidth={2.2} /></svg> },
  score: { c: "#9a9ba0", svg: <svg width="34" height="34" viewBox="0 0 34 34"><path d="M8 27V15" stroke="#ffffff" strokeWidth={3.4} strokeLinecap="round" fill="none" /><path d="M17 27V7" stroke="#b7b8bd" strokeWidth={3.4} strokeLinecap="round" fill="none" /><path d="M26 27V19" stroke="#6f7075" strokeWidth={3.4} strokeLinecap="round" fill="none" /></svg> },
  publish: { c: "#c9cace", svg: <svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 4 29 10.5v13L17 30 5 23.5v-13L17 4Z" {...stroke} /><path d="M17 4v13M5 10.5l12 6.5M29 10.5l-12 6.5M17 30V17" {...stroke} strokeWidth={1.4} opacity={0.7} /></svg> },
};
const PIPE_STEPS = [
  ["discover", "Discover", "AI Services (OKX · Bazaar)"],
  ["pay", "Pay", "x402 Payment (Real Money)"],
  ["probe", "Probe", "Adversarial Queries"],
  ["verify", "Verify", "On-Chain Truth"],
  ["score", "Score", "5 Dimensions 0–100"],
  ["publish", "Publish", "Evidence On-Chain"],
];

// Delay (s) at which the traveling pulse reaches tile i's center — keeps the
// per-tile flare exactly in step with the connector dot (loop 4.8s, travel 60%).
const PULSE_LOOP = 4.8;
const pulseDelay = (i) => (PULSE_LOOP * 0.6 * (((i + 0.5) / 6) * 100 - 2)) / 96;

function Pipeline() {
  return (
    <div className="vs-pipeline" style={{ position: "relative", margin: "44px 0 8px" }}>
      {/* connector rail + traveling pulse, aligned to the icon-tile centers (46px up from the base) */}
      <div aria-hidden className="vs-pipe-rail" />
      <div aria-hidden className="vs-pipe-dot" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, position: "relative" }}>
        {PIPE_STEPS.map(([id, name, cap], i) => {
          const ic = PIPE_ICONS[id];
          const delay = `${pulseDelay(i).toFixed(2)}s`;
          return (
            <div key={id} style={{ textAlign: "center", padding: "0 8px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", marginRight: 2 }}>{i + 1}.</span> {name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: "4px 0 16px", minHeight: 34 }}>{cap}</div>
              <div className="vs-pipe-tile" style={{
                position: "relative",
                width: 92, height: 92, margin: "0 auto", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                color: ic.c,
                background: `linear-gradient(135deg, color-mix(in srgb, ${ic.c} 14%, rgba(16,19,36,0.92)), rgba(8,10,22,0.96))`,
                border: `1px solid color-mix(in srgb, ${ic.c} 40%, transparent)`,
                boxShadow: `0 0 22px color-mix(in srgb, ${ic.c} 22%, transparent), inset 0 0 26px color-mix(in srgb, ${ic.c} 12%, transparent)`,
                filter: `drop-shadow(0 0 8px color-mix(in srgb, ${ic.c} 40%, transparent))`,
                animationDelay: delay,
              }}>
                {/* flare ring — brightens as the pulse passes through */}
                <span aria-hidden className="vs-pipe-flare" style={{
                  position: "absolute", inset: -1, borderRadius: 16, pointerEvents: "none",
                  border: `1px solid ${ic.c}`,
                  boxShadow: `0 0 26px ${ic.c}, inset 0 0 22px color-mix(in srgb, ${ic.c} 45%, transparent)`,
                  animationDelay: delay,
                }} />
                <span style={{ position: "relative" }}>{ic.svg}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 48, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
      Every score traces to on-chain payments and Merkle-anchored evidence on XLayer. Providers can never pay to change a score.
    </footer>
  );
}

Object.assign(window, { VS_NavBar: NavBar, VS_Pipeline: Pipeline, VS_Footer: Footer });
