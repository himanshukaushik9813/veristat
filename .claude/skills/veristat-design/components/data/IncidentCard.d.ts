import * as React from "react";

/**
 * Left-border incident record; the `kind` tag sets the accent color. Copy is a
 * measurement, never a characterization.
 *
 * @startingPoint section="Data" subtitle="Incident log card" viewport="700x130"
 */
export interface IncidentCardProps {
  /** @default "WRONG_ANSWER" */
  kind?: "WRONG_ANSWER" | "STALE_DATA" | "OVERCHARGE" | "HONEYPOT_FAILURE" | "GAMING_SUSPECTED" | "DISPUTE";
  /** Factual one-line summary. */
  summary?: React.ReactNode;
  /** Timestamp string (ISO or relative). */
  time?: string;
  /** Custom body (overrides `summary`). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function IncidentCard(props: IncidentCardProps): React.JSX.Element;
