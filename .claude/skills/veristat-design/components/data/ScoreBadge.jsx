import React from "react";

/** Grayscale score half — light = high score, dark = low (monochrome ramp). */
function scoreColor(score) {
  if (score == null) return "#3a3b40";
  if (score >= 90) return "#ffffff";
  if (score >= 70) return "#b9babf";
  if (score >= 60) return "#7c7d83";
  return "#45464b";
}

/**
 * Embeddable provider score badge — "Veristat 94/100". A two-part pill: a dark
 * label half and a score half colored by the composite. Providers display it
 * live; it always reflects the current verified score.
 */
export function ScoreBadge({ score, label = "Veristat", style }) {
  const value = score == null ? "unscored" : `${Math.round(score)}/100`;
  const needDark = score != null && score >= 70; /* light halves take dark ink */
  return (
    <span
      style={{
        display: "inline-flex",
        height: 20,
        borderRadius: 3,
        overflow: "hidden",
        fontFamily: "Verdana, Geneva, var(--font-sans)",
        fontSize: 11,
        lineHeight: "20px",
        ...style,
      }}
    >
      <span style={{ background: "#0a0a0a", color: "#fafafa", padding: "0 8px" }}>{label}</span>
      <span
        style={{
          background: scoreColor(score),
          color: needDark ? "#08080a" : "#fafafa",
          padding: "0 8px",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </span>
  );
}
