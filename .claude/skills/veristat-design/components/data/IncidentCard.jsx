import React from "react";

const KIND_COLOR = {
  WRONG_ANSWER: "var(--critical)",
  STALE_DATA: "var(--warning)",
  OVERCHARGE: "var(--serious)",
  HONEYPOT_FAILURE: "var(--critical)",
  GAMING_SUSPECTED: "var(--serious)",
  DISPUTE: "var(--warning)",
};

/**
 * Incident card: a left-border-accented factual record. The kind tag drives
 * the border + tag color. Copy is always a measurement, never a judgement
 * ("returned X when the contract read Y").
 */
export function IncidentCard({ kind = "WRONG_ANSWER", summary, time, children, style }) {
  const color = KIND_COLOR[kind] ?? "var(--critical)";
  return (
    <div
      style={{
        borderLeft: `3px solid ${color}`,
        padding: "8px 12px",
        margin: "8px 0",
        background: "var(--surface-1)",
        borderRadius: "0 8px 8px 0",
        fontSize: 13,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {kind}
      </span>
      {time && (
        <>
          {" · "}
          <time style={{ color: "var(--text-muted)", fontSize: 12 }}>{time}</time>
        </>
      )}
      <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>{children ?? summary}</div>
    </div>
  );
}
