import React from "react";

/**
 * Tiny single-series trend line on a fixed 0–100 domain — no axes, no legend.
 * Used in leaderboard rows and scorecards.
 */
export function Sparkline({ values = [], width = 110, height = 26, color = "var(--series-1)" }) {
  if (values.length < 2) {
    return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  }
  const pad = 2;
  const step = (width - pad * 2) / (values.length - 1);
  const y = (v) => pad + (height - pad * 2) * (1 - Math.max(0, Math.min(100, v)) / 100);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  return (
    <svg width={width} height={height} role="img" aria-label={`trend, now ${last.toFixed(0)}`} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pad + (values.length - 1) * step} cy={y(last)} r="2.5" fill={color} />
    </svg>
  );
}
