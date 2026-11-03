// Abstract "disconnected systems" motif for the Pain section's zig-visual
// slot — a muted hub-and-spoke diagram (not a specific literal scene, since
// the pain points are CMS-editable and can't be hardcoded to exact copy).
// Deliberately desaturated apart from one accent "friction" ping: the Pain
// section is the *problem* half of the page, so it reads muted next to the
// saturated per-product illustrations shown once you reach the solution.
const ANGLES = [
  [-58, 8, 72],
  [-70, 4, 66],
  [-50, 14, 80],
];

export default function PainIllustration({ icon, index = 0 }: { icon: string; index?: number }) {
  const angles = ANGLES[index % ANGLES.length];
  const frictionIdx = index % 3;
  const cx = 130;
  const cy = 100;
  const r = 62;

  const nodes = angles.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), friction: i === frictionIdx };
  });

  return (
    <svg viewBox="0 0 260 200" role="presentation" aria-hidden="true" style={{ width: "100%", height: "auto", maxWidth: 220 }}>
      {nodes.map((n, i) => (
        <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
      ))}

      <circle cx={cx} cy={cy} r="30" fill="var(--blue-pale)" stroke="var(--blue)" strokeOpacity="0.25" strokeWidth="1.5" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="24">
        {icon}
      </text>

      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="16" fill="var(--bg)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="5" fill={n.friction ? "var(--accent)" : "var(--faint)"} fillOpacity={n.friction ? 1 : 0.5} />
        </g>
      ))}
    </svg>
  );
}
