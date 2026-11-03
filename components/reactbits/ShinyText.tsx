"use client";

import { type ReactNode } from "react";

interface ShinyTextProps {
  children: ReactNode;
  disabled?: boolean;
  speed?: number; // duration in seconds
  className?: string;
  style?: React.CSSProperties;
}

export default function ShinyText({
  children,
  disabled = false,
  speed = 3,
  className = "",
  style = {},
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className} style={style}>{children}</span>;
  }

  return (
    <span
      className={`rb-shiny-text ${className}`}
      style={{
        display: "inline-block",
        backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 80%), linear-gradient(90deg, var(--adm-primary, #0096d6), #0284c7, #38bdf8)",
        backgroundSize: "200% 100%, 100% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `rb-shine ${speed}s linear infinite`,
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
