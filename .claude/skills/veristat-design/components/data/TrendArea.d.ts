import * as React from "react";

/**
 * Area sparkline — auto-scaled line, gradient fill, pulsing end dot.
 *
 * @startingPoint section="Data" subtitle="Filled area sparkline" viewport="700x90"
 */
export interface TrendAreaProps {
  values: number[];
  /** Stable id for gradient defs (unique per instance). */
  id?: string;
  /** @default 170 */
  width?: number;
  /** @default 44 */
  height?: number;
  /** @default "var(--accent)" */
  color?: string;
}

export function TrendArea(props: TrendAreaProps): React.JSX.Element;
