/* @ds-bundle: {"format":4,"namespace":"VeristatDesignSystem_aac6ad","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"DimensionMeter","sourcePath":"components/data/DimensionMeter.jsx"},{"name":"EvidenceRow","sourcePath":"components/data/EvidenceRow.jsx"},{"name":"EvidenceKV","sourcePath":"components/data/EvidenceRow.jsx"},{"name":"IncidentCard","sourcePath":"components/data/IncidentCard.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"ScoreBadge","sourcePath":"components/data/ScoreBadge.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"TrendArea","sourcePath":"components/data/TrendArea.jsx"},{"name":"CoiBadge","sourcePath":"components/indicators/CoiBadge.jsx"},{"name":"GradeChip","sourcePath":"components/indicators/GradeChip.jsx"},{"name":"LiveChip","sourcePath":"components/indicators/LiveChip.jsx"},{"name":"StatusChip","sourcePath":"components/indicators/StatusChip.jsx"},{"name":"TierBadge","sourcePath":"components/indicators/TierBadge.jsx"},{"name":"TxLink","sourcePath":"components/indicators/TxLink.jsx"},{"name":"VerdictChip","sourcePath":"components/indicators/VerdictChip.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"cd87d5708397","components/data/DimensionMeter.jsx":"806051fd0234","components/data/EvidenceRow.jsx":"72e28cef3af9","components/data/IncidentCard.jsx":"b708e51b3320","components/data/KpiCard.jsx":"308209d50979","components/data/ScoreBadge.jsx":"93ba4a4b21e2","components/data/Sparkline.jsx":"77e51e207166","components/data/StatCard.jsx":"a6795723acde","components/data/TrendArea.jsx":"f95b39fb3f2d","components/indicators/CoiBadge.jsx":"3c53251b52e2","components/indicators/GradeChip.jsx":"3ecae793d216","components/indicators/LiveChip.jsx":"09358615bcca","components/indicators/StatusChip.jsx":"aae5aface53e","components/indicators/TierBadge.jsx":"38cd1eea1743","components/indicators/TxLink.jsx":"bc7e5743d3ad","components/indicators/VerdictChip.jsx":"e20d50d97c6a","ui_kits/web/App.jsx":"be08684d9c53","ui_kits/web/chrome.jsx":"6152d2cc11a7","ui_kits/web/data.js":"54554ad43986","ui_kits/web/docs.jsx":"6fe5a3fd120a","ui_kits/web/screens.jsx":"5b6b3ab955c1"},"inlinedExternals":[],"unexposedExports":[{"name":"gradeBand","sourcePath":"components/indicators/GradeChip.jsx"},{"name":"truncateHash","sourcePath":"components/indicators/TxLink.jsx"}]} */

(() => {

const __ds_ns = (window.VeristatDesignSystem_aac6ad = window.VeristatDesignSystem_aac6ad || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: "7px 14px",
    fontSize: 13,
    borderRadius: "var(--radius-md)"
  },
  md: {
    padding: "10px 20px",
    fontSize: 14,
    borderRadius: "var(--radius-lg)"
  },
  lg: {
    padding: "14px 28px",
    fontSize: 16,
    borderRadius: "var(--radius-lg)"
  }
};

/**
 * Veristat button. Primary is a glowing accent fill; ghost is a glass-blur
 * outline; secondary is a quiet raised surface. Renders an <a> when `href`
 * is set, otherwise a <button>.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconRight,
  disabled = false,
  onClick,
  type = "button",
  style,
  ...rest
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    border: "1px solid transparent",
    transition: "background var(--dur-base) ease, border-color var(--dur-base) ease, opacity var(--dur-base) ease",
    opacity: disabled ? 0.5 : 1,
    ...SIZES[size]
  };
  const variants = {
    primary: {
      background: "var(--accent-strong)",
      color: "#08080a",
      boxShadow: "var(--glow-accent)"
    },
    ghost: {
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)"
    },
    secondary: {
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)"
    }
  };
  const merged = {
    ...base,
    ...variants[variant],
    ...style
  };
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      display: "inline-flex"
    }
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      display: "inline-flex"
    }
  }, iconRight));
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      style: merged,
      onClick: onClick
    }, rest), content);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    style: merged,
    disabled: disabled,
    onClick: onClick
  }, rest), content);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/data/DimensionMeter.jsx
try { (() => {
/**
 * One row of the five-dimension breakdown: label, thin track with a rounded
 * data fill, and the value in text ink. When `value` is null the dimension is
 * "n/a" — Veristat never fabricates a number (Tier-3 accuracy).
 */
function DimensionMeter({
  name,
  value,
  color = "var(--accent)",
  style
}) {
  const na = value === null || value === undefined;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "90px 1fr 48px",
      gap: 10,
      alignItems: "center",
      margin: "6px 0",
      fontSize: 13,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 8,
      background: "var(--surface-2)",
      borderRadius: 4,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      height: "100%",
      width: `${na ? 0 : Math.max(0, Math.min(100, value))}%`,
      background: color,
      borderRadius: 4
    }
  })), /*#__PURE__*/React.createElement("span", {
    title: na ? "Tier 3: never fabricated" : undefined,
    style: {
      textAlign: "right",
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      color: na ? "var(--text-muted)" : "var(--text-primary)"
    }
  }, na ? "n/a" : value.toFixed(0)));
}
Object.assign(__ds_scope, { DimensionMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DimensionMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/EvidenceRow.jsx
try { (() => {
/**
 * Expandable evidence row — a native <details> with a mono summary line (probe
 * id, template, inline verdict tags) that opens to a key/value ledger. Children
 * are the expanded body (kv rows, per-verdict lines).
 */
function EvidenceRow({
  summary,
  children,
  open = false,
  style
}) {
  return /*#__PURE__*/React.createElement("details", {
    open: open,
    style: {
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "4px 16px 12px",
      margin: "10px 0",
      fontSize: 13,
      ...style
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      padding: "10px 0",
      color: "var(--text-secondary)"
    }
  }, summary), children);
}

/** A single definition-list key/value pair inside an EvidenceRow (mono value). */
function EvidenceKV({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "140px 1fr",
      gap: "4px 12px",
      margin: "8px 0"
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      wordBreak: "break-all",
      color: "var(--text-secondary)"
    }
  }, children));
}
Object.assign(__ds_scope, { EvidenceRow, EvidenceKV });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/EvidenceRow.jsx", error: String((e && e.message) || e) }); }

// components/data/IncidentCard.jsx
try { (() => {
const KIND_COLOR = {
  WRONG_ANSWER: "var(--critical)",
  STALE_DATA: "var(--warning)",
  OVERCHARGE: "var(--serious)",
  HONEYPOT_FAILURE: "var(--critical)",
  GAMING_SUSPECTED: "var(--serious)",
  DISPUTE: "var(--warning)"
};

/**
 * Incident card: a left-border-accented factual record. The kind tag drives
 * the border + tag color. Copy is always a measurement, never a judgement
 * ("returned X when the contract read Y").
 */
function IncidentCard({
  kind = "WRONG_ANSWER",
  summary,
  time,
  children,
  style
}) {
  const color = KIND_COLOR[kind] ?? "var(--critical)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: `3px solid ${color}`,
      padding: "8px 12px",
      margin: "8px 0",
      background: "var(--surface-1)",
      borderRadius: "0 8px 8px 0",
      fontSize: 13,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }
  }, kind), time && /*#__PURE__*/React.createElement(React.Fragment, null, " · ", /*#__PURE__*/React.createElement("time", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-secondary)",
      marginTop: 2
    }
  }, children ?? summary));
}
Object.assign(__ds_scope, { IncidentCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/IncidentCard.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiCard.jsx
try { (() => {
/**
 * Generic KPI card: uppercase label + big mono value. Used across the
 * scorecard header and report page. Value may include a small suffix via
 * the `sub` prop (rendered lighter, e.g. "12 verdicts").
 */
function KpiCard({
  label,
  value,
  sub,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      marginTop: 4,
      color: "var(--text-primary)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, children ?? value, sub && /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      color: "var(--text-secondary)"
    }
  }, sub)));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ScoreBadge.jsx
try { (() => {
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
function ScoreBadge({
  score,
  label = "Veristat",
  style
}) {
  const value = score == null ? "unscored" : `${Math.round(score)}/100`;
  const needDark = score != null && score >= 70; /* light halves take dark ink */
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      height: 20,
      borderRadius: 3,
      overflow: "hidden",
      fontFamily: "Verdana, Geneva, var(--font-sans)",
      fontSize: 11,
      lineHeight: "20px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#0a0a0a",
      color: "#fafafa",
      padding: "0 8px"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      background: scoreColor(score),
      color: needDark ? "#08080a" : "#fafafa",
      padding: "0 8px",
      fontWeight: 700
    }
  }, value));
}
Object.assign(__ds_scope, { ScoreBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScoreBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
/**
 * Tiny single-series trend line on a fixed 0–100 domain — no axes, no legend.
 * Used in leaderboard rows and scorecards.
 */
function Sparkline({
  values = [],
  width = 110,
  height = 26,
  color = "var(--series-1)"
}) {
  if (values.length < 2) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: 12
      }
    }, "\u2014");
  }
  const pad = 2;
  const step = (width - pad * 2) / (values.length - 1);
  const y = v => pad + (height - pad * 2) * (1 - Math.max(0, Math.min(100, v)) / 100);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height,
    role: "img",
    "aria-label": `trend, now ${last.toFixed(0)}`,
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pad + (values.length - 1) * step,
    cy: y(last),
    r: "2.5",
    fill: color
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
/**
 * Landing stat-panel cell: colored icon tile, label, big animated-looking mono
 * value, caption + optional "+N today" delta, and a trend area at the bottom.
 * The top edge lights up in the stat color on hover.
 */
function StatCard({
  icon,
  label,
  value,
  caption,
  delta,
  color = "var(--accent)",
  chart,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      ["--stat-c"]: color,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: 9,
      color,
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      boxShadow: `0 0 14px color-mix(in srgb, ${color} 18%, transparent)`
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      margin: "12px 0 2px",
      letterSpacing: "-0.01em",
      color: "var(--text-primary)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)",
      marginBottom: 12
    }
  }, caption, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      marginLeft: 8,
      padding: "1px 7px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "var(--font-mono)",
      color: "var(--good)",
      background: "rgba(255, 255, 255, 0.10)"
    }
  }, delta)), chart && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, chart));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/TrendArea.jsx
try { (() => {
/**
 * Area sparkline: auto-scaled line with a gradient fill and a gently pulsing
 * end dot. Pass a stable `id` so multiple instances don't share gradient defs.
 */
function TrendArea({
  values = [],
  id = "0",
  width = 170,
  height = 44,
  color = "var(--accent)"
}) {
  if (values.length < 2) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: 12
      }
    }, "\u2014");
  }
  const pad = 3;
  const max = Math.max(...values, 1);
  const step = (width - pad * 2) / (values.length - 1);
  const y = v => pad + (height - pad * 2) * (1 - Math.max(0, v) / max);
  const pts = values.map((v, i) => [pad + i * step, y(v)]);
  const line = pts.map(([x, py], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height,
    role: "img",
    "aria-label": "trend",
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `ta-${id}`,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0.02"
  }))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#ta-${id})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: lx,
    cy: ly,
    r: "3",
    fill: color,
    opacity: "0.9"
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "3;4.5;3",
    dur: "2.2s",
    repeatCount: "indefinite"
  }), /*#__PURE__*/React.createElement("animate", {
    attributeName: "opacity",
    values: "0.9;0.4;0.9",
    dur: "2.2s",
    repeatCount: "indefinite"
  })));
}
Object.assign(__ds_scope, { TrendArea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TrendArea.jsx", error: String((e && e.message) || e) }); }

// components/indicators/CoiBadge.jsx
try { (() => {
/**
 * Conflict-of-interest badge shown on Veristat's own self-listing. Amber
 * outline — the brand names its own bias rather than hiding it.
 */
function CoiBadge({
  children = "Veristat itself — COI",
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "var(--radius-xs)",
      fontSize: 12,
      background: "var(--surface-2)",
      color: "var(--warning)",
      border: "1px solid var(--warning)",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { CoiBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/CoiBadge.jsx", error: String((e && e.message) || e) }); }

// components/indicators/GradeChip.jsx
try { (() => {
const BANDS = {
  a: {
    bg: "var(--grade-a)",
    fg: "var(--grade-ink-dark)"
  },
  b: {
    bg: "var(--grade-b)",
    fg: "var(--grade-ink-dark)"
  },
  c: {
    bg: "var(--grade-c)",
    fg: "var(--grade-ink-dark)"
  },
  d: {
    bg: "var(--grade-d)",
    fg: "#fafafa"
  },
  f: {
    bg: "var(--grade-f)",
    fg: "#fafafa"
  }
};

/** Map a letter grade (A+, B-, C, F…) to its color band. */
function gradeBand(grade) {
  const letter = (grade?.[0] ?? "f").toLowerCase();
  return ["a", "b", "c", "d"].includes(letter) ? letter : "f";
}
const SIZES = {
  sm: {
    minWidth: 30,
    height: 22,
    fontSize: 12,
    padding: "0 7px"
  },
  md: {
    minWidth: 34,
    height: 26,
    fontSize: 14,
    padding: "0 8px"
  },
  lg: {
    minWidth: 52,
    height: 44,
    fontSize: 22,
    padding: "0 12px",
    borderRadius: "var(--radius-md)"
  }
};

/**
 * Solid letter-grade block. Grades are opaque and unambiguous — mono, bold.
 * Amber (C) and orange (D) carry dark ink for contrast.
 */
function GradeChip({
  grade,
  size = "md",
  style
}) {
  const band = gradeBand(grade);
  const {
    bg,
    fg
  } = BANDS[band];
  return /*#__PURE__*/React.createElement("span", {
    style: {
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
      ...style
    }
  }, grade);
}
Object.assign(__ds_scope, { gradeBand, GradeChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/GradeChip.jsx", error: String((e && e.message) || e) }); }

// components/indicators/LiveChip.jsx
try { (() => {
/**
 * "LIVE" pulse chip — a pulsing green dot + label used on the probe-activity
 * panel header. The pulse is CSS keyframes injected once per mount.
 */
function LiveChip({
  label = "LIVE",
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "2px 9px",
      borderRadius: "var(--radius-pill)",
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: "0.1em",
      color: "var(--good)",
      background: "rgba(255, 255, 255, 0.08)",
      border: "1px solid rgba(255, 255, 255, 0.22)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes vs-pulse{0%,100%{opacity:1}50%{opacity:0.35}}"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--good)",
      boxShadow: "var(--glow-good)",
      animation: "vs-pulse 1.8s ease-in-out infinite"
    }
  }), label);
}
Object.assign(__ds_scope, { LiveChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/LiveChip.jsx", error: String((e && e.message) || e) }); }

// components/indicators/StatusChip.jsx
try { (() => {
const STATES = {
  correct: {
    bg: "var(--good-tint)",
    fg: "var(--good)",
    label: "✓ Correct"
  },
  incorrect: {
    bg: "var(--critical-tint)",
    fg: "var(--critical)",
    label: "Incorrect"
  },
  stale: {
    bg: "var(--warning-tint)",
    fg: "var(--warning)",
    label: "Stale"
  },
  overcharge: {
    bg: "var(--serious-tint)",
    fg: "var(--serious)",
    label: "Overcharge"
  },
  failed: {
    bg: "var(--critical-tint)",
    fg: "var(--critical)",
    label: "Failed"
  },
  unverified: {
    bg: "var(--surface-2)",
    fg: "var(--text-muted)",
    label: "Unverified"
  },
  confirmed: {
    bg: "var(--good-tint)",
    fg: "var(--good)",
    label: "✓ Confirmed"
  }
};

/**
 * Rounded pill summarizing a probe's outcome on the landing feed & anchor bar.
 * Pass `children` to override the default label for a state.
 */
function StatusChip({
  status = "unverified",
  children,
  style
}) {
  const s = STATES[status] ?? STATES.unverified;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "2px 9px",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 600,
      fontFamily: "var(--font-sans)",
      background: s.bg,
      color: s.fg,
      ...style
    }
  }, children ?? s.label);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/indicators/TierBadge.jsx
try { (() => {
/** Verification-tier pill: T1 deterministic, T2 consensus, T3 operational-only. */
function TierBadge({
  tier = 3,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    title: tier === 1 ? "Tier 1 — deterministic on-chain truth" : tier === 2 ? "Tier 2 — consensus cross-reference" : "Tier 3 — operational only, accuracy not verified",
    style: {
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: "var(--radius-pill)",
      fontSize: 11,
      border: "1px solid var(--border)",
      color: "var(--text-secondary)",
      fontFamily: "var(--font-mono)",
      ...style
    }
  }, "T", tier);
}
Object.assign(__ds_scope, { TierBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/TierBadge.jsx", error: String((e && e.message) || e) }); }

// components/indicators/TxLink.jsx
try { (() => {
/** Truncate a 0x… hash to `0x7673b4…60f6`. */
function truncateHash(hash, lead = 6, tail = 4) {
  if (!hash) return "";
  if (hash.length <= lead + tail + 1) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

/**
 * Truncated transaction / address hash linked to a block explorer — a core
 * Veristat visual element. The hash IS the proof, so it always reads in mono
 * and (when a URL is present) links out with a ↗.
 */
function TxLink({
  hash,
  href,
  lead = 6,
  tail = 4,
  arrow = true,
  style
}) {
  const text = truncateHash(hash, lead, tail);
  const shared = {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    fontSize: 12,
    ...style
  };
  if (!href) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        ...shared,
        color: "var(--text-secondary)"
      }
    }, text);
  }
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noreferrer",
    title: hash,
    style: {
      ...shared,
      color: "var(--accent)"
    }
  }, text, arrow && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, " \u2197"));
}
Object.assign(__ds_scope, { truncateHash, TxLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/TxLink.jsx", error: String((e && e.message) || e) }); }

// components/indicators/VerdictChip.jsx
try { (() => {
const V = {
  pass: {
    bg: "var(--good-tint)",
    fg: "var(--good)",
    mark: "✓"
  },
  fail: {
    bg: "var(--critical-tint)",
    fg: "var(--critical)",
    mark: "✗"
  },
  inconclusive: {
    bg: "var(--surface-2)",
    fg: "var(--text-muted)",
    mark: "–"
  },
  unverifiable: {
    bg: "var(--surface-2)",
    fg: "var(--text-muted)",
    mark: "–"
  }
};

/**
 * Compact mono verdict tag for a single dimension — the atom of the evidence
 * ledger. Shows either the raw verdict word or a `dim:✓` abbreviation.
 */
function VerdictChip({
  verdict = "inconclusive",
  dimension,
  abbrev = false,
  style
}) {
  const v = V[verdict] ?? V.inconclusive;
  let text;
  if (abbrev && dimension) text = `${dimension.slice(0, 3)}:${v.mark}`;else if (dimension) text = `${dimension}:${verdict}`;else text = verdict;
  return /*#__PURE__*/React.createElement("span", {
    title: dimension,
    style: {
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: "var(--radius-xs)",
      fontSize: 11,
      fontFamily: "var(--font-mono)",
      background: v.bg,
      color: v.fg,
      ...style
    }
  }, text);
}
Object.assign(__ds_scope, { VerdictChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/indicators/VerdictChip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/App.jsx
try { (() => {
// Veristat web UI kit — router shell wiring the screens together.
const {
  useState,
  useCallback
} = React;
function App() {
  const [route, setRoute] = useState("landing");
  const [serviceId, setServiceId] = useState(1);
  const go = useCallback((r, id) => {
    if (id != null) setServiceId(id);
    setRoute(r);
    window.scrollTo({
      top: 0
    });
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(window.VS_NavBar, {
    route: route,
    go: go
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "20px 32px 64px"
    }
  }, route === "landing" && /*#__PURE__*/React.createElement(window.VS_Landing, {
    go: go
  }), route === "leaderboard" && /*#__PURE__*/React.createElement(window.VS_Leaderboard, {
    go: go
  }), route === "service" && /*#__PURE__*/React.createElement(window.VS_Scorecard, {
    id: serviceId,
    go: go
  }), (route === "docs" || route === "report") && /*#__PURE__*/React.createElement(window.VS_Docs, {
    go: go
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/chrome.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Veristat web UI kit — shared chrome: nav, hero pipeline, footer, icons.
const {
  useState
} = React;
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
};
function LogoMark() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 26 26",
    fill: "none",
    "aria-hidden": true,
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 1.5 22.5 6v7.2c0 5.4-3.9 9.4-9.5 11.3C7.4 22.6 3.5 18.6 3.5 13.2V6L13 1.5Z",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.8 13.2l2.9 2.9 5.5-5.9",
    stroke: "var(--accent)",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
function NavBar({
  route,
  go
}) {
  const items = [["leaderboard", "Leaderboard"], ["report", "Reports"], ["api", "API"], ["mcp", "MCP Server"], ["docs", "Docs"], ["about", "About"]];
  const active = k => route === k || k === "leaderboard" && route === "service";
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 60,
      background: "var(--glass-nav)",
      backdropFilter: "var(--blur-nav)",
      WebkitBackdropFilter: "var(--blur-nav)",
      borderBottom: "1px solid rgba(109,126,248,0.16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      gap: 28,
      padding: "12px 32px"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("landing");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: "0.14em",
      color: "var(--text-primary)",
      textDecoration: "none",
      filter: "drop-shadow(0 0 10px rgba(109,126,248,0.4))"
    }
  }, /*#__PURE__*/React.createElement(LogoMark, null), " VERISTAT"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13.5,
      margin: "0 auto"
    }
  }, items.map(([k, label]) => /*#__PURE__*/React.createElement("a", {
    key: k,
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(k === "api" || k === "mcp" || k === "about" ? "docs" : k);
    },
    style: {
      position: "relative",
      padding: "7px 12px",
      borderRadius: 8,
      textDecoration: "none",
      whiteSpace: "nowrap",
      color: active(k) ? "var(--text-primary)" : "var(--text-secondary)"
    }
  }, label, active(k) && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: -13,
      height: 2,
      background: "var(--accent)",
      borderRadius: 2,
      boxShadow: "0 0 8px var(--accent)"
    }
  })))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("docs");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "var(--accent-strong)",
      color: "#08080a",
      borderRadius: 10,
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 600,
      textDecoration: "none",
      boxShadow: "0 0 24px rgba(255,255,255,0.14)"
    }
  }, "Get Early Access ", /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, "\u2197"))));
}
const PIPE_ICONS = {
  discover: {
    c: "#ffffff",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("circle", _extends({
      cx: "15",
      cy: "15",
      r: "8.5"
    }, stroke)), /*#__PURE__*/React.createElement("path", _extends({
      d: "M21.5 21.5 28 28"
    }, stroke, {
      strokeWidth: 2.4
    })))
  },
  pay: {
    c: "#d6d7db",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("rect", _extends({
      x: "4",
      y: "9",
      width: "26",
      height: "17",
      rx: "3"
    }, stroke)), /*#__PURE__*/React.createElement("path", _extends({
      d: "M4 14h26"
    }, stroke)), /*#__PURE__*/React.createElement("circle", _extends({
      cx: "23",
      cy: "20.5",
      r: "2.4"
    }, stroke)))
  },
  probe: {
    c: "#b7b8bd",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("path", _extends({
      d: "M3 18h6l3-9 5 16 4-11 2 4h8"
    }, stroke, {
      strokeWidth: 2.2
    })))
  },
  verify: {
    c: "#ffffff",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("path", _extends({
      d: "M17 3.5 27.5 8v8c0 6-4.3 10.5-10.5 12.5C10.8 26.5 6.5 22 6.5 16V8L17 3.5Z"
    }, stroke)), /*#__PURE__*/React.createElement("path", _extends({
      d: "M12.5 16.5l3.2 3.2 6-6.5"
    }, stroke, {
      strokeWidth: 2.2
    })))
  },
  score: {
    c: "#9a9ba0",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M8 27V15",
      stroke: "#ffffff",
      strokeWidth: 3.4,
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17 27V7",
      stroke: "#b7b8bd",
      strokeWidth: 3.4,
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M26 27V19",
      stroke: "#6f7075",
      strokeWidth: 3.4,
      strokeLinecap: "round",
      fill: "none"
    }))
  },
  publish: {
    c: "#c9cace",
    svg: /*#__PURE__*/React.createElement("svg", {
      width: "34",
      height: "34",
      viewBox: "0 0 34 34"
    }, /*#__PURE__*/React.createElement("path", _extends({
      d: "M17 4 29 10.5v13L17 30 5 23.5v-13L17 4Z"
    }, stroke)), /*#__PURE__*/React.createElement("path", _extends({
      d: "M17 4v13M5 10.5l12 6.5M29 10.5l-12 6.5M17 30V17"
    }, stroke, {
      strokeWidth: 1.4,
      opacity: 0.7
    })))
  }
};
const PIPE_STEPS = [["discover", "Discover", "AI Services (OKX · Bazaar)"], ["pay", "Pay", "x402 Payment (Real Money)"], ["probe", "Probe", "Adversarial Queries"], ["verify", "Verify", "On-Chain Truth"], ["score", "Score", "5 Dimensions 0–100"], ["publish", "Publish", "Evidence On-Chain"]];

// Delay (s) at which the traveling pulse reaches tile i's center — keeps the
// per-tile flare exactly in step with the connector dot (loop 4.8s, travel 60%).
const PULSE_LOOP = 4.8;
const pulseDelay = i => PULSE_LOOP * 0.6 * ((i + 0.5) / 6 * 100 - 2) / 96;
function Pipeline() {
  return /*#__PURE__*/React.createElement("div", {
    className: "vs-pipeline",
    style: {
      position: "relative",
      margin: "44px 0 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    className: "vs-pipe-rail"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    className: "vs-pipe-dot"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 16,
      position: "relative"
    }
  }, PIPE_STEPS.map(([id, name, cap], i) => {
    const ic = PIPE_ICONS[id];
    const delay = `${pulseDelay(i).toFixed(2)}s`;
    return /*#__PURE__*/React.createElement("div", {
      key: id,
      style: {
        textAlign: "center",
        padding: "0 8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-primary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--accent)",
        fontFamily: "var(--font-mono)",
        marginRight: 2
      }
    }, i + 1, "."), " ", name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        lineHeight: 1.4,
        margin: "4px 0 16px",
        minHeight: 34
      }
    }, cap), /*#__PURE__*/React.createElement("div", {
      className: "vs-pipe-tile",
      style: {
        position: "relative",
        width: 92,
        height: 92,
        margin: "0 auto",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: ic.c,
        background: `linear-gradient(135deg, color-mix(in srgb, ${ic.c} 14%, rgba(16,19,36,0.92)), rgba(8,10,22,0.96))`,
        border: `1px solid color-mix(in srgb, ${ic.c} 40%, transparent)`,
        boxShadow: `0 0 22px color-mix(in srgb, ${ic.c} 22%, transparent), inset 0 0 26px color-mix(in srgb, ${ic.c} 12%, transparent)`,
        filter: `drop-shadow(0 0 8px color-mix(in srgb, ${ic.c} 40%, transparent))`,
        animationDelay: delay
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      className: "vs-pipe-flare",
      style: {
        position: "absolute",
        inset: -1,
        borderRadius: 16,
        pointerEvents: "none",
        border: `1px solid ${ic.c}`,
        boxShadow: `0 0 26px ${ic.c}, inset 0 0 22px color-mix(in srgb, ${ic.c} 45%, transparent)`,
        animationDelay: delay
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "relative"
      }
    }, ic.svg)));
  })));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 48,
      paddingTop: 16,
      borderTop: "1px solid var(--border)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Every score traces to on-chain payments and Merkle-anchored evidence on XLayer. Providers can never pay to change a score.");
}
Object.assign(window, {
  VS_NavBar: NavBar,
  VS_Pipeline: Pipeline,
  VS_Footer: Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/data.js
try { (() => {
// Veristat demo cast — the real hackathon data (design-brief §3).
window.VERISTAT_DATA = {
  services: [{
    id: 1,
    name: "Honest Oracle",
    category: "price",
    endpoint: "http://honest.asp/v1",
    chain: "xlayerTestnet",
    declaredPriceUsd: 0.001,
    grade: "A",
    composite: 94.3,
    accuracy: 96,
    confidence: 0.92,
    tier: 1,
    isSelf: false,
    dims: {
      accuracy: 96,
      reliability: 95,
      latency: 90,
      integrity: 98,
      freshness: 93
    },
    history: [88, 90, 89, 91, 92, 90, 93, 92, 94, 93, 95, 94, 93, 94, 95, 94]
  }, {
    id: 2,
    name: "Stale Oracle",
    category: "price",
    endpoint: "http://stale.asp/v1",
    chain: "xlayerTestnet",
    declaredPriceUsd: 0.001,
    grade: "C",
    composite: 75.8,
    accuracy: 88,
    confidence: 0.81,
    tier: 1,
    isSelf: false,
    dims: {
      accuracy: 88,
      reliability: 84,
      latency: 82,
      integrity: 90,
      freshness: 0
    },
    history: [86, 84, 85, 80, 78, 74, 76, 72, 70, 73, 75, 74, 76, 75, 77, 76]
  }, {
    id: 3,
    name: "Liar Oracle",
    category: "price",
    endpoint: "http://liar.asp/v1",
    chain: "xlayerTestnet",
    declaredPriceUsd: 0.001,
    grade: "F",
    composite: 50.7,
    accuracy: 0,
    confidence: 0.88,
    tier: 1,
    isSelf: false,
    dims: {
      accuracy: 0,
      reliability: 82,
      latency: 79,
      integrity: 70,
      freshness: 71
    },
    history: [64, 60, 58, 55, 52, 54, 51, 49, 50, 52, 50, 51, 49, 50, 51, 51]
  }, {
    id: 4,
    name: "Greedy Oracle",
    category: "defi-rates",
    endpoint: "http://greedy.asp/v1",
    chain: "xlayerTestnet",
    declaredPriceUsd: 0.001,
    grade: "C-",
    composite: 72.5,
    accuracy: 91,
    confidence: 0.79,
    tier: 2,
    isSelf: false,
    dims: {
      accuracy: 91,
      reliability: 62,
      latency: 74,
      integrity: 0,
      freshness: 88
    },
    history: [80, 78, 76, 74, 70, 72, 68, 73, 71, 74, 72, 70, 73, 72, 74, 73]
  }, {
    id: 5,
    name: "Veristat Score API",
    category: "generic",
    endpoint: "http://localhost:4020/v1",
    chain: "xlayerTestnet",
    declaredPriceUsd: 0.001,
    grade: "A",
    composite: 96.0,
    accuracy: null,
    confidence: 0.85,
    tier: 3,
    isSelf: true,
    dims: {
      accuracy: null,
      reliability: 98,
      latency: 96,
      integrity: 97,
      freshness: 94
    },
    history: [93, 94, 95, 94, 96, 95, 96, 97, 96, 95, 96, 97, 96, 96, 97, 96]
  }],
  incidents: {
    2: [{
      kind: "STALE_DATA",
      time: "2025-07-06T09:41:12Z",
      summary: "claimed block 9,213,856 — 150 blocks behind chain head 9,214,006 (freshness tolerance 12)"
    }, {
      kind: "STALE_DATA",
      time: "2025-07-06T08:12:44Z",
      summary: "response timestamp lagged wall clock by 41 min"
    }],
    3: [{
      kind: "WRONG_ANSWER",
      time: "2025-07-06T09:52:03Z",
      summary: "returned 47.0 when the contract read 38.1 at block 9,214,006 (×1.10 + 7 transform detected)"
    }, {
      kind: "HONEYPOT_FAILURE",
      time: "2025-07-06T07:19:20Z",
      summary: "answered a known-unanswerable honeypot query with a fabricated value"
    }],
    4: [{
      kind: "OVERCHARGE",
      time: "2025-07-06T10:14:00Z",
      summary: "quoted $0.0010 but charged $0.0030 from the payment wallet (on-chain Transfer event)"
    }, {
      kind: "GAMING_SUSPECTED",
      time: "2025-07-06T06:33:11Z",
      summary: "random 500s clustered around fresh-wallet probes — reliability z-test flagged"
    }]
  },
  probes: [{
    id: 412,
    serviceId: 3,
    service: "Liar Oracle",
    template: "price.spot-usd",
    verdicts: [["accuracy", "fail"], ["integrity", "pass"]],
    charged: 0.0010,
    latency: 142,
    tx: "0x2d4022f1a9c3e0b74a55d1c8e0f9a1b2c3d4e5f6",
    ago: "12s"
  }, {
    id: 411,
    serviceId: 1,
    service: "Honest Oracle",
    template: "price.spot-usd",
    verdicts: [["accuracy", "pass"], ["freshness", "pass"]],
    charged: 0.0010,
    latency: 96,
    tx: "0x9f81c0aa4e2b7d3c1f0e9d8c7b6a5040302010ff",
    ago: "31s"
  }, {
    id: 410,
    serviceId: 4,
    service: "Greedy Oracle",
    template: "defi.token-meta",
    verdicts: [["integrity", "fail"], ["accuracy", "pass"]],
    charged: 0.0030,
    latency: 210,
    tx: "0x7a13be99ce22aa4411223344556677889900aabb",
    ago: "58s"
  }, {
    id: 409,
    serviceId: 2,
    service: "Stale Oracle",
    template: "price.twap-1h",
    verdicts: [["freshness", "fail"], ["accuracy", "pass"]],
    charged: 0.0010,
    latency: 118,
    tx: "0x4c88ff01de23bc4590817263544536271809aa0b",
    ago: "1m 22s"
  }, {
    id: 408,
    serviceId: 1,
    service: "Honest Oracle",
    template: "price.twap-1h",
    verdicts: [["accuracy", "pass"], ["latency", "pass"]],
    charged: 0.0010,
    latency: 88,
    tx: "0x1b02cd34ef45ab5678901234def0123456789abc",
    ago: "2m 04s"
  }, {
    id: 407,
    serviceId: 5,
    service: "Veristat Score API",
    template: "meta.self-probe",
    verdicts: [["reliability", "pass"]],
    charged: 0.0010,
    latency: 71,
    tx: "0xaa55bb66cc77dd88ee99ff001122334455667788",
    ago: "2m 40s"
  }],
  stats: {
    probes: 1284,
    verdicts: 3921,
    incidents: 47,
    usdSpent: 3.82,
    servicesScored: 5
  },
  anchor: {
    tx: "0x7673b46ef680f0ac28384a6524ad1b122cd2de8aa2f4b284fe4b692aa3f960f6",
    leaves: 159,
    ago: "4m",
    status: "confirmed"
  },
  // 14-day ledger series for the stat cards
  series: {
    probes: [40, 52, 61, 58, 72, 80, 77, 91, 88, 104, 110, 120, 118, 124],
    verdicts: [120, 150, 180, 175, 210, 240, 230, 270, 265, 310, 330, 360, 354, 372],
    incidents: [1, 2, 1, 3, 2, 4, 3, 2, 5, 3, 4, 2, 3, 4],
    usdSpent: [0.10, 0.14, 0.17, 0.16, 0.21, 0.24, 0.23, 0.28, 0.27, 0.32, 0.34, 0.38, 0.36, 0.41]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/data.js", error: String((e && e.message) || e) }); }

// ui_kits/web/docs.jsx
try { (() => {
// Veristat web UI kit — Build with Veristat (developer surface).
const _NS = window.VeristatDesignSystem_aac6ad;
function CodeBlock({
  children
}) {
  return /*#__PURE__*/React.createElement("pre", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12.5,
      lineHeight: 1.6,
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "14px 18px",
      overflowX: "auto",
      color: "var(--text-secondary)",
      whiteSpace: "pre-wrap"
    }
  }, children);
}
function Docs() {
  const th = {
    border: "1px solid var(--border)",
    padding: "6px 10px",
    textAlign: "left",
    fontSize: 13,
    color: "var(--text-primary)"
  };
  const td = {
    border: "1px solid var(--border)",
    padding: "6px 10px",
    textAlign: "left",
    fontSize: 13,
    color: "var(--text-secondary)"
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 860,
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      color: "var(--text-primary)"
    }
  }, "Build with Veristat"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14
    }
  }, "Everything an agent needs to check a service's verified track record before spending money on it \u2014 and to keep watching it afterwards."), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "var(--text-primary)"
    },
    id: "sdk"
  }, "SDK \u2014 the pre-purchase gate"), /*#__PURE__*/React.createElement("p", null, "Three lines before any x402 spend. ", /*#__PURE__*/React.createElement("code", null, "guard()"), " fails closed when a service has no verified track record."), /*#__PURE__*/React.createElement(CodeBlock, null, `import { Veristat } from "@veristat/sdk";

const veristat = new Veristat({ baseUrl: process.env.VERISTAT_API_URL });
const gate = await veristat.guard(serviceUrl, {
  minScore: 70,
  requireVerifiedAccuracy: true,
});
if (!gate.allow) throw new Error(\`blocked: \${gate.reason}\`);`), /*#__PURE__*/React.createElement("p", null, "A real deny result names the exact policy failures:"), /*#__PURE__*/React.createElement(CodeBlock, null, `{
  allow: false,
  reason: "composite 51.0 < required 70; integrity 40 < required 60 (billing risk)",
  score: { composite: 51, grade: "F", dimensions: { accuracy: 0, integrity: 40 } },
  serviceId: 3
}`), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "var(--text-primary)"
    },
    id: "mcp"
  }, "MCP server \u2014 scores as agent tools"), /*#__PURE__*/React.createElement("p", null, "Plug Veristat into Claude or any MCP-capable agent:"), /*#__PURE__*/React.createElement(CodeBlock, null, `{
  "mcpServers": {
    "veristat": {
      "command": "node",
      "args": ["apps/mcp/dist/main.js"],
      "env": { "VERISTAT_API_URL": "http://localhost:4020" }
    }
  }
}`), /*#__PURE__*/React.createElement("p", null, "Four tools: ", /*#__PURE__*/React.createElement("code", null, "check_before_purchase"), ", ", /*#__PURE__*/React.createElement("code", null, "get_service_score"), ", ", /*#__PURE__*/React.createElement("code", null, "compare_category"), ", ", /*#__PURE__*/React.createElement("code", null, "get_evidence"), "."), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "var(--text-primary)"
    },
    id: "api"
  }, "Paid score API \u2014 x402"), /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: "collapse",
      fontSize: 13,
      margin: "12px 0"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Endpoint"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Price"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Returns"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("code", null, "GET /v1/score/:id")), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "$0.001"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "composite, grade, confidence, 5 dimensions")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("code", null, "GET /v1/category/:cat")), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "$0.002"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "ranked comparison of every scored service")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("code", null, "GET /v1/evidence/:id")), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "$0.005"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, "probes, payment txs, ground truth, verdicts")))), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "var(--text-primary)"
    },
    id: "verify"
  }, "Verify the evidence yourself"), /*#__PURE__*/React.createElement(CodeBlock, null, `$ pnpm --filter @veristat/worker verify-proof 42

anchor #1: rows 1..159 (159 leaves)
recomputed root  0xe3fab9aa…  `, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--good)"
    }
  }, "\u2713 matches published"), `
proof (8 siblings) verifies locally: `, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--good)"
    }
  }, "\u2713"), `
contract verifyLeaf(): `, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--good)"
    }
  }, "\u2713 PROOF VALID ON-CHAIN")), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      borderLeft: "3px solid var(--accent)",
      margin: "24px 0 0",
      padding: "2px 16px",
      color: "var(--text-primary)"
    }
  }, "Providers can never pay to change a score. Every claim is a measurement. No token."), /*#__PURE__*/React.createElement(window.VS_Footer, null));
}
window.VS_Docs = Docs;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/docs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Veristat web UI kit — screens: Landing, Leaderboard, Scorecard.
const NS = window.VeristatDesignSystem_aac6ad;
const {
  GradeChip,
  StatusChip,
  VerdictChip,
  TierBadge,
  CoiBadge,
  LiveChip,
  TxLink,
  Sparkline,
  TrendArea,
  DimensionMeter,
  KpiCard,
  StatCard,
  IncidentCard,
  EvidenceRow,
  EvidenceKV,
  ScoreBadge,
  Button
} = NS;
const D = window.VERISTAT_DATA;
const EXPLORER = "https://www.oklink.com/xlayer-test/tx/";
const iconStroke = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
};
const STAT_ICONS = {
  probes: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("circle", _extends({
    cx: "10.5",
    cy: "10.5",
    r: "6.5"
  }, iconStroke)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M15.5 15.5 21 21"
  }, iconStroke, {
    strokeWidth: 2.2
  }))),
  verdicts: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", _extends({
    d: "M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z"
  }, iconStroke)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M8.8 11.6l2.3 2.3 4.2-4.6"
  }, iconStroke, {
    strokeWidth: 2
  }))),
  incidents: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", _extends({
    d: "M12 3 22 20H2L12 3Z"
  }, iconStroke)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M12 10v4.5"
  }, iconStroke, {
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "17.2",
    r: "0.9",
    fill: "currentColor",
    stroke: "none"
  })),
  usdSpent: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("rect", _extends({
    x: "2.5",
    y: "6",
    width: "19",
    height: "13",
    rx: "2.5"
  }, iconStroke)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M2.5 10h19"
  }, iconStroke)), /*#__PURE__*/React.createElement("circle", _extends({
    cx: "16.5",
    cy: "14.8",
    r: "1.8"
  }, iconStroke)))
};
function probeStatus(verdicts) {
  const fail = d => verdicts.some(([dim, v]) => dim === d && v === "fail");
  if (fail("accuracy")) return "incorrect";
  if (fail("freshness")) return "stale";
  if (fail("integrity")) return "overcharge";
  if (fail("reliability")) return "failed";
  return "correct";
}

// ---------- Landing ----------
function Landing({
  go
}) {
  const s = D.stats;
  const cards = [{
    id: "probes",
    k: "Paid Probes",
    v: s.probes.toLocaleString(),
    cap: "On-chain payments",
    color: "var(--accent)",
    delta: "+124 today"
  }, {
    id: "verdicts",
    k: "Verified Verdicts",
    v: s.verdicts.toLocaleString(),
    cap: "Merkle-anchored",
    color: "#d4d5d9",
    delta: "+372 today"
  }, {
    id: "incidents",
    k: "Incidents Caught",
    v: s.incidents,
    cap: "Wrong, stale & overcharges",
    color: "#9a9ba0",
    delta: "+4 today"
  }, {
    id: "usdSpent",
    k: "$ Spent Probing",
    v: "$" + s.usdSpent.toFixed(2),
    cap: `Across ${s.servicesScored} services`,
    color: "#b7b8bd",
    delta: "+$0.41 today"
  }];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      border: "1px solid var(--border)",
      borderRadius: 20,
      overflow: "hidden",
      minHeight: 480,
      display: "flex",
      alignItems: "center",
      background: "var(--surface-0)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vs-hero-art",
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      background: "url('../../assets/hero-bg.png') right center / cover no-repeat"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "vs-hero-scan",
    "aria-hidden": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(92deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.5) 52%, rgba(0,0,0,0) 72%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "vs-hero-grid",
    "aria-hidden": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 560,
      padding: "64px 24px 64px 52px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "clamp(42px,5vw,60px)",
      lineHeight: 1.04,
      letterSpacing: "-0.03em",
      fontWeight: 700,
      margin: "0 0 20px"
    }
  }, "Trust,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      background: "linear-gradient(96deg,#ffffff,#d0d1d5 52%,#8f9096)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 0 18px rgba(255,255,255,0.28))"
    }
  }, "verified"), /*#__PURE__*/React.createElement("br", null), "with money."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: 440,
      margin: "0 0 30px",
      fontSize: 16.5,
      lineHeight: 1.6,
      color: "var(--text-secondary)"
    }
  }, "Veristat adversarially probes paid AI agent services, verifies every answer against on-chain truth, and publishes cryptographic proof."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => go("docs"),
    iconRight: /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true
    }, "\u2197")
  }, "Get Early Access"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => go("leaderboard")
  }, "Explore Leaderboard")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 28,
      fontSize: 12.5,
      color: "var(--text-muted)",
      letterSpacing: "0.05em",
      textTransform: "uppercase"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "var(--good)",
      boxShadow: "0 0 10px var(--good)"
    }
  }), "Live verification network \u2014 probing ", s.servicesScored, " services"))), /*#__PURE__*/React.createElement(window.VS_Pipeline, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 480px",
      gap: 20,
      alignItems: "stretch",
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 12
    }
  }, cards.map(c => /*#__PURE__*/React.createElement(StatCard, {
    key: c.id,
    icon: STAT_ICONS[c.id],
    label: c.k,
    value: c.v,
    caption: c.cap,
    delta: c.delta,
    color: c.color,
    chart: /*#__PURE__*/React.createElement(TrendArea, {
      values: D.series[c.id],
      id: c.id,
      color: c.color
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "16px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontSize: 15,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(LiveChip, null), " Probe Activity"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("leaderboard");
    },
    style: {
      fontSize: 13
    }
  }, "View all \u2192")), D.probes.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      display: "grid",
      gridTemplateColumns: "64px 1fr auto auto",
      gap: 12,
      alignItems: "center",
      padding: "9px 8px",
      borderBottom: "1px solid var(--surface-2)",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12,
      fontVariantNumeric: "tabular-nums"
    }
  }, p.ago, " ago"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("service", p.serviceId);
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      color: "var(--text-primary)",
      fontWeight: 500,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: `hsl(0 0% ${45 + p.serviceId * 37 % 45}%)`,
      boxShadow: "0 0 8px currentColor"
    }
  }), p.service), /*#__PURE__*/React.createElement(StatusChip, {
    status: probeStatus(p.verdicts)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      fontVariantNumeric: "tabular-nums"
    }
  }, "$", p.charged.toFixed(4), " ", /*#__PURE__*/React.createElement(TxLink, {
    hash: p.tx,
    href: EXPLORER + p.tx,
    tail: 4,
    arrow: true
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 28,
      flexWrap: "wrap",
      marginTop: 20,
      padding: "16px 24px",
      border: "1px solid transparent",
      borderRadius: 16,
      fontSize: 14,
      background: "linear-gradient(var(--surface-1),var(--surface-1)) padding-box, linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.14), rgba(255,255,255,0.4)) border-box",
      boxShadow: "0 0 32px rgba(255,255,255,0.05)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 11,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow: "0 0 16px rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.5 19.5 6v5.5c0 4.3-3 7.5-7.5 9-4.5-1.5-7.5-4.7-7.5-9V6L12 2.5Z",
    stroke: "var(--accent)",
    strokeWidth: "1.7",
    strokeLinejoin: "round",
    fill: "rgba(255,255,255,0.06)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.8 11.6l2.3 2.3 4.2-4.6",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "All evidence Merkle-anchored on XLayer Testnet"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 8,
      color: "var(--text-muted)"
    }
  }, "Latest Anchor Tx ", /*#__PURE__*/React.createElement(TxLink, {
    hash: D.anchor.tx,
    href: EXPLORER + D.anchor.tx
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 8,
      color: "var(--text-muted)"
    }
  }, "Leaves ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-primary)",
      fontFamily: "var(--font-mono)"
    }
  }, D.anchor.leaves)), /*#__PURE__*/React.createElement(StatusChip, {
    status: "confirmed"
  }), /*#__PURE__*/React.createElement("a", {
    href: EXPLORER + D.anchor.tx,
    target: "_blank",
    rel: "noreferrer",
    style: {
      marginLeft: "auto"
    }
  }, "View on OKLink Explorer \u2192")), /*#__PURE__*/React.createElement(window.VS_Footer, null));
}

// ---------- Leaderboard ----------
function Leaderboard({
  go
}) {
  const cats = [...new Set(D.services.map(s => s.category))];
  const th = {
    textAlign: "left",
    fontWeight: 500,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-muted)",
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)"
  };
  const thNum = {
    ...th,
    textAlign: "right"
  };
  const td = {
    padding: 12,
    borderBottom: "1px solid var(--surface-2)",
    verticalAlign: "middle"
  };
  const tdNum = {
    ...td,
    textAlign: "right",
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums"
  };
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("h1", null, "Agent service leaderboard"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      margin: "0 0 24px",
      maxWidth: 640
    }
  }, "Live paid agent services, adversarially probed and verified against on-chain ground truth. Every score links to its evidence."), cats.map(cat => /*#__PURE__*/React.createElement("section", {
    key: cat
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      textTransform: "capitalize"
    }
  }, cat), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "#"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Service"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Grade"), /*#__PURE__*/React.createElement("th", {
    style: thNum
  }, "Score"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Trend"), /*#__PURE__*/React.createElement("th", {
    style: thNum
  }, "Accuracy"), /*#__PURE__*/React.createElement("th", {
    style: thNum
  }, "Confidence"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Tier"))), /*#__PURE__*/React.createElement("tbody", null, D.services.filter(s => s.category === cat).sort((a, b) => b.composite - a.composite).map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    style: {
      cursor: "pointer"
    },
    onClick: () => go("service", s.id)
  }, /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("service", s.id);
    }
  }, s.name), " ", s.isSelf && /*#__PURE__*/React.createElement(CoiBadge, null)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(GradeChip, {
    grade: s.grade
  })), /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, s.composite.toFixed(1)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Sparkline, {
    values: s.history
  })), /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, s.accuracy === null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontFamily: "var(--font-sans)"
    }
  }, "not verified") : s.accuracy), /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, Math.round(s.confidence * 100), "%"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(TierBadge, {
    tier: s.tier
  })))))))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("h2", null, "Live probe activity"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      margin: "0 0 12px"
    }
  }, "Latest adversarial probes \u2014 every row paid for on-chain and independently verifiable."), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "When"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Service"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Probe"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Verdicts"), /*#__PURE__*/React.createElement("th", {
    style: thNum
  }, "Paid"), /*#__PURE__*/React.createElement("th", {
    style: thNum
  }, "Latency"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Payment tx"))), /*#__PURE__*/React.createElement("tbody", null, D.probes.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: "var(--text-muted)"
    }
  }, p.ago, " ago"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("service", p.serviceId);
    }
  }, p.service)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("code", null, p.template)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, p.verdicts.map(([dim, v], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      marginRight: 4
    }
  }, /*#__PURE__*/React.createElement(VerdictChip, {
    verdict: v,
    dimension: dim,
    abbrev: true
  })))), /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, "$", p.charged.toFixed(4)), /*#__PURE__*/React.createElement("td", {
    style: tdNum
  }, p.latency, " ms"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(TxLink, {
    hash: p.tx,
    href: EXPLORER + p.tx,
    lead: 10,
    tail: 0,
    arrow: false
  }))))))), /*#__PURE__*/React.createElement(window.VS_Footer, null));
}

// ---------- Scorecard ----------
const DIMS = [["accuracy", "Accuracy"], ["reliability", "Reliability"], ["latency", "Latency"], ["integrity", "Integrity"], ["freshness", "Freshness"]];
function Scorecard({
  id,
  go
}) {
  const s = D.services.find(x => x.id === id) || D.services[0];
  const incidents = D.incidents[s.id] || [];
  const probes = D.probes.filter(p => p.serviceId === s.id);
  const dimColor = (k, v) => v === null ? "var(--accent)" : v < 50 ? "var(--critical)" : v < 75 ? "var(--warning)" : "var(--accent)";
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("leaderboard");
    },
    style: {
      fontSize: 13
    }
  }, "\u2190 Leaderboard"), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 10
    }
  }, s.name, " ", s.isSelf && /*#__PURE__*/React.createElement(CoiBadge, null, "Veristat itself \u2014 scored by the same methodology (conflict of interest disclosed)")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      margin: "0 0 20px"
    }
  }, /*#__PURE__*/React.createElement("code", null, s.endpoint), " \xB7 ", s.category, " \xB7 ", s.chain, " \xB7 listed $", s.declaredPriceUsd, "/call \xB7 status active"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
      gap: 12,
      margin: "16px 0"
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Composite"
  }, /*#__PURE__*/React.createElement(GradeChip, {
    grade: s.grade
  }), " ", s.composite.toFixed(1)), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Confidence",
    value: `${Math.round(s.confidence * 100)}%`,
    sub: `${probes.length + 9} verdicts`
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Verification tier"
  }, /*#__PURE__*/React.createElement(TierBadge, {
    tier: s.tier
  }), " ", /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      color: "var(--text-secondary)"
    }
  }, s.tier === 1 ? "deterministic on-chain" : s.tier === 2 ? "consensus cross-ref" : "operational only")), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Score history"
  }, /*#__PURE__*/React.createElement(Sparkline, {
    values: s.history,
    width: 160,
    height: 36
  }))), /*#__PURE__*/React.createElement("h2", null, "Dimensions"), DIMS.map(([k, label]) => /*#__PURE__*/React.createElement(DimensionMeter, {
    key: k,
    name: label,
    value: s.dims[k],
    color: dimColor(k, s.dims[k])
  })), s.accuracy === null && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12,
      marginTop: 8
    }
  }, "Accuracy not verified: this service's output cannot be objectively checked, so it receives an operational score only. Veristat never fabricates an accuracy number."), incidents.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, "Incident log"), incidents.map((inc, i) => /*#__PURE__*/React.createElement(IncidentCard, {
    key: i,
    kind: inc.kind,
    time: inc.time,
    summary: inc.summary
  }))), /*#__PURE__*/React.createElement("h2", null, "Sample evidence"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      margin: "0 0 12px",
      maxWidth: 640
    }
  }, "Each probe links its payment transaction, the raw response hash, the ground truth used, and the verdicts derived from it."), (probes.length ? probes : D.probes.slice(0, 2)).map(p => /*#__PURE__*/React.createElement(EvidenceRow, {
    key: p.id,
    summary: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)"
      }
    }, "#", p.id, " \xB7 ", p.template, " \xB7 ", p.verdicts.map(([dim, v], i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        marginRight: 4
      }
    }, /*#__PURE__*/React.createElement(VerdictChip, {
      verdict: v,
      dimension: dim
    }))))
  }, /*#__PURE__*/React.createElement(EvidenceKV, {
    label: "request"
  }, s.endpoint, "/", p.template.split(".")[1], "?pair=OKB-USDT"), /*#__PURE__*/React.createElement(EvidenceKV, {
    label: "latency"
  }, p.latency, "ms"), /*#__PURE__*/React.createElement(EvidenceKV, {
    label: "quoted / charged"
  }, "$", p.charged === 0.003 ? "0.0010" : p.charged.toFixed(4), " / $", p.charged.toFixed(4)), /*#__PURE__*/React.createElement(EvidenceKV, {
    label: "payment tx"
  }, /*#__PURE__*/React.createElement(TxLink, {
    hash: p.tx,
    href: EXPLORER + p.tx,
    lead: 20,
    tail: 6
  })), /*#__PURE__*/React.createElement(EvidenceKV, {
    label: "response sha256"
  }, "0x", p.tx.slice(2, 18), "a1b2c3d4e5f6"))), /*#__PURE__*/React.createElement("h2", null, "Embed this score"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 14,
      margin: "0 0 12px"
    }
  }, "Providers may display their live badge \u2014 it always reflects the current verified score."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-muted)",
      marginBottom: 8
    }
  }, "Badge preview"), /*#__PURE__*/React.createElement(ScoreBadge, {
    score: s.composite
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-muted)",
      margin: "14px 0 6px"
    }
  }, "HTML snippet"), /*#__PURE__*/React.createElement("code", {
    style: {
      display: "block",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-secondary)",
      wordBreak: "break-all",
      background: "var(--surface-2)",
      padding: "8px 10px",
      borderRadius: 6
    }
  }, `<a href="https://veristat.example/service/${s.id}"><img src="https://veristat.example/api/badge/${s.id}" alt="Veristat verified score" /></a>`)), /*#__PURE__*/React.createElement(window.VS_Footer, null));
}
Object.assign(window, {
  VS_Landing: Landing,
  VS_Leaderboard: Leaderboard,
  VS_Scorecard: Scorecard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.DimensionMeter = __ds_scope.DimensionMeter;

__ds_ns.EvidenceRow = __ds_scope.EvidenceRow;

__ds_ns.EvidenceKV = __ds_scope.EvidenceKV;

__ds_ns.IncidentCard = __ds_scope.IncidentCard;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.ScoreBadge = __ds_scope.ScoreBadge;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TrendArea = __ds_scope.TrendArea;

__ds_ns.CoiBadge = __ds_scope.CoiBadge;

__ds_ns.GradeChip = __ds_scope.GradeChip;

__ds_ns.LiveChip = __ds_scope.LiveChip;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.TierBadge = __ds_scope.TierBadge;

__ds_ns.TxLink = __ds_scope.TxLink;

__ds_ns.VerdictChip = __ds_scope.VerdictChip;

})();
