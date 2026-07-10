import * as React from "react";

/**
 * Solid, opaque letter-grade block (A+…F). Mono, bold, unambiguous.
 *
 * @startingPoint section="Indicators" subtitle="Letter-grade chips A–F" viewport="700x100"
 */
export interface GradeChipProps {
  /** Letter grade, e.g. "A", "B+", "C-", "F". */
  grade: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function GradeChip(props: GradeChipProps): React.JSX.Element;

/** Map a letter grade to its color band ("a"|"b"|"c"|"d"|"f"). */
export function gradeBand(grade: string): "a" | "b" | "c" | "d" | "f";
