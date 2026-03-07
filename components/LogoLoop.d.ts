import type { ReactNode } from "react";

export interface LogoLoopProps {
  logos: unknown[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: string | number;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: unknown, key: string) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLoop: React.FC<LogoLoopProps>;
export default LogoLoop;
