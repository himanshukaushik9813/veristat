import * as React from "react";

/**
 * Conflict-of-interest badge for Veristat's own self-listing (amber outline).
 *
 * @startingPoint section="Indicators" subtitle="Conflict-of-interest badge" viewport="700x90"
 */
export interface CoiBadgeProps {
  /** @default "Veristat itself — COI" */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function CoiBadge(props: CoiBadgeProps): React.JSX.Element;
