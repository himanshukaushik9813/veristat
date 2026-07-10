import * as React from "react";

/**
 * Truncated tx/address hash linked to a block explorer — a core Veristat
 * visual element ("the hash is the proof"). Mono, tabular, with a ↗.
 *
 * @startingPoint section="Indicators" subtitle="Explorer-linked tx hash" viewport="700x90"
 */
export interface TxLinkProps {
  /** Full hash string, e.g. "0x7673b4…". */
  hash: string;
  /** Explorer URL. When omitted, renders as muted text (no link). */
  href?: string;
  /** Leading chars kept. @default 6 */
  lead?: number;
  /** Trailing chars kept. @default 4 */
  tail?: number;
  /** Show the ↗ arrow. @default true */
  arrow?: boolean;
  style?: React.CSSProperties;
}

export function TxLink(props: TxLinkProps): React.JSX.Element;

/** Truncate a hash to `0x7673b4…60f6`. */
export function truncateHash(hash: string, lead?: number, tail?: number): string;
