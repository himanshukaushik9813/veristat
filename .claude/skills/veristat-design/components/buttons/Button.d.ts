import * as React from "react";

/**
 * Veristat primary/ghost/secondary button.
 *
 * @startingPoint section="Actions" subtitle="Primary, ghost & secondary buttons" viewport="700x120"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: "primary" | "ghost" | "secondary";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Render as a link when set. */
  href?: string;
  /** Leading icon node (SVG). */
  icon?: React.ReactNode;
  /** Trailing icon node (e.g. ↗). */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): React.JSX.Element;
