import React from "react";

const BANDS = {
  a: { bg: "var(--grade-a)", fg: "var(--grade-ink-dark)" },
  b: { bg: "var(--grade-b)", fg: "var(--grade-ink-dark)" },
  c: { bg: "var(--grade-c)", fg: "var(--grade-ink-dark)" },
  d: { bg: "var(--grade-d)", fg: "#fafafa" },
  f: { bg: "var(--grade-f)", fg: "#fafafa" },
};

/** Map a letter grade (A+, B-, C, F…) to its color band. */
export function gradeBand(grade) {
  const letter = (grade?.[0] ?? "f").toLowerCase();
  return ["a", "b", "c", "d"].includes(letter) ? letter : "f";
}

const SIZES = {
  sm: { minWidth: 30, height: 22, fontSize: 12, padding: "0 7px" },
  md: { minWidth: 34, height: 26, fontSize: 14, padding: "0 8px" },
  lg: { minWidth: 52, height: 44, fontSize: 22, padding: "0 12px", borderRadius: "var(--radius-md)" },
};

/**
 * Solid letter-grade block. Grades are opaque and unambiguous — mono, bold.
 * Amber (C) and orange (D) carry dark ink for contrast.
 */
export function GradeChip({ grade, size = "md", style }) {
  const band = gradeBand(grade);
  const { bg, fg } = BANDS[band];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        background: bg,
        color: fg,
        ...SIZES[size],
        ...style,
      }}
    >
      {grade}
    </span>
  );
}
