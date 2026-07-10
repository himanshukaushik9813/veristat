import React from "react";

const SIZES = {
  sm: { padding: "7px 14px", fontSize: 13, borderRadius: "var(--radius-md)" },
  md: { padding: "10px 20px", fontSize: 14, borderRadius: "var(--radius-lg)" },
  lg: { padding: "14px 28px", fontSize: 16, borderRadius: "var(--radius-lg)" },
};

/**
 * Veristat button. Primary is a glowing accent fill; ghost is a glass-blur
 * outline; secondary is a quiet raised surface. Renders an <a> when `href`
 * is set, otherwise a <button>.
 */
export function Button({
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
    ...SIZES[size],
  };

  const variants = {
    primary: {
      background: "var(--accent-strong)",
      color: "#08080a",
      boxShadow: "var(--glow-accent)",
    },
    ghost: {
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)",
    },
    secondary: {
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)",
    },
  };

  const merged = { ...base, ...variants[variant], ...style };
  const content = (
    <>
      {icon && <span aria-hidden style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
      {iconRight && <span aria-hidden style={{ display: "inline-flex" }}>{iconRight}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} style={merged} onClick={onClick} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} style={merged} disabled={disabled} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}
