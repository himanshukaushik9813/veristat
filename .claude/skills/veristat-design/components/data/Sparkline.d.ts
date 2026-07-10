import * as React from "react";

/**
 * Tiny single-series trend line (fixed 0–100 domain). Renders "—" for <2 points.
 *
 * @startingPoint section="Data" subtitle="0–100 trend sparkline" viewport="700x90"
 */
export interface SparklineProps {
  values: number[];
  /** @default 110 */
  width?: number;
  /** @default 26 */
  height?: number;
  /** Stroke color. @default "var(--series-1)" */
  color?: string;
}

export function Sparkline(props: SparklineProps): React.JSX.Element;
