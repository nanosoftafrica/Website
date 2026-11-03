"use client";

interface StatusPulseProps {
  status?: "online" | "warning" | "offline" | "busy" | "neutral";
  size?: "sm" | "md" | "lg";
  label?: string;
  ping?: boolean;
  className?: string;
}

const colorMap = {
  online: {
    bg: "#10b981",
    pulse: "rgba(16, 185, 129, 0.4)",
  },
  warning: {
    bg: "#f59e0b",
    pulse: "rgba(245, 158, 11, 0.4)",
  },
  offline: {
    bg: "#ef4444",
    pulse: "rgba(239, 68, 68, 0.4)",
  },
  busy: {
    bg: "#8b5cf6",
    pulse: "rgba(139, 92, 246, 0.4)",
  },
  neutral: {
    bg: "#6b7280",
    pulse: "rgba(107, 114, 128, 0.3)",
  },
};

const sizeMap = {
  sm: { dot: 8, ping: 16 },
  md: { dot: 10, ping: 20 },
  lg: { dot: 14, ping: 26 },
};

export default function StatusPulse({
  status = "online",
  size = "md",
  label,
  ping = true,
  className = "",
}: StatusPulseProps) {
  const colors = colorMap[status] || colorMap.online;
  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div className={`rb-status-pulse-container ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: dimensions.ping,
          height: dimensions.ping,
        }}
      >
        {ping && (
          <span
            className="rb-pulse-ping"
            style={{
              position: "absolute",
              width: dimensions.ping,
              height: dimensions.ping,
              borderRadius: "50%",
              backgroundColor: colors.pulse,
              animation: "rb-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        )}
        <span
          className="rb-pulse-dot"
          style={{
            position: "relative",
            width: dimensions.dot,
            height: dimensions.dot,
            borderRadius: "50%",
            backgroundColor: colors.bg,
            boxShadow: `0 0 8px ${colors.bg}`,
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: size === "sm" ? "11px" : "13px", fontWeight: 600, color: "var(--adm-text, #1a2332)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
