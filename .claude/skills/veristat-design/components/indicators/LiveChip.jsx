import React from "react";

/**
 * "LIVE" pulse chip — a pulsing green dot + label used on the probe-activity
 * panel header. The pulse is CSS keyframes injected once per mount.
 */
export function LiveChip({ label = "LIVE", style }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 9px",
        borderRadius: "var(--radius-pill)",
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "var(--good)",
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.22)",
        ...style,
      }}
    >
      <style>{"@keyframes vs-pulse{0%,100%{opacity:1}50%{opacity:0.35}}"}</style>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--good)",
          boxShadow: "var(--glow-good)",
          animation: "vs-pulse 1.8s ease-in-out infinite",
        }}
      />
      {label}
    </span>
  );
}
