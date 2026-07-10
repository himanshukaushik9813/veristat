import React from "react";

/**
 * Conflict-of-interest badge shown on Veristat's own self-listing. Amber
 * outline — the brand names its own bias rather than hiding it.
 */
export function CoiBadge({ children = "Veristat itself — COI", style }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "var(--radius-xs)",
        fontSize: 12,
        background: "var(--surface-2)",
        color: "var(--warning)",
        border: "1px solid var(--warning)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
