import React from "react";

/**
 * Landing stat-panel cell: colored icon tile, label, big animated-looking mono
 * value, caption + optional "+N today" delta, and a trend area at the bottom.
 * The top edge lights up in the stat color on hover.
 */
export function StatCard({ icon, label, value, caption, delta, color = "var(--accent)", chart, style }) {
  return (
    <div
      style={{
        position: "relative",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        ["--stat-c"]: color,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.5,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {icon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 9,
              color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
              boxShadow: `0 0 14px color-mix(in srgb, ${color} 18%, transparent)`,
            }}
          >
            {icon}
          </span>
        )}
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          margin: "12px 0 2px",
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        {caption}
        {delta && (
          <span
            style={{
              display: "inline-block",
              marginLeft: 8,
              padding: "1px 7px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              color: "var(--good)",
              background: "rgba(255, 255, 255, 0.10)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      {chart && <div style={{ marginTop: "auto" }}>{chart}</div>}
    </div>
  );
}
