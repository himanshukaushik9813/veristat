import * as React from "react";

/**
 * Expandable evidence row (<details>) with a mono summary and a key/value body.
 * Pair with `EvidenceKV` for each ledger field.
 *
 * @startingPoint section="Data" subtitle="Expandable evidence ledger row" viewport="700x200"
 */
export interface EvidenceRowProps {
  /** Summary line (probe id, template, inline verdict chips). */
  summary: React.ReactNode;
  /** Expanded body — usually EvidenceKV rows. */
  children?: React.ReactNode;
  /** Start expanded. @default false */
  open?: boolean;
  style?: React.CSSProperties;
}

export function EvidenceRow(props: EvidenceRowProps): React.JSX.Element;

export interface EvidenceKVProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

/** One key/value pair inside an EvidenceRow (mono value). */
export function EvidenceKV(props: EvidenceKVProps): React.JSX.Element;
