import * as React from "react";

/**
 * Embeddable provider score badge ("Veristat 94/100") — a two-part pill colored
 * by the composite score. Mirrors the live /api/badge SVG.
 *
 * @startingPoint section="Data" subtitle="Embeddable score badge" viewport="700x90"
 */
export interface ScoreBadgeProps {
  /** Composite 0–100, or null for "unscored". */
  score: number | null;
  /** Left-half label. @default "Veristat" */
  label?: string;
  style?: React.CSSProperties;
}

export function ScoreBadge(props: ScoreBadgeProps): React.JSX.Element;
