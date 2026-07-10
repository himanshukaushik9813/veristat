import * as React from "react";

/**
 * Verification-tier pill (T1/T2/T3), with an explanatory title.
 *
 * @startingPoint section="Indicators" subtitle="Verification-tier pills T1–T3" viewport="700x90"
 */
export interface TierBadgeProps {
  /** @default 3 */
  tier?: 1 | 2 | 3;
  style?: React.CSSProperties;
}

export function TierBadge(props: TierBadgeProps): React.JSX.Element;
