import * as React from "react";

/**
 * Per-dimension verdict tag (pass / fail / inconclusive). Mono, tiny — the
 * atom of the evidence ledger.
 *
 * @startingPoint section="Indicators" subtitle="Per-dimension verdict tags" viewport="700x100"
 */
export interface VerdictChipProps {
  /** @default "inconclusive" */
  verdict?: "pass" | "fail" | "inconclusive" | "unverifiable";
  /** Dimension name, e.g. "accuracy" — shown as label / abbreviation. */
  dimension?: string;
  /** Render as `acc:✓` instead of `accuracy:pass`. @default false */
  abbrev?: boolean;
  style?: React.CSSProperties;
}

export function VerdictChip(props: VerdictChipProps): React.JSX.Element;
