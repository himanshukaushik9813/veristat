import * as React from "react";

/**
 * One dimension bar (0–100) from a scorecard breakdown. `value={null}` renders
 * "n/a" — accuracy that could not be objectively verified is never faked.
 *
 * @startingPoint section="Data" subtitle="Score dimension meter" viewport="700x110"
 */
export interface DimensionMeterProps {
  /** Dimension label, e.g. "Accuracy". */
  name: string;
  /** 0–100, or null for "not verified". */
  value: number | null;
  /** Fill color. @default "var(--accent)" */
  color?: string;
  style?: React.CSSProperties;
}

export function DimensionMeter(props: DimensionMeterProps): React.JSX.Element;
