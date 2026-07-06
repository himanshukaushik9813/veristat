/**
 * The six-step verification pipeline — 3D isometric pedestals echoing the hero
 * artwork's stacked-plate tower: CSS preserve-3d plates, floating glowing
 * icons, and an animated data-flow connector. Pure CSS + inline SVG.
 */

const stroke = { stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const ICONS: Record<string, { color: string; svg: React.ReactNode }> = {
  discover: {
    color: "#6d7ef8",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <circle cx="15" cy="15" r="8.5" {...stroke} />
        <path d="M21.5 21.5 28 28" {...stroke} strokeWidth={2.4} />
      </svg>
    ),
  },
  pay: {
    color: "#22c55e",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <rect x="4" y="9" width="26" height="17" rx="3" {...stroke} />
        <path d="M4 14h26" {...stroke} />
        <circle cx="23" cy="20.5" r="2.4" {...stroke} />
      </svg>
    ),
  },
  probe: {
    color: "#8b9cff",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <path d="M3 18h6l3-9 5 16 4-11 2 4h8" {...stroke} strokeWidth={2.2} />
      </svg>
    ),
  },
  verify: {
    color: "#22c55e",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <path d="M17 3.5 27.5 8v8c0 6-4.3 10.5-10.5 12.5C10.8 26.5 6.5 22 6.5 16V8L17 3.5Z" {...stroke} />
        <path d="M12.5 16.5l3.2 3.2 6-6.5" {...stroke} strokeWidth={2.2} />
      </svg>
    ),
  },
  score: {
    color: "#fab219",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <path d="M8 27V15" stroke="#22c55e" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <path d="M17 27V7" stroke="#fab219" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <path d="M26 27V19" stroke="#6d7ef8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  publish: {
    color: "#a855f7",
    svg: (
      <svg width="38" height="38" viewBox="0 0 34 34">
        <path d="M17 4 29 10.5v13L17 30 5 23.5v-13L17 4Z" {...stroke} />
        <path d="M17 4v13M5 10.5l12 6.5M29 10.5l-12 6.5M17 30V17" {...stroke} strokeWidth={1.4} opacity={0.7} />
      </svg>
    ),
  },
};

const STEPS = [
  { id: "discover", name: "Discover", cap: <>AI Services<br />(OKX · Bazaar)</> },
  { id: "pay", name: "Pay", cap: <>x402 Payment<br />(Real Money)</> },
  { id: "probe", name: "Probe", cap: <>Adversarial<br />Queries</> },
  { id: "verify", name: "Verify", cap: <>On-Chain<br />Truth</> },
  { id: "score", name: "Score", cap: <>5 Dimensions<br />0–100</> },
  { id: "publish", name: "Publish", cap: <>Evidence On-Chain<br />(ERC-8004)</> },
];

export function Pipeline() {
  return (
    <div className="pipeline">
      <div className="connector" aria-hidden>
        <span className="flow" />
      </div>
      {STEPS.map((s, i) => {
        const icon = ICONS[s.id]!;
        return (
          <div className="step" key={s.id}>
            <div className="name">
              <span className="num">{i + 1}.</span> {s.name}
            </div>
            <div className="cap">{s.cap}</div>
            <div className="pedestal" style={{ ["--glow" as string]: icon.color }}>
              <div className="plates" aria-hidden>
                <span className="plate p3" />
                <span className="plate p2" />
                <span className="plate p1" />
              </div>
              <div className="icon" style={{ color: icon.color, animationDelay: `${i * 0.45}s` }}>
                {icon.svg}
              </div>
              <span className="pool" aria-hidden />
            </div>
            {i < STEPS.length - 1 && <span className="node" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}
