import React from "react";

/**
 * Expandable evidence row — a native <details> with a mono summary line (probe
 * id, template, inline verdict tags) that opens to a key/value ledger. Children
 * are the expanded body (kv rows, per-verdict lines).
 */
export function EvidenceRow({ summary, children, open = false, style }) {
  return (
    <details
      open={open}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "4px 16px 12px",
        margin: "10px 0",
        fontSize: 13,
        ...style,
      }}
    >
      <summary style={{ cursor: "pointer", padding: "10px 0", color: "var(--text-secondary)" }}>
        {summary}
      </summary>
      {children}
    </details>
  );
}

/** A single definition-list key/value pair inside an EvidenceRow (mono value). */
export function EvidenceKV({ label, children }) {
  return (
    <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "4px 12px", margin: "8px 0" }}>
      <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          wordBreak: "break-all",
          color: "var(--text-secondary)",
        }}
      >
        {children}
      </dd>
    </dl>
  );
}
