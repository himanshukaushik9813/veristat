import React from "react";

const STATES = {
  correct: { bg: "var(--good-tint)", fg: "var(--good)", label: "✓ Correct" },
  incorrect: { bg: "var(--critical-tint)", fg: "var(--critical)", label: "Incorrect" },
  stale: { bg: "var(--warning-tint)", fg: "var(--warning)", label: "Stale" },
  overcharge: { bg: "var(--serious-tint)", fg: "var(--serious)", label: "Overcharge" },
  failed: { bg: "var(--critical-tint)", fg: "var(--critical)", label: "Failed" },
  unverified: { bg: "var(--surface-2)", fg: "var(--text-muted)", label: "Unverified" },
  confirmed: { bg: "var(--good-tint)", fg: "var(--good)", label: "✓ Confirmed" },
};

/**
 * Rounded pill summarizing a probe's outcome on the landing feed & anchor bar.
 * Pass `children` to override the default label for a state.
 */
export function StatusChip({ status = "unverified", children, style }) {
  const s = STATES[status] ?? STATES.unverified;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 9px",
        borderRadius: "var(--radius-pill)",
        fontSize: 11.5,
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        background: s.bg,
        color: s.fg,
        ...style,
      }}
    >
      {children ?? s.label}
    </span>
  );
}
