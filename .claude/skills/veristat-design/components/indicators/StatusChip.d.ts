import * as React from "react";

/**
 * Probe-outcome status pill (landing feed / anchor bar).
 *
 * @startingPoint section="Indicators" subtitle="Probe-outcome status pills" viewport="700x100"
 */
export interface StatusChipProps {
  /** @default "unverified" */
  status?: "correct" | "incorrect" | "stale" | "overcharge" | "failed" | "unverified" | "confirmed";
  /** Override the default label for the state. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatusChip(props: StatusChipProps): React.JSX.Element;
