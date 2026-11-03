"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(0, 150, 214, 0.15)",
  borderColor = "rgba(0, 150, 214, 0.4)",
  onClick,
  style = {},
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`rb-spotlight-card ${className}`}
      style={{
        position: "relative",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        border: "1px solid var(--adm-border, #e2e6ea)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        ...style,
      }}
    >
      {/* Radial Spotlight Overlay */}
      <div
        className="rb-spotlight-overlay"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity,
          transition: "opacity 0.25s ease-out",
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
          zIndex: 1,
        }}
      />
      {/* Border Highlight Overlay */}
      <div
        className="rb-border-overlay"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: -1,
          borderRadius: "inherit",
          padding: 1,
          background: `radial-gradient(280px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 70%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          opacity,
          transition: "opacity 0.2s ease-out",
          zIndex: 2,
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}
