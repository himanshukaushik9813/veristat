import * as React from "react";

/**
 * Landing stat-panel cell — icon tile, label, big mono value, caption + delta,
 * and a trend chart. The top edge lights up in `color`.
 *
 * @startingPoint section="Data" subtitle="Landing metric card with trend" viewport="700x220"
 */
export interface StatCardProps {
  /** Icon SVG node. */
  icon?: React.ReactNode;
  label: string;
  /** Big value (usually a mono number). */
  value: React.ReactNode;
  caption?: React.ReactNode;
  /** e.g. "+124 today" (green pill). */
  delta?: React.ReactNode;
  /** Accent color for icon + top edge. @default "var(--accent)" */
  color?: string;
  /** Chart node pinned to the bottom (e.g. <TrendArea/>). */
  chart?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatCard(props: StatCardProps): React.JSX.Element;
