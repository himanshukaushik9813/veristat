/**
 * The six-step verification pipeline — per the Veristat design system: flat
 * glowing tiles on a connector rail, lit in sequence by a single traveling
 * light pulse (each tile flares + pops as the pulse passes its center).
 * Pure CSS + inline SVG, no libraries.
 */

const stroke = { stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const ICONS: Record<string, { c: string; svg: React.ReactNode }> = {
  discover: {
    c: "#6d7ef8",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="15" cy="15" r="8.5" {...stroke} />
        <path d="M21.5 21.5 28 28" {...stroke} strokeWidth={2.4} />
      </svg>
    ),
  },
  pay: {
    c: "#22c55e",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <rect x="4" y="9" width="26" height="17" rx="3" {...stroke} />
        <path d="M4 14h26" {...stroke} />
        <circle cx="23" cy="20.5" r="2.4" {...stroke} />
      </svg>
    ),
  },
  probe: {
    c: "#8b9cff",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <path d="M3 18h6l3-9 5 16 4-11 2 4h8" {...stroke} strokeWidth={2.2} />
      </svg>
    ),
  },
  verify: {
    c: "#22c55e",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <path d="M17 3.5 27.5 8v8c0 6-4.3 10.5-10.5 12.5C10.8 26.5 6.5 22 6.5 16V8L17 3.5Z" {...stroke} />
        <path d="M12.5 16.5l3.2 3.2 6-6.5" {...stroke} strokeWidth={2.2} />
      </svg>
    ),
  },
  score: {
    c: "#fab219",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <path d="M8 27V15" stroke="#22c55e" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <path d="M17 27V7" stroke="#fab219" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <path d="M26 27V19" stroke="#6d7ef8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  publish: {
    c: "#a855f7",
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34">
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

/** Delay (s) at which the traveling pulse reaches tile i's center — keeps the
 * per-tile flare exactly in step with the connector dot (loop 4.8s, travel 60%). */
const PULSE_LOOP = 4.8;
const pulseDelay = (i: number) => (PULSE_LOOP * 0.6 * (((i + 0.5) / 6) * 100 - 2)) / 96;

export function Pipeline() {
  return (
    <div className="pipeline">
      <div aria-hidden className="pipe-rail" />
      <div aria-hidden className="pipe-dot" />
      <div className="pipe-grid">
        {STEPS.map((s, i) => {
          const ic = ICONS[s.id]!;
          const delay = `${pulseDelay(i).toFixed(2)}s`;
          return (
            <div className="step" key={s.id}>
              <div className="name">
                <span className="num">{i + 1}.</span> {s.name}
              </div>
              <div className="cap">{s.cap}</div>
              <div
                className="tile"
                style={{
                  color: ic.c,
                  background: `linear-gradient(135deg, color-mix(in srgb, ${ic.c} 14%, rgba(16,19,36,0.92)), rgba(8,10,22,0.96))`,
                  border: `1px solid color-mix(in srgb, ${ic.c} 40%, transparent)`,
                  boxShadow: `0 0 22px color-mix(in srgb, ${ic.c} 22%, transparent), inset 0 0 26px color-mix(in srgb, ${ic.c} 12%, transparent)`,
                  filter: `drop-shadow(0 0 8px color-mix(in srgb, ${ic.c} 40%, transparent))`,
                  animationDelay: delay,
                }}
              >
                <span
                  aria-hidden
                  className="flare"
                  style={{
                    border: `1px solid ${ic.c}`,
                    boxShadow: `0 0 26px ${ic.c}, inset 0 0 22px color-mix(in srgb, ${ic.c} 45%, transparent)`,
                    animationDelay: delay,
                  }}
                />
                {ic.svg}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
