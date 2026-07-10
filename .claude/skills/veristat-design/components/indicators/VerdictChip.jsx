import React from "react";

const V = {
  pass: { bg: "var(--good-tint)", fg: "var(--good)", mark: "✓" },
  fail: { bg: "var(--critical-tint)", fg: "var(--critical)", mark: "✗" },
  inconclusive: { bg: "var(--surface-2)", fg: "var(--text-muted)", mark: "–" },
  unverifiable: { bg: "var(--surface-2)", fg: "var(--text-muted)", mark: "–" },
};

/**
 * Compact mono verdict tag for a single dimension — the atom of the evidence
 * ledger. Shows either the raw verdict word or a `dim:✓` abbreviation.
 */
export function VerdictChip({ verdict = "inconclusive", dimension, abbrev = false, style }) {
  const v = V[verdict] ?? V.inconclusive;
  let text;
  if (abbrev && dimension) text = `${dimension.slice(0, 3)}:${v.mark}`;
  else if (dimension) text = `${dimension}:${verdict}`;
  else text = verdict;
  return (
    <span
      title={dimension}
      style={{
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: "var(--radius-xs)",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        background: v.bg,
        color: v.fg,
        ...style,
      }}
    >
      {text}
    </span>
  );
}
