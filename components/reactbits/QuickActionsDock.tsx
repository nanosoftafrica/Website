"use client";

import { useState } from "react";
import Link from "next/link";

export interface DockAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  highlight?: boolean;
}

interface QuickActionsDockProps {
  actions: DockAction[];
  className?: string;
}

export default function QuickActionsDock({ actions, className = "" }: QuickActionsDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={`rb-dock-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px",
        background: "rgba(13, 26, 42, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.24)",
      }}
    >
      {actions.map((action, idx) => {
        const isHovered = hoveredIndex === idx;
        const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - idx) === 1;

        const scale = isHovered ? 1.22 : isNeighbor ? 1.08 : 1;

        const content = (
          <div
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: action.highlight
                ? "linear-gradient(135deg, #0096d6, #0284c7)"
                : "rgba(255, 255, 255, 0.08)",
              border: action.highlight
                ? "1px solid rgba(255, 255, 255, 0.3)"
                : "1px solid rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              fontSize: 20,
              cursor: "pointer",
              transform: `scale(${scale})`,
              transition: "transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease",
            }}
          >
            <span>{action.icon}</span>

            {/* Tooltip */}
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "4px 10px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  fontSize: "11px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  pointerEvents: "none",
                  zIndex: 50,
                  animation: "rb-fade-in 0.15s ease",
                }}
              >
                {action.label}
              </div>
            )}

            {/* Optional badge */}
            {action.badge !== undefined && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  padding: "1px 5px",
                  borderRadius: "10px",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 800,
                  lineHeight: "12px",
                }}
              >
                {action.badge}
              </span>
            )}
          </div>
        );

        if (action.href) {
          return (
            <Link key={action.id} href={action.href} style={{ textDecoration: "none" }}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.id}
            onClick={action.onClick}
            type="button"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
