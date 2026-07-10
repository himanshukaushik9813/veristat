import React from "react";

/**
 * One row of the five-dimension breakdown: label, thin track with a rounded
 * data fill, and the value in text ink. When `value` is null the dimension is
 * "n/a" — Veristat never fabricates a number (Tier-3 accuracy).
 */
export function DimensionMeter({ name, value, color = "var(--accent)", style }) {
  const na = value === null || value === undefined;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr 48px",
        gap: 10,
        alignItems: "center",
        margin: "6px 0",
        fontSize: 13,
        ...style,
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{name}</span>
      <span style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${na ? 0 : Math.max(0, Math.min(100, value))}%`,
            background: color,
            borderRadius: 4,
          }}
        />
      </span>
      <span
        title={na ? "Tier 3: never fabricated" : undefined}
        style={{
          textAlign: "right",
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          color: na ? "var(--text-muted)" : "var(--text-primary)",
        }}
      >
        {na ? "n/a" : value.toFixed(0)}
      </span>
    </div>
  );
}
