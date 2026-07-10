import * as React from "react";

/**
 * Generic KPI card — uppercase label + big mono value (+ optional sub-suffix).
 *
 * @startingPoint section="Data" subtitle="KPI value card" viewport="700x140"
 */
export interface KpiCardProps {
  /** Uppercase eyebrow label. */
  label: string;
  /** Primary value (string or number). Ignored if `children` is given. */
  value?: React.ReactNode;
  /** Lighter suffix, e.g. "12 verdicts". */
  sub?: React.ReactNode;
  /** Custom value node (e.g. a grade chip + number). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function KpiCard(props: KpiCardProps): React.JSX.Element;
