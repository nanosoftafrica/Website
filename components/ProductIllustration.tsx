// Lightweight abstract "dashboard on a laptop" placeholder, themed by the
// product's accent color. Used on the product detail hero when no real
// screenshot has been uploaded yet — an honest placeholder rather than a
// fabricated photorealistic mockup.
export default function ProductIllustration({ color, name }: { color: string; name: string }) {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={`${name} dashboard illustration`} style={{ width: "100%", height: "auto" }}>
      <rect x="30" y="30" width="340" height="200" rx="12" fill="#fff" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <rect x="30" y="30" width="340" height="34" rx="12" fill={color} fillOpacity="0.12" />
      <circle cx="50" cy="47" r="4" fill={color} fillOpacity="0.5" />
      <circle cx="64" cy="47" r="4" fill={color} fillOpacity="0.3" />
      <circle cx="78" cy="47" r="4" fill={color} fillOpacity="0.2" />

      <rect x="50" y="84" width="90" height="46" rx="8" fill={color} fillOpacity="0.08" />
      <rect x="58" y="94" width="40" height="7" rx="3.5" fill={color} fillOpacity="0.35" />
      <rect x="58" y="108" width="60" height="12" rx="4" fill={color} fillOpacity="0.55" />

      <rect x="152" y="84" width="90" height="46" rx="8" fill={color} fillOpacity="0.08" />
      <rect x="160" y="94" width="40" height="7" rx="3.5" fill={color} fillOpacity="0.35" />
      <rect x="160" y="108" width="45" height="12" rx="4" fill={color} fillOpacity="0.55" />

      <rect x="254" y="84" width="96" height="46" rx="8" fill={color} fillOpacity="0.08" />
      <rect x="262" y="94" width="40" height="7" rx="3.5" fill={color} fillOpacity="0.35" />
      <rect x="262" y="108" width="52" height="12" rx="4" fill={color} fillOpacity="0.55" />

      <rect x="50" y="146" width="160" height="66" rx="8" fill={color} fillOpacity="0.06" />
      <polyline points="60,196 85,178 110,188 135,162 160,172 185,156 200,166" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="222" y="146" width="128" height="66" rx="8" fill={color} fillOpacity="0.06" />
      <rect x="234" y="156" width="60" height="8" rx="4" fill={color} fillOpacity="0.3" />
      <rect x="234" y="172" width="104" height="6" rx="3" fill={color} fillOpacity="0.2" />
      <rect x="234" y="184" width="104" height="6" rx="3" fill={color} fillOpacity="0.2" />
      <rect x="234" y="196" width="80" height="6" rx="3" fill={color} fillOpacity="0.2" />

      <path d="M10 258 L390 258 L370 274 L30 274 Z" fill={color} fillOpacity="0.1" />
      <rect x="150" y="238" width="100" height="14" rx="3" fill={color} fillOpacity="0.2" />
    </svg>
  );
}
