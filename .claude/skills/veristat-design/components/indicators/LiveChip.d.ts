import * as React from "react";

/**
 * "LIVE" pulse chip — pulsing green dot + label for live data panels.
 *
 * @startingPoint section="Indicators" subtitle="LIVE pulse chip" viewport="700x90"
 */
export interface LiveChipProps {
  /** @default "LIVE" */
  label?: string;
  style?: React.CSSProperties;
}

export function LiveChip(props: LiveChipProps): React.JSX.Element;
