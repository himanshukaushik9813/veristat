import React from "react";

/**
 * Generic KPI card: uppercase label + big mono value. Used across the
 * scorecard header and report page. Value may include a small suffix via
 * the `sub` prop (rendered lighter, e.g. "12 verdicts").
 */
export function KpiCard({ label, value, sub, children, style }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          marginTop: 4,
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {children ?? value}
        {sub && <small style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>{sub}</small>}
      </div>
    </div>
  );
}
