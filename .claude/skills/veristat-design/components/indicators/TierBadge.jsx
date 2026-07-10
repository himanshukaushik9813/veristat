import React from "react";

/** Verification-tier pill: T1 deterministic, T2 consensus, T3 operational-only. */
export function TierBadge({ tier = 3, style }) {
  return (
    <span
      title={
        tier === 1
          ? "Tier 1 — deterministic on-chain truth"
          : tier === 2
            ? "Tier 2 — consensus cross-reference"
            : "Tier 3 — operational only, accuracy not verified"
      }
      style={{
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: "var(--radius-pill)",
        fontSize: 11,
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
        ...style,
      }}
    >
      T{tier}
    </span>
  );
}
