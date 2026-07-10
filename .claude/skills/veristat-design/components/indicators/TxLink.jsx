import React from "react";

/** Truncate a 0x… hash to `0x7673b4…60f6`. */
export function truncateHash(hash, lead = 6, tail = 4) {
  if (!hash) return "";
  if (hash.length <= lead + tail + 1) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

/**
 * Truncated transaction / address hash linked to a block explorer — a core
 * Veristat visual element. The hash IS the proof, so it always reads in mono
 * and (when a URL is present) links out with a ↗.
 */
export function TxLink({ hash, href, lead = 6, tail = 4, arrow = true, style }) {
  const text = truncateHash(hash, lead, tail);
  const shared = {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    fontSize: 12,
    ...style,
  };
  if (!href) {
    return <span style={{ ...shared, color: "var(--text-secondary)" }}>{text}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" title={hash} style={{ ...shared, color: "var(--accent)" }}>
      {text}
      {arrow && <span aria-hidden> ↗</span>}
    </a>
  );
}
